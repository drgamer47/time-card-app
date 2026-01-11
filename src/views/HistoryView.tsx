import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import ShiftCard from '../components/ShiftCard';
import type { Shift } from '../types';

export default function HistoryView() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('date', { ascending: false })
        .order('actual_start', { ascending: false })
        .limit(50);

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

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const dates = Object.keys(shiftsByDate).sort().reverse();

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Shift History</h1>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="mb-4">No shifts recorded yet.</p>
            <a href="/add" className="text-primary hover:underline">
              Add your first shift →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((dateStr) => {
              const date = parseISO(dateStr);
              const dayShifts = shiftsByDate[dateStr];

              return (
                <div key={dateStr}>
                  <h2 className="text-lg font-semibold mb-3 text-text-primary">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="space-y-3">
                    {dayShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onEdit={(shift) => navigate(`/add?edit=${shift.id}`)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

