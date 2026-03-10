import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  userRole: 'planner' | 'couple';
}

export const Navigation: React.FC<NavigationProps> = ({ userRole }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/timeline', label: 'Timeline', icon: '📅' },
    { path: '/contracts', label: 'Contracts', icon: '📄' },
    { path: '/moodboard', label: 'Mood Board', icon: '✨' },
  ];

  return (
    <nav className="bg-white border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="text-2xl">💍</div>
          <div>
            <h1 className="text-xl font-serif text-charcoal">The Ever After</h1>
            <p className="text-xs text-slate">
              {userRole === 'planner' ? 'Planner Portal' : 'Wedding Portal'}
            </p>
          </div>
        </Link>

        {/* Nav Items */}
        <ul className="flex gap-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-sand text-charcoal font-semibold shadow-sm'
                    : 'text-slate hover:text-charcoal hover:bg-sand/40'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User Info */}
        <div className="text-right text-sm">
          <p className="text-charcoal font-medium">Demo Wedding -Sarah & Michael</p>
          <p className="text-slate text-xs">{userRole === 'planner' ? 'Planner' : 'Couple'}</p>
        </div>
      </div>
    </nav>
  );
};
