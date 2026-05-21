import { createContext } from 'react';
import type { TimelineEvent, Contract, MoodBoardImage, WeddingData, TimelineAction, UserRole } from '../types';

export interface WeddingContextType {
  wedding: WeddingData | null;
  timelineEvents: TimelineEvent[];
  contracts: Contract[];
  moodBoardImages: MoodBoardImage[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isUpdating: boolean;
  createTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;
  handleTimelineAction: (action: TimelineAction, userRole: UserRole) => Promise<void>;
  addContract: (contract: Omit<Contract, 'id'>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  addMoodBoardImage: (image: Omit<MoodBoardImage, 'id'>) => Promise<void>;
  deleteMoodBoardImage: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const WeddingContext = createContext<WeddingContextType | undefined>(undefined);
