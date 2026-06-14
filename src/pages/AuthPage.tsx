import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onLogin: () => void;
}

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fromPath = ((location.state as { from?: string })?.from as string) || '/dashboard';
  const emailIsValid = validateEmail(email);
  const passwordIsValid = password.length >= 8;
  const passwordsMatch = authMode === 'login' || password === confirmPassword;
  const canSubmit = emailIsValid && passwordIsValid && passwordsMatch;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!emailIsValid) {
      setError('Enter a valid email address.');
      return;
    }

    if (!passwordIsValid) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response =
        authMode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (response.error) {
        throw response.error;
      }

      if (authMode === 'signup') {
        setSuccessMessage('Account created successfully. Please check your email to confirm your account.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      await onLogin();
      navigate(fromPath, { replace: true });
    } catch (authError: any) {
      setError(authError?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccessMessage('');
  };

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage('');
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-gold/20 bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-2 mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold">
            {authMode === 'login' ? 'Welcome Back' : 'Start Planning'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-charcoal">
            {authMode === 'login' ? 'Sign in to your planner portal' : 'Create your planner account'}
          </h1>
          <p className="text-slate text-sm leading-relaxed">
            {authMode === 'login'
              ? 'Manage wedding details, contracts, and progress in one elegant dashboard.'
              : 'Sign up with your email to begin planning every milestone with calm confidence.'}
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-3 rounded-full bg-cream/80 p-1 text-sm font-semibold text-slate">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`rounded-full px-5 py-2 transition ${authMode === 'login' ? 'bg-charcoal text-cream' : 'hover:bg-slate/10'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`rounded-full px-5 py-2 transition ${authMode === 'signup' ? 'bg-charcoal text-cream' : 'hover:bg-slate/10'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-3xl border border-slate-200 bg-cream/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="At least 8 characters"
              className="w-full rounded-3xl border border-slate-200 bg-cream/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                placeholder="Repeat your password"
                className="w-full rounded-3xl border border-slate-200 bg-cream/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          )}

          {successMessage && (
            <div className="relative rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>{successMessage}</p>
              <button
                type="button"
                onClick={() => setSuccessMessage('')}
                className="absolute top-3 right-3 text-emerald-700 hover:text-emerald-900"
                aria-label="Dismiss success message"
              >
                ×
              </button>
            </div>
          )}

          {error && <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-charcoal/10 transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Working…' : authMode === 'login' ? 'Continue to Dashboard' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate">
          {authMode === 'login' ? (
            <>
              <p>Need an account?</p>
              <button type="button" onClick={toggleMode} className="mt-2 font-semibold text-charcoal underline underline-offset-4">
                Sign up now
              </button>
            </>
          ) : (
            <>
              <p>Already have an account?</p>
              <button type="button" onClick={toggleMode} className="mt-2 font-semibold text-charcoal underline underline-offset-4">
                Sign in instead
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
