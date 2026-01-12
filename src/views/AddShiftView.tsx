import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import ShiftForm from '../components/ShiftForm';
import type { Shift } from '../types';

export default function AddShiftView() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      loadShift();
    }
  }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadShift = async () => {
    try {
      if (!editId) return;
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', editId)
        .maybeSingle();

      if (error) {
        console.error('Error loading shift:', error);
        alert('Failed to load shift');
        navigate('/');
      } else if (data) {
        setShift(data);
      } else {
        alert('Shift not found');
        navigate('/');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to load shift');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Omit<Shift, 'id' | 'user_name' | 'created_at' | 'updated_at'>) => {
    try {
      if (!currentUser) {
        alert('Please select a user first.');
        return;
      }

      if (editId && shift) {
        // Update existing shift
        const { error } = await (supabase
          .from('shifts') as any)
          .update({
            date: formData.date,
            scheduled_start: formData.scheduled_start,
            scheduled_end: formData.scheduled_end,
            actual_start: formData.actual_start,
            actual_end: formData.actual_end,
            lunch_start: formData.lunch_start,
            lunch_end: formData.lunch_end,
            is_holiday: formData.is_holiday || false,
            mood: formData.mood || null,
            energy_level: formData.energy_level || null,
            job: formData.job || null,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);

        if (error) {
          console.error('Error updating shift:', error);
          alert('Failed to update shift');
        } else {
          navigate('/week');
        }
      } else {
        // Create new shift
        const { error } = await (supabase
          .from('shifts') as any)
          .insert({
            user_name: currentUser,
            date: formData.date,
            scheduled_start: formData.scheduled_start,
            scheduled_end: formData.scheduled_end,
            actual_start: formData.actual_start,
            actual_end: formData.actual_end,
            lunch_start: formData.lunch_start,
            lunch_end: formData.lunch_end,
            is_holiday: formData.is_holiday || false,
            mood: formData.mood || null,
            energy_level: formData.energy_level || null,
            job: formData.job || null,
            notes: formData.notes,
          });

        if (error) {
          console.error('Error creating shift:', error);
          alert('Failed to create shift');
        } else {
          // Check if it's a future shift
          const shiftDate = new Date(formData.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          shiftDate.setHours(0, 0, 0, 0);
          const isFuture = shiftDate > today;
          
          if (isFuture) {
            alert('Scheduled shift added!');
          } else {
            alert('Shift added!');
          }
          navigate('/week');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleOffDay = async () => {
    try {
      if (!currentUser) {
        alert('Please select a user first.');
        return;
      }

      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');

      const { error } = await (supabase
        .from('shifts') as any)
        .insert({
          user_name: currentUser,
          date: dateStr,
          scheduled_start: null,
          scheduled_end: null,
          actual_start: null,
          actual_end: null,
          lunch_start: null,
          lunch_end: null,
          status: 'day_off',
          notes: 'Day off',
        });

      if (error) {
        console.error('Error creating off day:', error);
        alert('Failed to mark day off');
      } else {
        alert('Day off marked!');
        navigate('/week');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6 bg-background w-full">
      <div className="max-w-2xl md:max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-6 md:mb-8">
          {editId ? 'Edit Shift' : 'Add Shift'}
        </h1>
        <ShiftForm
          shift={shift}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onOffDay={handleOffDay}
        />
      </div>
    </div>
  );
}

