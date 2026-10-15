import React from 'react';

interface QuickActionsRemindersProps {
  reminders: string[];
  isLoading?: boolean;
  hasError?: boolean;
  allLoaded?: boolean;
}

export const QuickActionsReminders: React.FC<QuickActionsRemindersProps> = ({ reminders, isLoading, hasError, allLoaded }) => {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-[1fr_2fr]">
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-xs text-slate uppercase tracking-wide mb-2">Quick Actions</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <a href="#notes-section" className="text-left block rounded-lg border border-gold/20 px-3 py-2 text-sm text-charcoal hover:bg-sand transition">Add Note</a>
          <a href="#vendor-section" className="text-left block rounded-lg border border-gold/20 px-3 py-2 text-sm text-charcoal hover:bg-sand transition">Add Vendor</a>
          <a href="#payment-section" className="text-left block rounded-lg border border-gold/20 px-3 py-2 text-sm text-charcoal hover:bg-sand transition">Add Payment</a>
          <a href="#milestone-section" className="text-left block rounded-lg border border-gold/20 px-3 py-2 text-sm text-charcoal hover:bg-sand transition">Add Milestone</a>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-xs text-slate uppercase tracking-wide mb-2">Planner Reminders</p>

        {isLoading ? (
          <div className="text-sm text-slate">Loading planner reminders...</div>
        ) : hasError ? (
          <div className="text-sm text-red-700">Some reminders are unavailable because planning data could not be loaded.</div>
        ) : reminders.length === 0 && allLoaded ? (
          <div className="text-sm text-charcoal">All clear — keep momentum with your next action.</div>
        ) : (
          <ul className="list-disc list-inside text-sm text-charcoal space-y-1">
            {reminders.map((reminder, idx) => (
              <li key={idx}>{reminder}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};