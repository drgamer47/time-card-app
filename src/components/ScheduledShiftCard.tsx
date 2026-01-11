import { format, parseISO } from 'date-fns';
import type { Shift } from '../types';

interface ScheduledShiftCardProps {
  shift: Shift;
}

export default function ScheduledShiftCard({ shift }: ScheduledShiftCardProps) {
  const date = parseISO(shift.date);
  const startTime = shift.scheduled_start ? parseISO(shift.scheduled_start) : parseISO(shift.actual_start);
  const endTime = shift.scheduled_end ? parseISO(shift.scheduled_end) : parseISO(shift.actual_end);

  return (
    <div className="bg-surface border-l-4 border-accent rounded-lg p-4 mx-4 my-2 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-text-primary">
            {format(date, 'EEE, MMM d')}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </div>
        </div>
        {shift.scheduled_start && shift.scheduled_end && (
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
            Scheduled
          </span>
        )}
      </div>
    </div>
  );
}

