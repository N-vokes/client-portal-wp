import { useMemo } from 'react';
import type { TimelineEvent } from '../types';
import { calculateProgressPercent } from '../utils/progress';

export function useTimeline(timelineEvents: TimelineEvent[] | null) {
  const safeEvents = useMemo(() => timelineEvents ?? [], [timelineEvents]);

  const completedCount = useMemo(
    () => safeEvents.filter((e) => e.completed).length,
    [safeEvents]
  );

  const upcomingCount = useMemo(
    () => Math.max(0, safeEvents.length - completedCount),
    [safeEvents.length, completedCount]
  );

  const progressPercent = useMemo(
    () => calculateProgressPercent(safeEvents),
    [safeEvents]
  );

  return {
    filteredEvents: safeEvents,
    safeEvents,
    completedCount,
    upcomingCount,
    progressPercent,
  };
}