import { useUser } from '../contexts/UserContext';
import { User, Heart } from 'lucide-react';

export function UserPicker() {
  const { setCurrentUser } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hours Tracker</h1>
          <p className="text-gray-600">Who's clocking in?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentUser('macray')}
            className="w-full bg-gradient-to-r from-[#0072CE] to-blue-600 hover:from-blue-600 hover:to-[#0072CE] text-white font-bold text-xl py-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 group"
          >
            <User className="w-7 h-7" />
            <span>Macray</span>
          </button>

          <button
            onClick={() => setCurrentUser('yenna')}
            className="w-full bg-gradient-to-r from-[#C8A2C8] to-purple-400 hover:from-purple-400 hover:to-[#C8A2C8] text-white font-bold text-xl py-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 group"
          >
            <User className="w-7 h-7" />
            <span>Yenna</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Tap your name to continue
        </p>
      </div>
    </div>
  );
}

