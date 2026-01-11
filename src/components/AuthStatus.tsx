import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthStatus() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="fixed top-4 right-4 md:right-6 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-colors z-50 backdrop-blur-sm"
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>
    </button>
  );
}

