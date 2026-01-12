import { differenceInDays, parseISO, startOfDay } from 'date-fns';

interface Shift {
  date: string;
  status?: string;
  actual_start?: string | null;
  actual_end?: string | null;
}

export function calculateConsecutiveDaysStreak(shifts: Shift[]): number {
  if (!shifts || shifts.length === 0) return 0;

  // Filter to only worked shifts (have actual_start and actual_end, and not day_off)
  const workedShifts = shifts
    .filter(shift => 
      shift.actual_start && 
      shift.actual_end && 
      shift.status !== 'day_off'
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (workedShifts.length === 0) return 0;

  const today = startOfDay(new Date());
  const mostRecentShift = startOfDay(parseISO(workedShifts[0].date));

  // If most recent shift is not today or yesterday, streak is broken
  const daysSinceLast = differenceInDays(today, mostRecentShift);
  if (daysSinceLast > 1) return 0;

  // Count consecutive days working backwards from most recent
  let streak = 1;
  let currentDate = mostRecentShift;

  for (let i = 1; i < workedShifts.length; i++) {
    const shiftDate = startOfDay(parseISO(workedShifts[i].date));
    const daysBetween = differenceInDays(currentDate, shiftDate);

    if (daysBetween === 1) {
      // Consecutive day
      streak++;
      currentDate = shiftDate;
    } else if (daysBetween > 1) {
      // Gap in streak, stop counting
      break;
    }
    // If daysBetween === 0, same day (multiple shifts), continue
  }

  return streak;
}

