import React, { useState } from 'react';
import { DashboardView } from './DashboardView';

export const DashboardCoupleView: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessage('');
    setSent(true);
  };

  return (
    <DashboardView
      userRole="couple"
      contractHeading="Shared Documents"
    >
      <div className="bg-white/70 border border-gold/10 rounded-2xl p-6 mb-12">
        <div className="mb-5">
          <h2 className="text-2xl font-serif text-charcoal">
            Message Your Planner
          </h2>
          <p className="text-slate mt-2">
            Send a quick note to your planner about ideas, questions, or updates.
          </p>
        </div>

        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (sent) setSent(false);
          }}
          rows={4}
          className="w-full rounded-2xl border border-sand bg-cream p-4 text-charcoal placeholder:text-slate focus:border-charcoal focus:outline-none"
          placeholder="Write your message here…"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition disabled:cursor-not-allowed disabled:bg-slate"
          >
            Send
          </button>

          {sent && (
            <span className="text-sm text-slate">
              Message sent.
            </span>
          )}
        </div>
      </div>
    </DashboardView>
  );
};
