import { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, parseISO, isSameDay, addDays } from 'date-fns';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculatePayPeriodPay, getPayPeriodBounds, getPayday, calculateShiftHours, formatCurrency, formatHours } from '../lib/calculations';
import { calculateNetPay } from '../lib/taxCalculations';
import type { Shift } from '../types';

export default function PayPeriodView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, [currentDate]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const { start, end } = getPayPeriodBounds(currentDate);
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

  const { start: periodStart, end: periodEnd } = getPayPeriodBounds(currentDate);
  const periodPay = calculatePayPeriodPay(shifts);
  const payday = getPayday(periodEnd);
  const today = new Date();
  const isCurrentPeriod = isSameDay(periodStart, getPayPeriodBounds(today).start);
  
  // Calculate net pay
  const netPayDetails = calculateNetPay(periodPay.totalPay);
  const week1NetPay = calculateNetPay(periodPay.week1.totalPay);
  const week2NetPay = calculateNetPay(periodPay.week2.totalPay);

  // Week boundaries
  const week1Start = periodStart;
  const week1End = addDays(week1Start, 6); // Friday of week 1
  const week2Start = addDays(week1End, 1); // Saturday of week 2
  const week2End = periodEnd; // Friday of week 2

  const goToPreviousPeriod = () => {
    setCurrentDate(subWeeks(currentDate, 2));
  };

  const goToNextPeriod = () => {
    setCurrentDate(addWeeks(currentDate, 2));
  };

  const goToCurrentPeriod = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6 w-full">
      {/* Softer Header */}
      <div className="bg-primary text-white px-6 py-6 md:py-8 shadow-md w-full" style={{ backgroundColor: '#0072CE' }}>
        <div className="max-w-2xl md:max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={goToPreviousPeriod}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeftIcon className="w-5 h-5" style={{ color: 'white' }} />
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ color: 'white' }}>Pay Period</h1>
              <p className="text-sm md:text-base opacity-90 mt-1 text-white" style={{ color: 'white' }}>
                {format(periodStart, 'MMM d')} - {format(periodEnd, 'MMM d')}
              </p>
            </div>
            
            <button 
              onClick={goToNextPeriod}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Next period"
            >
              <ChevronRightIcon className="w-5 h-5" style={{ color: 'white' }} />
            </button>
          </div>
          
          {!isCurrentPeriod && (
            <button 
              onClick={goToCurrentPeriod}
              className="w-full md:w-auto md:mx-auto md:px-6 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg text-sm mt-3 transition-colors"
              style={{ color: 'white' }}
            >
              Jump to Current Period
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
                <DollarSignIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Period Summary</h2>
                <p className="text-sm text-gray-500">2 week pay period</p>
              </div>
            </div>

            {shifts.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {/* Lighter Stat Boxes */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 md:p-5 border border-blue-100 text-center">
                    <p className="text-sm text-blue-700 mb-1">Total Hours</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-900">{formatHours(periodPay.totalPaidHours)}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 md:p-5 border border-green-100 text-center">
                    <p className="text-sm text-green-700 mb-1">Gross Pay</p>
                    <p className="text-3xl md:text-4xl font-bold text-green-900">{formatCurrency(periodPay.totalPay)}</p>
                  </div>
                </div>

                {/* Net Pay Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 md:p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Projected Take Home</p>
                      <p className="text-4xl md:text-5xl font-bold">${netPayDetails.netPay}</p>
                      <p className="text-xs opacity-75 mt-1">After taxes (includes scheduled shifts)</p>
                    </div>
                  </div>
                  
                  {/* Tax Breakdown - Collapsible */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold bg-white/20 px-3 py-2 rounded hover:bg-white/30 transition-colors">
                      View Tax Breakdown
                    </summary>
                    <div className="mt-3 space-y-2 text-sm bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="opacity-90">Gross Pay</span>
                        <span className="font-semibold">${netPayDetails.grossPay}</span>
                      </div>
                      <div className="border-t border-white/20 my-2"></div>
                      <div className="flex justify-between opacity-90">
                        <span>Federal Tax (~12%)</span>
                        <span>-${netPayDetails.federal}</span>
                      </div>
                      <div className="flex justify-between opacity-90">
                        <span>State Tax (3.05%)</span>
                        <span>-${netPayDetails.state}</span>
                      </div>
                      <div className="flex justify-between opacity-90">
                        <span>Social Security (6.2%)</span>
                        <span>-${netPayDetails.socialSecurity}</span>
                      </div>
                      <div className="flex justify-between opacity-90">
                        <span>Medicare (1.45%)</span>
                        <span>-${netPayDetails.medicare}</span>
                      </div>
                      <div className="border-t border-white/20 my-2"></div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Taxes</span>
                        <span>-${netPayDetails.totalTax}</span>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Weekly Breakdown */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Weekly Breakdown</h3>
                  
                  {/* Week 1 */}
                  <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">
                        Week 1: {format(week1Start, 'MMM d')} - {format(week1End, 'MMM d')}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {formatHours(periodPay.week1.totalPaidHours)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular</span>
                        <span className="font-semibold">{formatHours(periodPay.week1.regularHours)} × $14 = {formatCurrency(periodPay.week1.regularHours * 14)}</span>
                      </div>
                      {periodPay.week1.otHours > 0 && (
                        <div className="flex justify-between">
                          <span className="text-orange-600">Overtime</span>
                          <span className="font-semibold text-orange-700">{formatHours(periodPay.week1.otHours)} × $21 = {formatCurrency(periodPay.week1.otHours * 21)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-semibold text-gray-700">Week 1 Gross</span>
                        <span className="font-bold text-green-600">${formatCurrency(periodPay.week1.totalPay)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estimated Net</span>
                        <span className="font-semibold">${week1NetPay.netPay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Week 2 */}
                  <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">
                        Week 2: {format(week2Start, 'MMM d')} - {format(week2End, 'MMM d')}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {formatHours(periodPay.week2.totalPaidHours)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular</span>
                        <span className="font-semibold">{formatHours(periodPay.week2.regularHours)} × $14 = {formatCurrency(periodPay.week2.regularHours * 14)}</span>
                      </div>
                      {periodPay.week2.otHours > 0 && (
                        <div className="flex justify-between">
                          <span className="text-orange-600">Overtime</span>
                          <span className="font-semibold text-orange-700">{formatHours(periodPay.week2.otHours)} × $21 = {formatCurrency(periodPay.week2.otHours * 21)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-semibold text-gray-700">Week 2 Gross</span>
                        <span className="font-bold text-green-600">${formatCurrency(periodPay.week2.totalPay)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estimated Net</span>
                        <span className="font-semibold">${week2NetPay.netPay}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Date - Still Colorful but Calmer */}
                <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm md:text-base text-accent mb-1">Pay Date</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">{format(payday, 'EEE, MMM d')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="bg-gray-200 w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <DollarSignIcon className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No shifts this period</p>
              </div>
            )}
          </div>
        )}

        {/* Shifts List */}
        {!loading && shifts.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 px-2">All Shifts</h2>
            
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {shifts.map(shift => {
              const shiftCalc = calculateShiftHours(shift);
              const shiftPay = shiftCalc.paidHours * 14; // Base rate
              const lunchMinutes = Math.round(shiftCalc.lunchHours * 60);
              const isScheduled = !shift.actual_start;
              
              // Get display time (actual or scheduled)
              const startTime = shift.actual_start || shift.scheduled_start;
              const endTime = shift.actual_end || shift.scheduled_end;
              
              return (
                <div 
                  key={shift.id}
                  className="bg-white rounded-lg p-4 md:p-5 shadow-sm border-l-4 border-accent"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 md:text-lg">
                          {format(parseISO(shift.date), 'EEE, MMM d')}
                        </p>
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
                      {startTime && endTime && (
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                          {format(parseISO(startTime), 'h:mma')} - {format(parseISO(endTime), 'h:mma')}
                        </p>
                      )}
                    </div>
                    
                    {!isScheduled && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Pay</p>
                        <p className="text-xl md:text-2xl font-bold text-success">{formatCurrency(shiftPay)}</p>
                      </div>
                    )}
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

                  {shift.notes && (
                    <div className="bg-amber-50 border-l-2 border-amber-400 p-2 rounded text-sm">
                      <p className="text-amber-900">{shift.notes}</p>
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

