import React, { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { TimelineEvent, Contract, MoodBoardImage, WeddingData, TimelineAction, TimelineEventInput, UserRole } from '../types';
import { db, getSession, supabase } from '../lib/supabase';
import { WeddingContext, type WeddingContextType, type WeddingState } from './WeddingContextValue';

type DbTimelineEvent = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  created_at: string;
};

type DbContract = {
  id: string;
  vendor_name: string;
  vendor_type: Contract['vendorType'];
  file_name: string;
  file_url: string;
  uploaded_date: string;
  amount?: number;
  notes?: string;
};

type DbMoodBoardImage = {
  id: string;
  wedding_id: string;
  image_url: string;
  uploaded_date: string;
  title: string | null;
  category: string | null;
  notes: string | null;
  status: string | null;
  url: string;
};

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [weddingState, setWeddingState] = useState<WeddingState>('loading');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [moodBoardImages, setMoodBoardImages] = useState<MoodBoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeWeddingId, setActiveWeddingIdState] = useState<string | null>(null);
  const loadRequestRef = useRef(0);
  const activeWeddingIdRef = useRef<string | null>(null);

  const persistActiveWeddingId = (id: string | null) => {
    activeWeddingIdRef.current = id;
    setActiveWeddingIdState(id);
    try {
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem('activeWeddingId', id);
        } else {
          localStorage.removeItem('activeWeddingId');
        }
      }
    } catch (err) {
      // ignore localStorage errors
    }
  };

  const setupComplete = Boolean(wedding);

  // Initialize and load data
  const sortTimelineEvents = (events: TimelineEvent[]) =>
    [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const loadTimeoutRef = useRef<number | null>(null);

  const clearLoadingTimeout = () => {
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  const startLoadingTimeout = () => {
    clearLoadingTimeout();
    if (typeof window !== 'undefined') {
      loadTimeoutRef.current = window.setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  };

  const loadData = useCallback(async (requestedWeddingId?: string) => {
    const requestId = ++loadRequestRef.current;
    const isCurrentRequest = () => requestId === loadRequestRef.current;
    const belongsToUser = (candidate: any, userId: string) =>
      candidate?.user_id === userId ||
      candidate?.planner_id === userId ||
      candidate?.couple_id === userId;

    try {
      startLoadingTimeout();
      setLoading(true);
      setError(null);
      setWeddingState('loading');

      if (requestedWeddingId) {
        setWedding(null);
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
      }


let sessionResult;

try {
  sessionResult = await getSession();
} catch (sessionCatchError) {
  throw sessionCatchError;
}

const {
  data: { session },
  error: sessionError,
} = sessionResult;
      if (sessionError) {
        throw sessionError;
      }
      if (!isCurrentRequest()) return;

      const authenticatedUser = session?.user ?? null;
      setAuthUser(authenticatedUser);

      if (!authenticatedUser) {
        setWeddingState('no-auth');
        setWedding(null);
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
        setError('No authenticated user found. Please log in.');
        return;
      }

      // Try to restore active wedding id from localStorage first
      let weddingData: any = null;
      if (requestedWeddingId) {
        const requestedWedding = await db.getWedding(requestedWeddingId);
        if (!isCurrentRequest()) return;
        if (belongsToUser(requestedWedding, authenticatedUser.id)) {
          weddingData = requestedWedding;
          persistActiveWeddingId(requestedWeddingId);
        }
      } else {
        try {
          const storedId = typeof window !== 'undefined' ? localStorage.getItem('activeWeddingId') : null;
          if (storedId) {
            try {
              const byId = await db.getWedding(storedId);
              if (!isCurrentRequest()) return;
              // ensure the wedding belongs to this user
              if (belongsToUser(byId, authenticatedUser.id)) {
                weddingData = byId;
                persistActiveWeddingId(storedId);
              } else {
                persistActiveWeddingId(null);
              }
            } catch (err) {
            }
          }
        } catch (err) {
          // ignore localStorage read issues
        }
      }

      // Fallback: load the user's wedding (single-wedding for couples)
      if (!weddingData && !requestedWeddingId) {
        weddingData = await db.getWeddingForUser(authenticatedUser.id);
        if (!isCurrentRequest()) return;
        if (weddingData && weddingData.id) {
          persistActiveWeddingId(weddingData.id);
        }
      }

      // Role is derived from the global auth hook; wedding context does not manage roles.

      if (!weddingData) {
        if (requestedWeddingId) persistActiveWeddingId(null);
        setWeddingState('no-wedding-found');
        setWedding(null);
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
        return;
      }

      const weddingDate = (weddingData.wedding_date || weddingData.weddingDate || '') as string;

      setWedding({
        id: weddingData.id as string,
        coupleNames: (weddingData.couple_names || weddingData.coupleNames || '') as string,
        weddingDate,
        coverImagePath: typeof weddingData.cover_image_path === 'string' ? weddingData.cover_image_path : null,
        timeline: [],
        contracts: [],
        moodBoard: [],
        createdDate: (weddingData.created_date || weddingData.createdDate || new Date().toISOString()) as string,
      });

      try {
        const [events, contractsList, images] =
          (await Promise.all([
            db.getTimelineEvents(weddingData.id),
            db.getContracts(weddingData.id),
            db.getMoodBoardImages(weddingData.id),
          ])) as [DbTimelineEvent[], DbContract[], DbMoodBoardImage[]];
        if (!isCurrentRequest()) return;

        setTimelineEvents(
          events.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            completed: e.completed,
          }))
        );

        setContracts(
          contractsList.map((c) => ({
            id: c.id,
            vendorName: c.vendor_name,
            vendorType: c.vendor_type,
            fileName: c.file_name,
            fileUrl: c.file_url,
            uploadedDate: c.uploaded_date,
            amount: c.amount,
            notes: c.notes,
          }))
        );

        setMoodBoardImages(
          images.map((i) => {
            const category = ['flowers', 'dress', 'decor', 'colors', 'cake', 'other'].includes(i.category || '')
              ? i.category as MoodBoardImage['category']
              : 'other';
            const status = ['love', 'maybe', 'pass'].includes(i.status || '')
              ? i.status as NonNullable<MoodBoardImage['status']>
              : 'maybe';

            return {
              id: i.id,
              url: i.url,
              title: i.title || i.image_url.split('/').pop()?.replace(/^[0-9a-f-]{36}-/i, '').replace(/\.[^.]+$/, '') || 'Inspiration image',
              category,
              status,
              uploadedBy: 'Wedding member',
              uploadedDate: i.uploaded_date,
              notes: i.notes ?? undefined,
            };
          })
        );

        const hasCompletedSetup = events.length > 0 || images.length > 0;

        setWeddingState(hasCompletedSetup ? 'loaded' : 'setup-in-progress');
      } catch (optionalDataError) {
        if (!isCurrentRequest()) return;
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
        setWeddingState('completed');
      }
    } catch (err) {
      if (!isCurrentRequest()) return;
      if (requestedWeddingId) persistActiveWeddingId(null);
      console.error('Failed to load wedding data:', err);
      setError('Failed to load wedding data. Please try again.');
      setWeddingState('no-wedding-found');
    } finally {
      if (isCurrentRequest()) {
        clearLoadingTimeout();
        setLoading(false);
      }
    }
  }, []);

  const setActiveWeddingId = (id: string | null) => {
    if (id && id === activeWeddingIdRef.current && wedding?.id === id && !loading) return;
    persistActiveWeddingId(id);
    if (id) {
      void loadData(id);
      return;
    }

    loadRequestRef.current += 1;
    clearLoadingTimeout();
    setWedding(null);
    setTimelineEvents([]);
    setContracts([]);
    setMoodBoardImages([]);
    setWeddingState(authUser ? 'no-wedding-found' : 'no-auth');
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    setTimeout(() => {
      void loadData();
    }, 0);
  } else {
      loadRequestRef.current += 1;
      clearLoadingTimeout();
    setAuthUser(null);
    setWedding(null);
    setTimelineEvents([]);
    setContracts([]);
    setMoodBoardImages([]);
    setWeddingState('no-auth');
    setError('No authenticated user found. Please log in.');
    setLoading(false);
  }
});

    return () => {
      loadRequestRef.current += 1;
      authListener.data.subscription.unsubscribe();
    };
  }, [loadData]);

  /**
   * Add a timeline event to the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: This operation is explicitly tied to `wedding.id`
   * and will no-op if wedding context is not loaded.
   */
  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    if (!wedding?.id) throw new Error('Select a wedding before adding a timeline event.');

    try {
      const newEvent = await db.addTimelineEvent({
        wedding_id: wedding.id,
        title: event.title,
        date: event.date,
        completed: event.completed,
      });

      setTimelineEvents((currentEvents) =>
        sortTimelineEvents([
          ...currentEvents,
          {
            id: newEvent.id,
            title: newEvent.title,
            date: newEvent.date,
            completed: newEvent.completed,
          },
        ])
      );
    } catch (err) {
      console.error('Failed to add timeline event:', err);
      throw err;
    }
  };

  /**
   * Mark onboarding as completed. This sets the weddingState to 'completed'.
   * This does not mutate backend data; it updates the in-memory state used by routing.
   */
  const completeSetup = () => {
    setWeddingState('completed');
  };

  /**
   * Create a timeline event (alias for addTimelineEvent).
   * ⚠️ WEDDING-SCOPED: This operation is explicitly tied to the active wedding context.
   */
  const createTimelineEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    await addTimelineEvent(event);
  };

  /**
   * Update a timeline event in the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only updates events belonging to the current wedding.
   */
  const updateTimelineEvent = async (id: string, updates: Partial<TimelineEvent>) => {
    if (!wedding?.id) throw new Error('Select a wedding before updating a timeline event.');

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.date !== undefined) dbUpdates.date = updates.date;

      await db.updateTimelineEvent(wedding.id, id, dbUpdates);

      setTimelineEvents((currentEvents) =>
        sortTimelineEvents(
          currentEvents.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          )
        )
      );
    } catch (err) {
      console.error('Failed to update timeline event:', err);
      throw err;
    }
  };

  /**
   * Delete a timeline event from the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only removes events from the current wedding's timeline.
   */
  const deleteTimelineEvent = async (id: string) => {
    if (!wedding) {
      return;
    }

    if (!wedding.id) {
      return;
    }

    try {
      await db.deleteTimelineEvent(wedding.id, id);
      setTimelineEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== id)
      );
    } catch (err) {
      console.error('Failed to delete timeline event:', err);
      throw err;
    }
  };

  /**
   * Handle timeline actions with role-based authorization and wedding scoping.
   * ⚠️ WEDDING-SCOPED: All actions operate on the currently active wedding.
   * ⚠️ ROLE-BASED: Couples can only toggle completion; planners can perform all actions.
   */
  const handleTimelineAction = async (action: TimelineAction, userRole: UserRole) => {
    // Wedding context guard
    if (!wedding || !wedding.id) {
      throw new Error('Select a wedding before changing its timeline.');
    }

    // Role enforcement: couples can only toggle complete
    if (userRole === 'couple' && action.type !== 'TOGGLE_COMPLETE') {
      throw new Error('Only the planner can make this timeline change.');
    }

    // Planner may perform any action
    try {
      setIsUpdating(true);

      if (action.type === 'CREATE') {
        const data: TimelineEventInput = action.data;
        await addTimelineEvent(data);
      }

      if (action.type === 'UPDATE') {
        const { id, data } = action;
        await updateTimelineEvent(id, data);
      }

      if (action.type === 'DELETE') {
        await deleteTimelineEvent(action.id);
      }

      if (action.type === 'TOGGLE_COMPLETE') {
        const event = timelineEvents.find((currentEvent) => currentEvent.id === action.id);
        if (!event) {
          throw new Error('This timeline event is no longer available in the active wedding.');
        }

        await updateTimelineEvent(action.id, { completed: !event.completed });
      }

      // simulate realtime sync timestamp
      setLastUpdated(Date.now());

      // small delay for UX badge
      setTimeout(() => setIsUpdating(false), 700);
    } catch (err) {
      setIsUpdating(false);
      console.error('handleTimelineAction error:', err);
      throw err;
    }
  };

  /**
   * Add a contract to the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Contract is explicitly tied to `wedding.id`
   * and will no-op if wedding context is not loaded.
   */
  const addContract = async (contract: Omit<Contract, 'id'>) => {
    if (!wedding) {
      return;
    }

    if (!wedding.id) {
      return;
    }

    try {
      const newContract = await db.addContract({
        wedding_id: wedding.id,
        vendor_name: contract.vendorName,
        vendor_type: contract.vendorType,
        file_name: contract.fileName,
        file_url: contract.fileUrl,
        uploaded_date: contract.uploadedDate,
        amount: contract.amount,
        notes: contract.notes,
      });

      setContracts((currentContracts) => [
        ...currentContracts,
        {
          id: newContract.id,
          vendorName: newContract.vendor_name,
          vendorType: newContract.vendor_type,
          fileName: newContract.file_name,
          fileUrl: newContract.file_url,
          uploadedDate: newContract.uploaded_date,
          amount: newContract.amount,
          notes: newContract.notes,
        },
      ]);
    } catch (err) {
      const supabaseError = err as {
        message?: unknown;
        code?: unknown;
        details?: unknown;
        hint?: unknown;
      };
      const diagnostics: Record<string, string> = {};

      for (const field of ['message', 'code', 'details', 'hint'] as const) {
        const value = supabaseError?.[field];
        if (typeof value === 'string') {
          diagnostics[field] = value
            .replace(/https?:\/\/[^\s"'<>]+/gi, '[redacted URL]')
            .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
            .replace(/\b(?:eyJ[a-zA-Z0-9_-]{8,}\.){2}[a-zA-Z0-9_-]+\b/g, '[redacted token]')
            .replace(/\b(?:sb_secret|sb_publishable)_[A-Za-z0-9_-]+\b/g, '[redacted credential]')
            .replace(/Key \(([^)]+)\)=\(([^)]*)\)/g, 'Key ($1)=([redacted])');
        }
      }

      const diagnosticText = Object.entries(diagnostics)
        .map(([field, value]) => `${field}: ${value}`)
        .join('\n');
      console.error(`Failed to add contract:\n${diagnosticText || 'No diagnostic fields available.'}`);
      throw err;
    }
  };

  /**
   * Delete a contract from the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only removes contracts belonging to the current wedding.
   */
  const deleteContract = async (id: string) => {
    if (!wedding) {
      return;
    }

    if (!wedding.id) {
      return;
    }

    try {
      await db.deleteContract(id);
      setContracts(contracts.filter((contract) => contract.id !== id));
    } catch (err) {
      console.error('Failed to delete contract:', err);
      throw err;
    }
  };

  /**
   * Add a mood board image to the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Image is explicitly tied to `wedding.id`
   * and will no-op if wedding context is not loaded.
   */
  const addMoodBoardImage = async (image: Omit<MoodBoardImage, 'id'>, file: File) => {
    if (!wedding?.id) throw new Error('Select a wedding before uploading a Mood Board image.');

    let storagePath: string | null = null;
    try {
      storagePath = await db.uploadMoodBoardImageFile(wedding.id, file);
      const signedUrl = await db.getMoodBoardImageSignedUrl(storagePath);
      const newImage = await db.addMoodBoardImage(wedding.id, storagePath, {
        title: image.title,
        category: image.category,
        notes: image.notes,
        status: image.status || 'maybe',
      });

      setMoodBoardImages((currentImages) => [
        ...currentImages,
        {
          id: newImage.id,
          url: signedUrl,
          title: newImage.title || image.title,
          category: newImage.category as MoodBoardImage['category'] || image.category,
          status: (newImage.status as NonNullable<MoodBoardImage['status']>) || image.status || 'maybe',
          uploadedBy: image.uploadedBy,
          uploadedDate: newImage.uploaded_date,
          notes: newImage.notes ?? image.notes,
        },
      ]);
    } catch (err) {
      console.error('Failed to add mood board image:', err);
      if (storagePath) {
        try {
          await db.removeMoodBoardImageFile(storagePath);
        } catch (cleanupError) {
          console.error('Failed to clean up uploaded Mood Board image:', cleanupError);
          const uploadMessage = err instanceof Error ? err.message : String(err);
          const cleanupMessage = cleanupError instanceof Error
            ? cleanupError.message
            : String(cleanupError);
          throw new Error(
            `Mood Board upload failed: ${uploadMessage}. The uploaded file could not be removed: ${cleanupMessage}`
          );
        }
      }
      throw err;
    }
  };

  const updateMoodBoardImage = async (
    id: string,
    updates: Partial<Pick<MoodBoardImage, 'title' | 'category' | 'notes' | 'status'>>
  ) => {
    if (!wedding?.id) throw new Error('Select a wedding before updating a Mood Board image.');

    try {
      await db.updateMoodBoardImage(wedding.id, id, updates);
      setMoodBoardImages((currentImages) =>
        currentImages.map((image) => image.id === id ? { ...image, ...updates } : image)
      );
    } catch (err) {
      console.error('Failed to update mood board image:', err);
      throw err;
    }
  };

  /**
   * Delete a mood board image from the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only removes images belonging to the current wedding.
   */
  const deleteMoodBoardImage = async (id: string) => {
    if (!wedding?.id) throw new Error('Select a wedding before deleting a Mood Board image.');

    try {
      const storagePath = await db.getMoodBoardImagePath(wedding.id, id);
      await db.deleteMoodBoardImage(wedding.id, id);
      setMoodBoardImages((currentImages) => currentImages.filter((image) => image.id !== id));
      try {
        await db.removeMoodBoardImageFile(storagePath);
      } catch (cleanupError) {
        const message = cleanupError instanceof Error
          ? cleanupError.message
          : String(cleanupError);
        throw new Error(
          `The image record was deleted, but its stored file could not be removed: ${message}`
        );
      }
    } catch (err) {
      console.error('Failed to delete mood board image:', err);
      throw err;
    }
  };

  const getMoodBoardImageComments = useCallback(async (imageId: string) => {
    if (!wedding?.id) throw new Error('Select a wedding before loading its Mood Board discussion.');
    if (!authUser?.id) throw new Error('Sign in before loading Mood Board comments.');

    try {
      return await db.getMoodBoardImageComments(wedding.id, imageId);
    } catch (err) {
      console.error('Failed to load Mood Board comments:', err);
      throw err;
    }
  }, [wedding?.id, authUser?.id]);

  const getMoodBoardCommentAuthor = () => {
    if (!authUser?.id) throw new Error('Sign in before posting a Mood Board comment.');
    const role = authUser.user_metadata?.role;
    if (role !== 'planner' && role !== 'couple') {
      throw new Error('Your account does not have a valid wedding role.');
    }
    return { userId: authUser.id as string, role: role as UserRole };
  };

  const addMoodBoardComment = async (imageId: string, text: string) => {
    if (!wedding?.id) throw new Error('Select a wedding before posting a Mood Board comment.');
    const author = getMoodBoardCommentAuthor();

    try {
      await db.addMoodBoardComment(wedding.id, imageId, author.userId, author.role, text);
    } catch (err) {
      console.error('Failed to add Mood Board comment:', err);
      throw err;
    }
  };

  const addMoodBoardReply = async (imageId: string, parentCommentId: string, text: string) => {
    if (!wedding?.id) throw new Error('Select a wedding before posting a Mood Board reply.');
    const author = getMoodBoardCommentAuthor();

    try {
      return await db.addMoodBoardReply(
        wedding.id,
        imageId,
        parentCommentId,
        author.userId,
        author.role,
        text
      );
    } catch (err) {
      console.error('Failed to add Mood Board reply:', err);
      throw err;
    }
  };

  const deleteMoodBoardComment = async (imageId: string, commentId: string) => {
    if (!wedding?.id) throw new Error('Select a wedding before deleting a Mood Board comment.');
    if (!authUser?.id) throw new Error('Sign in before deleting a Mood Board comment.');

    try {
      await db.deleteMoodBoardComment(wedding.id, imageId, commentId);
    } catch (err) {
      console.error('Failed to delete Mood Board comment:', err);
      throw err;
    }
  };

  const updateMoodBoardCommentDecision = async (
    imageId: string,
    commentId: string,
    isDecision: boolean
  ) => {
    if (!wedding?.id) throw new Error('Select a wedding before updating a Mood Board decision.');
    if (!authUser?.id) throw new Error('Sign in before updating a Mood Board decision.');

    try {
      await db.updateMoodBoardCommentDecision(wedding.id, imageId, commentId, isDecision);
    } catch (err) {
      console.error('Failed to update Mood Board decision:', err);
      throw err;
    }
  };

  /**
   * Refresh all data for the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Reloads timeline, contracts, and mood board for the active wedding.
   */
  const refreshData = async () => {
    await loadData();
  };

  /**
   * Update wedding details (couple names, wedding date, etc.)
   * ⚠️ WEDDING-SCOPED: Only updates the active wedding
   */
  const updateWeddingDetails = async (updates: Partial<WeddingData>) => {
    if (!wedding?.id) {
      return;
    }

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.coupleNames !== undefined) dbUpdates.couple_names = updates.coupleNames;
      if (updates.weddingDate !== undefined) dbUpdates.wedding_date = updates.weddingDate;

      const updatedData = await db.updateWedding(wedding.id, dbUpdates);

      setWedding({
        ...wedding,
        coupleNames: (updatedData.couple_names || updatedData.coupleNames || wedding.coupleNames) as string,
        weddingDate: (updatedData.wedding_date || updatedData.weddingDate || wedding.weddingDate) as string,
      });
    } catch (err) {
      console.error('Failed to update wedding:', err);
      throw err;
    }
  };

  const value: WeddingContextType = {
    authUser,
    wedding,
    weddingState,
    timelineEvents,
    contracts,
    moodBoardImages,
    loading,
    error,
    lastUpdated,
    isUpdating,
    setupComplete,
    createTimelineEvent,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    handleTimelineAction,
    addContract,
    deleteContract,
    addMoodBoardImage,
    updateMoodBoardImage,
    deleteMoodBoardImage,
    getMoodBoardImageComments,
    addMoodBoardComment,
    addMoodBoardReply,
    deleteMoodBoardComment,
    updateMoodBoardCommentDecision,
    refreshData,
    updateWedding: updateWeddingDetails,
    completeSetup,
    activeWeddingId,
    setActiveWeddingId,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
};
