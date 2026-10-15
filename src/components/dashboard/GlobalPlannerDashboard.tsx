import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/supabase';
import type { TimelineEvent } from '../../types';
import type { MilestoneEntry, VendorEntry } from '../../types/clientProfile';
import { calculateProgressPercent } from '../../utils/progress';

type PlannerWeddingSummary = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  status: 'Upcoming' | 'Today' | 'Past' | 'Date pending';
};

type PlannerFocusItem = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  overdueCount: number;
  overdueMilestoneCount: number;
  upcomingCount: number;
  timelineCount: number;
  message: string;
  additionalSignals: string[];
};

type PlannerFocusState = {
  weddingKey: string;
  status: 'loading' | 'loaded';
  items: PlannerFocusItem[];
  failedQueryCount: number;
};

type VendorCoverageItem = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  missingVendorTypes: string[];
  missingCount: number;
};

type ClientAttentionItem = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  progress: number;
  timelineCount: number;
  description: string;
};

type ClientAttentionState = {
  weddingKey: string;
  status: 'loading' | 'loaded';
  items: ClientAttentionItem[];
  failedCount: number;
};

type PlanningProgressItem = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  progressPercent: number;
  label: string;
};

type DashboardIconName = 'weddings' | 'calendar' | 'priority' | 'progress' | 'timeline' | 'moodboard' | 'portfolio' | 'clock' | 'arrow';

const iconPaths: Record<DashboardIconName, string> = {
  weddings: 'M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6',
  calendar: 'M7 2v4m10-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm2 9h3m4 0h3m-10 4h3',
  priority: 'M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z',
  progress: 'M4 19V5m0 14h17M8 15l4-4 3 2 5-6',
  timeline: 'M6 4h15M6 12h15M6 20h15M2 4h.01M2 12h.01M2 20h.01',
  moodboard: 'M12 20.5s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9.5c0 6.2-8 11-8 11Z',
  portfolio: 'M3 7h18v13H3zM8 7V4h8v3M3 11h18M10 11v2h4v-2',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
};

const DashboardIcon: React.FC<{ name: DashboardIconName; className?: string }> = ({
  name,
  className = 'h-5 w-5',
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={iconPaths[name]} />
  </svg>
);

const PlanningProgressRing: React.FC<{ value: number }> = ({ value }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progressColor =
    value >= 100 ? '#075B46' : value >= 70 ? '#4F8060' : value >= 40 ? '#B18425' : '#B6504E';

  return (
    <div
      className="relative h-16 w-16 shrink-0"
      role="img"
      aria-label={`Timeline ${value}% complete`}
    >
      <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#E8ECE7" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#172D26]">
        {value}%
      </span>
    </div>
  );
};

const expectedVendorCategories = [
  'caterer',
  'photographer',
  'florist',
  'venue',
  'music',
] as const;

const formatVendorLabel = (vendorType: string): string => {
  return vendorType.charAt(0).toUpperCase() + vendorType.slice(1);
};

const parseLocalCalendarDate = (dateValue: string): Date => {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(dateValue);

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const getRelativeWeddingTiming = (dateValue: string): string => {
  if (!dateValue) {
    return 'Date pending';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date pending';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);

  const diffInMs = target.getTime() - today.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Tomorrow';
  }

  if (diffInDays < 30) {
    return `In ${diffInDays} days`;
  }

  const months = Math.round(diffInDays / 30);

  if (months === 1) {
    return 'In 1 month';
  }

  return `In ${months} months`;
};

const formatWeddingDate = (dateValue: string): string => {
  if (!dateValue) {
    return 'Date pending';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date pending';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getWeddingStatus = (dateValue: string): PlannerWeddingSummary['status'] => {
  if (!dateValue) {
    return 'Date pending';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date pending';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedWeddingDate = new Date(parsed);
  normalizedWeddingDate.setHours(0, 0, 0, 0);

  if (normalizedWeddingDate.getTime() > today.getTime()) {
    return 'Upcoming';
  }

  if (normalizedWeddingDate.getTime() === today.getTime()) {
    return 'Today';
  }

  return 'Past';
};

const getPlannerFocusMessage = (
  overdueCount: number,
  upcomingCount: number,
  timelineCount: number
): string => {
  if (overdueCount > 0) {
    return overdueCount === 1 ? '1 overdue timeline event' : `${overdueCount} overdue timeline events`;
  }

  if (upcomingCount > 0) {
    return upcomingCount === 1 ? '1 upcoming timeline event' : `${upcomingCount} upcoming timeline events`;
  }

  if (timelineCount === 0) {
    return 'No timeline events added yet';
  }

  return 'Planning looks calm';
};

export const GlobalPlannerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [weddings, setWeddings] = React.useState<PlannerWeddingSummary[]>([]);
  const [plannerFocusState, setPlannerFocusState] = React.useState<PlannerFocusState>({
    weddingKey: '',
    status: 'loading',
    items: [],
    failedQueryCount: 0,
  });
  const [vendorCoverageItems, setVendorCoverageItems] = React.useState<VendorCoverageItem[]>([]);
  const [clientAttentionState, setClientAttentionState] = React.useState<ClientAttentionState>({
    weddingKey: '',
    status: 'loading',
    items: [],
    failedCount: 0,
  });
  const [planningProgressItems, setPlanningProgressItems] = React.useState<PlanningProgressItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user?.id) {
      setWeddings([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadWeddings = async () => {
      setLoading(true);
      setError(null);

      try {
        const rows = await db.getWeddingsForUser(user.id);

        if (!isMounted) {
          return;
        }

        const mapped = (rows ?? []).map((wedding: any) => ({
          id: String(wedding.id),
          coupleNames: String(wedding.couple_names || 'Unnamed couple'),
          weddingDate: String(wedding.wedding_date || ''),
          status: getWeddingStatus(String(wedding.wedding_date || '')),
        }));

        setWeddings(mapped);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError('Unable to load your wedding portfolio right now.');
        setWeddings([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadWeddings();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  React.useEffect(() => {
    const weddingKey = JSON.stringify(weddings.map(({ id }) => id));

    if (weddings.length === 0) {
      setPlannerFocusState({ weddingKey, status: 'loaded', items: [], failedQueryCount: 0 });
      return;
    }

    let isMounted = true;

    const loadFocusItems = async () => {
      setPlannerFocusState({ weddingKey, status: 'loading', items: [], failedQueryCount: 0 });

      const items: PlannerFocusItem[] = [];
      let failedQueryCount = 0;

      for (const wedding of weddings) {
        const [timelineResult, vendorsResult, milestonesResult] = await Promise.allSettled([
          db.getTimelineEvents(wedding.id),
          db.getVendorsForWedding(wedding.id),
          db.getMilestonesForWedding(wedding.id),
        ]);

        if (!isMounted) {
          return;
        }

        const timelineEvents: TimelineEvent[] =
          timelineResult.status === 'fulfilled' && Array.isArray(timelineResult.value)
            ? timelineResult.value
            : [];
        const vendors: VendorEntry[] =
          vendorsResult.status === 'fulfilled' ? vendorsResult.value : [];
        const milestones: MilestoneEntry[] =
          milestonesResult.status === 'fulfilled' ? milestonesResult.value : [];

        if (timelineResult.status === 'rejected') {
          failedQueryCount += 1;
          console.error(`Failed to load timeline events for wedding ${wedding.id}:`, timelineResult.reason);
        }
        if (vendorsResult.status === 'rejected') {
          failedQueryCount += 1;
          console.error(`Failed to load vendors for wedding ${wedding.id}:`, vendorsResult.reason);
        }
        if (milestonesResult.status === 'rejected') {
          failedQueryCount += 1;
          console.error(`Failed to load milestones for wedding ${wedding.id}:`, milestonesResult.reason);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueCount = timelineEvents.filter((event) => {
          const eventDate = parseLocalCalendarDate(event.date);
          return !event.completed && !Number.isNaN(eventDate.getTime()) && eventDate < today;
        }).length;

        const upcomingCount = timelineEvents.filter((event) => {
          const eventDate = parseLocalCalendarDate(event.date);
          return !event.completed && !Number.isNaN(eventDate.getTime()) && eventDate >= today;
        }).length;

        const overdueMilestones = milestones.filter((milestone) => {
          const dueDate = parseLocalCalendarDate(milestone.dueDate);
          return milestone.status !== 'completed' &&
            !Number.isNaN(dueDate.getTime()) &&
            dueDate < today;
        });
        const vendorFollowUps = vendors.filter(
          (vendor) => vendor.status === 'pending' || vendor.status === 'contacted'
        );
        const timelineLoaded = timelineResult.status === 'fulfilled';
        const timelineCount = timelineLoaded ? timelineEvents.length : 0;
        const additionalSignals = [
          ...vendorFollowUps.map(
            (vendor) => `${vendor.vendorName || vendor.category || 'Vendor'}: ${vendor.status} vendor follow-up`
          ),
          ...overdueMilestones.map(
            (milestone) => `Overdue milestone: ${milestone.title}`
          ),
        ];
        const hasTimelineAttention =
          timelineLoaded && (overdueCount > 0 || upcomingCount > 0 || timelineCount === 0);

        if (hasTimelineAttention || additionalSignals.length > 0) {
          items.push({
            id: wedding.id,
            coupleNames: wedding.coupleNames,
            weddingDate: wedding.weddingDate,
            overdueCount,
            overdueMilestoneCount: overdueMilestones.length,
            upcomingCount,
            timelineCount,
            message: hasTimelineAttention
              ? getPlannerFocusMessage(overdueCount, upcomingCount, timelineCount)
              : '',
            additionalSignals,
          });
        }
      }

      if (!isMounted) {
        return;
      }

      const sorted = items.sort((a, b) => {
        const aTotalOverdue = a.overdueCount + a.overdueMilestoneCount;
        const bTotalOverdue = b.overdueCount + b.overdueMilestoneCount;
        if (aTotalOverdue !== bTotalOverdue) {
          return bTotalOverdue - aTotalOverdue;
        }

        if (a.upcomingCount !== b.upcomingCount) {
          return b.upcomingCount - a.upcomingCount;
        }

        if (a.timelineCount !== b.timelineCount) {
          return a.timelineCount - b.timelineCount;
        }

        return 0;
      });

      setPlannerFocusState({
        weddingKey,
        status: 'loaded',
        items: sorted,
        failedQueryCount,
      });
    };

    void loadFocusItems();

    return () => {
      isMounted = false;
    };
  }, [weddings]);

  const plannerFocusWeddingKey = JSON.stringify(weddings.map(({ id }) => id));
  const isPlannerFocusLoaded =
    plannerFocusState.weddingKey === plannerFocusWeddingKey &&
    plannerFocusState.status === 'loaded';

  React.useEffect(() => {
    if (weddings.length === 0) {
      setVendorCoverageItems([]);
      return;
    }

    let isMounted = true;

    const loadVendorCoverage = async () => {
      const items: VendorCoverageItem[] = [];

      for (const wedding of weddings) {
        try {
          const rows = await db.getContracts(wedding.id);

          if (!isMounted) {
            return;
          }

          const contracts = Array.isArray(rows)
            ? (rows as Array<{ vendor_type?: string | null }>)
            : [];

          const bookedVendorTypes = new Set(
            contracts
              .map((contract) => contract.vendor_type)
              .filter((vendorType): vendorType is string => typeof vendorType === 'string' && vendorType.length > 0)
          );

          const missingVendorTypes = expectedVendorCategories.filter(
            (vendorType) => !bookedVendorTypes.has(vendorType)
          );

          if (missingVendorTypes.length === 0) {
            continue;
          }

          items.push({
            id: wedding.id,
            coupleNames: wedding.coupleNames,
            weddingDate: wedding.weddingDate,
            missingVendorTypes: missingVendorTypes.map((vendorType) => vendorType),
            missingCount: missingVendorTypes.length,
          });
        } catch {
          continue;
        }
      }

      if (!isMounted) {
        return;
      }

      const sorted = [...items].sort((a, b) => {
        if (a.missingCount !== b.missingCount) {
          return b.missingCount - a.missingCount;
        }

        const aDate = new Date(a.weddingDate).getTime();
        const bDate = new Date(b.weddingDate).getTime();

        if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
          return 0;
        }

        return aDate - bDate;
      });

      setVendorCoverageItems(sorted);
    };

    void loadVendorCoverage();

    return () => {
      isMounted = false;
    };
  }, [weddings]);

  React.useEffect(() => {
    const weddingKey = JSON.stringify(
      weddings.map(({ id, coupleNames, weddingDate }) => ({ id, coupleNames, weddingDate }))
    );

    if (weddings.length === 0) {
      setClientAttentionState({ weddingKey, status: 'loaded', items: [], failedCount: 0 });
      return;
    }

    let isMounted = true;

    const loadClientAttention = async () => {
      setClientAttentionState({ weddingKey, status: 'loading', items: [], failedCount: 0 });

      const results = await Promise.all(
        weddings.map(async (wedding) => {
          try {
            const timelineEvents = await db.getTimelineEvents(wedding.id);
            if (!Array.isArray(timelineEvents)) {
              throw new Error('Timeline query returned no event list.');
            }

            const progress = calculateProgressPercent(timelineEvents);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const hasOverdueIncompleteEvent = timelineEvents.some((event) => {
              if (event.completed) {
                return false;
              }

              const eventDate = parseLocalCalendarDate(event.date);
              return !Number.isNaN(eventDate.getTime()) && eventDate < today;
            });

            if (timelineEvents.length > 0 && !hasOverdueIncompleteEvent) {
              return { item: null, failed: false };
            }

            return {
              item: {
                id: wedding.id,
                coupleNames: wedding.coupleNames,
                weddingDate: wedding.weddingDate,
                progress,
                timelineCount: timelineEvents.length,
                description: timelineEvents.length === 0
                  ? 'No planning milestones added yet'
                  : 'An incomplete planning milestone is overdue',
              },
              failed: false,
            };
          } catch (loadError) {
            console.error(`Failed to load timeline progress for wedding ${wedding.id}:`, loadError);
            return { item: null, failed: true };
          }
        })
      );

      if (!isMounted) {
        return;
      }

      const items = results
        .flatMap(({ item }) => (item ? [item] : []))
        .sort((a, b) => {
          if (a.progress !== b.progress) {
            return a.progress - b.progress;
          }

          const aDate = new Date(a.weddingDate).getTime();
          const bDate = new Date(b.weddingDate).getTime();

          if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
            return 0;
          }

          return aDate - bDate;
        });

      setClientAttentionState({
        weddingKey,
        status: 'loaded',
        items,
        failedCount: results.filter(({ failed }) => failed).length,
      });
    };

    void loadClientAttention();

    return () => {
      isMounted = false;
    };
  }, [weddings]);

  const clientAttentionWeddingKey = JSON.stringify(
    weddings.map(({ id, coupleNames, weddingDate }) => ({ id, coupleNames, weddingDate }))
  );
  const isClientAttentionLoaded =
    clientAttentionState.weddingKey === clientAttentionWeddingKey &&
    clientAttentionState.status === 'loaded';

  React.useEffect(() => {
    if (weddings.length === 0) {
      setPlanningProgressItems([]);
      return;
    }

    let isMounted = true;

    const loadPlanningProgress = async () => {
      const items: PlanningProgressItem[] = [];

      for (const wedding of weddings) {
        try {
          const rows = await db.getTimelineEvents(wedding.id);

          if (!isMounted) {
            return;
          }

          const timelineEvents = Array.isArray(rows) ? rows : [];
          const progressPercent = calculateProgressPercent(timelineEvents);
          const label =
            progressPercent >= 80
              ? 'Strong progress'
              : progressPercent >= 50
                ? 'Planning is underway'
                : 'Needs attention';

          items.push({
            id: wedding.id,
            coupleNames: wedding.coupleNames,
            weddingDate: wedding.weddingDate,
            progressPercent,
            label,
          });
        } catch {
          continue;
        }
      }

      if (!isMounted) {
        return;
      }

      const sorted = [...items].sort((a, b) => {
        if (a.progressPercent !== b.progressPercent) {
          return a.progressPercent - b.progressPercent;
        }

        const aDate = new Date(a.weddingDate).getTime();
        const bDate = new Date(b.weddingDate).getTime();

        if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
          return 0;
        }

        return aDate - bDate;
      });

      setPlanningProgressItems(sorted);
    };

    void loadPlanningProgress();

    return () => {
      isMounted = false;
    };
  }, [weddings]);

  const upcomingWeddings = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return [...weddings]
      .filter((wedding) => wedding.weddingDate && new Date(wedding.weddingDate) >= now)
      .sort((a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime())
      .slice(0, 3);
  }, [weddings]);

  const totalActiveWeddings = weddings.length;
  const nextWedding = upcomingWeddings[0] ?? weddings[0];
  const nextWeddingProgress = nextWedding
    ? planningProgressItems.find((item) => item.id === nextWedding.id)
    : undefined;

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl bg-[#FAF7F0] px-4 py-8 md:px-8 md:py-10">
        <div className="rounded-2xl border border-[#D9E5DD] bg-white p-6 text-[#73796F] md:p-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#075B46]">Planner Dashboard</p>
          <h2 className="mb-2 text-2xl font-serif text-[#172D26] md:text-3xl">Loading your wedding portfolio...</h2>
          <p>We’re preparing the overview for your weddings.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl bg-[#FAF7F0] px-4 py-8 md:px-8 md:py-10">
        <div className="rounded-2xl border border-[#E9C7C5] bg-white p-6 text-[#73796F] md:p-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#075B46]">Planner Dashboard</p>
          <h2 className="mb-2 text-2xl font-serif text-[#172D26] md:text-3xl">We couldn’t load your wedding portfolio.</h2>
          <p>Please try again in a moment.</p>
        </div>
      </section>
    );
  }

  if (weddings.length === 0) {
    return (
      <section className="mx-auto max-w-7xl bg-[#FAF7F0] px-4 py-8 md:px-8 md:py-10">
        <div className="rounded-2xl border border-[#D9E5DD] bg-white p-7 text-center md:p-10">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#075B46]">Planner Dashboard</p>
          <h2 className="mb-4 text-3xl font-serif text-[#172D26] md:text-4xl">Your planning workspace is ready</h2>
          <p className="mx-auto max-w-xl text-[#73796F]">
            Create your first wedding to start managing your planning portfolio.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl bg-[#FAF7F0] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-7 flex flex-col gap-4 border-b border-[#D8E3DB] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#075B46]">Planner Dashboard</p>
          <h1 className="text-3xl font-serif leading-tight tracking-[-0.02em] text-[#172D26] md:text-4xl">Your planning overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#73796F] md:text-base">
            {isPlannerFocusLoaded && plannerFocusState.items.length > 0
              ? `${totalActiveWeddings} wedding workspaces, with ${plannerFocusState.items.length} flagged for a closer look.`
              : `${totalActiveWeddings} wedding workspaces in your portfolio, with the next dates and planning progress in view.`}
          </p>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#D4A843] bg-[#FBF0D4] px-4 py-2 text-sm font-semibold text-[#51431F] transition-colors hover:bg-[#F4E3B4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46] focus-visible:ring-offset-2 sm:self-auto"
        >
          <DashboardIcon name="portfolio" className="h-4 w-4" />
          View Weddings
        </Link>
      </header>

      <section aria-labelledby="at-a-glance-title" className="mb-8">
        <h2 id="at-a-glance-title" className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#73796F]">At a Glance</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#075B46] bg-[#075B46] p-4 text-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#E5BC59]">
              <DashboardIcon name="weddings" />
            </span>
            <div>
              <p className="text-3xl font-serif leading-none">{totalActiveWeddings}</p>
              <p className="mt-2 text-xs font-medium text-white/85">Active Weddings</p>
            </div>
          </article>
          <article className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#E7D59F] bg-[#FBF0D4] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70 text-[#8A681C]">
              <DashboardIcon name="calendar" />
            </span>
            <div>
              <p className="text-3xl font-serif leading-none text-[#172D26]">{upcomingWeddings.length}</p>
              <p className="mt-2 text-xs font-medium text-[#70591E]">Upcoming Wedding Dates</p>
            </div>
          </article>
          <article className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#E9C7C5] bg-[#F8E4E3] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/75 text-[#914A47]">
              <DashboardIcon name="priority" />
            </span>
            <div>
              <p className="text-3xl font-serif leading-none text-[#302D2A]">
                {isPlannerFocusLoaded ? plannerFocusState.items.length : '—'}
              </p>
              <p className="mt-2 text-xs font-medium text-[#783B3A]">Priority Weddings</p>
            </div>
          </article>
          <article className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#C8DDD0] bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E2F0E8] text-[#075B46]">
              <DashboardIcon name="progress" />
            </span>
            <div className="min-w-0">
              <p className="text-3xl font-serif leading-none text-[#172D26]">
                {nextWeddingProgress ? `${nextWeddingProgress.progressPercent}%` : '—'}
              </p>
              <p className="mt-2 text-xs font-medium text-[#315744]">Planning Progress</p>
              <p className="truncate text-[11px] text-[#73796F]">
                {nextWeddingProgress ? nextWeddingProgress.coupleNames : 'Next wedding timeline'}
              </p>
            </div>
          </article>
        </div>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.65fr_0.85fr]">
        <section id="priority-tasks" aria-labelledby="priority-title" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="priority-title" className="text-xl font-serif text-[#172D26] md:text-2xl">Priority Tasks</h2>
              <p className="mt-1 text-sm text-[#73796F]">Weddings with existing overdue items or follow-up signals.</p>
            </div>
            {isPlannerFocusLoaded && plannerFocusState.items.length > 0 && (
              <span className="shrink-0 rounded-full bg-[#FBF0D4] px-2.5 py-1 text-xs font-semibold text-[#684B1F]">
                {plannerFocusState.items.length} weddings
              </span>
            )}
          </div>

          {!isPlannerFocusLoaded ? (
            <div className="rounded-xl border border-[#D9E5DD] bg-white p-5 text-sm text-[#73796F]">
              Loading Planner Focus across your weddings...
            </div>
          ) : (
            <>
              {plannerFocusState.failedQueryCount > 0 && (
                <p role="alert" className="mb-3 rounded-lg border border-[#EAD5AD] bg-[#F8EEDB] p-3 text-sm text-[#684B1F]">
                  Some timeline, vendor, or milestone data could not be loaded. Planner Focus results may be incomplete.
                </p>
              )}
              {plannerFocusState.items.length === 0 ? (
                <div className="rounded-xl border border-[#C8DDD0] bg-[#E2F0E8] p-5 text-sm text-[#315744]">
                  {plannerFocusState.failedQueryCount > 0
                    ? 'No all-clear status is available because some wedding data failed to load.'
                    : 'Everything looks calm right now.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {plannerFocusState.items.map((item) => (
                    <article key={item.id} className={`rounded-xl border px-4 py-3 ${
                      item.overdueCount + item.overdueMilestoneCount > 0
                        ? 'border-[#E9C9C5] bg-[#FFF8F7]'
                        : item.additionalSignals.length > 0 || item.timelineCount === 0
                          ? 'border-[#E7D59F] bg-[#FFFBF0]'
                          : 'border-[#C7D9CC] bg-[#F3F8F4]'
                    }`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#172D26]">{item.coupleNames}</h3>
                          <p className="text-xs text-[#73796F]">{formatWeddingDate(item.weddingDate)}</p>
                        </div>
                        <Link
                          to={`/dashboard/${item.id}`}
                          className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[#075B46] underline decoration-[#D4A843] underline-offset-4 hover:text-[#172D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]"
                        >
                          Open Wedding <DashboardIcon name="arrow" className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      {item.message && (
                        <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                          item.overdueCount > 0 || item.overdueMilestoneCount > 0
                            ? 'bg-[#F7E5E4] text-[#783B3A]'
                            : item.additionalSignals.length > 0 || item.timelineCount === 0
                              ? 'bg-[#FBF0D4] text-[#684B1F]'
                              : 'bg-[#E5EEF9] text-[#435A78]'
                        }`}>{item.message}</p>
                      )}
                      {item.additionalSignals.length > 0 && (
                        <ul className="mt-2 space-y-1.5 text-xs text-[#5D554D]">
                          {item.additionalSignals.map((signal, index) => (
                            <li key={`${item.id}-${index}`} className="flex items-start gap-2">
                              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                                signal.startsWith('Overdue milestone') ? 'bg-[#A65350]' : 'bg-[#D4A843]'
                              }`} />
                              {signal}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="h-fit rounded-xl border border-[#D9E5DD] bg-white p-4 md:p-5">
          <h2 className="text-xl font-serif text-[#172D26]">Quick Actions</h2>
          <p className="mt-1 text-sm text-[#73796F]">Jump into the work that matters.</p>
          <nav aria-label="Dashboard quick actions" className="mt-4 flex flex-col gap-2">
            <a href="#priority-tasks" className="group flex min-h-11 items-center gap-3 rounded-lg bg-[#F8F5F0] px-3 py-2 text-sm font-medium text-[#302D2A] transition-colors hover:bg-[#E2F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
              <DashboardIcon name="priority" className="h-4 w-4 text-[#A65350]" />
              Review priorities
              <DashboardIcon name="arrow" className="ml-auto h-4 w-4 text-[#73796F] transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link to="/portfolio" className="group flex min-h-11 items-center gap-3 rounded-lg bg-[#F8F5F0] px-3 py-2 text-sm font-medium text-[#302D2A] transition-colors hover:bg-[#FBF0D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
              <DashboardIcon name="portfolio" className="h-4 w-4 text-[#8A681C]" />
              View Weddings
              <DashboardIcon name="arrow" className="ml-auto h-4 w-4 text-[#73796F] transition-transform group-hover:translate-x-0.5" />
            </Link>
            {nextWedding && (
              <>
                <Link to={`/dashboard/${nextWedding.id}/timeline`} className="group flex min-h-11 items-center gap-3 rounded-lg bg-[#F8F5F0] px-3 py-2 text-sm font-medium text-[#302D2A] transition-colors hover:bg-[#E5EEF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
                  <DashboardIcon name="timeline" className="h-4 w-4 text-[#435A78]" />
                  Manage Timeline
                  <DashboardIcon name="arrow" className="ml-auto h-4 w-4 text-[#73796F] transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to={`/dashboard/${nextWedding.id}/moodboard`} className="group flex min-h-11 items-center gap-3 rounded-lg bg-[#F8F5F0] px-3 py-2 text-sm font-medium text-[#302D2A] transition-colors hover:bg-[#EEE8F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
                  <DashboardIcon name="moodboard" className="h-4 w-4 text-[#695487]" />
                  Open Mood Board
                  <DashboardIcon name="arrow" className="ml-auto h-4 w-4 text-[#73796F] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </nav>
        </aside>
      </div>

      <div className="mb-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section aria-labelledby="coming-up-title" className="overflow-hidden rounded-xl border border-[#D9E5DD] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div>
              <h2 id="coming-up-title" className="text-xl font-serif text-[#172D26] md:text-2xl">Coming Up</h2>
              <p className="mt-1 text-sm text-[#73796F]">The next wedding dates on your calendar.</p>
            </div>
            <Link to="/portfolio" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-[#075B46] underline decoration-[#D4A843] underline-offset-4 hover:text-[#172D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
              View portfolio <DashboardIcon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          {upcomingWeddings.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#73796F] md:px-5">No upcoming weddings yet. Your portfolio will appear here as you add weddings.</p>
          ) : (
            <div className="divide-y divide-[#E8EEE9]">
              {upcomingWeddings.map((wedding) => (
                <div key={wedding.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#F8FAF7] sm:flex-row sm:items-center sm:justify-between md:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5EEF9] text-[#435A78]">
                      <DashboardIcon name="calendar" className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#172D26]">{wedding.coupleNames}</h3>
                      <p className="mt-0.5 text-xs text-[#73796F]">{formatWeddingDate(wedding.weddingDate)}</p>
                    </div>
                    {wedding.weddingDate && (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E5EEF9] px-2.5 py-1 text-[11px] font-medium text-[#435A78] sm:ml-0">
                        <DashboardIcon name="clock" className="h-3.5 w-3.5" />
                        {getRelativeWeddingTiming(wedding.weddingDate)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/dashboard/${wedding.id}`}
                    className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-full bg-[#075B46] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 sm:self-auto"
                  >
                    Open Wedding <DashboardIcon name="arrow" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="planning-progress-title" className="rounded-xl border border-[#D9E5DD] bg-white p-4 md:p-5">
          <div className="mb-3">
            <h2 id="planning-progress-title" className="text-xl font-serif text-[#172D26] md:text-2xl">Planning Progress</h2>
            <p className="mt-1 text-sm text-[#73796F]">Timeline completion across your weddings.</p>
          </div>
          {planningProgressItems.length === 0 ? (
            <div className="rounded-lg bg-[#F8F5F0] p-4 text-sm text-[#73796F]">No planning progress data is available yet.</div>
          ) : (
            <div className="max-h-[330px] space-y-1 overflow-y-auto pr-1">
              {planningProgressItems.map((item) => (
                <article key={item.id} className="flex items-center gap-3 border-b border-[#EEF0EC] py-3 last:border-0">
                  <PlanningProgressRing value={item.progressPercent} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[#172D26]">{item.coupleNames}</h3>
                    <p className="mt-0.5 text-xs text-[#73796F]">{formatWeddingDate(item.weddingDate)}</p>
                    <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      item.progressPercent >= 80
                        ? 'bg-[#E2F0E8] text-[#315744]'
                        : item.progressPercent >= 50
                          ? 'bg-[#FBF0D4] text-[#684B1F]'
                          : 'bg-[#F7E5E4] text-[#783B3A]'
                    }`}>{item.label}</span>
                  </div>
                  <Link
                    to={`/dashboard/${item.id}`}
                    aria-label={`Open ${item.coupleNames} wedding`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#075B46] transition-colors hover:bg-[#E2F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]"
                  >
                    <DashboardIcon name="arrow" className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mb-8 grid gap-4 xl:grid-cols-2">
        <section aria-labelledby="vendor-coverage-title" className="rounded-xl border border-[#D9E5DD] bg-[#F2F7F2] p-4 md:p-5">
          <div className="mb-3">
            <h2 id="vendor-coverage-title" className="text-xl font-serif text-[#172D26] md:text-2xl">Vendor Coverage</h2>
            <p className="mt-1 text-sm text-[#73796F]">Categories that still need coverage.</p>
          </div>
          {vendorCoverageItems.length === 0 ? (
            <p className="rounded-lg border border-[#C8DDD0] bg-[#E2F0E8] p-4 text-sm text-[#315744]">
              All expected vendor categories are currently covered across your weddings.
            </p>
          ) : (
            <div className="space-y-2">
              {vendorCoverageItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-[#D9E5DD] bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#172D26]">{item.coupleNames}</h3>
                      <p className="mt-0.5 text-xs text-[#73796F]">{formatWeddingDate(item.weddingDate)}</p>
                    </div>
                    <Link to={`/dashboard/${item.id}`} className="shrink-0 text-xs font-semibold text-[#075B46] underline decoration-[#D4A843] underline-offset-4 hover:text-[#172D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
                      Open Wedding
                    </Link>
                  </div>
                  <p className="mb-2 mt-2 text-xs text-[#514B45]">
                    {item.missingCount === 1
                      ? '1 vendor category needs coverage'
                      : `${item.missingCount} vendor categories need coverage`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.missingVendorTypes.map((vendorType) => (
                      <span
                        key={vendorType}
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          vendorType === 'venue' || vendorType === 'florist'
                            ? 'border-[#C8DDD0] bg-[#E2F0E8] text-[#315744]'
                            : vendorType === 'photographer' || vendorType === 'music'
                              ? 'border-[#D7CBE8] bg-[#EEE8F7] text-[#5D4A78]'
                              : 'border-[#D7E1EF] bg-[#E5EEF9] text-[#435A78]'
                        }`}
                      >
                        {formatVendorLabel(vendorType)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="client-attention-title" className="rounded-xl border border-[#E9D8D3] bg-[#FBF5F2] p-4 md:p-5">
          <div className="mb-3">
            <h2 id="client-attention-title" className="text-xl font-serif text-[#172D26] md:text-2xl">Client Attention</h2>
            <p className="mt-1 text-sm text-[#73796F]">Couples who may need a planner follow-up.</p>
          </div>
          {!isClientAttentionLoaded ? (
            <div className="rounded-lg bg-white p-4 text-sm text-[#73796F]">Loading wedding progress...</div>
          ) : (
            <>
              {clientAttentionState.failedCount > 0 && (
                <p role="alert" className="mb-3 rounded-lg border border-[#E7D59F] bg-[#FBF0D4] p-3 text-xs text-[#684B1F]">
                  Unable to load progress for {clientAttentionState.failedCount}{' '}
                  {clientAttentionState.failedCount === 1 ? 'wedding' : 'weddings'}. Attention results may be incomplete.
                </p>
              )}
              {clientAttentionState.items.length === 0 ? (
                <p className="rounded-lg border border-[#C8DDD0] bg-[#E2F0E8] p-4 text-sm text-[#315744]">
                  {clientAttentionState.failedCount > 0
                    ? 'No attention results can be confirmed because some wedding data failed to load.'
                    : 'No client follow-ups are currently flagged for attention.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {clientAttentionState.items.map((item) => (
                    <article key={item.id} className={`rounded-lg border bg-white p-3 ${
                      item.description.toLowerCase().includes('overdue') ? 'border-[#E9C7C5]' : 'border-[#E7D59F]'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#172D26]">{item.coupleNames}</h3>
                          <p className="mt-0.5 text-xs text-[#73796F]">{formatWeddingDate(item.weddingDate)}</p>
                        </div>
                        <Link to={`/dashboard/${item.id}`} className="shrink-0 text-xs font-semibold text-[#075B46] underline decoration-[#D4A843] underline-offset-4 hover:text-[#172D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46]">
                          Open Wedding
                        </Link>
                      </div>
                      <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs ${
                        item.description.toLowerCase().includes('overdue')
                          ? 'bg-[#F7E5E4] text-[#783B3A]'
                          : 'bg-[#FBF0D4] text-[#684B1F]'
                      }`}>{item.description}</p>
                      <p className="mt-1.5 text-xs text-[#73796F]">
                        {item.timelineCount === 0 ? 'Progress unavailable' : `${item.progress}% complete`}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="your-weddings-title" className="overflow-hidden rounded-xl border border-[#D9E5DD] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#D4A843]/50 bg-[#075B46] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <h2 id="your-weddings-title" className="text-xl font-serif text-white md:text-2xl">Your Weddings</h2>
            <p className="mt-1 text-sm text-white/80">All wedding workspaces in your portfolio.</p>
          </div>
          <Link to="/portfolio" className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-full border border-[#E5BC59] bg-[#FBF0D4] px-4 py-2 text-xs font-semibold text-[#51431F] transition-colors hover:bg-[#F4E3B4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#075B46] sm:self-auto">
            View Wedding Portfolio <DashboardIcon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-[#E8EEE9]">
          {weddings.map((wedding) => (
            <div key={wedding.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#F8FAF7] sm:flex-row sm:items-center sm:justify-between md:px-5">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#172D26]">{wedding.coupleNames}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-[#73796F]">{formatWeddingDate(wedding.weddingDate)}</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    wedding.status === 'Upcoming'
                      ? 'border-[#D7E1EF] bg-[#E5EEF9] text-[#435A78]'
                      : wedding.status === 'Today'
                        ? 'border-[#C8DDD0] bg-[#E2F0E8] text-[#315744]'
                        : wedding.status === 'Past'
                          ? 'border-[#E8E0D4] bg-[#F1EEE8] text-[#5E645C]'
                          : 'border-[#E7D59F] bg-[#FBF0D4] text-[#684B1F]'
                  }`}>
                    {wedding.status}
                  </span>
                </div>
              </div>
              <Link
                to={`/dashboard/${wedding.id}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#075B46] bg-[#075B46] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 sm:self-auto"
              >
                Open Wedding <DashboardIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};
