import React, { useState } from 'react';
import type { TimelineEvent } from '../types';
import { useWedding } from '../contexts/WeddingContext';
import { useToast } from '../contexts/ToastContext';
import { TimelineSkeleton } from '../components/Skeleton';
import { getErrorMessage } from '../utils/validation';

interface TimelinePageProps {
  userRole: 'planner' | 'couple';
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ userRole }) => {
  const { timelineEvents, updateTimelineEvent, loading } = useWedding();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'planning' | 'design' | 'logistics' | 'celebration'>('all');
  const [animatingEventId, setAnimatingEventId] = useState<string | null>(null);

  const categoryIcons: Record<string, string> = {
    planning: '📋',
    design: '🎨',
    logistics: '🚀',
    celebration: '🎉',
  };

  const categoryLabels: Record<string, string> = {
    planning: 'Planning',
    design: 'Design',
    logistics: 'Logistics',
    celebration: 'Celebration',
  };

  const filteredEvents = 
    selectedCategory === 'all'
      ? timelineEvents
      : timelineEvents.filter((event) => event.category === selectedCategory);

  const categories: Array<'all' | 'planning' | 'design' | 'logistics' | 'celebration'> = [
    'all',
    'planning',
    'design',
    'logistics',
    'celebration',
  ];

  const handleToggleComplete = async (event: TimelineEvent) => {
    try {
      if (!event.completed) {
        // Trigger animation when marking as complete
        setAnimatingEventId(event.id);
        setTimeout(() => setAnimatingEventId(null), 300);
      }
      await updateTimelineEvent(event.id, { completed: !event.completed });
      addToast(event.completed ? 'Milestone marked as pending' : 'Milestone completed! 🎉', 'success');
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    }
  };

  if (loading) {
    return <TimelineSkeleton userRole={userRole} />;
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h1 className="text-5xl font-serif text-charcoal mb-4">📅 Live Wedding Timeline</h1>
          <p className="text-lg text-slate max-w-3xl">
            Your wedding unfolds moment by moment. Watch your dreams become reality with every milestone
            you complete.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Filter Buttons */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-charcoal text-cream font-medium'
                  : 'bg-sand text-charcoal hover:bg-taupe'
              }`}
            >
              {cat === 'all' ? '✨ All' : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-taupe to-gold"></div>

          {/* Timeline Events */}
          <div className="space-y-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="relative">
                  {/* Timeline Dot */}
                  <button
                    onClick={() => handleToggleComplete(event)}
                    className={`absolute left-0 w-16 h-16 flex items-center justify-center rounded-full border-4 border-cream z-10 transition-colors duration-200 ${
                      event.completed ? 'bg-charcoal text-cream' : 'bg-white border-gold hover:bg-sand'
                    } ${animatingEventId === event.id ? 'animate-checkComplete' : ''}`}
                  >
                    <span className="text-2xl">{categoryIcons[event.category]}</span>
                  </button>

                  {/* Event Card */}
                  <div className="ml-32 card group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-serif text-charcoal">{event.title}</h3>
                        {event.assignedTo && (
                          <p className="text-xs text-slate mt-1">Assigned to: {event.assignedTo}</p>
                        )}
                      </div>
                      {event.completed && (
                        <span className="text-sm font-medium text-charcoal bg-sand px-3 py-1 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <p className="text-slate mb-4">{event.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gold font-medium">
                          📅 {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate">{categoryLabels[event.category]}</span>
                      </div>
                      {userRole === 'planner' && (
                        <button className="text-gold hover:text-charcoal transition-colors text-sm font-medium">
                          Edit →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="inline-block mb-6">
                  <p className="text-6xl mb-4">📅</p>
                </div>
                <h3 className="text-2xl font-serif text-charcoal mb-3">No milestones yet</h3>
                <p className="text-slate max-w-md mx-auto mb-8">
                  Start planning your wedding timeline.
                </p>
                {userRole === 'planner' && (
                  <button className="btn-primary">Add your first milestone</button>
                )}
                {userRole === 'couple' && (
                  <p className="text-xs text-slate italic">⏳ Timeline updates will appear here as planning progresses</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Event Button */}
        {userRole === 'planner' && (
          <div className="mt-16 text-center">
            <button className="btn-primary">+ Add New Milestone</button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-3 gap-6">
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal font-bold">
              {timelineEvents.filter((e) => e.completed).length}
            </p>
            <p className="text-slate mt-2">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal font-bold">
              {timelineEvents.filter((e) => !e.completed).length}
            </p>
            <p className="text-slate mt-2">Upcoming</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal font-bold">
              {timelineEvents.length > 0 
                ? Math.round((timelineEvents.filter((e) => e.completed).length / timelineEvents.length) * 100)
                : 0}%
            </p>
            <p className="text-slate mt-2">Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};
