import type { Note, CommunicationEntry, VendorEntry, PaymentEntry, VisionNote, MilestoneEntry } from '../types/clientProfile';

export const initialNotes: Record<number, Note[]> = {
  1: [
    { id: 1, title: 'Venue visit booked', content: 'Confirmed venue walk-through for June 1.', createdAt: '2025-03-01 10:20' },
    { id: 2, title: 'Cake tasting', content: 'Tasting notes added for flavors: vanilla, lavender, salted caramel.', createdAt: '2025-03-02 14:04' },
  ],
  2: [
    { id: 1, title: 'Guest list review', content: 'Final guest count should be 142 after RSVPs processed.', createdAt: '2025-03-05 11:30' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const initialCommunication: Record<number, CommunicationEntry[]> = {
  1: [
    { id: 1, type: 'call', summary: 'Spoke with couple about vendor timeline.', date: '2025-03-07', followUp: 'Send updated timeline by Friday.' },
    { id: 2, type: 'email', summary: 'Sent contract draft to photographer.', date: '2025-03-09', followUp: 'Await signed doc.' },
  ],
  2: [
    { id: 1, type: 'meeting', summary: 'Reviewed guest seating chart.', date: '2025-03-08' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const initialVendors: Record<number, VendorEntry[]> = {
  1: [
    { id: 1, vendorName: 'Lighthouse Photography', category: 'photographer', status: 'booked', note: 'Confirmed package includes 8-hour coverage.' },
    { id: 2, vendorName: 'Petal & Fern', category: 'florist', status: 'contacted', note: 'Sent bouquet ideas, waiting for final quote.' },
  ],
  2: [
    { id: 1, vendorName: 'Crystal Catering Co.', category: 'caterer', status: 'pending', note: 'Menu tasting scheduled April 5.' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const initialPayments: Record<number, PaymentEntry[]> = {
  1: [
    { id: 1, title: 'Venue deposit', amount: 4000, status: 'paid', dueDate: '2025-02-28', note: 'Paid via bank transfer' },
    { id: 2, title: 'Florals', amount: 1800, status: 'partial', dueDate: '2025-04-15', note: '50% deposit done' },
  ],
  2: [
    { id: 1, title: 'Catering contract', amount: 6500, status: 'unpaid', dueDate: '2025-03-30', note: 'Await final menu sign-off' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const initialVisionNotes: Record<number, VisionNote[]> = {
  1: [
    { id: 1, title: 'Soft garden palette', description: 'Ensure floral tones lean into cream, blush, and sage with soft lighting.', category: 'colors' },
    { id: 2, title: 'Vintage tablescape', description: 'Curate romantic table overlays and mixed metallic place settings for a tactile experience.', category: 'decor' },
  ],
  2: [
    { id: 1, title: 'Sunset sea atmosphere', description: 'Beach-front table decor with soft blue and coral accents and natural textures.', category: 'venue' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const initialMilestones: Record<number, MilestoneEntry[]> = {
  1: [
    { id: 1, title: 'Finalize photographer contract', dueDate: '2025-03-20', status: 'in progress', note: 'Review deliverables and usage rights' },
    { id: 2, title: 'Confirm floral palette', dueDate: '2025-03-25', status: 'upcoming', note: 'Client selected blush / cream tones' },
  ],
  2: [
    { id: 1, title: 'Decor walkthrough', dueDate: '2025-04-01', status: 'upcoming' },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
};