import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, supabase } from '../lib/supabase';
import { useWedding } from '../contexts/useWedding';

interface OnboardingPageProps {
  errorMessage?: string | null;
}

type OnboardingState = 'ready' | 'creating' | 'success' | 'error';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  errorMessage,
}) => {
  const navigate = useNavigate();
  const { refreshData } = useWedding();
  const [state, setState] = useState<OnboardingState>('ready');
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [createdWeddingName, setCreatedWeddingName] = useState<string>('');

  const handleCreateWedding = async () => {
    if (state === 'creating' || state === 'success') return;

    setError(null);
    setState('creating');

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;
      if (!user) {
        throw new Error('Please sign in to continue.');
      }

      const userRole =
        user.user_metadata?.role === 'planner' ? 'planner' : 'couple';
      const coupleNames =
        typeof user.user_metadata?.name === 'string' && user.user_metadata.name
          ? `${user.user_metadata.name}'s Wedding`
          : 'Your Wedding';
      const weddingDate = new Date().toISOString().split('T')[0];

      await db.createWeddingForUser(user.id, userRole, coupleNames, weddingDate);
      setCreatedWeddingName(coupleNames);
      setState('success');
      
      await refreshData();
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
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
              {isSuccess ? 'Wedding created! 🎉' : 'Create your wedding workspace'}
            </h1>
            <p className="mt-5 text-slate text-base leading-relaxed sm:text-lg">
              {isSuccess
                ? `Your workspace for ${createdWeddingName} is ready. Let's start planning together.`
                : 'Everything you need to plan, organize, and manage your wedding in one place.'}
            </p>

            {!isSuccess && (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCreateWedding}
                  disabled={isCreating}
                  className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
                      Creating your wedding…
                    </>
                  ) : (
                    'Create Your Wedding'
                  )}
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-cream px-8 py-4 text-sm font-semibold text-charcoal"
                >
                  Join existing wedding (coming soon)
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition hover:bg-charcoal/90"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-cream p-6 text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">Why this exists</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                Your wedding workspace keeps everything organized in one secure place.
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
              <h2 className="font-semibold text-lg">Why start here?</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                Create a dedicated wedding workspace that only you can access. Once created, your timeline, contracts, and mood board are isolated to this wedding.
              </p>
            </div>

            <div className="rounded-3xl bg-cream p-6 text-charcoal shadow-sm">
              <h2 className="font-semibold text-lg">Next step</h2>
              <p className="mt-3 text-slate text-sm leading-relaxed">
                After setup, you can invite collaborators, track progress, and use the full dashboard to stay organized.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
