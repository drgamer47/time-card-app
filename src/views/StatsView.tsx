import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { findBestAndWorstWeeks, type WeekEarnings } from '../lib/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function StatsView() {
  const { currentUser } = useUser();
  const [bestWeek, setBestWeek] = useState<WeekEarnings | null>(null);
  const [worstWeek, setWorstWeek] = useState<WeekEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Get all shifts
      const { data: shifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_name', currentUser)
        .not('actual_start', 'is', null) // Only worked shifts
        .order('date', { ascending: false });

      if (shifts) {
        const { best, worst } = await findBestAndWorstWeeks(shifts);
        setBestWeek(best);
        setWorstWeek(worst);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24 md:pb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6 w-full">
      <div className="bg-primary text-white px-6 py-6 shadow-md w-full">
        <h1 className="text-2xl font-bold">Stats & Analytics</h1>
        <p className="text-sm opacity-90 mt-1">Your work history</p>
      </div>

      <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        
        {/* Best Week */}
        {bestWeek && (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Best Week</h2>
                <p className="text-sm text-gray-500">Highest earnings</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Week of</span>
                <span className="font-semibold text-gray-900">
                  {format(bestWeek.weekStart, 'MMM d')} - {format(bestWeek.weekEnd, 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hours Worked</span>
                <span className="font-semibold text-gray-900">{bestWeek.totalHours.toFixed(1)}hrs</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Earned</span>
                <span className="text-2xl font-bold text-green-600">${bestWeek.totalPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Worst Week */}
        {worstWeek && bestWeek && worstWeek.weekStart.getTime() !== bestWeek.weekStart.getTime() && (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2.5 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Lightest Week</h2>
                <p className="text-sm text-gray-500">Lowest earnings</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Week of</span>
                <span className="font-semibold text-gray-900">
                  {format(worstWeek.weekStart, 'MMM d')} - {format(worstWeek.weekEnd, 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hours Worked</span>
                <span className="font-semibold text-gray-900">{worstWeek.totalHours.toFixed(1)}hrs</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Earned</span>
                <span className="text-2xl font-bold text-orange-600">${worstWeek.totalPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        {bestWeek && worstWeek && bestWeek.weekStart.getTime() !== worstWeek.weekStart.getTime() && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Your best week earned <span className="font-bold text-green-600">
                ${(bestWeek.totalPay - worstWeek.totalPay).toFixed(2)}
              </span> more than your lightest week
            </p>
          </div>
        )}

        {!bestWeek && !worstWeek && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No stats available yet. Start logging shifts to see your best and worst weeks!</p>
          </div>
        )}
      </div>
    </div>
  );
}

