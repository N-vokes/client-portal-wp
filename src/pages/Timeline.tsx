import React, { useMemo, useState } from 'react';
import type { TimelineEvent } from '../types';
import { useWedding } from '../contexts/useWedding';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../contexts/useToast';
import { TimelineSkeleton } from '../components/Skeleton';
import { getErrorMessage, validators } from '../utils/validation';
import {
  generateTimelineSuggestions,
  getDateBeforeWedding,
  type TimelineSuggestion,
} from '../utils/timelineSuggestions';
import { formatShortDate } from '../utils/formatting';
import { useTimeline } from '../hooks/useTimeline';
import AddTimelineEventModal from '../components/AddTimelineEventModal';
import { EmptyState, ErrorState } from '../components/StateCards';

export const TimelinePage: React.FC = () => {
  const {
    wedding,
    timelineEvents,
    handleTimelineAction,
    lastUpdated,
    isUpdating,
    loading,
    error,
    refreshData,
  } = useWedding();
  const { addToast } = useToast();

  const { userRole } = useAuth();
  const safeUserRole = userRole ?? 'couple';
  const {
    filteredEvents,
    safeEvents,
    completedCount,
    upcomingCount,
    progressPercent,
  } = useTimeline(timelineEvents);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      completed: completedCount,
      upcoming: upcomingCount,
      progress: progressPercent,
    }),
    [completedCount, upcomingCount, progressPercent]
  );

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
            date,
            completed: false,
          },
        },
        safeUserRole
      );

      addToast('Suggestion added to timeline', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  const handleToggle = async (event: TimelineEvent) => {
    const eventId = event.id;
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
      await handleTimelineAction({ type: 'TOGGLE_COMPLETE', id: eventId }, safeUserRole);

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

  const handleCreate = async (event: Omit<TimelineEvent, 'id'>) => {
    if (!isValidDate(event.date)) {
      throw new Error('Invalid date');
    }

    await handleTimelineAction({ type: 'CREATE', data: event }, safeUserRole);
    addToast('Milestone added', 'success');
  };

  const handleUpdate = async (id: string, updates: Partial<TimelineEvent>) => {
    if (updates.date && !isValidDate(updates.date)) {
      throw new Error('Invalid date');
    }

    await handleTimelineAction({ type: 'UPDATE', id, data: updates }, safeUserRole);
    addToast('Milestone updated', 'success');
    setEditingEvent(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setModalMode('create');
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete milestone?');
    if (!ok) return;

    try {
      await handleTimelineAction({ type: 'DELETE', id }, safeUserRole);
      addToast('Milestone deleted', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  // Ensure hooks are always called before any early returns
  if (!userRole) {
    return <PageLoader />;
  }

  if (loading) {
    return <TimelineSkeleton userRole={userRole} />;
  }

  if (!loading && error && safeEvents.length === 0) {
    return (
      <div className="min-h-screen bg-cream page-enter">
        <div className="max-w-4xl mx-auto px-8 py-24">
          <ErrorState
            icon="⚠️"
            title="Timeline unavailable"
            message={error}
            actionLabel="Refresh"
            onAction={refreshData}
          />
        </div>
      </div>
    );
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

      <div className="max-w-4xl mx-auto px-8 py-10">
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
              No suggestions are available right now. Add a wedding date or suggested milestones to see recommendations.
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
                    onClick={handleOpenCreate}
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
            const eventId = event.id;

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
                  <span className="text-2xl">📅</span>
                </button>

                {/* CARD */}
                <div className="ml-32 bg-white/60 p-6 rounded-2xl border border-gold/10">
                  <h3 className="font-serif text-lg text-charcoal">
                    {event.title}
                  </h3>

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

                  <div className="text-sm text-slate">
                    <span>📅 {formatShortDate(event.date)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <AddTimelineEventModal
            isOpen={isAddModalOpen}
            onClose={() => { setIsAddModalOpen(false); setEditingEvent(null); setModalMode('create'); }}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            editingEvent={editingEvent}
            mode={modalMode}
          />

          {filteredEvents.length === 0 && (
            <EmptyState
              icon="✨"
              title="No milestones yet"
              message={
                userRole === 'planner'
                  ? 'Create your first wedding milestone to keep the timeline moving. Every detail helps your couple feel supported and prepared.'
                  : 'Your planner will add timeline milestones here. Check back soon for the next step in your wedding journey.'
              }
              actionLabel={userRole === 'planner' ? 'Add milestone' : undefined}
              onAction={userRole === 'planner' ? handleOpenCreate : undefined}
              className="py-20"
            />
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