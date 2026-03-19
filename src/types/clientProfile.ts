export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CommunicationEntry {
  id: number;
  type: string;
  summary: string;
  date: string;
  followUp?: string;
}

export interface VendorEntry {
  id: number;
  vendorName: string;
  category: string;
  status: 'pending' | 'contacted' | 'booked';
  note?: string;
}

export interface PaymentEntry {
  id: number;
  title: string;
  amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  dueDate: string;
  note?: string;
}

export interface VisionNote {
  id: number;
  title: string;
  description: string;
  category?: string;
}

export interface MilestoneEntry {
  id: number;
  title: string;
  dueDate: string;
  status: 'upcoming' | 'in progress' | 'completed';
  note?: string;
}