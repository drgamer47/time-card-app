export interface Shift {
  id: string;
  user_name: string; // Changed from user_id
  date: string; // ISO date string
  scheduled_start: string | null; // ISO timestamp
  scheduled_end: string | null; // ISO timestamp
  actual_start: string | null; // ISO timestamp (null for scheduled/future shifts)
  actual_end: string | null; // ISO timestamp (null for scheduled/future shifts)
  lunch_start: string | null; // ISO timestamp
  lunch_end: string | null; // ISO timestamp
  status?: string | null; // 'accepted', 'offered', 'day_off'
  is_holiday?: boolean | null; // Holiday pay flag
  mood?: string | null; // Mood emoji ('😫', '😐', '🙂', '😊', '😄')
  energy_level?: number | null; // Energy level 1-5
  breaks_taken?: number | null; // Number of breaks taken
  job?: string | null; // Job name (e.g., 'walmart', '7brew')
  notes: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ShiftCalculation {
  totalHours: number;
  lunchHours: number;
  paidHours: number;
}

export interface WeeklyPay {
  regularHours: number;
  otHours: number;
  totalPaidHours: number; // Actual hours worked
  expectedPaidHours: number; // Scheduled/expected hours
  totalPay: number; // Actual gross pay
  expectedPay: number; // Expected gross pay (actual + scheduled)
}

export interface PayPeriodPay {
  week1: WeeklyPay;
  week2: WeeklyPay;
  totalRegularHours: number;
  totalOtHours: number;
  totalPaidHours: number; // Actual hours worked
  expectedPaidHours: number; // Scheduled/expected hours
  totalPay: number; // Actual gross pay
  expectedPay: number; // Expected gross pay (actual + scheduled)
  payDate: Date;
}

