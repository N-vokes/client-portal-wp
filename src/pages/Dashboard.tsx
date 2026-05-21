import React from 'react';
import { DashboardPlannerView } from './DashboardPlannerView';
import { DashboardCoupleView } from './DashboardCoupleView';

interface DashboardProps {
  userRole: 'planner' | 'couple';
}

export const Dashboard: React.FC<DashboardProps> = ({
  userRole,
}) =>
  userRole === 'planner' ? (
    <DashboardPlannerView />
  ) : (
    <DashboardCoupleView />
  );

