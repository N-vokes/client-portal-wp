import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/PageLoader';
import { GlobalPlannerDashboard } from '../components/dashboard/GlobalPlannerDashboard';
import { DashboardPlannerView } from './DashboardPlannerView';
import { DashboardCoupleView } from './DashboardCoupleView';

/**
 * Dashboard Component
 * - Reads userRole directly from useAuth hook (no props)
 * - Single source of truth: auth state from useAuth
 * - No async race conditions
 */

export const Dashboard: React.FC = () => {
  const { userRole, loading } = useAuth();
  const { weddingId } = useParams();

  if (loading) {
    return <PageLoader />;
  }

  if (userRole === 'planner') {
    return weddingId ? <DashboardPlannerView /> : <GlobalPlannerDashboard />;
  }

  return <DashboardCoupleView />;
};
