import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TimelineEvent, Contract, MoodBoardImage, WeddingData, TimelineAction, TimelineEventInput, UserRole } from '../types';
import { db, supabase } from '../lib/supabase';
import { WeddingContext, type WeddingContextType, type WeddingState } from './WeddingContextValue';

type DbTimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: TimelineEvent['category'];
  completed: boolean;
  assigned_to?: string;
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
  url: string;
  title: string;
  category: MoodBoardImage['category'];
  uploaded_by: string;
  uploaded_date: string;
  notes?: string;
};

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [weddingState, setWeddingState] = useState<WeddingState>('loading');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [moodBoardImages, setMoodBoardImages] = useState<MoodBoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize and load data
  const sortTimelineEvents = (events: TimelineEvent[]) =>
    [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const validCategories: TimelineEvent['category'][] = [
    'planning',
    'design',
    'logistics',
    'celebration',
  ];

  /**
   * Load wedding data strictly for authenticated users with existing wedding records.
   * All data must come from authenticated user state and wedding records.
   */
  const resolveRole = (authUser: any, weddingData: any | null): UserRole => {
    const metadataRole = authUser?.user_metadata?.role as UserRole | undefined;
    if (metadataRole === 'planner' || metadataRole === 'couple') {
      return metadataRole;
    }

    if (weddingData) {
      if (authUser.id === weddingData.planner_id) {
        return 'planner';
      }
      if (authUser.id === weddingData.couple_id) {
        return 'couple';
      }
    }

    return 'couple';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWeddingState('loading');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authenticatedUser = session?.user ?? null;
      setAuthUser(authenticatedUser);

      if (!authenticatedUser) {
        setUserRole(null);
        setWeddingState('no-auth');
        setWedding(null);
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
        setError('No authenticated user found. Please log in.');
        return;
      }

      const weddingData: any = await db.getWeddingForUser(authenticatedUser.id);
      const resolvedRole = resolveRole(authenticatedUser, weddingData);
      setUserRole(resolvedRole);

      if (!weddingData) {
        setWeddingState('no-wedding-found');
        setWedding(null);
        setTimelineEvents([]);
        setContracts([]);
        setMoodBoardImages([]);
        return;
      }

      setWedding({
        id: weddingData.id as string,
        coupleNames: (weddingData.couple_names || weddingData.coupleNames || '') as string,
        weddingDate: (weddingData.wedding_date || weddingData.weddingDate || '') as string,
        timeline: [],
        contracts: [],
        moodBoard: [],
        createdDate: (weddingData.created_date || weddingData.createdDate || new Date().toISOString()) as string,
      });

      const [events, contractsList, images] =
        (await Promise.all([
          db.getTimelineEvents(weddingData.id),
          db.getContracts(weddingData.id),
          db.getMoodBoardImages(weddingData.id),
        ])) as [DbTimelineEvent[], DbContract[], DbMoodBoardImage[]];

      setTimelineEvents(
        events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.date,
          category: e.category,
          completed: e.completed,
          assignedTo: e.assigned_to,
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
        images.map((i) => ({
          id: i.id,
          url: i.url,
          title: i.title,
          category: i.category,
          uploadedBy: i.uploaded_by,
          uploadedDate: i.uploaded_date,
          notes: i.notes,
        }))
      );

      setWeddingState('loaded');
    } catch (err) {
      console.error('Failed to load wedding data:', err);
      setError('Failed to load wedding data. Please try again.');
      setWeddingState('no-wedding-found');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Add a timeline event to the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: This operation is explicitly tied to `wedding.id`
   * and will no-op if wedding context is not loaded.
   */
  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    if (!wedding) {
      console.warn('[WeddingContext] addTimelineEvent: No active wedding context. Event not added.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] addTimelineEvent: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      const newEvent = await db.addTimelineEvent({
        wedding_id: wedding.id,
        title: event.title,
        description: event.description,
        date: event.date,
        category: event.category,
        completed: event.completed,
        assigned_to: event.assignedTo,
      });

      setTimelineEvents((currentEvents) =>
        sortTimelineEvents([
          ...currentEvents,
          {
            id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date,
            category: newEvent.category,
            completed: newEvent.completed,
            assignedTo: newEvent.assigned_to,
          },
        ])
      );
    } catch (err) {
      console.error('Failed to add timeline event:', err);
      throw err;
    }
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
    if (!wedding) {
      console.warn('[WeddingContext] updateTimelineEvent: No active wedding context. Event not updated.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] updateTimelineEvent: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;

      await db.updateTimelineEvent(id, dbUpdates);

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
      console.warn('[WeddingContext] deleteTimelineEvent: No active wedding context. Event not deleted.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] deleteTimelineEvent: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      await db.deleteTimelineEvent(id);
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
      console.warn('[WeddingContext] handleTimelineAction: No active wedding context. Action aborted.');
      return;
    }

    // Role enforcement: couples can only toggle complete
    if (userRole === 'couple' && action.type !== 'TOGGLE_COMPLETE') {
      console.warn('[WeddingContext] handleTimelineAction: Unauthorized action for couple:', action.type);
      return;
    }

    // Planner may perform any action
    try {
      setIsUpdating(true);

      if (action.type === 'CREATE') {
        const data: TimelineEventInput = action.data;
        if (!validCategories.includes(data.category)) {
          console.warn('Invalid category for create:', data.category);
          return;
        }

        const newEvent: TimelineEvent = {
          id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 7),
          title: data.title,
          description: data.description,
          date: data.date,
          category: data.category,
          completed: data.completed ?? false,
          assignedTo: data.assignedTo,
        };

        setTimelineEvents((current) => sortTimelineEvents([...current, newEvent]));
      }

      if (action.type === 'UPDATE') {
        const { id, data } = action;
        if (data.category && !validCategories.includes(data.category)) {
          console.warn('Invalid category for update:', data.category);
          return;
        }

        setTimelineEvents((current) =>
          sortTimelineEvents(
            current.map((evt) => (evt.id === id ? { ...evt, ...data } : evt))
          )
        );
      }

      if (action.type === 'DELETE') {
        setTimelineEvents((current) => current.filter((evt) => evt.id !== action.id));
      }

      if (action.type === 'TOGGLE_COMPLETE') {
        const id = action.id;
        setTimelineEvents((current) =>
          current.map((evt) =>
            evt.id === id ? { ...evt, completed: !evt.completed } : evt
          )
        );
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
      console.warn('[WeddingContext] addContract: No active wedding context. Contract not added.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] addContract: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      const newContract = await db.addContract({
        wedding_id: wedding.id,
        vendor_name: contract.vendorName,
        vendor_type: contract.vendorType,
        file_name: contract.fileName,
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
      console.error('Failed to add contract:', err);
      throw err;
    }
  };

  /**
   * Delete a contract from the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only removes contracts belonging to the current wedding.
   */
  const deleteContract = async (id: string) => {
    if (!wedding) {
      console.warn('[WeddingContext] deleteContract: No active wedding context. Contract not deleted.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] deleteContract: Wedding has no ID. Invalid state.');
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
  const addMoodBoardImage = async (image: Omit<MoodBoardImage, 'id'>) => {
    if (!wedding) {
      console.warn('[WeddingContext] addMoodBoardImage: No active wedding context. Image not added.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] addMoodBoardImage: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      const newImage = await db.addMoodBoardImage({
        wedding_id: wedding.id,
        url: image.url,
        title: image.title,
        category: image.category,
        uploaded_by: image.uploadedBy,
        uploaded_date: image.uploadedDate,
        notes: image.notes,
      });

      setMoodBoardImages((currentImages) => [
        ...currentImages,
        {
          id: newImage.id,
          url: newImage.url,
          title: newImage.title,
          category: newImage.category,
          uploadedBy: newImage.uploaded_by,
          uploadedDate: newImage.uploaded_date,
          notes: newImage.notes,
        },
      ]);
    } catch (err) {
      console.error('Failed to add mood board image:', err);
      throw err;
    }
  };

  /**
   * Delete a mood board image from the currently active wedding context.
   * ⚠️ WEDDING-SCOPED: Only removes images belonging to the current wedding.
   */
  const deleteMoodBoardImage = async (id: string) => {
    if (!wedding) {
      console.warn('[WeddingContext] deleteMoodBoardImage: No active wedding context. Image not deleted.');
      return;
    }

    if (!wedding.id) {
      console.error('[WeddingContext] deleteMoodBoardImage: Wedding has no ID. Invalid state.');
      return;
    }

    try {
      await db.deleteMoodBoardImage(id);
      setMoodBoardImages(moodBoardImages.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Failed to delete mood board image:', err);
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

  const value: WeddingContextType = {
    authUser,
    wedding,
    weddingState,
    userRole,
    timelineEvents,
    contracts,
    moodBoardImages,
    loading,
    error,
    lastUpdated,
    isUpdating,
    createTimelineEvent,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    handleTimelineAction,
    addContract,
    deleteContract,
    addMoodBoardImage,
    deleteMoodBoardImage,
    refreshData,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
};

