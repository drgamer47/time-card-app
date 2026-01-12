import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayRate: number;
  onPayRateChange: (rate: number) => void;
}

export default function SettingsModal({ isOpen, onClose, currentPayRate, onPayRateChange }: SettingsModalProps) {
  const [payRate, setPayRate] = useState(currentPayRate.toString());

  useEffect(() => {
    if (isOpen) {
      setPayRate(currentPayRate.toString());
    }
  }, [isOpen, currentPayRate]);

  const handleSave = () => {
    const rate = parseFloat(payRate);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid pay rate');
      return;
    }
    onPayRateChange(rate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="bg-primary text-white p-6 rounded-t-xl flex justify-between items-center" style={{ backgroundColor: '#0072CE' }}>
          <h2 className="text-2xl font-bold">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="payRate" className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Pay Rate
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">$</span>
              <input
                id="payRate"
                type="number"
                step="0.01"
                min="0"
                value={payRate}
                onChange={(e) => setPayRate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="14.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">This rate applies to future shifts only</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all touch-manipulation"
              style={{ backgroundColor: '#0072CE' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

