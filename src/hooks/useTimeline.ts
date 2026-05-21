import { useMemo, useState } from 'react';
import type { TimelineEvent } from '../types';

type TimelineCategory = TimelineEvent['category'];
type CategoryFilter = TimelineCategory | 'all';

const validCategories: TimelineCategory[] = [
  'planning',
  'design',
  'logistics',
  'celebration',
];

const isValidCategory = (
  category: string
): category is TimelineCategory =>
  validCategories.includes(category as TimelineCategory);

export function useTimeline(timelineEvents: TimelineEvent[] | null) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');

  const safeEvents = timelineEvents ?? [];

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
    () => safeEvents.filter((e) => !e.completed).length,
    [safeEvents]
  );

  const progressPercent = useMemo(() => {
    const total = safeEvents.length;
    if (total === 0) return 0;

    return Math.round((completedCount / total) * 100);
  }, [safeEvents, completedCount]);

  const cappedProgress = Math.min(
    100,
    Math.max(0, progressPercent)
  );

  return {
    selectedCategory,
    setSelectedCategory,
    filteredEvents,
    safeEvents,
    completedCount,
    upcomingCount,
    progressPercent: cappedProgress,
    isValidCategory,
    validCategories,
  };
}