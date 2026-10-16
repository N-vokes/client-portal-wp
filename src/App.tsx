import React, { Suspense } from 'react';
import { Outlet, BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import './index.css';

import { Navigation } from './components/Navigation/Navigation';
import { WeddingProvider } from './contexts/WeddingContext';
import { useAuth } from './hooks/useAuth';
import { useWedding } from './contexts/useWedding';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { PageLoader } from './components/PageLoader';

import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { OnboardingSetup } from './pages/OnboardingSetup';
import { MultiWeddingDashboard } from './components/dashboard/MultiWeddingDashboard';

// Lazy pages
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const TimelinePage = React.lazy(() => import('./pages/Timeline').then(m => ({ default: m.TimelinePage })));
const ContractVault = React.lazy(() => import('./pages/ContractVault').then(m => ({ default: m.ContractVault })));
const MoodBoard = React.lazy(() => import('./pages/MoodBoard').then(m => ({ default: m.MoodBoard })));
const MessagesPage = React.lazy(() => import('./pages/Messages').then(m => ({ default: m.MessagesPage })));
const Clients = React.lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const ClientProfile = React.lazy(() => import('./pages/ClientProfile').then(m => ({ default: m.ClientProfile })));

/* ---------------- LAYOUTS ---------------- */

function PlannerLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation mode="planner" />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

function GlobalPlannerLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation mode="planner" plannerScope="global" />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

function CoupleLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation mode="couple" />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

/* ---------------- ROUTE GUARDS ---------------- */

function PlannerRoute() {
  const { weddingId } = useParams();
  const { activeWeddingId, wedding, loading, setActiveWeddingId } = useWedding();
  const [requestedWeddingId, setRequestedWeddingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (weddingId) {
      setRequestedWeddingId(weddingId);
      setActiveWeddingId(weddingId);
    }
  }, [weddingId]);

  if (!weddingId) return <Navigate to="/portfolio" replace />;
  if (requestedWeddingId !== weddingId || loading) {
    return <PageLoader />;
  }
  if (activeWeddingId !== weddingId || wedding?.id !== weddingId) {
    return <Navigate to="/portfolio" replace />;
  }

  return <PlannerLayout />;
}

function PlannerFallbackRoute() {
  const { activeWeddingId, loading } = useWedding();

  if (loading) return <PageLoader />;

  if (!activeWeddingId) {
    return <Navigate to="/portfolio" replace />;
  }

  return <Navigate to={`/dashboard/${activeWeddingId}`} replace />;
}

function CoupleRoute() {
  const { activeWeddingId, loading } = useWedding();

  if (loading) return <PageLoader />;

  if (!activeWeddingId) {
    return <Navigate to="/portfolio" replace />;
  }

  return <CoupleLayout />;
}

/* ---------------- APP CONTENT ---------------- */

function AppContent() {
  const { isAuthenticated, loading: authLoading, userRole, logout, error: authError } = useAuth();
  const { activeWeddingId, loading: weddingLoading } = useWedding();
  const navigate = useNavigate();
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

  if (authLoading || weddingLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated && !userRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-[#E7D59F] bg-white p-6 text-center shadow-sm md:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#075B46]">Account access</p>
          <h1 className="text-2xl font-serif text-[#172D26]">We couldn’t confirm your account role</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#73796F]">
            Your session is active, but the account does not have a recognized planner or couple role. Please contact your administrator.
          </p>
          {authError && (
            <p role="alert" className="mt-4 rounded-lg border border-[#E9C7C5] bg-[#FFF8F7] px-3 py-2 text-sm text-[#783B3A]">
              {authError.message}
            </p>
          )}
          {signOutError && (
            <p role="alert" className="mt-4 rounded-lg border border-[#E9C7C5] bg-[#FFF8F7] px-3 py-2 text-sm text-[#783B3A]">
              {signOutError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#075B46] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/auth"
        element={
          isAuthenticated
            ? userRole === 'planner'
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/couple/dashboard" replace />
            : <AuthPage />
        }
      />

      {/* NOT AUTHENTICATED */}
      {!isAuthenticated ? (
        <>
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
      ) : (
        <>
          {userRole === 'planner' ? (
            <>
              <Route element={<GlobalPlannerLayout />}>
                <Route path="/portfolio" element={<MultiWeddingDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route path="/dashboard/:weddingId/*" element={<PlannerRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="contracts" element={<ContractVault />} />
                <Route path="moodboard" element={<MoodBoard />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientProfile />} />
              </Route>

              {!activeWeddingId && <Route path="/onboarding/setup" element={<OnboardingSetup />} />}
              <Route path="*" element={<PlannerFallbackRoute />} />
            </>
          ) : !activeWeddingId ? (
            <>
              <Route path="/portfolio" element={<OnboardingPage />} />
              <Route path="/onboarding/setup" element={<OnboardingSetup />} />
              <Route path="*" element={<Navigate to="/portfolio" replace />} />
            </>
          ) : (
            <>
              {/* COUPLE */}
              <Route path="/couple/dashboard/*" element={<CoupleRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="contracts" element={<ContractVault />} />
                <Route path="moodboard" element={<MoodBoard />} />
                <Route path="messages" element={<MessagesPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/couple/dashboard" replace />} />
            </>
          )}
        </>
      )}
    </Routes>
  );
}

/* ---------------- ROOT ---------------- */

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WeddingProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WeddingProvider>
      </ToastProvider>

      <Analytics />
    </ErrorBoundary>
  );
}