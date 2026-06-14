import { useMemo } from 'react';
import { useWedding } from '../contexts/useWedding';
import type { VendorType } from '../types';
import { calculateDaysUntil } from '../utils/formatting';
import type {
  OverdueEvent,
  UpcomingMilestone,
  VendorGap,
  NextAction,
  RiskFlag,
  PlannerFocusData,
} from '../types/plannerFocus';


/**
 * Compute planner focus data from wedding context.
 * ⚠️ WEDDING-SCOPED: All data derived from active wedding context
 * Read-only hook that aggregates insights for planner daily workflow
 * Gracefully handles cases where no wedding is loaded
 */
export const usePlannerFocus = (): PlannerFocusData => {
  const { timelineEvents, contracts, weddingState } = useWedding();

  // Return empty focus data if wedding is not loaded
  const isWeddingLoaded = weddingState === 'loaded';
  const safeTimelineEvents = isWeddingLoaded ? timelineEvents : [];
  const safeContracts = isWeddingLoaded ? contracts : [];

  // ⚠️ COMPUTE: Overdue events (date < today, not completed)
  const overdueTasks = useMemo((): OverdueEvent[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return safeTimelineEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate < today && !event.completed;
      })
      .map((event) => {
        const eventDate = new Date(event.date);
        const daysOverdue = Math.floor(
          (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: event.id,
          title: event.title,
          daysOverdue,
          category: event.category,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [safeTimelineEvents]);

  // ⚠️ COMPUTE: Upcoming milestones (7-14 days from today)
  const upcomingMilestones = useMemo((): UpcomingMilestone[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    return safeTimelineEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate >= sevenDaysFromNow &&
          eventDate <= fourteenDaysFromNow &&
          !event.completed
        );
      })
      .map((event) => ({
        id: event.id,
        title: event.title,
        daysUntil: calculateDaysUntil(event.date),
        category: event.category,
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [safeTimelineEvents]);

  // ⚠️ COMPUTE: Vendor gaps (vendor types in timeline but not contracted)
  const vendorGaps = useMemo((): VendorGap[] => {
    // Count booked vendors by type
    const bookedVendorTypes = new Set(safeContracts.map((c) => c.vendorType));

    // Define expected vendor types
    const expectedVendors: Array<[VendorType, string]> = [
      ['caterer', '🍽️'],
      ['photographer', '📸'],
      ['florist', '🌹'],
      ['venue', '🏛️'],
      ['music', '🎵'],
    ];

    return expectedVendors
      .filter(([type]) => !bookedVendorTypes.has(type))
      .map(([type, icon]) => ({
        vendorType: type,
        count: 1, // placeholder - indicates "not booked"
        icon,
      }));
  }, [safeContracts]);

  // ⚠️ COMPUTE: Next 3 actions
  const nextActions = useMemo((): NextAction[] => {
    const actions: NextAction[] = [];

    // Priority 1: Earliest overdue event
    if (overdueTasks.length > 0) {
      actions.push({
        id: `overdue-${overdueTasks[0].id}`,
        title: `Complete overdue: ${overdueTasks[0].title}`,
        type: 'overdue-event',
        priority: 'critical',
        score: 100,
        actionUrl: '/timeline',
      });
    }

    // Priority 2: Next upcoming event outside the 7-14 day window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextIncompleteTodayOrAfter = safeTimelineEvents.find((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && !event.completed;
    });

    if (
      nextIncompleteTodayOrAfter &&
      actions.length < 2 &&
      !overdueTasks.some((t) => t.id === nextIncompleteTodayOrAfter.id)
    ) {
      const daysUntil = calculateDaysUntil(nextIncompleteTodayOrAfter.date);
      const upcomingScore = Math.min(90, Math.max(55, 90 - daysUntil * 2));

      actions.push({
        id: `upcoming-${nextIncompleteTodayOrAfter.id}`,
        title: `Next: ${nextIncompleteTodayOrAfter.title} (${daysUntil} days)`,
        type: 'upcoming-event',
        priority: 'high',
        score: upcomingScore,
        actionUrl: '/timeline',
      });
    }

    // Priority 3: First missing vendor type
    if (vendorGaps.length > 0 && actions.length < 3) {
      const gap = vendorGaps[0];
      const criticalVendorTypes: VendorType[] = [
        'venue',
        'photographer',
        'caterer',
        'florist',
      ];
      const vendorScoreBase = 70;
      const vendorScore = criticalVendorTypes.includes(gap.vendorType)
        ? vendorScoreBase + 10
        : vendorScoreBase;

      actions.push({
        id: `vendor-${gap.vendorType}`,
        title: `Secure vendor: ${gap.vendorType}`,
        type: 'vendor-gap',
        priority: 'high',
        score: Math.min(100, vendorScore),
        actionUrl: '/contracts',
      });
    }

    return actions
      .slice(0, 3)
      .sort((a, b) => b.score - a.score || a.priority.localeCompare(b.priority));
  }, [overdueTasks, safeTimelineEvents, vendorGaps]);

  // ⚠️ COMPUTE: Risk flags
  const riskFlags = useMemo((): RiskFlag[] => {
    const flags: RiskFlag[] = [];

    // Risk: Overdue tasks
    if (overdueTasks.length > 0) {
      flags.push({
        id: 'risk-overdue',
        type: 'overdue-tasks',
        severity: 'critical',
        message: `${overdueTasks.length} overdue task${
          overdueTasks.length > 1 ? 's' : ''
        }. Oldest is ${overdueTasks[0].daysOverdue} days late.`,
      });
    }

    // Risk: No contracts
    if (safeContracts.length === 0) {
      flags.push({
        id: 'risk-no-contracts',
        type: 'no-contracts',
        severity: 'warning',
        message:
          'No vendor contracts uploaded. Start by adding your first contract.',
      });
    }

    // Risk: Sparse timeline (fewer than 5 events)
    if (safeTimelineEvents.length < 5) {
      flags.push({
        id: 'risk-sparse-timeline',
        type: 'sparse-timeline',
        severity: 'warning',
        message: `Timeline is sparse (${safeTimelineEvents.length} events). Consider adding more milestones.`,
      });
    }

    // Risk: Missing key vendors
    if (vendorGaps.length > 2) {
      flags.push({
        id: 'risk-missing-vendors',
        type: 'no-vendors',
        severity: 'warning',
        message: `${vendorGaps.length} key vendor types not yet booked.`,
      });
    }

    return flags;
  }, [overdueTasks, safeContracts, safeTimelineEvents, vendorGaps]);

  const riskScore = useMemo(() => {
    const overdueRisk = Math.min(40, overdueTasks.length * 12);
    const contractRisk = Math.max(0, 30 - safeContracts.length * 3);
    const timelineRisk = safeTimelineEvents.length < 5 ? 20 : 0;
    const vendorGapRisk = Math.min(15, vendorGaps.length * 5);

    return Math.min(100, overdueRisk + contractRisk + timelineRisk + vendorGapRisk + 20);
  }, [overdueTasks.length, safeContracts.length, safeTimelineEvents.length, vendorGaps.length]);

  const insights = useMemo(() => {
    const recommendations: string[] = [];

    if (overdueTasks.length > 0) {
      recommendations.push(
        overdueTasks.length > 1
          ? 'Multiple overdue tasks are increasing planning risk. Prioritize them now.'
          : `Resolve overdue task '${overdueTasks[0].title}' to reduce risk.`
      );
    }

    const atRiskMilestone = upcomingMilestones.find(
      (milestone) => milestone.daysUntil >= 3 && milestone.daysUntil <= 5
    );

    if (atRiskMilestone) {
      recommendations.push(
        `Milestone '${atRiskMilestone.title}' is at risk in ${atRiskMilestone.daysUntil} days. Review it soon.`
      );
    }

    if (vendorGaps.length > 0) {
      vendorGaps.slice(0, 2).forEach((gap) => {
        recommendations.push(`Book ${gap.vendorType} soon to avoid vendor sourcing delays.`);
      });
    }

    if (safeContracts.length === 0) {
      recommendations.push('Upload your first vendor contract to lock in commitments.');
    }

    if (safeTimelineEvents.length < 5) {
      recommendations.push('Add more timeline milestones to strengthen the planning roadmap.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Wedding planning is on track. Keep monitoring upcoming milestones.');
    }

    return recommendations;
  }, [overdueTasks, upcomingMilestones, vendorGaps, safeContracts.length, safeTimelineEvents.length]);

  return {
    overdueTasks,
    upcomingMilestones,
    vendorGaps,
    nextActions,
    riskFlags,
    riskScore,
    insights,
    lastUpdated: Date.now(),
  };
};
