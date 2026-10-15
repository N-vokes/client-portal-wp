import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWedding } from '../contexts/useWedding';
import { db, getSession } from '../lib/supabase';

interface OnboardingPageProps {
  errorMessage?: string | null;
}

type OnboardingState = 'ready' | 'creating' | 'success' | 'error';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  errorMessage,
}) => {
  const navigate = useNavigate();
  const { setActiveWeddingId, refreshData } = useWedding();
  const [state, setState] = useState<OnboardingState>('ready');
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [createdWeddingName, setCreatedWeddingName] = useState<string>('');
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');

  const handleCreateWedding = async () => {
    if (state === 'creating' || state === 'success') return;

    const trimmedCoupleNames = coupleNames.trim();
    if (!trimmedCoupleNames) {
      setError('Please enter the couple names for this wedding workspace.');
      setState('error');
      return;
    }

    if (!weddingDate) {
      setError('Please select the wedding date.');
      setState('error');
      return;
    }

    setError(null);
    setState('creating');

    try {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;
      if (!user) {
        throw new Error('Please sign in to continue.');
      }

      const createdWedding = await db.createWeddingForUser(
        user.id,
        trimmedCoupleNames,
        weddingDate
      );

      if (createdWedding?.id) {
        setActiveWeddingId(createdWedding.id);
      }

      await refreshData();
      setCreatedWeddingName(trimmedCoupleNames);
      setState('success');

      // small delay to let state sync properly
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate('/onboarding/setup', { replace: true });
    } catch (createError: any) {
      setError(createError?.message || 'Unable to create your wedding. Please try again.');
      setState('error');
    }
  };

  const isCreating = state === 'creating';
  const isSuccess = state === 'success';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl rounded-[2rem] border border-gold/20 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1.3fr] items-center">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold">
              Welcome to Ever After
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-serif text-charcoal">
              {isSuccess ? 'Wedding created!' : 'Create a wedding workspace'}
            </h1>
            <p className="mt-5 text-slate text-base leading-relaxed sm:text-lg">
              {isSuccess
                ? `Your workspace for ${createdWeddingName} is ready.`
                : 'Set up a dedicated workspace for a couple you’re planning for.'}
            </p>

            {!isSuccess && (
              <div className="mt-10 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal" htmlFor="coupleNames">
                    Couple names
                  </label>
                  <input
                    id="coupleNames"
                    type="text"
                    value={coupleNames}
                    onChange={(event) => setCoupleNames(event.target.value)}
                    placeholder="e.g. Sarah & Michael"
                    className="w-full rounded-3xl border border-slate-200 bg-cream/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal" htmlFor="weddingDate">
                    Wedding date
                  </label>
                  <input
                    id="weddingDate"
                    type="date"
                    value={weddingDate}
                    onChange={(event) => setWeddingDate(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-cream/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateWedding}
                  disabled={isCreating}
                  className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
                      Creating wedding…
                    </>
                  ) : (
                    'Create Wedding'
                  )}
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/setup', { replace: true })}
                  className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90"
                >
                  Continue setup
                </button>
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-cream p-6 text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">How this helps your planning</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                As the planner, you manage this wedding workspace to keep timelines, vendor details, contracts, and planning progress organized for the couple.
              </p>
            </div>

            {error && (
              <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {!isSuccess && (
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 p-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-rose-50 opacity-80" />
                <div className="relative space-y-6">
                  <div className="h-12 w-28 rounded-full bg-white/90 shadow-sm" />
                  <div className="space-y-4">
                    <div className="h-4 w-32 rounded-full bg-slate-200" />
                    <div className="h-4 w-20 rounded-full bg-slate-200" />
                  </div>
                  <div className="grid gap-4">
                    <div className="h-32 rounded-[1.5rem] bg-white/90 shadow-sm" />
                    <div className="h-20 rounded-[1.5rem] bg-white/90 shadow-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/90 shadow-sm" />
                    <div className="h-10 w-10 rounded-full bg-white/90 shadow-sm" />
                    <div className="h-10 w-10 rounded-full bg-white/90 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="hidden lg:flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gold/10 mb-4 animate-pulse">
                  <span className="text-5xl">✨</span>
                </div>
                <p className="text-slate text-sm">Preparing your dashboard…</p>
              </div>
            </div>
          )}
        </div>

        {!isSuccess && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-cream p-6 text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">Planner workspace</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                Create a dedicated space for each couple you’re managing so timelines, contracts, notes, and milestones stay organized in one place.
              </p>
            </div>

            <div className="rounded-3xl bg-cream p-6 text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">Next step</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                After setup, you can begin customizing the workspace and tracking every milestone for the couple.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
