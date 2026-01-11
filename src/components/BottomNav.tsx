import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, DollarSign as DollarSignIcon, PlusCircle as PlusCircleIcon } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Today' },
    { path: '/week', icon: CalendarIcon, label: 'Week' },
    { path: '/pay-period', icon: DollarSignIcon, label: 'Pay Period' },
    { path: '/add', icon: PlusCircleIcon, label: 'Add', isAccent: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isAccent) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 py-2"
              >
                <div className="bg-gradient-to-r from-accent to-teal-600 p-2 rounded-lg" style={{ background: 'linear-gradient(to right, #14B8A6, #0D9488)' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-accent">{item.label}</span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 relative"
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary"></div>
              )}
              
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

