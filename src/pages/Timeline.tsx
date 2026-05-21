import React, { useMemo, useState } from 'react';
import type { TimelineEvent } from '../types';
import { useWedding } from '../contexts/WeddingContext';
import { useToast } from '../contexts/ToastContext';
import { TimelineSkeleton } from '../components/Skeleton';
import { getErrorMessage, validators } from '../utils/validation';
import {
  generateTimelineSuggestions,
  getDateBeforeWedding,
  type TimelineSuggestion,
} from '../utils/timelineSuggestions';
import AddTimelineEventModal from '../components/AddTimelineEventModal';

interface TimelinePageProps {
  userRole: 'planner' | 'couple';
}

type TimelineCategory = TimelineEvent['category'];
type CategoryFilter = TimelineCategory | 'all';

const validCategories: TimelineCategory[] = [
  'planning',
  'design',
  'logistics',
  'celebration',
];

const categories: CategoryFilter[] = ['all', ...validCategories];

const categoryIcons: Record<TimelineCategory, string> = {
  planning: '📋',
  design: '🎨',
  logistics: '🚀',
  celebration: '🎉',
};

const categoryLabels: Record<TimelineCategory, string> = {
  planning: 'Planning',
  design: 'Design',
  logistics: 'Logistics',
  celebration: 'Celebration',
};

const isValidCategory = (
  category: string
): category is TimelineCategory =>
  validCategories.includes(category as TimelineCategory);

const getSafeId = (
  id: string | number | null | undefined
): string => {
  if (id === null || id === undefined) {
    return '';
  }

  return String(id);
};

const getSafeCategory = (
  category: string | TimelineCategory | undefined
): TimelineCategory => {
  if (!category) {
    return 'planning';
  }

  return isValidCategory(category) ? category : 'planning';
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const TimelinePage: React.FC<TimelinePageProps> = ({
  userRole,
}) => {
  const { wedding, timelineEvents, handleTimelineAction, lastUpdated, isUpdating, loading } = useWedding();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const safeEvents = useMemo(() => {
    if (!Array.isArray(timelineEvents)) {
      return [] as TimelineEvent[];
    }

    return timelineEvents;
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') {
      return safeEvents;
    }

    return safeEvents.filter(
      (event) => event.category === selectedCategory
    );
  }, [safeEvents, selectedCategory]);

  const stats = useMemo(() => {
    const completed = safeEvents.reduce(
      (count, event) => (event.completed ? count + 1 : count),
      0
    );
    const total = safeEvents.length;
    const upcoming = total - completed;

    return {
      completed,
      upcoming,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [safeEvents]);

  const suggestions = useMemo(
    () =>
      generateTimelineSuggestions(
        wedding?.weddingDate ?? '',
        safeEvents
      ),
    [wedding?.weddingDate, safeEvents]
  );

  const handleAddSuggestionToTimeline = async (
    suggestion: TimelineSuggestion
  ) => {
    if (!wedding?.weddingDate) {
      addToast('Unable to add suggestion without a wedding date', 'error');
      return;
    }

    const date = getDateBeforeWedding(
      wedding.weddingDate,
      suggestion.estimatedDaysBeforeWedding
    );

    if (!date) {
      addToast('Unable to calculate date for suggestion', 'error');
      return;
    }

    try {
      await handleTimelineAction(
        {
          type: 'CREATE',
          data: {
            title: suggestion.title,
            description: suggestion.description,
            date,
            category: suggestion.category,
            assignedTo: undefined,
          },
        },
        userRole
      );

      addToast('Suggestion added to timeline', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  const handleToggle = async (event: TimelineEvent) => {
    const eventId = getSafeId(event.id);
    if (!eventId) {
      addToast('Unable to update milestone', 'error');
      return;
    }

    const nextCompleted = !event.completed;

    if (!event.completed) {
      setAnimatingId(eventId);
      setTimeout(() => {
        setAnimatingId((current) =>
          current === eventId ? null : current
        );
      }, 300);
    }

    try {
      await handleTimelineAction({ type: 'TOGGLE_COMPLETE', id: eventId }, userRole);

      addToast(
        nextCompleted
          ? 'Milestone completed! 🎉'
          : 'Milestone marked as pending',
        'success'
      );
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  const isValidDate = (d: string) => validators.validateDate(d).length === 0;

  const handleCreate = async (event: Omit<TimelineEvent, 'id' | 'completed'>) => {
    if (!isValidDate(event.date)) {
      addToast('Invalid date', 'error');
      return;
    }

    if (!isValidCategory(event.category)) {
      addToast('Invalid category', 'error');
      return;
    }

    try {
      await handleTimelineAction({ type: 'CREATE', data: event }, userRole);
      addToast('Milestone added', 'success');
      setIsAddModalOpen(false);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<TimelineEvent>) => {
    if (updates.date && !isValidDate(updates.date)) {
      addToast('Invalid date', 'error');
      return;
    }

    if (updates.category && !isValidCategory(updates.category)) {
      addToast('Invalid category', 'error');
      return;
    }

    try {
      await handleTimelineAction({ type: 'UPDATE', id, data: updates }, userRole);
      addToast('Milestone updated', 'success');
      setEditingEvent(null);
      setIsAddModalOpen(false);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete milestone?');
    if (!ok) return;

    try {
      await handleTimelineAction({ type: 'DELETE', id }, userRole);
      addToast('Milestone deleted', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) {
    return <TimelineSkeleton userRole={userRole} />;
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h1 className="text-5xl font-serif text-charcoal mb-4">
            📅 Live Wedding Timeline
          </h1>
          <p className="text-slate max-w-3xl">
            Track every milestone of your wedding journey.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? 'bg-charcoal text-cream'
                  : 'bg-sand text-charcoal'
              }`}>
              {category === 'all'
                ? '✨ All'
                : `${categoryIcons[category]} ${categoryLabels[category]}`}
            </button>
          ))}
        </div>

        <div className="mb-10 rounded-3xl border border-gold/20 bg-white/80 p-8">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate">
              ✨ AI Suggestions
            </p>
            <h2 className="text-2xl font-serif text-charcoal">
              Smart Timeline Suggestions
            </h2>
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-2xl border border-gold/10 bg-cream/70 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-charcoal">
                        {suggestion.title}
                      </h3>
                      <p className="text-slate mb-3">
                        {suggestion.description}
                      </p>
                      <div className="text-sm text-slate">
                        <span>{categoryLabels[suggestion.category]}</span>
                        <span className="ml-4">
                          ~{suggestion.estimatedDaysBeforeWedding} days before wedding
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSuggestionToTimeline(suggestion)}
                      className="mt-3 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition hover:bg-slate md:mt-0"
                    >
                      Add to Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate">
              No AI suggestions are available right now. Add a wedding date or complete missing categories to see suggestions.
            </p>
          )}
        </div>

        {/* TIMELINE */}
        <div className="relative space-y-10">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gold" />

              <div className="mb-6 flex justify-between items-center">
                <div />
                {userRole === 'planner' && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream"
                  >
                    + Add Milestone
                  </button>
                )}
                {isUpdating && (
                  <div className="ml-4 text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {userRole === 'couple' ? 'Planner updating…' : 'Updating…'}
                  </div>
                )}
                {lastUpdated && (
                  <div className="ml-3 text-xs text-slate">Last updated just now</div>
                )}
              </div>

          {filteredEvents.map((event) => {
            const safeCategory = getSafeCategory(event.category);
            const eventId = getSafeId(event.id);

            return (
              <div key={eventId} className="relative">
                {/* DOT */}
                <button
                  onClick={() => handleToggle(event)}
                  className={`absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center transition ${
                    event.completed
                      ? 'bg-charcoal text-cream'
                      : 'bg-white border-gold'
                  } ${
                    animatingId === eventId
                      ? 'animate-pulse'
                      : ''
                  }`}>
                  <span className="text-2xl">
                    {categoryIcons[safeCategory]}
                  </span>
                </button>

                {/* CARD */}
                <div className="ml-32 bg-white/60 p-6 rounded-2xl border border-gold/10">
                  <h3 className="font-serif text-lg text-charcoal">
                    {event.title}
                  </h3>

                  <p className="text-slate mb-4">
                    {event.description}
                  </p>

                  <div className="flex gap-2 mt-4">
                    {userRole === 'planner' && (
                      <>
                        <button onClick={() => handleEdit(event)} className="px-3 py-1 rounded bg-sand text-charcoal">Edit</button>
                        <button onClick={() => handleDelete(eventId)} className="px-3 py-1 rounded bg-white border border-red-200 text-red-600">Delete</button>
                      </>
                    )}
                    {userRole === 'couple' && (
                      <div className="text-sm text-slate">You can mark this milestone complete</div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-slate">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>{categoryLabels[safeCategory]}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <AddTimelineEventModal
            isOpen={isAddModalOpen}
            onClose={() => { setIsAddModalOpen(false); setEditingEvent(null); }}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            editingEvent={editingEvent}
          />

          {filteredEvents.length === 0 && (
            <p className="text-center text-slate py-20">
              No milestones yet
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="mt-20 grid grid-cols-3 gap-6">
          <div className="card text-center">
            <p className="text-3xl font-serif">
              {stats.completed}
            </p>
            <p className="text-slate">Completed</p>
          </div>

          <div className="card text-center">
            <p className="text-3xl font-serif">
              {stats.upcoming}
            </p>
            <p className="text-slate">Upcoming</p>
          </div>

          <div className="card text-center">
            <p className="text-3xl font-serif">
              {stats.progress}%
            </p>
            <p className="text-slate">Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};