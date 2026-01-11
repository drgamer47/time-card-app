import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { differenceInMinutes } from 'date-fns';
import { formatCurrency, formatHours } from '../lib/calculations';
import type { Shift } from '../types';

interface ShiftFormProps {
  shift?: Shift | null;
  onSubmit: (data: Omit<Shift, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export default function ShiftForm({ shift, onSubmit, onCancel }: ShiftFormProps) {
  const today = new Date();
  const defaultDate = shift ? parseISO(shift.date) : today;
  
  const [date, setDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  
  // Get time from actual_start or scheduled_start
  const getStartTime = (): string => {
    if (shift?.actual_start) return format(parseISO(shift.actual_start), 'HH:mm');
    if (shift?.scheduled_start) return format(parseISO(shift.scheduled_start), 'HH:mm');
    return '09:00';
  };
  
  const getEndTime = (): string => {
    if (shift?.actual_end) return format(parseISO(shift.actual_end), 'HH:mm');
    if (shift?.scheduled_end) return format(parseISO(shift.scheduled_end), 'HH:mm');
    return '17:00';
  };
  
  const [clockIn, setClockIn] = useState(getStartTime());
  const [lunchStart, setLunchStart] = useState(
    shift?.lunch_start ? format(parseISO(shift.lunch_start), 'HH:mm') : ''
  );
  const [lunchEnd, setLunchEnd] = useState(
    shift?.lunch_end ? format(parseISO(shift.lunch_end), 'HH:mm') : ''
  );
  const [clockOut, setClockOut] = useState(getEndTime());
  const [notes, setNotes] = useState(shift?.notes || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate real-time values
  const dateObj = parseISO(date);
  const clockInTime = new Date(dateObj);
  const [clockInHour, clockInMin] = clockIn.split(':').map(Number);
  clockInTime.setHours(clockInHour, clockInMin, 0, 0);

  const clockOutTime = new Date(dateObj);
  const [clockOutHour, clockOutMin] = clockOut.split(':').map(Number);
  clockOutTime.setHours(clockOutHour, clockOutMin, 0, 0);

  // Handle overnight shifts
  if (clockOutTime <= clockInTime) {
    clockOutTime.setDate(clockOutTime.getDate() + 1);
  }

  // Calculate total hours using minutes for accuracy
  const totalMinutes = differenceInMinutes(clockOutTime, clockInTime);
  const totalHours = totalMinutes / 60;

  // Calculate lunch break in minutes
  let lunchMinutes = 0;
  if (lunchStart && lunchEnd) {
    const lunchStartTime = new Date(dateObj);
    const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
    lunchStartTime.setHours(lunchStartH, lunchStartM, 0, 0);

    const lunchEndTime = new Date(dateObj);
    const [lunchEndH, lunchEndM] = lunchEnd.split(':').map(Number);
    lunchEndTime.setHours(lunchEndH, lunchEndM, 0, 0);

    if (lunchEndTime <= lunchStartTime) {
      lunchEndTime.setDate(lunchEndTime.getDate() + 1);
    }

    lunchMinutes = differenceInMinutes(lunchEndTime, lunchStartTime);
  }

  const lunchHours = lunchMinutes / 60;
  
  // Paid hours = total minutes minus lunch minutes, converted to hours
  const paidHours = (totalMinutes - lunchMinutes) / 60;
  const shiftPay = paidHours * 14; // Base rate

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clockIn || !clockOut) {
      newErrors.times = 'Clock in and out times are required';
    } else if (clockOutTime <= clockInTime && clockOutTime.getDate() === clockInTime.getDate()) {
      newErrors.times = 'Clock out must be after clock in';
    }

    if (lunchStart && !lunchEnd) {
      newErrors.lunch = 'Lunch end time is required if lunch start is provided';
    } else if (!lunchStart && lunchEnd) {
      newErrors.lunch = 'Lunch start time is required if lunch end is provided';
    } else if (lunchStart && lunchEnd) {
      const ls = new Date(dateObj);
      const [lsH, lsM] = lunchStart.split(':').map(Number);
      ls.setHours(lsH, lsM, 0, 0);
      const le = new Date(dateObj);
      const [leH, leM] = lunchEnd.split(':').map(Number);
      le.setHours(leH, leM, 0, 0);
      if (le <= ls && le.getDate() === ls.getDate()) {
        newErrors.lunch = 'Lunch end must be after lunch start';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Determine if this is a future shift
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shiftDate = new Date(dateObj);
    shiftDate.setHours(0, 0, 0, 0);
    const isFuture = shiftDate > today;

    // Build time strings
    const startTime = clockInTime.toISOString();
    const endTime = clockOutTime.toISOString();
    
    // Fix lunch times
    const lunchStartDate = lunchStart ? (() => {
      const d = new Date(dateObj);
      const [h, m] = lunchStart.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    })() : null;
    
    const lunchEndDate = lunchEnd ? (() => {
      const d = new Date(dateObj);
      const [h, m] = lunchEnd.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      if (d <= new Date(lunchStartDate!)) {
        d.setDate(d.getDate() + 1);
      }
      return d.toISOString();
    })() : null;

    // If future date, save as scheduled; otherwise save as actual
    await onSubmit({
      date: format(dateObj, 'yyyy-MM-dd'),
      scheduled_start: isFuture ? startTime : startTime, // Always save scheduled
      scheduled_end: isFuture ? endTime : endTime,
      actual_start: isFuture ? null : startTime, // Only actual if past/today
      actual_end: isFuture ? null : endTime,
      lunch_start: lunchStartDate,
      lunch_end: lunchEndDate,
      notes: notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-2">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clockIn" className="block text-sm font-medium text-text-primary mb-2">
            Clock In
          </label>
          <input
            type="time"
            id="clockIn"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="clockOut" className="block text-sm font-medium text-text-primary mb-2">
            Clock Out
          </label>
          <input
            type="time"
            id="clockOut"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      {errors.times && (
        <p className="text-sm text-red-600">{errors.times}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Lunch Break (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lunchStart" className="block text-xs text-text-secondary mb-1">
              Start
            </label>
            <input
              type="time"
              id="lunchStart"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="lunchEnd" className="block text-xs text-text-secondary mb-1">
              End
            </label>
            <input
              type="time"
              id="lunchEnd"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        {errors.lunch && (
          <p className="text-sm text-red-600 mt-1">{errors.lunch}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Add any notes about this shift..."
        />
      </div>

      {/* Real-time calculations */}
      <div className="bg-background rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold mb-3">Calculations</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Hours</span>
            <span className="font-medium">{formatHours(totalHours)}</span>
          </div>
          {lunchHours > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Lunch Duration</span>
              <span className="font-medium">{formatHours(lunchHours)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text-secondary">Paid Hours</span>
            <span className="font-semibold">{formatHours(paidHours)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold">Shift Pay</span>
            <span className="font-bold text-success">{formatCurrency(shiftPay)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, #0072CE, #0056A3)' }}
        >
          {shift ? 'Update Shift' : 'Save Shift'}
        </button>
      </div>
    </form>
  );
}

