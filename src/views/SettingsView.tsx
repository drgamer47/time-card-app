import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useJob } from '../contexts/JobContext';
import { supabase } from '../lib/supabase';
import { UserSwitcher } from '../components/UserSwitcher';
import { DollarSign, Palette, Briefcase, Plus } from 'lucide-react';

export default function SettingsView() {
  const { currentUser, theme, setThemeForUser } = useUser();
  const { jobs, loadJobs } = useJob();
  const [payRate, setPayRate] = useState('14.00');
  const [loading, setLoading] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobRate, setNewJobRate] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadSettings();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    if (!currentUser) return;
    
    try {
      const { data } = await (supabase
        .from('user_settings') as any)
        .select('*')
        .eq('user_name', currentUser)
        .single();

      if (data) {
        setPayRate(data.pay_rate.toString());
      } else {
        // If no settings exist, create default
        const { error } = await (supabase
          .from('user_settings') as any)
          .insert({
            user_name: currentUser,
            pay_rate: currentUser === 'macray' ? 14.00 : 15.00,
            theme: currentUser === 'macray' ? 'walmart' : 'yenna'
          });
        
        if (!error && currentUser === 'macray') {
          setPayRate('14.00');
        } else if (!error) {
          setPayRate('15.00');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const savePayRate = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({ 
          user_name: currentUser,
          pay_rate: parseFloat(payRate),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('payRate', payRate);
      
      alert('Pay rate updated!');
    } catch (error) {
      console.error('Error updating pay rate:', error);
      alert('Failed to update pay rate');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <div className="bg-primary text-white px-6 py-6 md:py-8 shadow-md w-full">
        <div className="max-w-2xl md:max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm md:text-base opacity-90 mt-1 text-white">Logged in as {currentUser}</p>
        </div>
      </div>

      <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        
        {/* Pay Rate */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pay Rate</h2>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={savePayRate}
                disabled={loading}
                className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Theme</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                if (currentUser) {
                  setThemeForUser(currentUser, 'walmart');
                }
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                theme === 'walmart'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Walmart Theme</p>
                    <p className="text-sm text-gray-600">Blue & Teal</p>
                  </div>
                </div>
                {theme === 'walmart' && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setThemeForUser(currentUser, 'yenna');
                }
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                theme === 'yenna'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Yenna Theme</p>
                    <p className="text-sm text-gray-600">Lilac & Pink</p>
                  </div>
                </div>
                {theme === 'yenna' && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Jobs & Pay Rates */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Jobs & Pay Rates</h2>
            </div>
            <button
              onClick={() => setShowAddJob(!showAddJob)}
              className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Job
            </button>
          </div>

          {/* Job List */}
          <div className="space-y-3 mb-4">
            {jobs.map((job) => (
              <div key={job.job_name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {job.job_name.replace('_', ' ')}
                  </p>
                </div>
                <p className="text-lg font-bold text-primary">${job.pay_rate}/hr</p>
              </div>
            ))}
          </div>

          {/* Add Job Form */}
          {showAddJob && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Name
                </label>
                <input
                  type="text"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  placeholder="e.g., Target, Starbucks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newJobRate}
                    onChange={(e) => setNewJobRate(e.target.value)}
                    placeholder="14.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newJobName || !newJobRate || !currentUser) return;

                  setLoading(true);
                  try {
                    const { error } = await supabase
                      .from('user_jobs')
                      .insert({
                        user_name: currentUser,
                        job_name: newJobName.toLowerCase().replace(/\s+/g, '_'),
                        pay_rate: parseFloat(newJobRate),
                      });

                    if (error) throw error;

                    setNewJobName('');
                    setNewJobRate('');
                    setShowAddJob(false);
                    loadJobs();
                    alert('Job added!');
                  } catch (error) {
                    console.error('Error adding job:', error);
                    alert('Failed to add job');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !newJobName || !newJobRate}
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Add Job
              </button>
            </div>
          )}
        </div>

        {/* User Switcher */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
          <UserSwitcher />
        </div>
      </div>
    </div>
  );
}

