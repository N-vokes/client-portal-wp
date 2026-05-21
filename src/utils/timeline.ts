import type { TimelineEvent } from '../types';

export type TimelineCategory = TimelineEvent['category'];
export type CategoryFilter = TimelineCategory | 'all';

export const validTimelineCategories: TimelineCategory[] = [
  'planning',
  'design',
  'logistics',
  'celebration',
];

export const timelineCategoryFilters: CategoryFilter[] = [
  'all',
  ...validTimelineCategories,
];

export const categoryIcons: Record<TimelineCategory, string> = {
  planning: '📋',
  design: '🎨',
  logistics: '🚀',
  celebration: '🎉',
};

export const categoryLabels: Record<TimelineCategory, string> = {
  planning: 'Planning',
  design: 'Design',
  logistics: 'Logistics',
  celebration: 'Celebration',
};

export const isValidTimelineCategory = (
  category: string
): category is TimelineCategory =>
  validTimelineCategories.includes(category as TimelineCategory);
