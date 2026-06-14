import { createContext } from 'react';
import type { TimelineEvent, Contract, MoodBoardImage, WeddingData, TimelineAction, UserRole } from '../types';

/**
 * Wedding loading state machine
 * - loading: Initial data fetch in progress
 * - no-auth: No authenticated user found
 * - no-wedding-found: User authenticated but has no wedding record
 * - loaded: Wedding data successfully loaded and ready to use
 */
export type WeddingState = 'loading' | 'no-auth' | 'no-wedding-found' | 'loaded';

/**
 * Wedding Context Type - Contains all wedding-scoped data and operations
 * ⚠️ WEDDING-SCOPED: All data and operations are implicitly tied to a single active wedding
 * 
 * Context structure:
 * - wedding: Metadata for the currently active wedding (null if not loaded)
 * - weddingState: Current state of wedding loading (loading, no-auth, no-wedding-found, loaded)
 * - timelineEvents: Events specific to this wedding (empty array if no wedding)
 * - contracts: Contracts specific to this wedding (empty array if no wedding)
 * - moodBoardImages: Mood board items specific to this wedding (empty array if no wedding)
 * - All operations (add/update/delete) are automatically scoped to the active wedding
 */
export interface WeddingContextType {
  authUser: any | null;
  wedding: WeddingData | null;
  weddingState: WeddingState;
  userRole: UserRole | null;
  timelineEvents: TimelineEvent[];
  contracts: Contract[];
  moodBoardImages: MoodBoardImage[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isUpdating: boolean;
  /** ⚠️ WEDDING-SCOPED: Creates event for active wedding only */
  createTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Adds event to active wedding only */
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Updates event in active wedding only */
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Deletes event from active wedding only */
  deleteTimelineEvent: (id: string) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Handles timeline actions with role-based access control */
  handleTimelineAction: (action: TimelineAction, userRole: UserRole) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Adds contract to active wedding only */
  addContract: (contract: Omit<Contract, 'id'>) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Deletes contract from active wedding only */
  deleteContract: (id: string) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Adds mood board image to active wedding only */
  addMoodBoardImage: (image: Omit<MoodBoardImage, 'id'>) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Deletes mood board image from active wedding only */
  deleteMoodBoardImage: (id: string) => Promise<void>;
  /** ⚠️ WEDDING-SCOPED: Refreshes all data for active wedding */
  refreshData: () => Promise<void>;
}

export const WeddingContext = createContext<WeddingContextType | undefined>(undefined);
