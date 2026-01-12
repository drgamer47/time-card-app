import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, eachDayOfInterval, addWeeks, subWeeks, parseISO, isSameDay } from 'date-fns';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateWeekPay, getWeekBounds, calculateShiftHours, formatCurrency, formatHours } from '../lib/calculations';
import { calculateNetPay } from '../lib/taxCalculations';
import type { Shift } from '../types';

export default function WeekView() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, [currentWeek]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const { start, end } = getWeekBounds(currentWeek);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true })
        .order('actual_start', { ascending: true });

      if (error) {
        console.error('Error loading shifts:', error);
      } else {
        setShifts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('Error deleting shift:', error);
        alert('Failed to delete shift');
      } else {
        loadShifts();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete shift');
    }
  };

  const { start: weekStart, end: weekEnd } = getWeekBounds(currentWeek);
  const weekPay = calculateWeekPay(shifts);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();
  const isCurrentWeek = isSameDay(weekStart, getWeekBounds(today).start);

  // Group shifts by date
  const groupedShifts = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayShifts = shifts.filter(shift => shift.date === dayStr);
    return { date: day, shifts: dayShifts };
  });

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const handleEdit = (shift: Shift) => {
    navigate(`/add?edit=${shift.id}`);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, today);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6 w-full">
      {/* Softer Header */}
      <div className="bg-primary text-white px-6 py-6 md:py-8 shadow-md w-full" style={{ backgroundColor: '#0072CE' }}>
        <div className="max-w-2xl md:max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="w-5 h-5" style={{ color: 'white' }} />
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ color: 'white' }}>Week View</h1>
              <p className="text-sm md:text-base opacity-90 mt-1 text-white" style={{ color: 'white' }}>
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </p>
            </div>
            
            <button 
              onClick={goToNextWeek}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Next week"
            >
              <ChevronRightIcon className="w-5 h-5" style={{ color: 'white' }} />
            </button>
          </div>
          
          {!isCurrentWeek && (
            <button 
              onClick={goToCurrentWeek}
              className="w-full md:w-auto md:mx-auto md:px-6 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg text-sm mt-3 transition-colors"
              style={{ color: 'white' }}
            >
              Jump to Current Week
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        
        {/* Calmer Summary Card */}
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
                <h2 className="text-lg font-bold text-gray-900">Week Summary</h2>
                <p className="text-sm text-gray-500">Sun - Sat</p>
              </div>
            </div>

            {shifts.length > 0 ? (
              <div className="space-y-4">
                {/* Lighter Stat Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 md:p-5 border border-blue-100 text-center">
                    <p className="text-xs md:text-sm text-blue-700 mb-1">Hours Worked</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900">{formatHours(weekPay.totalPaidHours)}</p>
                  </div>
                  
                  {weekPay.expectedPaidHours > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 md:p-5 border border-purple-100 text-center">
                      <p className="text-xs md:text-sm text-purple-700 mb-1">Hours Expected</p>
                      <p className="text-2xl md:text-3xl font-bold text-purple-900">{formatHours(weekPay.totalPaidHours + weekPay.expectedPaidHours)}</p>
                    </div>
                  )}
                  
                  <div className="bg-green-50 rounded-lg p-4 md:p-5 border border-green-100 text-center">
                    <p className="text-xs md:text-sm text-green-700 mb-1">Gross Pay (Actual)</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-900">{formatCurrency(weekPay.totalPay)}</p>
                  </div>
                  
                  {weekPay.expectedPaidHours > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 md:p-5 border border-green-100 text-center">
                      <p className="text-xs md:text-sm text-green-700 mb-1">Gross Pay (Expected)</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-900">{formatCurrency(weekPay.expectedPay)}</p>
                    </div>
                  )}
                  
                  <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/20 text-center">
                    <p className="text-xs md:text-sm text-accent mb-1">Take Home (Actual)</p>
                    <p className="text-2xl md:text-3xl font-bold text-accent">${calculateNetPay(weekPay.totalPay).netPay}</p>
                  </div>
                  
                  {weekPay.expectedPaidHours > 0 && (
                    <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/20 text-center">
                      <p className="text-xs md:text-sm text-accent mb-1">Take Home (Expected)</p>
                      <p className="text-2xl md:text-3xl font-bold text-accent">${calculateNetPay(weekPay.expectedPay).netPay}</p>
                    </div>
                  )}
                </div>

                {/* Pay Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Worked</span>
                    <span className="font-semibold">{formatHours(weekPay.totalPaidHours)}</span>
                  </div>
                  {weekPay.expectedPaidHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-purple-600">Hours Expected</span>
                      <span className="font-semibold text-purple-700">{formatHours(weekPay.totalPaidHours + weekPay.expectedPaidHours)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular</span>
                    <span className="font-semibold">{formatHours(weekPay.regularHours)} × $14 = {formatCurrency(weekPay.regularHours * 14)}</span>
                  </div>
                  {weekPay.otHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-orange-600">Overtime</span>
                      <span className="font-semibold text-orange-700">{formatHours(weekPay.otHours)} × $21 = {formatCurrency(weekPay.otHours * 21)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span>Gross Pay (Actual)</span>
                      <span className="text-success">{formatCurrency(weekPay.totalPay)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Take Home (Actual)</span>
                      <span className="font-semibold">${calculateNetPay(weekPay.totalPay).netPay}</span>
                    </div>
                    {weekPay.expectedPaidHours > 0 && (
                      <>
                        <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                          <span className="text-purple-600">Gross Pay (Expected)</span>
                          <span className="text-success">{formatCurrency(weekPay.expectedPay)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-purple-500">
                          <span>Take Home (Expected)</span>
                          <span className="font-semibold">${calculateNetPay(weekPay.expectedPay).netPay}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="bg-gray-200 w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No shifts this week</p>
              </div>
            )}
          </div>
        )}

        {/* Shifts List - Grouped by Day */}
        {!loading && shifts.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 px-2">Shifts This Week</h2>
            
            {groupedShifts.map(({ date, shifts: dayShifts }) => (
              <div key={format(date, 'yyyy-MM-dd')} className="space-y-2 md:space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-3 px-2">
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center font-semibold text-sm md:text-base
                    ${isToday(date) 
                      ? 'bg-accent text-white' 
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    <span className="text-xs">{format(date, 'EEE')}</span>
                    <span className="text-base md:text-lg">{format(date, 'd')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 md:text-lg">{format(date, 'EEEE')}</p>
                    <p className="text-sm text-gray-500">
                      {dayShifts.reduce((sum, s) => sum + calculateShiftHours(s).paidHours, 0).toFixed(1)} hours
                    </p>
                  </div>
                </div>

                {/* Shifts for this day */}
                {dayShifts.map(shift => {
                  const shiftCalc = calculateShiftHours(shift);
                  const shiftPay = shiftCalc.paidHours * 14; // Base rate, OT calculated at week level
                  const lunchMinutes = Math.round(shiftCalc.lunchHours * 60);
                  const isScheduled = !shift.actual_start;
                  
                  // Get display time (actual or scheduled)
                  const startTime = shift.actual_start || shift.scheduled_start;
                  const endTime = shift.actual_end || shift.scheduled_end;
                  
                  return (
                    <div 
                      key={shift.id}
                      className="bg-white rounded-lg p-4 md:p-5 shadow-sm border-l-2 border-primary ml-4 md:ml-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                          {startTime && endTime ? (
                            <span className="font-semibold text-gray-900 md:text-lg">
                              {format(parseISO(startTime), 'h:mma')} - {format(parseISO(endTime), 'h:mma')}
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-500 md:text-lg">No time set</span>
                          )}
                          {isScheduled && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                              Scheduled
                            </span>
                          )}
                          {!isScheduled && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                              Worked
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(shift)}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Edit shift"
                          >
                            <EditIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(shift.id)}
                            className="p-1.5 md:p-2 hover:bg-red-50 rounded transition-colors"
                            aria-label="Delete shift"
                          >
                            <TrashIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Hours Breakdown */}
                      <div className="space-y-2 bg-gray-50 rounded p-3 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Shift</span>
                          <span className="font-semibold text-gray-900">{formatHours(shiftCalc.totalHours)}</span>
                        </div>
                        
                        {lunchMinutes > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lunch Break</span>
                            <span className="font-semibold text-orange-600">-{formatHours(shiftCalc.lunchHours)}</span>
                          </div>
                        )}
                        
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-semibold text-gray-900">Paid Hours</span>
                          <span className="font-bold text-blue-600">{formatHours(shiftCalc.paidHours)}</span>
                        </div>
                      </div>

                      {/* Pay Display - Only for actual shifts */}
                      {!isScheduled && (
                        <div className="flex gap-2 md:gap-3 text-sm md:text-base">
                          <div className="flex-1 bg-green-50 rounded p-2 md:p-3 text-center">
                            <p className="text-green-700 text-xs md:text-sm">Pay</p>
                            <p className="font-semibold text-green-900 md:text-lg">{formatCurrency(shiftPay)}</p>
                          </div>
                        </div>
                      )}

                      {shift.notes && (
                        <div className="mt-3 bg-amber-50 border-l-2 border-amber-400 p-2 md:p-3 rounded text-sm md:text-base">
                          <p className="text-amber-900">{shift.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={() => navigate('/add')}
          className="w-full bg-gradient-to-r from-primary/90 to-primary text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Shift
        </button>
      </div>
    </div>
  );
}

