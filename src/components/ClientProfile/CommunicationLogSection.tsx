import React from 'react';
import type { CommunicationEntry } from '../../types/clientProfile';

interface CommunicationLogSectionProps {
  communication: CommunicationEntry[];
  commType: string;
  commSummary: string;
  commDate: string;
  commFollowUp: string;
  onTypeChange: (next: string) => void;
  onSummaryChange: (next: string) => void;
  onDateChange: (next: string) => void;
  onFollowUpChange: (next: string) => void;
  onAddCommunication: () => void;
}

export const CommunicationLogSection: React.FC<CommunicationLogSectionProps> = ({
  communication,
  commType,
  commSummary,
  commDate,
  commFollowUp,
  onTypeChange,
  onSummaryChange,
  onDateChange,
  onFollowUpChange,
  onAddCommunication,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-charcoal">Communication Log</h2>
        <span className="text-sm text-slate">{communication.length} entries</span>
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-gold/20 mb-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="comm-type">Type</label>
            <select
              id="comm-type"
              value={commType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">Select type</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="comm-date">Date</label>
            <input
              id="comm-date"
              type="date"
              value={commDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-charcoal mb-2" htmlFor="comm-summary">Summary</label>
            <input
              id="comm-summary"
              value={commSummary}
              onChange={(e) => onSummaryChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Brief communication summary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-charcoal mb-2" htmlFor="comm-followup">Status / Follow-up (optional)</label>
            <input
              id="comm-followup"
              value={commFollowUp}
              onChange={(e) => onFollowUpChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Next step or contextual note"
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onAddCommunication}
            className="bg-gold text-white px-4 py-2 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Communication
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {communication.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gold/20 text-slate">No communications logged yet. Add one above to keep track.</div>
        ) : (
          communication.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded-lg border border-gold/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-charcoal">{entry.type.toUpperCase()}</h3>
                  <p className="text-sm text-slate">{entry.summary}</p>
                </div>
                <span className="text-xs text-slate">{entry.date}</span>
              </div>
              {entry.followUp && <p className="text-sm text-gold">Follow-up: {entry.followUp}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};