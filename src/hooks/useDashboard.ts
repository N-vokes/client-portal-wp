import { useEffect } from 'react';

import { useWedding } from '../contexts/useWedding';
import type { WeddingState } from '../contexts/WeddingContextValue';
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
  weddingState: WeddingState;
  error: string | null;
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
    weddingState,
    timelineEvents,
    contracts,
    moodBoardImages,
    loading,
    error,
  } = useWedding();

  // ⚠️ WEDDING-SCOPED: All data accessed through wedding context
  // Gracefully handle no-auth and no-wedding-found states
  const isWeddingLoaded = weddingState === 'loaded' && wedding;

  useEffect(() => {
    const coupleNames = isWeddingLoaded ? wedding.coupleNames : 'Wedding Portal';

    document.title =
      userRole === 'planner'
        ? 'The Ever After Wedding Portal – Planner Dashboard'
        : `The Ever After Wedding Portal – ${coupleNames}`;
  }, [userRole, wedding?.coupleNames, isWeddingLoaded]);

  const safeTimeline = isWeddingLoaded ? timelineEvents || [] : [];
  const safeContracts = isWeddingLoaded ? contracts || [] : [];
  const safeMoodBoard = isWeddingLoaded ? moodBoardImages || [] : [];

  const heroCopy = getDashboardHeroCopy(
    userRole,
    isWeddingLoaded ? wedding.coupleNames : undefined
  );

  const upcomingMilestones = mapUpcomingMilestones(safeTimeline);
  const recentContracts = mapRecentContracts(safeContracts);

  const stats =
    userRole === 'planner'
      ? getPlannerStats(
          safeTimeline.length,
          safeContracts.length,
          safeMoodBoard.length,
          isWeddingLoaded ? wedding.weddingDate : undefined
        )
      : getCoupleStats(
          safeTimeline,
          safeMoodBoard.length,
          safeContracts.length,
          isWeddingLoaded ? wedding.weddingDate : undefined
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
    weddingState,
    error,
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
