export type UserRole = 'planner' | 'couple';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

/**
 * Timeline Event
 * ⚠️ WEDDING-SCOPED: These events are always accessed within a WeddingContext
 * They don't have an explicit wedding_id on the client, but are filtered by wedding_id at the DB layer
 */
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'planning' | 'design' | 'logistics' | 'celebration';
  completed: boolean;
  assignedTo?: string;
}

export type TimelineEventInput = Omit<TimelineEvent, 'id'>;

export type TimelineAction =
  | { type: 'CREATE'; data: TimelineEventInput }
  | { type: 'UPDATE'; id: string; data: Partial<TimelineEvent> }
  | { type: 'DELETE'; id: string }
  | { type: 'TOGGLE_COMPLETE'; id: string };

/**
 * Contract
 * ⚠️ WEDDING-SCOPED: Contracts are always accessed within a WeddingContext
 * They don't have an explicit wedding_id on the client, but are filtered by wedding_id at the DB layer
 */
export interface Contract {
  id: string;
  vendorName: string;
  vendorType: 'caterer' | 'photographer' | 'florist' | 'venue' | 'music' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  amount?: number;
  notes?: string;
}

export type VendorType = Contract['vendorType'];

/**
 * Mood Board Image
 * ⚠️ WEDDING-SCOPED: Images are always accessed within a WeddingContext
 * They don't have an explicit wedding_id on the client, but are filtered by wedding_id at the DB layer
 */
export interface MoodBoardImage {
  id: string;
  url: string;
  title: string;
  category: 'flowers' | 'dress' | 'decor' | 'colors' | 'cake' | 'other';
  uploadedBy: string;
  uploadedDate: string;
  notes?: string;
}

/**
 * Wedding Data - Root aggregate for a single wedding
 * ⚠️ WEDDING-SCOPED SaaS: This is the primary scoping unit
 * - Contains all timeline, contract, and mood board data for ONE wedding
 * - All operations on nested data are implicitly scoped to this wedding.id
 * - This ensures strict data isolation between different weddings
 */
export interface WeddingData {
  /** Unique identifier for this wedding (used for all data access queries) */
  id: string;
  /** Couple names for display purposes */
  coupleNames: string;
  /** Wedding ceremony date */
  weddingDate: string;
  /** Timeline events for this wedding (always filtered by wedding.id at DB) */
  timeline: TimelineEvent[];
  /** Contracts for this wedding (always filtered by wedding.id at DB) */
  contracts: Contract[];
  /** Mood board items for this wedding (always filtered by wedding.id at DB) */
  moodBoard: MoodBoardImage[];
  /** When this wedding was created in the system */
  createdDate: string;
}
