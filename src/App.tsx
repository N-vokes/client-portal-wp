import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import { Navigation } from './components/Navigation/Navigation';
import { WeddingProvider } from './contexts/WeddingContext';
import { useWedding } from './contexts/useWedding';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { PageLoader } from './components/PageLoader';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { supabase } from './lib/supabase';

// Lazy-loaded page components for code splitting
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const TimelinePage = React.lazy(() =>
  import('./pages/Timeline').then((module) => ({ default: module.TimelinePage }))
);
const ContractVault = React.lazy(() =>
  import('./pages/ContractVault').then((module) => ({ default: module.ContractVault }))
);
const MoodBoard = React.lazy(() =>
  import('./pages/MoodBoard').then((module) => ({ default: module.MoodBoard }))
);
const MessagesPage = React.lazy(() =>
  import('./pages/Messages').then((module) => ({ default: module.MessagesPage }))
);
const Clients = React.lazy(() =>
  import('./pages/Clients').then((module) => ({ default: module.Clients }))
);
const ClientProfile = React.lazy(() =>
  import('./pages/ClientProfile').then((module) => ({ default: module.ClientProfile }))
);

function ProtectedApp({ onLogout }: { onLogout: () => void }) {
  const { authUser, loading: weddingLoading, weddingState, userRole } = useWedding();

  if (weddingLoading) {
    return <PageLoader />;
  }

  if (authUser && weddingState === 'no-wedding-found') {
    return <OnboardingPage />;
  }

  if (!userRole) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navigation userRole={userRole} onBackToEntry={onLogout} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
          <Route path="/dashboard/timeline" element={<TimelinePage userRole={userRole} />} />
          <Route path="/dashboard/contracts" element={<ContractVault userRole={userRole} />} />
          <Route path="/dashboard/moodboard" element={<MoodBoard userRole={userRole} />} />
          <Route path="/dashboard/messages" element={<MessagesPage userRole={userRole} />} />
          <Route path="/dashboard/clients" element={<Clients userRole={userRole} />} />
          <Route path="/dashboard/clients/:id" element={<ClientProfile userRole={userRole} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthChecked(true);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
      <Route
        path="/dashboard/*"
        element={
          !authChecked ? (
            <PageLoader />
          ) : session ? (
            <WeddingProvider>
              <ProtectedApp onLogout={handleLogout} />
            </WeddingProvider>
          ) : (
            <Navigate to="/auth" replace state={{ from: location.pathname }} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <ErrorBoundary>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </ErrorBoundary>

      <Analytics />
    </>
  );
}

export default App;