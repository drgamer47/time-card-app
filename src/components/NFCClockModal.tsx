import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Clock, Coffee, LogOut, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import type { Shift } from '../types';

interface NFCClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShiftState = 'clocked_out' | 'clocked_in' | 'on_lunch' | 'lunch_ended';

export function NFCClockModal({ isOpen, onClose }: NFCClockModalProps) {
  const [loading, setLoading] = useState(true);
  const [shiftState, setShiftState] = useState<ShiftState>('clocked_out');
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkShiftStatus();
    }
  }, [isOpen]);

  const checkShiftStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // Get today's shift
      const { data: shifts, error } = await (supabase
        .from('shifts') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching shifts:', error);
        setLoading(false);
        return;
      }

      if (!shifts || shifts.length === 0) {
        setShiftState('clocked_out');
        setActiveShift(null);
      } else {
        const shift = shifts[0];
        setActiveShift(shift);

        // Determine state
        if (!shift.actual_start) {
          setShiftState('clocked_out');
        } else if (!shift.actual_end) {
          // Still clocked in
          if (shift.lunch_start && !shift.lunch_end) {
            setShiftState('on_lunch');
          } else if (shift.lunch_end) {
            setShiftState('lunch_ended');
          } else {
            setShiftState('clocked_in');
          }
        } else {
          // Shift completed
          setShiftState('clocked_out');
        }
      }
    } catch (error) {
      console.error('Error checking shift status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in');
        return;
      }

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      const { error } = await (supabase
        .from('shifts') as any)
        .insert({
          user_id: user.id,
          date: today,
          actual_start: now.toISOString(),
          actual_end: null,
          scheduled_start: now.toISOString(),
          scheduled_end: null,
          lunch_start: null,
          lunch_end: null
        });

      if (error) throw error;

      await checkShiftStatus();
      showSuccess('Clocked In!');
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartLunch = async () => {
    if (!activeShift) return;
    setActionLoading(true);

    try {
      const now = new Date();

      const { error } = await (supabase
        .from('shifts') as any)
        .update({ lunch_start: now.toISOString() })
        .eq('id', activeShift.id);

      if (error) throw error;

      await checkShiftStatus();
      showSuccess('Lunch Started');
    } catch (error) {
      console.error('Error starting lunch:', error);
      alert('Failed to start lunch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndLunch = async () => {
    if (!activeShift) return;
    setActionLoading(true);

    try {
      const now = new Date();

      const { error } = await (supabase
        .from('shifts') as any)
        .update({ lunch_end: now.toISOString() })
        .eq('id', activeShift.id);

      if (error) throw error;

      await checkShiftStatus();
      showSuccess('Lunch Ended');
    } catch (error) {
      console.error('Error ending lunch:', error);
      alert('Failed to end lunch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeShift) return;
    setActionLoading(true);

    try {
      const now = new Date();

      const { error } = await (supabase
        .from('shifts') as any)
        .update({ actual_end: now.toISOString() })
        .eq('id', activeShift.id);

      if (error) throw error;

      await checkShiftStatus();
      showSuccess('Clocked Out!');
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    // Simple success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-t-xl flex justify-between items-center" style={{ backgroundColor: '#0072CE' }}>
          <div>
            <h2 className="text-2xl font-bold">Quick Clock</h2>
            <p className="text-sm opacity-90 mt-1">{format(new Date(), 'EEE, MMM d • h:mm a')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" style={{ borderColor: '#0072CE', borderTopColor: 'transparent' }}></div>
              <p className="text-gray-600 mt-4">Checking status...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status Badge */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  shiftState === 'clocked_out' ? 'bg-gray-100 text-gray-700' :
                  shiftState === 'on_lunch' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    shiftState === 'clocked_out' ? 'bg-gray-500' :
                    shiftState === 'on_lunch' ? 'bg-orange-500' :
                    'bg-green-500'
                  } animate-pulse`}></div>
                  {shiftState === 'clocked_out' && 'Not Working'}
                  {shiftState === 'clocked_in' && 'Working'}
                  {shiftState === 'on_lunch' && 'On Lunch'}
                  {shiftState === 'lunch_ended' && 'Working'}
                </div>
              </div>

              {/* Actions Based on State */}
              {shiftState === 'clocked_out' && (
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-6 h-6" />
                  Clock In
                </button>
              )}

              {shiftState === 'clocked_in' && (
                <>
                  <button
                    onClick={handleStartLunch}
                    disabled={actionLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                  >
                    <Coffee className="w-6 h-6" />
                    Start Lunch
                  </button>

                  <button
                    onClick={handleClockOut}
                    disabled={actionLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-6 h-6" />
                    Clock Out
                  </button>
                </>
              )}

              {shiftState === 'on_lunch' && (
                <button
                  onClick={handleEndLunch}
                  disabled={actionLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                  <Clock className="w-6 h-6" />
                  End Lunch
                </button>
              )}

              {shiftState === 'lunch_ended' && (
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-6 h-6" />
                  Clock Out
                </button>
              )}

              {/* Shift Info */}
              {activeShift && shiftState !== 'clocked_out' && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="text-gray-600 mb-2 font-semibold">Today's Shift</p>
                  <div className="space-y-1">
                    {activeShift.actual_start && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Clocked In</span>
                        <span className="font-semibold">{format(new Date(activeShift.actual_start), 'h:mm a')}</span>
                      </div>
                    )}
                    {activeShift.lunch_start && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Lunch Start</span>
                        <span className="font-semibold">{format(new Date(activeShift.lunch_start), 'h:mm a')}</span>
                      </div>
                    )}
                    {activeShift.lunch_end && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Lunch End</span>
                        <span className="font-semibold">{format(new Date(activeShift.lunch_end), 'h:mm a')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

