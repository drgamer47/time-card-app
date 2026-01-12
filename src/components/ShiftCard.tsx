import { format, parseISO } from 'date-fns';
import { Edit, Trash2, Coffee } from 'lucide-react';
import { calculateShiftHours, formatCurrency, formatHours } from '../lib/calculations';
import type { Shift } from '../types';

interface ShiftCardProps {
  shift: Shift;
  onEdit?: (shift: Shift) => void;
  onDelete?: (shiftId: string) => void;
}

export default function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  const calculation = calculateShiftHours(shift);
  const shiftPay = calculation.paidHours * 14; // Base rate, OT calculated at week level

  const date = parseISO(shift.date);
  // Get display time (actual or scheduled)
  const startTime = shift.actual_start ? parseISO(shift.actual_start) : (shift.scheduled_start ? parseISO(shift.scheduled_start) : null);
  const endTime = shift.actual_end ? parseISO(shift.actual_end) : (shift.scheduled_end ? parseISO(shift.scheduled_end) : null);
  const isScheduled = !shift.actual_start;

  return (
    <div className="bg-surface rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="font-semibold text-lg">
            {format(date, 'EEEE, MMM d')}
          </div>
        </div>
        {/* Mood & Energy Display */}
        {!isScheduled && (shift.mood || shift.energy_level) && (
          <div className="flex gap-2 mr-2">
            {shift.mood && (
              <div className="bg-gray-50 px-3 py-1 rounded-full">
                <span className="text-lg">{shift.mood}</span>
              </div>
            )}
            {shift.energy_level && (
              <div className="bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="text-xs font-semibold text-yellow-700">{shift.energy_level}</span>
                <span className="text-yellow-400 text-xs">★</span>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(shift)}
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              aria-label="Edit shift"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(shift.id)}
              className="p-2 text-text-secondary hover:text-red-600 transition-colors"
              aria-label="Delete shift"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {startTime && endTime && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">{isScheduled ? 'Scheduled Start' : 'Clock In'}</span>
              <span className="font-medium">{format(startTime, 'h:mm a')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">{isScheduled ? 'Scheduled End' : 'Clock Out'}</span>
              <span className="font-medium">{format(endTime, 'h:mm a')}</span>
            </div>
          </>
        )}
        <div className="flex gap-2 flex-wrap">
        {isScheduled && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded inline-block">
            Scheduled
          </span>
        )}
        {!isScheduled && (
          <span className="bg-success/20 text-success text-xs font-semibold px-2 py-1 rounded inline-block">
            Worked
          </span>
        )}
          {shift.is_holiday && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded inline-block">
              🎉 Holiday Pay
            </span>
          )}
          {!isScheduled && (shift as any).breaks_taken > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Coffee className="w-3 h-3" />
              <span>{(shift as any).breaks_taken} break{(shift as any).breaks_taken !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hours Breakdown */}
      <div className="space-y-2 bg-gray-50 rounded p-3 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Shift</span>
          <span className="font-semibold text-gray-900">{formatHours(calculation.totalHours)}</span>
        </div>
        
        {calculation.lunchHours > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Lunch Break</span>
            <span className="font-semibold text-orange-600">-{formatHours(calculation.lunchHours)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Paid Hours</span>
          <span className="font-bold text-blue-600">{formatHours(calculation.paidHours)}</span>
        </div>
      </div>

      {!isScheduled && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Shift Pay</span>
            <span className="text-lg font-bold text-success">{formatCurrency(shiftPay)}</span>
          </div>
        </div>
      )}

      {shift.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-text-secondary italic">{shift.notes}</p>
        </div>
      )}
    </div>
  );
}

