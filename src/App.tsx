import React, { Suspense } from 'react';
import { RoleEntry } from './pages/RoleEntry';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Navigation } from './components/Navigation/Navigation';
import { WeddingProvider } from './contexts/WeddingContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { PageLoader } from './components/PageLoader';

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

type UserRole = 'planner' | 'couple';

function AppContent() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem('role');
    return savedRole === 'planner' || savedRole === 'couple'
      ? savedRole
      : null;
  });

  const handleSelectRole = (role: UserRole) => {
    localStorage.setItem('role', role);
    setUserRole(role);
  };

  const handleBackToEntry = () => {
    localStorage.removeItem('role');
    setUserRole(null);
  };

  if (!userRole) {
    return <RoleEntry onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navigation userRole={userRole} onBackToEntry={handleBackToEntry} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard userRole={userRole} />} />
          <Route path="/timeline" element={<TimelinePage userRole={userRole} />} />
          <Route path="/contracts" element={<ContractVault userRole={userRole} />} />
          <Route path="/moodboard" element={<MoodBoard userRole={userRole} />} />
          <Route path="/messages" element={<MessagesPage userRole={userRole} />} />
          <Route path="/clients" element={<Clients userRole={userRole} />} />
          <Route path="/clients/:id" element={<ClientProfile userRole={userRole} />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <>
      <ErrorBoundary>
        <ToastProvider>
          <WeddingProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </WeddingProvider>
        </ToastProvider>
      </ErrorBoundary>

      <Analytics />
    </>
  );
}

export default App;