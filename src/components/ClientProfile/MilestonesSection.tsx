import React from 'react';
import type { MilestoneEntry } from '../../types/clientProfile';

interface MilestonesSectionProps {
  milestones: MilestoneEntry[];
  milestoneTitle: string;
  milestoneDueDate: string;
  milestoneStatus: 'upcoming' | 'in progress' | 'completed';
  milestoneNote: string;
  onTitleChange: (next: string) => void;
  onDueDateChange: (next: string) => void;
  onStatusChange: (next: 'upcoming' | 'in progress' | 'completed') => void;
  onNoteChange: (next: string) => void;
  onAddMilestone: () => void;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  milestoneTitle,
  milestoneDueDate,
  milestoneStatus,
  milestoneNote,
  onTitleChange,
  onDueDateChange,
  onStatusChange,
  onNoteChange,
  onAddMilestone,
}) => {
  return (
    <div id="milestone-section" className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
  <h2 className="text-lg sm:text-xl font-serif text-charcoal">Milestones</h2>
  <span className="text-sm text-slate">{milestones.length} items</span>
</div>

      <div className="bg-sand/50 p-3 sm:p-4 rounded-lg border border-gold/20 mb-5 sm:mb-6">
        <div className="grid gap-3">
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="milestone-title">Milestone</label>
            <input
              id="milestone-title"
              value={milestoneTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Finalize photographer contract"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-charcoal mb-2" htmlFor="milestone-due-date">Due date</label>
              <input
                id="milestone-due-date"
                type="date"
                value={milestoneDueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
                className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal mb-2" htmlFor="milestone-status">Status</label>
              <select
                id="milestone-status"
                value={milestoneStatus}
                onChange={(e) => onStatusChange(e.target.value as 'upcoming' | 'in progress' | 'completed')}
                className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="milestone-note">Optional note</label>
            <input
              id="milestone-note"
              value={milestoneNote}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Quick planning note"
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onAddMilestone}
            className="bg-gold text-white w-full sm:w-auto px-4 py-2.5 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Milestone
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20 text-slate text-sm sm:text-base">
  No milestones yet. Add a key operation for the schedule.
</div>
        ) : (
          milestones.slice().reverse().map((milestone) => (
            <div key={milestone.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-charcoal break-words">{milestone.title}</h3>
                  <p className="text-sm sm:text-base text-slate break-words">
  Due {new Date(milestone.dueDate).toLocaleDateString('en-US')}
</p>
                  {milestone.note && (
  <p className="text-sm sm:text-base text-slate mt-1 leading-relaxed break-words">
    {milestone.note}
  </p>
)}
                </div>
                <span className={`w-fit px-3 py-1 text-xs font-semibold rounded-full uppercase ${milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : milestone.status === 'in progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                  {milestone.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};