import React, { Suspense } from 'react';
import { Outlet, BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
  const { setActiveWeddingId } = useWedding();

  React.useEffect(() => {
    if (weddingId) setActiveWeddingId(weddingId);
  }, [weddingId]);

  if (!weddingId) return <Navigate to="/portfolio" replace />;

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
  const { isAuthenticated, loading: authLoading, userRole } = useAuth();
  const { activeWeddingId, loading: weddingLoading } = useWedding();

  if (authLoading || weddingLoading) {
    return <PageLoader />;
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
              : <Navigate to="/portfolio" replace />
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
          {/* ONBOARDING */}
          {!activeWeddingId ? (
            <>
              <Route path="/portfolio" element={<OnboardingPage />} />
              <Route path="/onboarding/setup" element={<OnboardingSetup />} />
              <Route path="*" element={<Navigate to="/portfolio" replace />} />
            </>
          ) : (
            <>
              {/* PLANNER */}
              {userRole === 'planner' ? (
                <>
                  <Route path="/portfolio" element={<MultiWeddingDashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="/dashboard/:weddingId/*" element={<PlannerRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="timeline" element={<TimelinePage />} />
                    <Route path="contracts" element={<ContractVault />} />
                    <Route path="moodboard" element={<MoodBoard />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="clients/:id" element={<ClientProfile />} />
                  </Route>

                  <Route path="*" element={<PlannerFallbackRoute />} />
                </>
              ) : (
                /* COUPLE */
                <>
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