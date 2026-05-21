import { useMemo, useState } from 'react';
import type { TimelineEvent } from '../types';
import { calculateProgressPercent } from '../utils/progress';
import {
  timelineCategoryFilters,
  validTimelineCategories,
  isValidTimelineCategory,
} from '../utils/timeline';

type CategoryFilter = typeof timelineCategoryFilters[number];

export function useTimeline(timelineEvents: TimelineEvent[] | null) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');

  const safeEvents = useMemo(() => timelineEvents ?? [], [timelineEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return safeEvents;

    return safeEvents.filter(
      (e) => e.category === selectedCategory
    );
  }, [safeEvents, selectedCategory]);

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
    selectedCategory,
    setSelectedCategory,
    filteredEvents,
    safeEvents,
    completedCount,
    upcomingCount,
    progressPercent,
    isValidCategory: isValidTimelineCategory,
    validCategories: validTimelineCategories,
  };
}