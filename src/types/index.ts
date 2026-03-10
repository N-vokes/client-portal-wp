export type UserRole = 'planner' | 'couple';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'planning' | 'design' | 'logistics' | 'celebration';
  completed: boolean;
  assignedTo?: string;
}

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

export interface MoodBoardImage {
  id: string;
  url: string;
  title: string;
  category: 'flowers' | 'dress' | 'decor' | 'colors' | 'cake' | 'other';
  uploadedBy: string;
  uploadedDate: string;
  notes?: string;
}

export interface WeddingData {
  id: string;
  coupleNames: string;
  weddingDate: string;
  timeline: TimelineEvent[];
  contracts: Contract[];
  moodBoard: MoodBoardImage[];
  createdDate: string;
}
