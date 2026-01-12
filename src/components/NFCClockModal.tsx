import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useJob } from '../contexts/JobContext';
import { X, Clock, Coffee, LogOut, LogIn, Smile, Meh, Angry, Laugh, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import type { Shift } from '../types';

interface NFCClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShiftState = 'clocked_out' | 'clocked_in' | 'on_lunch' | 'lunch_ended';

export function NFCClockModal({ isOpen, onClose }: NFCClockModalProps) {
  const { currentUser } = useUser();
  const { jobs, selectedJob, setSelectedJob } = useJob();
  const [loading, setLoading] = useState(true);
  const [shiftState, setShiftState] = useState<ShiftState>('clocked_out');
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [mood, setMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(0);
  const [justClockedOutShiftId, setJustClockedOutShiftId] = useState<string | null>(null);

  // Mood options
  const moodOptions = [
    { emoji: '😫', label: 'Exhausted', icon: Angry, value: '😫' },
    { emoji: '😐', label: 'Meh', icon: Meh, value: '😐' },
    { emoji: '🙂', label: 'Okay', icon: Smile, value: '🙂' },
    { emoji: '😊', label: 'Good', icon: Smile, value: '😊' },
    { emoji: '😄', label: 'Great', icon: Laugh, value: '😄' },
  ];

  useEffect(() => {
    if (isOpen && currentUser) {
      checkShiftStatus();
    }
  }, [isOpen, currentUser]);

  const checkShiftStatus = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // Get today's shift
      const { data: shifts, error } = await (supabase
        .from('shifts') as any)
        .select('*')
        .eq('user_name', currentUser)
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

  const performClockIn = async (jobToUse: typeof selectedJob) => {
    setActionLoading(true);
    try {
      if (!currentUser) {
        alert('Please select a user first');
        return;
      }

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      const { error } = await (supabase
        .from('shifts') as any)
        .insert({
          user_name: currentUser,
          date: today,
          actual_start: now.toISOString(),
          actual_end: null,
          scheduled_start: now.toISOString(),
          scheduled_end: null,
          lunch_start: null,
          lunch_end: null,
          job: jobToUse?.job_name || null,
        });

      if (error) throw error;

      setShowJobSelector(false);
      await checkShiftStatus();
      showSuccess('Clocked In!');
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockIn = async () => {
    // If user has multiple jobs and hasn't selected one, show selector
    if (jobs.length > 1 && !selectedJob) {
      setShowJobSelector(true);
      return;
    }

    await performClockIn(selectedJob);
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
    setShowClockOutConfirm(true);
  };

  const confirmClockOut = async () => {
    if (!activeShift) return;
    setShowClockOutConfirm(false);
    setActionLoading(true);

    try {
      const now = new Date();

      const { error } = await (supabase
        .from('shifts') as any)
        .update({ actual_end: now.toISOString() })
        .eq('id', activeShift.id);

      if (error) throw error;

      // Store the shift ID and show mood prompt
      setJustClockedOutShiftId(activeShift.id);
      setShowMoodPrompt(true);
      setActionLoading(false);
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
      setActionLoading(false);
    }
  };

  const handleSaveMoodAndEnergy = async () => {
    if (!justClockedOutShiftId) return;
    setActionLoading(true);

    try {
      const { error } = await (supabase
        .from('shifts') as any)
        .update({
          mood: mood || null,
          energy_level: energyLevel || null,
        })
        .eq('id', justClockedOutShiftId);

      if (error) throw error;

      await checkShiftStatus();
      showSuccess('Clocked Out!');
      setShowMoodPrompt(false);
      setMood('');
      setEnergyLevel(0);
      setJustClockedOutShiftId(null);
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Error saving mood/energy:', error);
      alert('Failed to save mood/energy');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipMood = async () => {
    setShowMoodPrompt(false);
    setMood('');
    setEnergyLevel(0);
    setJustClockedOutShiftId(null);
    await checkShiftStatus();
    showSuccess('Clocked Out!');
    setTimeout(onClose, 1500);
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
        <div className="bg-primary text-white p-6 rounded-t-xl flex justify-between items-center">
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

              {/* Job Selector */}
              {showJobSelector && jobs.length > 1 && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Which job are you clocking in for?</span>
                  </div>
                  {jobs.map((job) => (
                    <button
                      key={job.job_name}
                      onClick={() => {
                        setSelectedJob(job);
                        performClockIn(job);
                      }}
                      className="w-full bg-white border-2 border-gray-200 hover:border-primary text-left p-4 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {job.job_name.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">${job.pay_rate}/hr</p>
                        </div>
                        {selectedJob?.job_name === job.job_name && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions Based on State */}
              {shiftState === 'clocked_out' && !showJobSelector && (
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 touch-manipulation min-h-[56px]"
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
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 touch-manipulation min-h-[56px]"
                  >
                    <Coffee className="w-6 h-6" />
                    Start Lunch
                  </button>

                  <button
                    onClick={handleClockOut}
                    disabled={actionLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 touch-manipulation min-h-[56px]"
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
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 touch-manipulation min-h-[56px]"
                >
                  <Clock className="w-6 h-6" />
                  End Lunch
                </button>
              )}

              {shiftState === 'lunch_ended' && (
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 touch-manipulation min-h-[56px]"
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
      
      {/* Clock Out Confirmation Modal */}
      {showClockOutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clock Out?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to clock out?</p>
            <div className="flex gap-3">
              <button
                onClick={confirmClockOut}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                Yes, Clock Out
              </button>
              <button
                onClick={() => setShowClockOutConfirm(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood & Energy Prompt Modal */}
      {showMoodPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">How was your shift?</h3>
            <p className="text-gray-600 mb-6 text-sm">Optional - you can skip this</p>
            
            {/* Mood Picker */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Mood</p>
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
                    <div className="text-xs text-gray-600 mt-1">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Energy Level</p>
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
                    <div className="text-xl font-bold text-gray-900">{level}</div>
                    <div className="flex justify-center mt-1">
                      {Array.from({ length: level }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">★</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                1 = Drained | 5 = Energized
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSkipMood}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                Skip
              </button>
              <button
                onClick={handleSaveMoodAndEnergy}
                disabled={actionLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

