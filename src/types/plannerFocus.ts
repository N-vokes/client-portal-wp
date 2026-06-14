/**
 * Planner Focus Panel Types
 * ⚠️ WEDDING-SCOPED: All data is computed from active wedding context
 * These types derive from TimelineEvent, Contract, and WeddingData
 */

export type OverdueEvent = {
  id: string;
  title: string;
  daysOverdue: number;
  category: string;
};

export type UpcomingMilestone = {
  id: string;
  title: string;
  daysUntil: number;
  category: string;
};

import type { VendorType } from './index';

export type VendorGap = {
  vendorType: VendorType;
  count: number;
  icon: string;
};

export type NextAction = {
  id: string;
  title: string;
  type: 'overdue-event' | 'upcoming-event' | 'vendor-gap';
  priority: 'critical' | 'high' | 'medium';
  score: number;
  actionUrl: string;
};

export type RiskFlag = {
  id: string;
  type: 'overdue-tasks' | 'no-contracts' | 'sparse-timeline' | 'no-vendors';
  severity: 'critical' | 'warning';
  message: string;
};

export type PlannerFocusData = {
  overdueTasks: OverdueEvent[];
  upcomingMilestones: UpcomingMilestone[];
  vendorGaps: VendorGap[];
  nextActions: NextAction[];
  riskFlags: RiskFlag[];
  riskScore: number;
  insights: string[];
  lastUpdated: number;
};
