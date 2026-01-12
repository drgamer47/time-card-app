import { differenceInMinutes, startOfWeek, endOfWeek, startOfDay, subDays, addDays, differenceInDays } from 'date-fns';
import type { Shift, ShiftCalculation, WeeklyPay, PayPeriodPay } from '../types';

const HOURLY_RATE = 14;
const OT_RATE = 21;
const OT_THRESHOLD = 40;

/**
 * Calculate hours for a single shift
 * Handles both actual shifts (past/today) and scheduled shifts (future)
 */
export function calculateShiftHours(shift: Shift): ShiftCalculation {
  // For scheduled shifts (future), use scheduled times; otherwise use actual
  const startTime = shift.actual_start || shift.scheduled_start;
  const endTime = shift.actual_end || shift.scheduled_end;
  
  if (!startTime || !endTime) {
    return { totalHours: 0, lunchHours: 0, paidHours: 0 };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Total shift time in minutes, then convert to hours
  const totalMinutes = differenceInMinutes(end, start);
  const totalHours = totalMinutes / 60;
  
  // Lunch break in minutes
  let lunchMinutes = 0;
  if (shift.lunch_start && shift.lunch_end) {
    const lunchStart = new Date(shift.lunch_start);
    const lunchEnd = new Date(shift.lunch_end);
    lunchMinutes = differenceInMinutes(lunchEnd, lunchStart);
  }
  
  const lunchHours = lunchMinutes / 60;
  
  // Paid hours = total hours minus lunch
  const paidHours = (totalMinutes - lunchMinutes) / 60;
  
  return { 
    totalHours: Number(totalHours.toFixed(2)), 
    lunchHours: Number(lunchHours.toFixed(2)), 
    paidHours: Number(paidHours.toFixed(2)) 
  };
}

/**
 * Calculate pay for a week (Sunday-Saturday)
 * Includes both actual and scheduled shifts (for projected pay)
 */
export function calculateWeekPay(shifts: Shift[]): WeeklyPay {
  // Include all shifts (actual and scheduled) for projected pay calculation
  // calculateShiftHours already handles both types correctly
  const totalPaidHours = shifts.reduce((sum, shift) => {
    return sum + calculateShiftHours(shift).paidHours;
  }, 0);
  
  const regularHours = Math.min(totalPaidHours, OT_THRESHOLD);
  const otHours = Math.max(totalPaidHours - OT_THRESHOLD, 0);
  const totalPay = (regularHours * HOURLY_RATE) + (otHours * OT_RATE);
  
  return { regularHours, otHours, totalPaidHours, totalPay };
}

/**
 * Get week bounds (Sunday-Saturday)
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 }); // Saturday
  return { start, end };
}

/**
 * Get pay period bounds (Saturday-Friday, biweekly)
 * Pay periods start on Saturday and end on Friday (14 days total)
 */
export function getPayPeriodBounds(date: Date): { start: Date; end: Date } {
  const current = startOfDay(date);
  
  // Find how many days since last Saturday (0 = Saturday, 1 = Sunday, etc.)
  const dayOfWeek = current.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7; // Saturday = 0 days back
  
  // Go back to the most recent Saturday (or stay on Saturday if today is Saturday)
  const lastSaturday = subDays(current, daysSinceSaturday);
  
  // Calculate weeks since a known pay period start (use Jan 1, 2000 as epoch - was a Saturday)
  const epoch = new Date(2000, 0, 1); // Jan 1, 2000 was a Saturday
  const weeksSinceEpoch = Math.floor(differenceInDays(lastSaturday, epoch) / 7);
  
  // If odd number of weeks, we need to go back one more week
  const periodsElapsed = Math.floor(weeksSinceEpoch / 2);
  const periodStart = addDays(epoch, periodsElapsed * 14);
  
  const periodEnd = addDays(periodStart, 13); // 13 days later = Friday
  periodEnd.setHours(23, 59, 59, 999);
  
  return { start: periodStart, end: periodEnd };
}

/**
 * Calculate payday (Thursday after period ends)
 * Period ends on Friday, payday is 6 days later (next Thursday)
 */
export function getPayday(periodEnd: Date): Date {
  // Period ends on Friday, payday is 6 days later (next Thursday)
  return addDays(periodEnd, 6);
}

/**
 * Calculate pay period pay (both weeks)
 */
export function calculatePayPeriodPay(shifts: Shift[]): PayPeriodPay {
  if (shifts.length === 0) {
    const today = new Date();
    const { end } = getPayPeriodBounds(today);
    return {
      week1: { regularHours: 0, otHours: 0, totalPaidHours: 0, totalPay: 0 },
      week2: { regularHours: 0, otHours: 0, totalPaidHours: 0, totalPay: 0 },
      totalRegularHours: 0,
      totalOtHours: 0,
      totalPaidHours: 0,
      totalPay: 0,
      payDate: getPayday(end),
    };
  }
  
  // Split shifts into week 1 and week 2
  const { start: periodStart } = getPayPeriodBounds(new Date(shifts[0].date));
  const week1End = new Date(periodStart);
  week1End.setDate(periodStart.getDate() + 6); // End of first week (Friday)
  
  const week1Shifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= periodStart && shiftDate <= week1End;
  });
  
  const week2Shifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate > week1End;
  });
  
  const week1 = calculateWeekPay(week1Shifts);
  const week2 = calculateWeekPay(week2Shifts);
  
  const totalRegularHours = week1.regularHours + week2.regularHours;
  const totalOtHours = week1.otHours + week2.otHours;
  const totalPaidHours = week1.totalPaidHours + week2.totalPaidHours;
  const totalPay = week1.totalPay + week2.totalPay;
  
  const { end: periodEnd } = getPayPeriodBounds(new Date(shifts[0].date));
  const payDate = getPayday(periodEnd);
  
  return {
    week1,
    week2,
    totalRegularHours,
    totalOtHours,
    totalPaidHours,
    totalPay,
    payDate,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format hours
 */
export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

