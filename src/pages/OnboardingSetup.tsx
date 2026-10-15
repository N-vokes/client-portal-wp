import React, { useState, useEffect } from 'react';
import { useWedding } from '../contexts/useWedding';
import { useAuth } from '../hooks/useAuth';

export const OnboardingSetup: React.FC = () => {
  const { userRole } = useAuth();
  const { wedding, updateWedding, completeSetup } = useWedding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedCoupleNames, setEditedCoupleNames] = useState('');
  const [editedWeddingDate, setEditedWeddingDate] = useState('');

  // Initialize form with current wedding data
  useEffect(() => {
    if (wedding) {
      setEditedCoupleNames(wedding.coupleNames || '');
      setEditedWeddingDate(wedding.weddingDate || '');
      // If wedding already has core details, treat step 1 as saved
      if (wedding.coupleNames && wedding.weddingDate) {
        setDetailsSaved(true);
      }
    }
  }, [wedding]);

  const displayWeddingDate = editedWeddingDate
    ? new Date(editedWeddingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  // Track whether step 1 (details) has been saved — only required for onboarding
  const [detailsSaved, setDetailsSaved] = useState(false);
  const weddingDateValid = Boolean(
    editedWeddingDate && !Number.isNaN(new Date(editedWeddingDate).getTime())
  );

  const handleSaveDetails = async () => {
    if (!editedCoupleNames || !weddingDateValid) {
      setError('Please enter a couple name and a valid wedding date.');
      return;
    }

    try {
      await updateWedding({
        coupleNames: editedCoupleNames,
        weddingDate: editedWeddingDate,
      });
      setDetailsSaved(true);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to save wedding details. Please try again.');
    }
  };

  const handleCompleteSetup = async () => {
    if (loading) return;
    setError(null);

    if (!editedCoupleNames || !weddingDateValid) {
      setError('Please confirm the couple name and a valid wedding date before continuing.');
      return;
    }


    setLoading(true);

    try {
      // Save any final changes
      await updateWedding({
        coupleNames: editedCoupleNames,
        weddingDate: editedWeddingDate,
      });

      // Mark the onboarding as completed in wedding context
      try {
        completeSetup();
      } catch (err) {
        // swallow - optional
      }
    } catch (setupError: any) {
      setError(
        setupError?.message ||
          'Unable to save your wedding setup. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl rounded-[2rem] border border-gold/20 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold">
            Wedding setup
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-serif text-charcoal">
            {userRole === 'planner'
              ? editedCoupleNames
                ? `Set up ${editedCoupleNames}'s wedding`
                : 'Set up this wedding'
              : editedCoupleNames
                ? `Set up ${editedCoupleNames}'s wedding`
                : 'Set up this wedding'}
          </h1>
          <p className="mt-5 text-slate text-base leading-relaxed sm:text-lg max-w-3xl mx-auto">
            Confirm the wedding details below. You can add timeline items, contracts, and mood inspiration from the dashboard whenever you're ready.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-gold/10 bg-cream p-6 text-charcoal shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-charcoal">
              1
            </div>
            <h2 className="text-xl font-semibold font-serif">Confirm wedding details</h2>
            <p className="mt-3 text-slate text-sm leading-relaxed">
              Make sure the couple names and wedding date are correct before opening the workspace.
            </p>
            <div className="mt-4 space-y-4 rounded-3xl bg-white p-4 text-left shadow-sm">
              <div>
                <label htmlFor="couple-names" className="block text-sm font-medium text-charcoal">
                  Couple names
                </label>
                <input
                  id="couple-names"
                  type="text"
                  value={editedCoupleNames}
                  onChange={(e) => setEditedCoupleNames(e.target.value)}
                  placeholder="e.g., Sarah & Michael"
                  className="mt-2 w-full rounded-full border border-slate-200 bg-cream/70 px-4 py-2 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <label htmlFor="wedding-date" className="block text-sm font-medium text-charcoal">
                  Wedding date
                </label>
                <input
                  id="wedding-date"
                  type="date"
                  value={editedWeddingDate}
                  onChange={(e) => setEditedWeddingDate(e.target.value)}
                  className="mt-2 w-full rounded-full border border-slate-200 bg-cream/70 px-4 py-2 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
                {editedWeddingDate && (
                  <p className="mt-2 text-xs text-slate">{displayWeddingDate}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveDetails}
                className="mt-4 w-full rounded-full border border-gold bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-gold/10"
              >
                Save details
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gold/10 bg-cream p-6 text-charcoal shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-charcoal">
              2
            </div>
            <h2 className="text-xl font-semibold font-serif">Plan the timeline</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                Optional. You can add milestones and planning events from the dashboard.
              </p>
              <p className="mt-5 text-sm text-slate">Add timeline items anytime from the dashboard.</p>
          </div>

          <div className="rounded-[1.75rem] border border-gold/10 bg-cream p-6 text-charcoal shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-charcoal">
              3
            </div>
            <h2 className="text-xl font-semibold font-serif">Build the mood board</h2>
            <p className="mt-3 text-slate text-sm leading-relaxed">
              Optional. Add inspiration and visual references from the dashboard whenever you're ready.
            </p>
            <p className="mt-5 text-sm text-slate">You can upload mood board items from the dashboard at any time.</p>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleCompleteSetup}
            disabled={loading || !detailsSaved}
            className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Opening workspace…' : 'Open wedding workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
