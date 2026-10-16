import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWedding } from '../../contexts/useWedding';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  mode?: 'planner' | 'couple';
  plannerScope?: 'global' | 'workspace';
  isDrawerOpen: boolean;
  onDrawerOpenChange: (isOpen: boolean) => void;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  mode,
  plannerScope = 'workspace',
  isDrawerOpen,
  onDrawerOpenChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wedding, activeWeddingId } = useWedding();
  const { userRole, logout } = useAuth();
  const uiMode = mode ?? (userRole ?? 'couple');
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await logout();
      onDrawerOpenChange(false);
      navigate('/auth', { replace: true });
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const hasActivePlannerWedding = Boolean(
    uiMode === 'planner' &&
    activeWeddingId &&
    wedding?.id === activeWeddingId
  );
  const plannerGlobalItems: NavigationItem[] = [
    { path: '/dashboard', label: 'Planner Dashboard', icon: '🏠' },
    { path: '/portfolio', label: 'Portfolio', icon: '📁' },
  ];
  const plannerWeddingItems: NavigationItem[] = hasActivePlannerWedding
    ? [
        { path: `/dashboard/${activeWeddingId}`, label: 'Wedding Workspace', icon: '💍' },
        { path: `/dashboard/${activeWeddingId}/timeline`, label: 'Timeline', icon: '📅' },
        { path: `/dashboard/${activeWeddingId}/contracts`, label: 'Contracts', icon: '📄' },
        { path: `/dashboard/${activeWeddingId}/moodboard`, label: 'Mood Board', icon: '✨' },
        { path: `/dashboard/${activeWeddingId}/clients`, label: 'Clients', icon: '👥' },
      ]
    : [];
  const coupleItems: NavigationItem[] = [
    { path: '/couple/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/couple/dashboard/timeline', label: 'Timeline', icon: '📅' },
    { path: '/couple/dashboard/contracts', label: 'Contracts', icon: '📄' },
    { path: '/couple/dashboard/moodboard', label: 'Mood Board', icon: '✨' },
  ];
  const navItems = uiMode === 'planner'
    ? plannerScope === 'global'
      ? plannerGlobalItems
      : [...plannerGlobalItems, ...plannerWeddingItems]
    : coupleItems;

  const isItemActive = (item: NavigationItem) => (
    item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );

  const closeDrawer = () => onDrawerOpenChange(false);

  React.useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  React.useEffect(() => {
    if (!isDrawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (!firstElement || !lastElement) return;
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (!drawerRef.current.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      menuButtonRef.current?.focus();
    };
  }, [isDrawerOpen]);

  const linkStateClasses = (item: NavigationItem, isDrawer = false) => {
    const isActive = isItemActive(item);
    if (uiMode === 'planner') {
      return isActive
        ? 'border border-[#E5BC59] bg-[#D4A843] text-[#172D26] font-semibold shadow-sm'
        : `border border-transparent text-white/90 hover:border-white/20 hover:bg-white/10 hover:text-white${isDrawer ? ' active:bg-white/15' : ''}`;
    }
    return isActive
      ? 'bg-sand text-charcoal font-semibold shadow-sm'
      : 'text-slate hover:text-charcoal hover:bg-sand/40 active:bg-sand/60';
  };

  const focusClasses = uiMode === 'planner'
    ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BC59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#075B46]'
    : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2';

  const plannerSignOutClasses = uiMode === 'planner'
    ? 'border border-white/30 text-white hover:bg-white/10 focus-visible:ring-offset-[#075B46]'
    : 'border border-[#D4A843]/50 text-[#075B46] hover:bg-sand/40';

  const renderDrawerItems = (items: NavigationItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            onClick={closeDrawer}
            aria-current={isItemActive(item) ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none ${linkStateClasses(item, true)} ${focusClasses}`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav aria-label="Primary navigation" className={`sticky top-0 z-50 border-b ${
      uiMode === 'planner'
        ? 'border-[#D4A843]/40 bg-[#075B46] shadow-[0_4px_18px_rgba(23,45,38,0.16)]'
        : 'border-gold/20 bg-white'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 lg:gap-4 lg:py-4">
        <Link
          to="/"
          className={`flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80 ${
            uiMode === 'planner' ? 'text-white' : ''
          } ${focusClasses}`}
        >
          <div className={`text-2xl ${uiMode === 'planner' ? 'text-[#E5BC59]' : ''}`}>💍</div>
          <div>
            <h1 className="text-lg font-serif md:text-xl">The Ever After</h1>
            <p className={`text-xs ${uiMode === 'planner' ? 'text-white/75' : 'text-slate'}`}>
              Wedding Portal
            </p>
          </div>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => onDrawerOpenChange(true)}
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
          aria-controls={isDrawerOpen ? 'mobile-navigation-drawer' : undefined}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg lg:hidden ${
            uiMode === 'planner'
              ? 'text-white hover:bg-white/10'
              : 'text-charcoal hover:bg-sand/60'
          } ${focusClasses}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <ul className="hidden min-w-0 flex-1 flex-wrap justify-center gap-1 lg:flex lg:gap-2 xl:gap-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                aria-current={isItemActive(item) ? 'page' : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md ${uiMode === 'planner' ? 'border' : ''} px-2 py-2 text-sm transition-all duration-200 xl:gap-2 xl:px-4 xl:text-base ${
                  linkStateClasses(item)
                } ${focusClasses}`}
              >
                <span className={uiMode === 'planner' ? 'grayscale brightness-0 invert' : ''} aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 flex-col items-end gap-2 text-right text-sm lg:flex">
          <div>
            {(uiMode !== 'planner' || plannerScope !== 'global') && (
              <p className={`max-w-40 break-words font-medium ${uiMode === 'planner' ? 'text-white' : 'text-charcoal'}`}>
                {uiMode === 'planner'
                  ? wedding?.coupleNames ?? 'Portfolio'
                  : wedding?.coupleNames ?? 'Your Wedding'}
              </p>
            )}
            <p className={`text-xs ${uiMode === 'planner' ? 'text-white/75' : 'text-slate'}`}>
              {uiMode === 'planner' ? 'Planner' : 'Couple'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${plannerSignOutClasses} ${focusClasses}`}
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutError && (
            <p role="alert" className="max-w-xs text-left text-xs text-red-700">
              {signOutError}
            </p>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="lg:hidden">
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`fixed bottom-0 left-0 top-[4.3rem] z-40 flex h-[calc(100dvh-4.3rem)] w-[min(18rem,45vw)] flex-col overflow-y-auto shadow-2xl ${
              uiMode === 'planner' ? 'bg-[#075B46] text-white' : 'bg-cream text-charcoal'
            }`}
          >
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-5 ${
              uiMode === 'planner' ? 'border-white/15' : 'border-[#D4A843]/30'
            }`}>
              <div className="min-w-0">
                <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  uiMode === 'planner' ? 'text-[#E5BC59]' : 'text-[#947C4F]'
                }`}>
                  The Ever After
                </p>
                {uiMode === 'planner' && plannerScope === 'workspace' && hasActivePlannerWedding && (
                  <p className="mt-1 truncate text-sm font-medium text-white/90">
                    {wedding?.coupleNames || 'Wedding Workspace'}
                  </p>
                )}
                {uiMode === 'couple' && (
                  <p className="mt-1 truncate text-sm font-medium">
                    {wedding?.coupleNames || 'Your Wedding'}
                  </p>
                )}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  uiMode === 'planner' ? 'text-white hover:bg-white/10' : 'text-charcoal hover:bg-sand'
                } ${focusClasses}`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 px-4 py-5">
              {uiMode === 'planner' ? (
                <>
                  <section aria-labelledby="navigation-global-heading">
                    <h2 id="navigation-global-heading" className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      uiMode === 'planner' ? 'text-white/60' : 'text-slate'
                    }`}>
                      The Ever After
                    </h2>
                    <div>
                      {renderDrawerItems(plannerGlobalItems)}
                    </div>
                  </section>

                  {plannerScope === 'workspace' && hasActivePlannerWedding && (
                    <section aria-labelledby="navigation-wedding-heading">
                      <h2 id="navigation-wedding-heading" className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                        Current Wedding
                      </h2>
                      <div>
                        {renderDrawerItems(plannerWeddingItems)}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <section aria-labelledby="navigation-couple-heading">
                  <h2 id="navigation-couple-heading" className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
                    Your Wedding
                  </h2>
                  <div>
                    {renderDrawerItems(coupleItems)}
                  </div>
                </section>
              )}
            </div>

            <div className={`border-t px-5 py-4 ${
              uiMode === 'planner' ? 'border-white/15' : 'border-[#D4A843]/30'
            }`}>
              <p className={`mb-3 text-xs ${uiMode === 'planner' ? 'text-white/70' : 'text-slate'}`}>
                {uiMode === 'planner' ? 'Planner' : 'Couple'}
              </p>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className={`min-h-11 w-full rounded-lg px-4 py-2 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${plannerSignOutClasses} ${focusClasses}`}
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
              {signOutError && <p role="alert" className="mt-2 text-xs text-red-200">{signOutError}</p>}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
