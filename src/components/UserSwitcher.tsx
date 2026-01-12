import { useUser } from '../contexts/UserContext';
import { UserX } from 'lucide-react';

export function UserSwitcher() {
  const { currentUser } = useUser();

  const switchUser = () => {
    // Clear current user to show picker again
    localStorage.removeItem('currentUser');
    window.location.reload(); // Simple way to reset app state
  };

  return (
    <button
      onClick={switchUser}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
    >
      <UserX className="w-4 h-4" />
      <span>Switch User</span>
      <span className="text-xs text-gray-500 ml-auto">({currentUser})</span>
    </button>
  );
}

