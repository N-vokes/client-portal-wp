export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CommunicationEntry {
  id: string;
  type: string;
  summary: string;
  date: string;
  followUp?: string;
}

export interface VendorEntry {
  id: string;
  vendorName: string;
  category: string;
  status: 'pending' | 'contacted' | 'booked';
  note?: string;
}

export interface PaymentEntry {
  id: string;
  title: string;
  amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  dueDate: string;
  note?: string;
}

export interface VisionNote {
  id: string;
  title: string;
  description: string;
  category?: string;
}

export interface MilestoneEntry {
  id: string;
  title: string;
  dueDate: string;
  status: 'upcoming' | 'in progress' | 'completed';
  note?: string;
}