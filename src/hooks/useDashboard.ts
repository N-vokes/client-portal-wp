import { useEffect } from 'react';

import { useWedding } from '../contexts/WeddingContext';
import { planningFlowData } from '../data/planningFlowData';
import {
  getDashboardFocusMoment,
  getDashboardHeroCopy,
  getNextAction,
  getPlannerStats,
  getCoupleStats,
  getPrimaryAction,
  mapActivePlanningFlow,
  mapRecentContracts,
  mapUpcomingMilestones,
  calculateProgressPercent,
} from '../adapters/dashboardAdapters';
import type {
  DashboardHeroCopy,
  FocusMoment,
  NextActionItem,
  PrimaryAction,
  DashboardStat,
  RecentContract,
  UpcomingMilestone,
  ActivePlanningFlowItem,
} from '../adapters/dashboardAdapters';

export type DashboardModel = {
  loading: boolean;
  heroCopy: DashboardHeroCopy;
  stats: DashboardStat[];
  focusMoment: FocusMoment;
  nextAction: NextActionItem;
  activePlanningFlow: ActivePlanningFlowItem[];
  upcomingMilestones: UpcomingMilestone[];
  progressPercent: number;
  recentContracts: RecentContract[];
  primaryAction: PrimaryAction;
};

export const useDashboard = (
  userRole: 'planner' | 'couple'
): DashboardModel => {
  const {
    wedding,
    timelineEvents,
    contracts,
    moodBoardImages,
    loading,
  } = useWedding();

  useEffect(() => {
    const coupleNames = wedding?.coupleNames || 'Demo Couple';

    document.title =
      userRole === 'planner'
        ? 'The Ever After Wedding Portal – Planner Dashboard'
        : `The Ever After Wedding Portal – ${coupleNames} (Demo)`;
  }, [userRole, wedding?.coupleNames]);

  const safeTimeline = timelineEvents || [];
  const safeContracts = contracts || [];
  const safeMoodBoard = moodBoardImages || [];

  const heroCopy = getDashboardHeroCopy(
    userRole,
    wedding?.coupleNames
  );

  const upcomingMilestones = mapUpcomingMilestones(safeTimeline);
  const recentContracts = mapRecentContracts(safeContracts);

  const stats =
    userRole === 'planner'
      ? getPlannerStats(
          safeTimeline.length,
          safeContracts.length,
          safeMoodBoard.length,
          wedding?.weddingDate
        )
      : getCoupleStats(
          safeTimeline,
          safeMoodBoard.length,
          safeContracts.length,
          wedding?.weddingDate
        );

  const activePlanningFlow = mapActivePlanningFlow(
    userRole === 'planner'
      ? planningFlowData.plannerView.focusItems
      : planningFlowData.coupleView.focusItems
  );

  const focusMoment = getDashboardFocusMoment(userRole);
  const nextAction = getNextAction(userRole);
  const progressPercent = calculateProgressPercent(safeTimeline);
  const primaryAction = getPrimaryAction(userRole);

  return {
    loading,
    heroCopy,
    stats,
    focusMoment,
    nextAction,
    activePlanningFlow,
    upcomingMilestones,
    progressPercent,
    recentContracts,
    primaryAction,
  };
};
