import { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserSwitcher } from './UserSwitcher';

export default function MobileHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-primary">Hours Tracker</h1>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Menu"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowMenu(false)}>
          <div 
            className="bg-white rounded-t-2xl fixed bottom-0 left-0 right-0 p-6 space-y-4 max-h-[60vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowMenu(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left touch-manipulation min-h-[48px]"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            
            <div className="pt-2 border-t border-gray-200 mt-2">
              <UserSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

