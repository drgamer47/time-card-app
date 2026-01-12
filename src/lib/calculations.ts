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
 * Calculate actual hours for a shift (only if it has actual_start and actual_end)
 */
export function calculateActualShiftHours(shift: Shift): ShiftCalculation {
  if (!shift.actual_start || !shift.actual_end) {
    return { totalHours: 0, lunchHours: 0, paidHours: 0 };
  }

  const start = new Date(shift.actual_start);
  const end = new Date(shift.actual_end);
  
  const totalMinutes = differenceInMinutes(end, start);
  const totalHours = totalMinutes / 60;
  
  let lunchMinutes = 0;
  if (shift.lunch_start && shift.lunch_end) {
    const lunchStart = new Date(shift.lunch_start);
    const lunchEnd = new Date(shift.lunch_end);
    lunchMinutes = differenceInMinutes(lunchEnd, lunchStart);
  }
  
  const lunchHours = lunchMinutes / 60;
  const paidHours = (totalMinutes - lunchMinutes) / 60;
  
  return { 
    totalHours: Number(totalHours.toFixed(2)), 
    lunchHours: Number(lunchHours.toFixed(2)), 
    paidHours: Number(paidHours.toFixed(2)) 
  };
}

/**
 * Calculate expected hours for a scheduled shift (only if it has scheduled times but no actual times)
 */
export function calculateExpectedShiftHours(shift: Shift): ShiftCalculation {
  // Only calculate expected if it's a scheduled shift (has scheduled times but no actual_start)
  if (shift.actual_start || !shift.scheduled_start || !shift.scheduled_end) {
    return { totalHours: 0, lunchHours: 0, paidHours: 0 };
  }

  const start = new Date(shift.scheduled_start);
  const end = new Date(shift.scheduled_end);
  
  const totalMinutes = differenceInMinutes(end, start);
  const totalHours = totalMinutes / 60;
  
  // For scheduled shifts, assume lunch if scheduled times suggest it (e.g., 8+ hour shift)
  // Or use scheduled lunch times if they exist
  let lunchMinutes = 0;
  if (shift.lunch_start && shift.lunch_end) {
    const lunchStart = new Date(shift.lunch_start);
    const lunchEnd = new Date(shift.lunch_end);
    lunchMinutes = differenceInMinutes(lunchEnd, lunchStart);
  } else if (totalHours >= 6) {
    // Default 30 min lunch for shifts 6+ hours
    lunchMinutes = 30;
  }
  
  const lunchHours = lunchMinutes / 60;
  const paidHours = (totalMinutes - lunchMinutes) / 60;
  
  return { 
    totalHours: Number(totalHours.toFixed(2)), 
    lunchHours: Number(lunchHours.toFixed(2)), 
    paidHours: Number(paidHours.toFixed(2)) 
  };
}

/**
 * Calculate pay for a week (Sunday-Saturday)
 * Separates actual hours worked from expected/scheduled hours
 */
export function calculateWeekPay(shifts: Shift[]): WeeklyPay {
  // Calculate actual hours (only shifts with actual_start and actual_end)
  const actualShifts = shifts.filter(shift => shift.actual_start && shift.actual_end);
  const totalPaidHours = actualShifts.reduce((sum, shift) => {
    return sum + calculateActualShiftHours(shift).paidHours;
  }, 0);
  
  // Calculate expected hours (scheduled shifts without actual_start)
  const expectedShifts = shifts.filter(shift => !shift.actual_start && shift.scheduled_start && shift.scheduled_end);
  const expectedPaidHours = expectedShifts.reduce((sum, shift) => {
    return sum + calculateExpectedShiftHours(shift).paidHours;
  }, 0);
  
  // Calculate pay for actual hours
  const regularHours = Math.min(totalPaidHours, OT_THRESHOLD);
  const otHours = Math.max(totalPaidHours - OT_THRESHOLD, 0);
  const totalPay = (regularHours * HOURLY_RATE) + (otHours * OT_RATE);
  
  // Calculate expected pay (combining actual + expected hours for projection)
  const totalProjectedHours = totalPaidHours + expectedPaidHours;
  const projectedRegularHours = Math.min(totalProjectedHours, OT_THRESHOLD);
  const projectedOtHours = Math.max(totalProjectedHours - OT_THRESHOLD, 0);
  const expectedPay = (projectedRegularHours * HOURLY_RATE) + (projectedOtHours * OT_RATE);
  
  return { 
    regularHours, 
    otHours, 
    totalPaidHours, 
    expectedPaidHours,
    totalPay,
    expectedPay
  };
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
      week1: { regularHours: 0, otHours: 0, totalPaidHours: 0, expectedPaidHours: 0, totalPay: 0, expectedPay: 0 },
      week2: { regularHours: 0, otHours: 0, totalPaidHours: 0, expectedPaidHours: 0, totalPay: 0, expectedPay: 0 },
      totalRegularHours: 0,
      totalOtHours: 0,
      totalPaidHours: 0,
      expectedPaidHours: 0,
      totalPay: 0,
      expectedPay: 0,
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
  const expectedPaidHours = week1.expectedPaidHours + week2.expectedPaidHours;
  const totalPay = week1.totalPay + week2.totalPay;
  const expectedPay = week1.expectedPay + week2.expectedPay;
  
  const { end: periodEnd } = getPayPeriodBounds(new Date(shifts[0].date));
  const payDate = getPayday(periodEnd);
  
  return {
    week1,
    week2,
    totalRegularHours,
    totalOtHours,
    totalPaidHours,
    expectedPaidHours,
    totalPay,
    expectedPay,
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

