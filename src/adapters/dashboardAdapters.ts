import { calculateDaysUntil } from '../utils/formatting';
export { calculateProgressPercent } from '../utils/progress';

export type DashboardStat = {
  label: string;
  value: string;
  color: string;
};

export type UpcomingMilestone = {
  id: string;
  title: string;
  daysUntil: number;
  category: string;
};

export type RecentContract = {
  id: string;
  vendor: string;
  type: string;
  status: string;
  icon: string;
  fileUrl: string;
};

export type ActivePlanningFlowItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
};

export type FocusMoment = {
  title: string;
  message: string;
  highlight: string;
};

export type NextActionItem = {
  title: string;
  action: string;
  hint: string;
  cta: string;
  link: string;
};

export type PrimaryAction = {
  title: string;
  text: string;
  buttonLabel: string;
  buttonLink: string;
};

export type DashboardHeroCopy = {
  heading: string;
  message: string;
};

export const getDashboardHeroCopy = (
  userRole: 'planner' | 'couple',
  coupleNames?: string
): DashboardHeroCopy => {
  if (userRole === 'planner') {
    return {
      heading: coupleNames ? `${coupleNames} — Planner Dashboard` : 'No Wedding Selected',
      message: coupleNames
        ? 'Manage milestones, contracts, and inspiration in one elegant workspace.'
        : 'Select a wedding to begin planning.',
    };
  }

  return {
    heading: coupleNames ? `${coupleNames} — Wedding Dashboard` : 'No Wedding Selected',
    message: coupleNames
      ? 'Keep your planning details organized, share progress, and stay aligned.'
      : 'Select a wedding to see your wedding journey.',
  };
};

/**
 * Transform upcoming timeline milestones for dashboard display.
 * ⚠️ WEDDING-SCOPED: Transforms events from a specific wedding context
 */
export const mapUpcomingMilestones = (
  timelineEvents: Array<{
    id: number | string;
    title: string;
    date: string;
    completed: boolean;
    category: string;
  }> = []
): UpcomingMilestone[] =>
  timelineEvents
    .filter((event) => !event.completed)
    .slice(0, 3)
    .map((event) => ({
      id: String(event.id),
      title: event.title,
      daysUntil: calculateDaysUntil(event.date),
      category: event.category,
    }));

/**
 * Transform recent contracts for dashboard display.
 * ⚠️ WEDDING-SCOPED: Transforms contracts from a specific wedding context
 */
export const mapRecentContracts = (
  contracts: Array<{
    id: number | string;
    vendorName?: string;
    vendorType?: string;
    fileUrl?: string;
  }> = []
): RecentContract[] =>
  contracts.slice(0, 3).map((contract) => ({
    id: String(contract.id),
    vendor: contract.vendorName || 'Unknown Vendor',
    type: contract.vendorType || 'other',
    status: 'Signed',
    icon: getVendorIcon(contract.vendorType || 'other'),
    fileUrl: contract.fileUrl || '#',
  }));

/**
 * Calculate dashboard stats for planner view.
 * ⚠️ WEDDING-SCOPED: Stats are generated from a specific wedding's data
 */
export const getPlannerStats = (
  timelineCount: number,
  contractCount: number,
  moodBoardCount: number,
  weddingDate?: string
): DashboardStat[] => [
  {
    label: 'Timeline Events',
    value: timelineCount.toString(),
    color: 'bg-sand',
  },
  {
    label: 'Documents',
    value: contractCount.toString(),
    color: 'bg-blush',
  },
  {
    label: 'Mood Board Items',
    value: moodBoardCount.toString(),
    color: 'bg-gold/10',
  },
  {
    label: 'Days Until Wedding',
    value: calculateDaysUntil(weddingDate).toString(),
    color: 'bg-slate/10',
  },
];

/**
 * Calculate dashboard stats for couple view.
 * ⚠️ WEDDING-SCOPED: Stats are generated from a specific wedding's data
 */
export const getCoupleStats = (
  timelineEvents: Array<{ completed: boolean }> = [],
  moodBoardCount: number,
  contractCount: number,
  weddingDate?: string
): DashboardStat[] => [
  {
    label: 'Days Until Wedding',
    value: calculateDaysUntil(weddingDate).toString(),
    color: 'bg-sand',
  },
  {
    label: 'Tasks Completed',
    value: timelineEvents.filter((e) => e.completed).length.toString(),
    color: 'bg-blush',
  },
  {
    label: 'Mood Board Ideas',
    value: moodBoardCount.toString(),
    color: 'bg-gold/10',
  },
  {
    label: 'Documents Shared',
    value: contractCount.toString(),
    color: 'bg-slate/10',
  },
];

/**
 * Transform planning flow items for dashboard display.
 * ⚠️ WEDDING-SCOPED: Transforms flow items within a wedding context
 */
export const mapActivePlanningFlow = (
  items: Array<{
    id: number | string;
    title: string;
    subtitle: string;
    tag: string;
  }> = []
): ActivePlanningFlowItem[] =>
  items.map((item) => ({
    ...item,
    id: String(item.id),
  }));

export const getDashboardFocusMoment = (
  userRole: 'planner' | 'couple'
): FocusMoment =>
  userRole === 'planner'
    ? {
        title: 'Current Focus',
        message:
          'Floral direction is awaiting final couple confirmation before vendor lock-in.',
        highlight: 'Floral Proposal',
      }
    : {
        title: 'Your Wedding Right Now',
        message:
          'Your floral concepts are being refined. Next step is your feedback on the updated direction.',
        highlight: 'Floral Design Review',
      };

export const getNextAction = (
  userRole: 'planner' | 'couple'
): NextActionItem =>
  userRole === 'planner'
    ? {
        title: 'Next Priority Action',
        action: 'Review updated floral direction with client',
        hint: 'Waiting on final confirmation before vendor lock-in',
        cta: 'Open Mood Board',
        link: '/moodboard',
      }
    : {
        title: 'Next Step for You',
        action: 'Review your updated floral concepts',
        hint: 'Your planner is ready for your feedback',
        cta: 'View Mood Board',
        link: '/moodboard',
      };

export const getPrimaryAction = (
  userRole: 'planner' | 'couple'
): PrimaryAction =>
  userRole === 'planner'
    ? {
        title: 'What would you like to review next?',
        text: 'Keep momentum by checking upcoming milestones, reviewing contracts, or guiding clients.',
        buttonLabel: 'Open Mood Board',
        buttonLink: '/moodboard',
      }
    : {
        title: 'What would you like to look at next?',
        text: 'Explore inspiration, review shared documents, and stay aligned.',
        buttonLabel: 'Open Mood Board',
        buttonLink: '/moodboard',
      };

function getVendorIcon(type?: string) {
  return (
    {
      caterer: '🍽️',
      photographer: '📸',
      florist: '🌹',
      venue: '🏛️',
      music: '🎵',
      other: '📦',
    }[type || 'other'] || '📦'
  );
}
