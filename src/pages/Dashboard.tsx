import React from 'react';

import { DashboardSkeleton } from '../components/Skeleton';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { FocusCard } from '../components/dashboard/FocusCard';
import { NextActionCard } from '../components/dashboard/NextActionCard';
import { ActiveFlowList } from '../components/dashboard/ActiveFlowList';
import { useDashboard, type DashboardModel } from '../hooks/useDashboard';
import {
  DashboardHero,
  DashboardProgress,
  DashboardContracts,
  DashboardFinalCta,
} from '../components/dashboard/DashboardSections';
import type {
  DashboardHeroCopy,
  FocusMoment,
  NextActionItem,
  UpcomingMilestone,
  RecentContract,
  PrimaryAction,
  DashboardStat,
  ActivePlanningFlowItem,
} from '../adapters/dashboardAdapters';

interface DashboardProps {
  userRole: 'planner' | 'couple';
}

const safeArray = <T,>(items: T[] | null | undefined): T[] =>
  Array.isArray(items) ? items : [];

const safeObject = <T,>(value: T | null | undefined, fallback: T): T =>
  value ?? fallback;

const safePercent = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

const emptyHeroCopy: DashboardHeroCopy = {
  heading: '',
  message: '',
};

const emptyFocusMoment: FocusMoment = {
  title: '',
  message: '',
  highlight: '',
};

const emptyNextAction: NextActionItem = {
  title: '',
  action: '',
  hint: '',
  cta: '',
  link: '/',
};

const emptyPrimaryAction: PrimaryAction = {
  title: '',
  text: '',
  buttonLabel: 'Continue',
  buttonLink: '/',
};

const emptyDashboardData: DashboardModel = {
  loading: false,
  heroCopy: emptyHeroCopy,
  stats: [],
  focusMoment: emptyFocusMoment,
  nextAction: emptyNextAction,
  activePlanningFlow: [],
  upcomingMilestones: [],
  progressPercent: 0,
  recentContracts: [],
  primaryAction: emptyPrimaryAction,
};

export const Dashboard: React.FC<DashboardProps> = ({
  userRole,
}) => {
  const dashboardData = useDashboard(userRole) ?? emptyDashboardData;

  const heroCopy = safeObject(dashboardData.heroCopy, emptyHeroCopy);
  const stats = safeArray<DashboardStat>(dashboardData.stats);
  const focusMoment = safeObject(
    dashboardData.focusMoment,
    emptyFocusMoment
  );
  const nextAction = safeObject(
    dashboardData.nextAction,
    emptyNextAction
  );
  const activePlanningFlow = safeArray<ActivePlanningFlowItem>(
    dashboardData.activePlanningFlow
  );
  const upcomingMilestones = safeArray<UpcomingMilestone>(
    dashboardData.upcomingMilestones
  );
  const progressPercent = safePercent(dashboardData.progressPercent);
  const recentContracts = safeArray<RecentContract>(
    dashboardData.recentContracts
  );
  const primaryAction = safeObject(
    dashboardData.primaryAction,
    emptyPrimaryAction
  );

  if (dashboardData.loading) {
    return <DashboardSkeleton userRole={userRole} />;
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      <DashboardHero heroCopy={heroCopy} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-10">
          <StatsGrid stats={stats} />
        </div>

        <div className="mb-10">
          <FocusCard
            title={focusMoment.title}
            highlight={focusMoment.highlight}
            message={focusMoment.message}
          />
        </div>

        <div className="mb-12">
          <NextActionCard
            title={nextAction.title}
            action={nextAction.action}
            hint={nextAction.hint}
            cta={nextAction.cta}
            link={nextAction.link}
          />
        </div>

        <div className="mb-12">
          <ActiveFlowList items={activePlanningFlow} />
        </div>

        <DashboardProgress
          upcomingMilestones={upcomingMilestones}
          progressPercent={progressPercent}
        />

        <DashboardContracts
          heading={
            userRole === 'planner'
              ? 'Vendor Contracts'
              : 'Shared Documents'
          }
          recentContracts={recentContracts}
        />

        <DashboardFinalCta primaryAction={primaryAction} />
      </div>
    </div>
  );
};

