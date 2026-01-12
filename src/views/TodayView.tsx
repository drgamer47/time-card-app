import { useState, useEffect } from 'react';
import { format, addDays, parseISO, subDays } from 'date-fns';
import { Plus as PlusIcon, Calendar as CalendarIcon, Clock as ClockIcon, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { getPayPeriodBounds, getPayday, calculatePayPeriodPay, formatCurrency, formatHours, calculateShiftHours } from '../lib/calculations';
import { calculateNetPay } from '../lib/taxCalculations';
import { calculateConsecutiveDaysStreak } from '../lib/streakCalculations';
import { requestNotificationPermission } from '../lib/notifications';
import { TimerControls } from '../components/TimerControls';
import type { Shift } from '../types';

interface TodayViewProps {
  onOpenNFCModal?: () => void;
}

export default function TodayView({ onOpenNFCModal }: TodayViewProps = {}) {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [periodShifts, setPeriodShifts] = useState<Shift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(0);
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const { start: periodStart, end: periodEnd } = getPayPeriodBounds(today);
  const payDate = getPayday(periodEnd);
  const periodPay = calculatePayPeriodPay(periodShifts);

  useEffect(() => {
    // Request notification permission on load
    requestNotificationPermission();

    // Update time immediately and then every second
    setCurrentTime(new Date());
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (currentUser) {
      loadData();
    }

    return () => clearInterval(timeInterval);
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPeriodShifts(),
        loadUpcomingShifts(),
        loadStreakData(),
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStreakData = async () => {
    try {
      if (!currentUser) return;
      
      // Get last 30 days of shifts
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: shifts } = await supabase
        .from('shifts')
        .select('date, status')
        .eq('user_name', currentUser)
        .gte('date', thirtyDaysAgo)
        .lte('date', today)
        .order('date', { ascending: false });

      if (shifts) {
        const currentStreak = calculateConsecutiveDaysStreak(shifts);
        setStreak(currentStreak);
      }
    } catch (err) {
      console.error('Error loading streak data:', err);
    }
  };

  const loadPeriodShifts = async () => {
    try {
      const { start, end } = getPayPeriodBounds(today);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      if (!currentUser) return;
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_name', currentUser)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true })
        .order('actual_start', { ascending: true });

      if (error) {
        console.error('Error loading period shifts:', error);
      } else {
        setPeriodShifts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadUpcomingShifts = async () => {
    try {
      const nextWeek = addDays(today, 7);
      const nextWeekStr = format(nextWeek, 'yyyy-MM-dd');

      if (!currentUser) return;
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_name', currentUser)
        .gte('date', todayStr)
        .lte('date', nextWeekStr)
        .order('date', { ascending: true })
        .order('actual_start', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error loading upcoming shifts:', error);
      } else {
        // Only show scheduled shifts (future shifts with scheduled times)
        const scheduledShifts = (data || []).filter(
          (shift: Shift) => shift.scheduled_start && shift.scheduled_end && shift.date >= todayStr
        );
        setUpcomingShifts(scheduledShifts);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const formattedDate = format(today, 'EEEE, MMMM d');
  const formattedTime = format(currentTime, 'h:mm:ss a');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6 w-full">
      {/* Softer Header */}
      <div className="bg-primary text-white px-6 py-6 md:py-8 shadow-md w-full">
        <div className="max-w-2xl md:max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{formattedDate}</h1>
          <p className="text-base md:text-lg mt-1 opacity-90 text-white">{formattedTime}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        {/* Streak Card */}
        {!loading && streak > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Work Streak</p>
                <p className="text-4xl font-bold">{streak}</p>
                <p className="text-xs opacity-75 mt-1">consecutive days</p>
              </div>
              <Flame className="w-12 h-12 opacity-80" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Current Pay Period</h2>
                <p className="text-sm text-gray-500">
                  {format(periodStart, 'MMM d')} - {format(periodEnd, 'MMM d')}
                </p>
              </div>
            </div>

            {periodShifts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="bg-gray-200 w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <ClockIcon className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No shifts recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lighter Stat Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 md:p-5 border border-blue-100 text-center">
                    <p className="text-sm text-blue-700 mb-1">Hours Worked</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-900">{formatHours(periodPay.totalPaidHours)}</p>
                  </div>
                  
                  {periodPay.expectedPaidHours > 0 && (
                    <div className="rounded-lg p-4 md:p-5 text-center" style={{ backgroundColor: 'var(--color-primary-30)' }}>
                      <p className="text-sm text-gray-800 mb-1 font-semibold">Hours Expected</p>
                      <p className="text-3xl md:text-4xl font-bold text-gray-900">{formatHours(periodPay.totalPaidHours + periodPay.expectedPaidHours)}</p>
                    </div>
                  )}
                  
                  <div className="bg-success/30 rounded-lg p-4 md:p-5 text-center">
                    <p className="text-sm text-gray-800 mb-1 font-semibold">Gross Pay (Actual)</p>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">{formatCurrency(periodPay.totalPay)}</p>
                  </div>
                  
                  {periodPay.expectedPaidHours > 0 && (
                    <div className="bg-success/30 rounded-lg p-4 md:p-5 text-center">
                      <p className="text-sm text-gray-800 mb-1 font-semibold">Gross Pay (Expected)</p>
                      <p className="text-3xl md:text-4xl font-bold text-gray-900">{formatCurrency(periodPay.expectedPay)}</p>
                    </div>
                  )}
                  
                  <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/20 text-center">
                    <p className="text-sm text-accent mb-1">Take Home (Actual)</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent">${calculateNetPay(periodPay.totalPay).netPay}</p>
                  </div>
                  
                  {periodPay.expectedPaidHours > 0 && (
                    <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/20 text-center">
                      <p className="text-sm text-accent mb-1">Take Home (Expected)</p>
                      <p className="text-3xl md:text-4xl font-bold text-accent">${calculateNetPay(periodPay.expectedPay).netPay}</p>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Worked</span>
                    <span className="font-semibold">{formatHours(periodPay.totalPaidHours)}</span>
                  </div>
                  {periodPay.expectedPaidHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-primary">Hours Expected</span>
                      <span className="font-semibold text-primary">{formatHours(periodPay.totalPaidHours + periodPay.expectedPaidHours)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular</span>
                    <span className="font-semibold">{formatHours(periodPay.totalRegularHours)} × $14 = {formatCurrency(periodPay.totalRegularHours * 14)}</span>
                  </div>
                  {periodPay.totalOtHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-orange-600">Overtime</span>
                      <span className="font-semibold text-orange-700">{formatHours(periodPay.totalOtHours)} × $21 = {formatCurrency(periodPay.totalOtHours * 21)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600">Gross Pay (Actual)</span>
                        <p className="text-lg font-bold text-success">{formatCurrency(periodPay.totalPay)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600">Take Home (Actual)</span>
                        <p className="text-lg font-bold text-accent">${calculateNetPay(periodPay.totalPay).netPay}</p>
                      </div>
                    </div>
                    {periodPay.expectedPaidHours > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div>
                          <span className="text-primary">Gross Pay (Expected)</span>
                          <p className="text-lg font-bold text-success">{formatCurrency(periodPay.expectedPay)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-primary">Take Home (Expected)</span>
                          <p className="text-lg font-bold text-accent">${calculateNetPay(periodPay.expectedPay).netPay}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pay Date - Still Colorful but Calmer */}
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <div>
                    <p className="text-sm text-accent mb-1">Pay Date</p>
                    <p className="text-xl font-bold text-gray-900">{format(payDate, 'EEE, MMM d')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Clock Button */}
        {onOpenNFCModal && (
          <button
            onClick={onOpenNFCModal}
            className="w-full md:w-auto md:max-w-md md:mx-auto bg-gradient-to-r from-accent/90 to-accent text-white font-semibold text-lg md:text-xl py-4 md:py-5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Zap className="w-5 h-5 md:w-6 md:h-6" />
            <span>Quick Clock</span>
          </button>
        )}

        {/* Add Today's Shift Button */}
        <button
          onClick={() => navigate('/add')}
          className="w-full md:w-auto md:max-w-md md:mx-auto bg-primary text-white font-bold text-lg md:text-xl py-4 md:py-5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border-2 border-primary/50"
        >
          <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
          <span>Add Today's Shift</span>
        </button>

        {/* Timer Controls */}
        <TimerControls />

        {/* Upcoming Shifts Section */}
        {upcomingShifts.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 px-2">Upcoming Shifts</h2>
            
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              {upcomingShifts.map(shift => {
                const shiftCalc = calculateShiftHours(shift);
                
                return (
                  <div 
                    key={shift.id}
                    className="bg-white rounded-lg p-4 md:p-5 shadow-sm border-l-4 border-accent"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900 md:text-lg">
                          {format(parseISO(shift.date), 'EEE, MMM d')}
                        </p>
                        {shift.scheduled_start && shift.scheduled_end && (
                          <p className="text-sm md:text-base text-gray-600 mt-1">
                            {format(parseISO(shift.scheduled_start), 'h:mma')} - {format(parseISO(shift.scheduled_end), 'h:mma')}
                          </p>
                        )}
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs md:text-sm font-semibold px-3 py-1 rounded-full">
                        Scheduled
                      </span>
                    </div>
                    
                    {shiftCalc.totalHours > 0 && (
                      <div className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Scheduled Hours</span>
                          <span className="font-semibold">{formatHours(shiftCalc.totalHours)}</span>
                        </div>
                        {shiftCalc.lunchHours > 0 && (
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Lunch</span>
                            <span className="font-semibold text-orange-600">-{formatHours(shiftCalc.lunchHours)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

