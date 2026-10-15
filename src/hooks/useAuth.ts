import { useEffect, useState, useCallback, useRef } from 'react';
import { getSession, supabase } from '../lib/supabase';
import type { UserRole } from '../types/index';

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
  const authEventVersionRef = useRef(0);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authEventVersionRef.current += 1;
        const user = session?.user ?? null;
        setAuthState({
          user,
          userRole: resolveRole(user),
          loading: false,
          hydrated: true,
          error: null,
        });
      }
    );

    const initialEventVersion = authEventVersionRef.current;
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const { data, error } = await getSession();
        if (!isMounted || authEventVersionRef.current !== initialEventVersion) return;

        if (error) {
          setAuthState({
            user: null,
            userRole: null,
            loading: false,
            hydrated: true,
            error,
          });
          return;
        }

        const user = data.session?.user ?? null;
        setAuthState({
          user,
          userRole: resolveRole(user),
          loading: false,
          hydrated: true,
          error: null,
        });
      } catch (err) {
        if (!isMounted || authEventVersionRef.current !== initialEventVersion) return;
        setAuthState({
          user: null,
          userRole: null,
          loading: false,
          hydrated: true,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };

    void loadInitialSession();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
