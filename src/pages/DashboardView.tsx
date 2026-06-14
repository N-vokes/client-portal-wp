import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { FocusCard } from '../components/dashboard/FocusCard';
import { NextActionCard } from '../components/dashboard/NextActionCard';
import { ActiveFlowList } from '../components/dashboard/ActiveFlowList';
import { PlannerFocusPanel } from '../components/dashboard/PlannerFocusPanel';
import { GettingStartedGuide, type GettingStartedStep } from '../components/dashboard/GettingStartedGuide';
import { DashboardSkeleton } from '../components/Skeleton';
import { useDashboard } from '../hooks/useDashboard';
import { useWedding } from '../contexts/useWedding';
import { OnboardingPage } from './OnboardingPage';
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
import type { DashboardModel } from '../hooks/useDashboard';

export interface DashboardViewProps {
  userRole: 'planner' | 'couple';
  contractHeading: string;
  children?: React.ReactNode;
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
  weddingState: 'loading',
  error: null,
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  userRole,
  contractHeading,
  children,
}) => {
  const {
    authUser,
    wedding,
    loading: weddingLoading,
    timelineEvents,
    contracts,
    moodBoardImages,
  } = useWedding();
  const dashboardData = useDashboard(userRole) ?? emptyDashboardData;
  const navigate = useNavigate();

  if (authUser && !weddingLoading && wedding === null) {
    return <OnboardingPage errorMessage={dashboardData.error} />;
  }

  const timelineItems = safeArray(timelineEvents);
  const contractItems = safeArray(contracts);
  const moodBoardItems = safeArray(moodBoardImages);
  const weddingLoaded = dashboardData.weddingState === 'loaded' && wedding !== null;
  const hasMinimalDashboardData =
    weddingLoaded &&
    timelineItems.length === 0 &&
    contractItems.length === 0 &&
    moodBoardItems.length === 0;
  const showOnboardingHint = weddingLoaded && timelineItems.length === 0;

  const gettingStartedSteps: GettingStartedStep[] = [
    {
      id: 1,
      title: 'Create Timeline',
      description: 'Add milestones and plan key dates for your wedding.',
      icon: '📅',
      link: '/dashboard/timeline',
      completed: timelineItems.length > 0,
    },
    {
      id: 2,
      title: 'Upload Contracts',
      description: 'Store vendor contracts and important documents.',
      icon: '📄',
      link: '/dashboard/contracts',
      completed: contractItems.length > 0,
    },
    {
      id: 3,
      title: 'Build Mood Board',
      description: 'Gather inspiration and visualize your wedding style.',
      icon: '🎨',
      link: '/dashboard/moodboard',
      completed: moodBoardItems.length > 0,
    },
  ];

  const showGettingStarted = weddingLoaded && 
    (timelineItems.length === 0 || contractItems.length === 0 || moodBoardItems.length === 0);

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

  // Show explicit loading state while checking wedding existence
  if (dashboardData.weddingState === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold">Welcome</p>
          <h1 className="text-3xl font-serif text-charcoal mb-4">Setting up your workspace...</h1>
          <p className="text-slate mb-6">
            We’re checking your account and preparing your personalized wedding planning experience.
          </p>
        </div>
      </div>
    );
  }

  // Show loading skeleton during initial load
  if (dashboardData.loading) {
    return <DashboardSkeleton userRole={userRole} />;
  }

  // Show auth error state
  if (dashboardData.weddingState === 'no-auth') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-charcoal mb-4">Authentication Required</h1>
          <p className="text-slate mb-6">
            Please log in to access your wedding planning portal.
          </p>
          <a href="/auth" className="btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show no wedding found state and surface onboarding
  if (dashboardData.weddingState === 'no-wedding-found') {
    return <OnboardingPage errorMessage={dashboardData.error} />;
  }

  if (hasMinimalDashboardData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl rounded-[2rem] border border-gold/20 bg-white p-10 shadow-xl shadow-slate-200/60">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-serif text-charcoal">
              Welcome to your wedding workspace
            </h1>
            <p className="mt-5 text-slate text-base leading-relaxed sm:text-lg max-w-2xl mx-auto">
              Let’s get your planning journey started. Begin by adding your first milestones, vendors, or inspiration.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard/timeline')}
                className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90"
              >
                Start planning
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-cream px-8 py-4 text-sm font-semibold text-charcoal"
              >
                Explore dashboard
              </button>
            </div>

            <div className="mt-10 rounded-3xl border border-gold/10 bg-cream/70 p-6 text-left text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">Why this exists</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                Your wedding workspace keeps everything organized in one secure place.
              </p>
            </div>

            <div className="mt-8 rounded-full border border-gold/20 bg-gold/5 px-5 py-3 text-sm font-medium text-charcoal inline-flex items-center justify-center mx-auto">
              Step 1: Add your first milestone
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      <DashboardHero heroCopy={heroCopy} />

      {showOnboardingHint && (
        <div className="mx-auto mt-6 mb-8 max-w-xl rounded-full border border-gold/20 bg-gold/5 px-5 py-3 text-center text-sm font-medium text-charcoal">
          Step 1: Add your first milestone
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-10">
          <StatsGrid stats={stats} />
        </div>

        {showGettingStarted && (
          <GettingStartedGuide steps={gettingStartedSteps} />
        )}

        {/* ⚠️ PLANNER-ONLY: Focus Panel for daily workflow guidance */}
        {userRole === 'planner' && (
          <div className="mb-12">
            <PlannerFocusPanel />
          </div>
        )}

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
          heading={contractHeading}
          recentContracts={recentContracts}
        />

        {children}

        <DashboardFinalCta primaryAction={primaryAction} />
      </div>
    </div>
  );
};
