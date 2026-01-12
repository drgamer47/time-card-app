import { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Coffee, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Shift } from '../types';

export function TimerControls() {
  const { startTimer, isRunning } = useTimer();
  const { currentUser } = useUser();
  const [todayShift, setTodayShift] = useState<Shift | null>(null);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [expectedBreaks, setExpectedBreaks] = useState(0);
  const [lunchTaken, setLunchTaken] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchTodayShift();
    }
  }, [currentUser]);

  const fetchTodayShift = async () => {
    if (!currentUser) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    const { data: shifts, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_name', currentUser)
      .eq('date', today)
      .not('actual_start', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching today shift:', error);
      return;
    }

    if (shifts && shifts.length > 0) {
      const shift = shifts[0] as Shift;
      setTodayShift(shift);
      setBreaksTaken((shift as any).breaks_taken || 0);

      // Calculate expected breaks based on shift length
      if (shift.actual_start && shift.actual_end) {
        const start = new Date(shift.actual_start);
        const end = new Date(shift.actual_end);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (hours <= 5) {
          setExpectedBreaks(1);
        } else if (hours <= 7) {
          setExpectedBreaks(1);
        } else {
          setExpectedBreaks(2);
        }
      }

      // Check if lunch taken
      setLunchTaken(shift.lunch_start !== null);
    }
  };

  const handleStartBreak = async () => {
    startTimer('break');

    // Increment break counter in database
    if (todayShift) {
      const newBreaksTaken = breaksTaken + 1;
      const { error } = await supabase
        .from('shifts')
        .update({ breaks_taken: newBreaksTaken })
        .eq('id', todayShift.id);

      if (!error) {
        setBreaksTaken(newBreaksTaken);
      } else {
        console.error('Error updating breaks_taken:', error);
      }
    }
  };

  const handleStartLunch = async (duration: 'lunch30' | 'lunch60') => {
    startTimer(duration);

    // Record lunch start time in database
    if (todayShift) {
      const lunchStart = new Date().toISOString();
      const { error } = await supabase
        .from('shifts')
        .update({ lunch_start: lunchStart })
        .eq('id', todayShift.id);

      if (error) {
        console.error('Error updating lunch_start:', error);
      }
    }
  };

  const getSuggestedLunchDuration = (): 'lunch30' | 'lunch60' => {
    if (!todayShift?.actual_start || !todayShift?.actual_end) return 'lunch30';

    const start = new Date(todayShift.actual_start);
    const end = new Date(todayShift.actual_end);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return hours >= 7 ? 'lunch60' : 'lunch30';
  };

  if (!todayShift || isRunning) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">Break & Lunch Timers</h3>

      <div className="space-y-3">
        {/* Break Timer */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-semibold text-gray-900">15min Break</p>
              <p className="text-xs text-gray-600">
                {breaksTaken}/{expectedBreaks} taken today
              </p>
            </div>
            <button
              onClick={handleStartBreak}
              disabled={breaksTaken >= expectedBreaks}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Start Break
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Alerts at 13min (warning) and 15min (complete)
          </p>
        </div>

        {/* Lunch Timer */}
        {!lunchTaken && (
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="mb-3">
              <p className="font-semibold text-gray-900 mb-1">Lunch Break</p>
              <p className="text-xs text-gray-600 mb-3">
                {getSuggestedLunchDuration() === 'lunch60' ? 'Suggested: 60 minutes' : 'Suggested: 30 minutes'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartLunch('lunch30')}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                30min
              </button>
              <button
                onClick={() => handleStartLunch('lunch60')}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                60min
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              30min: alerts at 28/30min | 60min: alerts at 58/60min
            </p>
          </div>
        )}

        {lunchTaken && (
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">✓ Lunch break completed</p>
          </div>
        )}
      </div>
    </div>
  );
}

