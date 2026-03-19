import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Navigation } from './components/Navigation/Navigation';
import { Dashboard } from './pages/Dashboard';
import { TimelinePage } from './pages/Timeline';
import { ContractVault } from './pages/ContractVault';
import { MoodBoard } from './pages/MoodBoard';
import { MessagesPage } from './pages/Messages';
import { Clients } from './pages/Clients';
import { ClientProfile } from './pages/ClientProfile';
import { WeddingProvider } from './contexts/WeddingContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

type UserRole = 'planner' | 'couple';

function AppContent() {
  const userRole: UserRole = 'planner'; // Demo: change to 'couple' to see couple view

  return (
    <div className="min-h-screen bg-cream">
      <Navigation userRole={userRole} />
      <Routes>
        <Route path="/" element={<Dashboard userRole={userRole} />} />
        <Route path="/timeline" element={<TimelinePage userRole={userRole} />} />
        <Route path="/contracts" element={<ContractVault userRole={userRole} />} />
        <Route path="/moodboard" element={<MoodBoard userRole={userRole} />} />
        <Route path="/messages" element={<MessagesPage userRole={userRole} />} />
        <Route path="/clients" element={<Clients userRole={userRole} />} />
        <Route path="/clients/:id" element={<ClientProfile />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WeddingProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WeddingProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
