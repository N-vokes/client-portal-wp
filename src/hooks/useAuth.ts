import { useEffect, useState, useCallback, useRef } from 'react';
import { getSession, supabase } from '../lib/supabase';
import type { UserRole } from '../types/index';

/**
 * Single source of truth for authentication + role derivation.
 * This hook reads from Supabase session once and prevents all duplication.
 * 
 * - Supabase.auth is the ONLY source of user + role data
 * - resolveRole() is called ONCE and memoized
 * - No state duplication in App.tsx, WeddingContext, or other contexts
 */

interface AuthState {
  user: any | null;
  userRole: UserRole | null;
  loading: boolean;
  hydrated: boolean;
  error: Error | null;
}

const resolveRole = (authUser: any): UserRole | null => {
  if (!authUser) return null;
  const metadataRole = authUser.user_metadata?.role as UserRole | undefined;
  if (metadataRole === 'planner' || metadataRole === 'couple') {
    return metadataRole;
  }
  return null;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userRole: null,
    loading: true,
    hydrated: false,
    error: null,
  });
  const timeoutRef = useRef<number | null>(null);

  const clearLoadingTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Memoized initialization to prevent infinite loops
  const initializeAuth = useCallback(async () => {
    try {
      const { data, error } = await getSession();
      if (error) {
        setAuthState((prev) => ({ ...prev, error, loading: false, hydrated: true }));
        return;
      }

      if (data.session?.user) {
        const user = data.session.user;
        const userRole = resolveRole(user);
        setAuthState({
          user,
          userRole,
          loading: false,
          hydrated: true,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          userRole: null,
          loading: false,
          hydrated: true,
          error: null,
        });
      }
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
        loading: false,
        hydrated: true,
      }));
    } finally {
      clearLoadingTimeout();
      setAuthState((prev) => ({ ...prev, loading: false, hydrated: true }));
    }
  }, []);

  // Initialize on mount and listen for auth changes
  useEffect(() => {
    initializeAuth();

    timeoutRef.current = window.setTimeout(() => {
      setAuthState((prev) => ({ ...prev, loading: false, hydrated: true }));
    }, 5000);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user = session.user;
          const userRole = resolveRole(user);
          setAuthState({
            user,
            userRole,
            loading: false,
            hydrated: true,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            userRole: null,
            loading: false,
            hydrated: true,
            error: null,
          });
        }
      }
    );

    return () => {
      clearLoadingTimeout();
      authListener.subscription.unsubscribe();
    };
  }, [initializeAuth]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      userRole: null,
      loading: false,
      hydrated: true,
      error: null,
    });
  }, []);

  return {
    user: authState.user,
    userRole: authState.userRole,
    loading: authState.loading,
    hydrated: authState.hydrated,
    error: authState.error,
    logout,
    isAuthenticated: !!authState.user,
  };
};
