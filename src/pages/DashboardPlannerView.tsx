import React from 'react';
import { DashboardView } from './DashboardView';

export const DashboardPlannerView: React.FC = () => (
  <DashboardView
    userRole="planner"
    contractHeading="Vendor Contracts"
  />
);
