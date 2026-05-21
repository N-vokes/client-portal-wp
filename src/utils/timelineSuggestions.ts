import type { TimelineEvent } from '../types';

export type TimelineSuggestion = {
  id: string;
  title: string;
  description: string;
  category: TimelineEvent['category'];
  estimatedDaysBeforeWedding: number;
};

const suggestionGroups: Record<TimelineEvent['category'], Omit<TimelineSuggestion, 'id'>[]> = {
  planning: [
    {
      title: 'Venue booking',
      description: 'Lock in the venue early so you can build the rest of your timeline around the space.',
      category: 'planning',
      estimatedDaysBeforeWedding: 180,
    },
    {
      title: 'Guest list',
      description: 'Start your guest list to estimate capacity and prepare invitations.',
      category: 'planning',
      estimatedDaysBeforeWedding: 170,
    },
    {
      title: 'Budget finalization',
      description: 'Confirm your budget to guide vendor decisions and planning milestones.',
      category: 'planning',
      estimatedDaysBeforeWedding: 160,
    },
  ],
  design: [
    {
      title: 'Color palette',
      description: 'Choose a color story that unifies decor, invitations, and attire.',
      category: 'design',
      estimatedDaysBeforeWedding: 120,
    },
    {
      title: 'Floral concept',
      description: 'Define floral direction for bouquets, centerpieces, and ceremony arrangements.',
      category: 'design',
      estimatedDaysBeforeWedding: 100,
    },
    {
      title: 'Décor approval',
      description: 'Approve key decor elements so vendors can begin production.',
      category: 'design',
      estimatedDaysBeforeWedding: 90,
    },
  ],
  logistics: [
    {
      title: 'Catering review',
      description: 'Finalize food and beverage details with your caterer.',
      category: 'logistics',
      estimatedDaysBeforeWedding: 60,
    },
    {
      title: 'Transport plan',
      description: 'Confirm transportation schedules for guests and vendors.',
      category: 'logistics',
      estimatedDaysBeforeWedding: 45,
    },
    {
      title: 'Vendor confirmations',
      description: 'Verify arrival times and final details with all vendors.',
      category: 'logistics',
      estimatedDaysBeforeWedding: 40,
    },
  ],
  celebration: [
    {
      title: 'Rehearsal dinner',
      description: 'Plan the rehearsal dinner to align with your wedding weekend flow.',
      category: 'celebration',
      estimatedDaysBeforeWedding: 14,
    },
    {
      title: 'Wedding day schedule',
      description: 'Outline the wedding day timeline for the couple, party, and vendors.',
      category: 'celebration',
      estimatedDaysBeforeWedding: 7,
    },
    {
      title: 'Final walkthrough',
      description: 'Complete a venue walkthrough to confirm all ceremony and reception details.',
      category: 'celebration',
      estimatedDaysBeforeWedding: 3,
    },
  ],
};

const buildSuggestionId = (
  category: TimelineEvent['category'],
  title: string,
  daysBefore: number
) => `${category}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${daysBefore}`;

export function generateTimelineSuggestions(
  weddingDate: string,
  existingEvents: TimelineEvent[]
): TimelineSuggestion[] {
  if (!weddingDate) {
    return [];
  }

  const parsedWeddingDate = new Date(weddingDate);
  if (Number.isNaN(parsedWeddingDate.getTime())) {
    return [];
  }

  const existingCategories = new Set(
    existingEvents.map((event) => event.category)
  );

  return (Object.keys(suggestionGroups) as TimelineEvent['category'][])
    .filter((category) => !existingCategories.has(category))
    .flatMap((category) =>
      suggestionGroups[category].map((suggestion) => ({
        id: buildSuggestionId(
          category,
          suggestion.title,
          suggestion.estimatedDaysBeforeWedding
        ),
        ...suggestion,
      }))
    );
}

export function getDateBeforeWedding(
  weddingDate: string,
  estimatedDaysBeforeWedding: number
): string {
  const wedding = new Date(weddingDate);
  if (Number.isNaN(wedding.getTime())) {
    return '';
  }

  const result = new Date(wedding);
  result.setDate(result.getDate() - estimatedDaysBeforeWedding);
  return result.toISOString().slice(0, 10);
}
