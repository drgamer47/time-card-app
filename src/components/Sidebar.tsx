import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, DollarSign as DollarSignIcon, PlusCircle as PlusCircleIcon } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Today' },
    { path: '/week', icon: CalendarIcon, label: 'Week' },
    { path: '/pay-period', icon: DollarSignIcon, label: 'Pay Period' },
    { path: '/add', icon: PlusCircleIcon, label: 'Add Shift', isAccent: true },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Hours Tracker</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.isAccent) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-accent to-teal-600 text-white shadow-md'
                      : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                  style={isActive ? { background: 'linear-gradient(to right, #14B8A6, #0D9488)' } : {}}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

