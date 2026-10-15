import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWedding } from '../../contexts/useWedding';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  mode?: 'planner' | 'couple';
}

export const Navigation: React.FC<NavigationProps> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wedding } = useWedding();
  const { userRole, logout } = useAuth();
  const uiMode = mode ?? (userRole ?? 'couple');
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const basePath =
    uiMode === 'planner'
      ? wedding?.id
        ? `/dashboard/${wedding.id}`
        : '/portfolio'
      : '/couple/dashboard';

  const navItems =
    uiMode === 'planner'
      ? [
          { path: '/dashboard', label: 'Planner Dashboard', icon: '🏠' },
          { path: '/portfolio', label: 'Portfolio', icon: '📁' },
          { path: `${basePath}`, label: 'Wedding Workspace', icon: '💍' },
          { path: `${basePath}/timeline`, label: 'Timeline', icon: '📅' },
          { path: `${basePath}/contracts`, label: 'Contracts', icon: '📄' },
          { path: `${basePath}/moodboard`, label: 'Mood Board', icon: '✨' },
          { path: `${basePath}/clients`, label: 'Clients', icon: '👥' },
        ]
      : [
          { path: `${basePath}`, label: 'Dashboard', icon: '🏠' },
          { path: `${basePath}/timeline`, label: 'Timeline', icon: '📅' },
          { path: `${basePath}/contracts`, label: 'Contracts', icon: '📄' },
          { path: `${basePath}/moodboard`, label: 'Mood Board', icon: '✨' },
        ];

  return (
    <nav className={`sticky top-0 z-50 border-b ${
      uiMode === 'planner'
        ? 'border-[#D4A843]/40 bg-[#075B46] shadow-[0_4px_18px_rgba(23,45,38,0.16)]'
        : 'border-gold/20 bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 transition-opacity hover:opacity-80 self-start ${
            uiMode === 'planner' ? 'text-white' : ''
          } ${uiMode === 'planner' ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BC59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#075B46]' : ''}`}
        >
          <div className={`text-2xl ${uiMode === 'planner' ? 'text-[#E5BC59]' : ''}`}>💍</div>
          <div>
            <h1 className={`text-lg md:text-xl font-serif ${uiMode === 'planner' ? 'text-white' : 'text-charcoal'}`}>The Ever After</h1>
            <p className={`text-xs ${uiMode === 'planner' ? 'text-white/75' : 'text-slate'}`}>
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
                  (item.path === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
                    ? uiMode === 'planner'
                      ? 'border border-[#E5BC59] bg-[#D4A843] text-[#172D26] font-semibold shadow-sm'
                      : 'bg-sand text-charcoal font-semibold shadow-sm'
                    : uiMode === 'planner'
                      ? 'border border-transparent text-white/90 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      : 'text-slate hover:text-charcoal hover:bg-sand/40'
                } ${uiMode === 'planner' ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BC59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#075B46]' : ''}`}
              >
                <span className={uiMode === 'planner' ? 'grayscale brightness-0 invert' : ''}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User Info */}
        <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right text-sm self-start md:self-auto">
          <div>
            <p className={`font-medium break-words ${uiMode === 'planner' ? 'text-white' : 'text-charcoal'}`}>
              {uiMode === 'planner'
                ? wedding?.coupleNames ?? 'Portfolio'
                : wedding?.coupleNames ?? 'Your Wedding'}
            </p>
            <p className={`text-xs ${uiMode === 'planner' ? 'text-white/75' : 'text-slate'}`}>{uiMode === 'planner' ? 'Planner' : 'Couple'}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              uiMode === 'planner'
                ? 'border border-white/30 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BC59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#075B46]'
                : 'border border-[#D4A843]/50 text-[#075B46] hover:bg-sand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2'
            }`}
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutError && <p role="alert" className="max-w-xs text-left text-xs text-red-700 md:text-right">{signOutError}</p>}
        </div>
      </div>
    </nav>
  );
};
