import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { UserSwitcher } from '../components/UserSwitcher';
import { DollarSign, Palette } from 'lucide-react';

export default function SettingsView() {
  const { currentUser, theme, setThemeForUser } = useUser();
  const [payRate, setPayRate] = useState('14.00');
  const [loading, setLoading] = useState(false);

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

        {/* User Switcher */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
          <UserSwitcher />
        </div>
      </div>
    </div>
  );
}

