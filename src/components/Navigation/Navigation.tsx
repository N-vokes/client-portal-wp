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

  if (userRole === 'planner') {
    navItems.push({ path: '/clients', label: 'Clients', icon: '👥' });
  }

  return (
    <nav className="bg-white border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity self-start">
          <div className="text-2xl">💍</div>
          <div>
            <h1 className="text-lg md:text-xl font-serif text-charcoal">The Ever After</h1>
            <p className="text-xs text-slate">
              Wedding Portal
            </p>
          </div>
        </Link>

        {/* Nav Items */}
        <ul className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md transition-all duration-200 text-sm md:text-base ${
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
        <div className="text-left md:text-right text-sm self-start md:self-auto">
          <p className="text-charcoal font-medium break-words">Demo Wedding - Sarah & Michael</p>
          <p className="text-slate text-xs">{userRole === 'planner' ? 'Planner' : 'Couple'}</p>
        </div>
      </div>
    </nav>
  );
};
