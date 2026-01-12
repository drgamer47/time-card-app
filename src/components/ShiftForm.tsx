import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { differenceInMinutes } from 'date-fns';
import { Smile, Meh, Angry, Laugh } from 'lucide-react';
import { formatCurrency, formatHours, getPayRate } from '../lib/calculations';
import type { Shift } from '../types';

interface ShiftFormProps {
  shift?: Shift | null;
  onSubmit: (data: Omit<Shift, 'id' | 'user_name' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  onOffDay?: () => Promise<void>;
}

export default function ShiftForm({ shift, onSubmit, onCancel, onOffDay }: ShiftFormProps) {
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
  const [isHoliday, setIsHoliday] = useState(shift?.is_holiday || false);
  const [mood, setMood] = useState<string>(shift?.mood || '');
  const [energyLevel, setEnergyLevel] = useState<number>(shift?.energy_level || 0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mood options
  const moodOptions = [
    { emoji: '😫', label: 'Exhausted', icon: Angry, value: '😫' },
    { emoji: '😐', label: 'Meh', icon: Meh, value: '😐' },
    { emoji: '🙂', label: 'Okay', icon: Smile, value: '🙂' },
    { emoji: '😊', label: 'Good', icon: Smile, value: '😊' },
    { emoji: '😄', label: 'Great', icon: Laugh, value: '😄' },
  ];

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
  
  // Get pay rate and calculate shift pay with holiday multiplier
  // Use useMemo to ensure it recalculates when isHoliday changes
  const shiftPay = useMemo(() => {
    const baseRate = getPayRate();
    const holidayMultiplier = isHoliday ? 1.5 : 1;
    return paidHours * baseRate * holidayMultiplier;
  }, [paidHours, isHoliday]);

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

    // Build time strings
    const startTime = clockInTime.toISOString();
    const endTime = clockOutTime.toISOString();
    
    // Determine if this is a future shift - check if start time is in the future
    const now = new Date();
    const isFuture = clockInTime > now; // If start time is in the future, it's scheduled
    
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

    // Determine if this should be actual or scheduled
    // If editing an existing shift, preserve its original type (actual vs scheduled)
    // For new shifts, use date: future = scheduled, past/today = actual
    const wasWorked = shift?.actual_start && shift?.actual_end;
    const wasScheduled = shift?.scheduled_start && shift?.scheduled_end && !shift?.actual_start;
    
    let actualStart: string | null = null;
    let actualEnd: string | null = null;
    
    if (wasWorked) {
      // Preserve as worked shift - always has actual times
      actualStart = startTime;
      actualEnd = endTime;
    } else if (wasScheduled) {
      // Preserve as scheduled shift - no actual times, even if date is now today
      // Scheduled shifts stay scheduled until user actually clocks in
      actualStart = null;
      actualEnd = null;
    } else {
      // New shift - determine based on start time
      // If start time is in the future, it's scheduled; otherwise it's actual
      actualStart = isFuture ? null : startTime;
      actualEnd = isFuture ? null : endTime;
    }
    
    // Only include mood and energy for worked shifts (not scheduled)
    const isWorkedShift = actualStart !== null && actualEnd !== null;
    
    await onSubmit({
      date: format(dateObj, 'yyyy-MM-dd'),
      scheduled_start: startTime, // Always save scheduled times
      scheduled_end: endTime,
      actual_start: actualStart,
      actual_end: actualEnd,
      lunch_start: lunchStartDate,
      lunch_end: lunchEndDate,
      is_holiday: isHoliday,
      mood: isWorkedShift ? (mood || null) : null,
      energy_level: isWorkedShift ? (energyLevel || null) : null,
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

      {/* Mood & Energy Section - Only show if it's a worked shift (not scheduled) */}
      {(() => {
        const dateObjCheck = parseISO(date);
        const clockInTimeCheck = new Date(dateObjCheck);
        const [clockInHourCheck, clockInMinCheck] = clockIn.split(':').map(Number);
        clockInTimeCheck.setHours(clockInHourCheck, clockInMinCheck, 0, 0);
        const isFutureShift = clockInTimeCheck > new Date();
        const isWorkedShift = shift?.actual_start && shift?.actual_end;
        const willBeWorkedShift = !isFutureShift && !shift;
        
        // Show mood/energy if editing a worked shift, or creating a non-future shift
        if (isWorkedShift || willBeWorkedShift) {
          return (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-text-primary mb-3">
                How was this shift? (optional)
              </label>
              
              {/* Mood Picker */}
              <div className="mb-4">
                <p className="text-xs text-text-secondary mb-2">Mood</p>
                <div className="flex gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMood(option.value)}
                      className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                        mood === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="text-xs text-text-secondary mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <p className="text-xs text-text-secondary mb-2">Energy Level</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                        energyLevel === level
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl font-bold text-text-primary">{level}</div>
                      <div className="flex justify-center mt-1">
                        {Array.from({ length: level }).map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">★</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-secondary mt-2 text-center">
                  1 = Drained | 5 = Energized
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Real-time calculations */}
      {/* Holiday Pay Toggle */}
      <div className={`flex items-center gap-3 p-4 rounded-lg touch-manipulation transition-colors ${
        isHoliday ? 'bg-amber-100 border-2 border-amber-400' : 'bg-amber-50 border border-amber-200'
      }`}>
        <input
          type="checkbox"
          id="isHoliday"
          checked={isHoliday}
          onChange={(e) => {
            setIsHoliday(e.target.checked);
          }}
          className="w-6 h-6 md:w-5 md:h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 touch-manipulation cursor-pointer"
        />
        <label htmlFor="isHoliday" className="flex-1 cursor-pointer touch-manipulation">
          <span className="font-semibold text-amber-900">Holiday Pay</span>
          <p className="text-sm text-amber-700">Pay at 1.5x rate for this shift</p>
          {isHoliday && (
            <p className="text-xs text-amber-800 mt-1 font-bold">✓ Active - Pay will be 1.5x</p>
          )}
        </label>
      </div>

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
            <span className="font-semibold">
              Shift Pay
              {isHoliday && <span className="text-amber-600 ml-2">(Holiday 1.5x)</span>}
            </span>
            <span className={`font-bold ${isHoliday ? 'text-amber-600' : 'text-success'}`}>
              {formatCurrency(shiftPay)}
              {isHoliday && <span className="text-xs ml-1">(1.5x)</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-w-[120px] px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 min-w-[120px] px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          {shift ? 'Update Shift' : 'Save Shift'}
        </button>
        {onOffDay && !shift && (
          <button
            type="button"
            onClick={onOffDay}
            className="w-full md:w-auto md:absolute md:bottom-0 md:right-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 mt-2 md:mt-0"
          >
            Off Day
          </button>
        )}
      </div>
    </form>
  );
}

