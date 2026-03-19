export interface Client {
  id: number;
  coupleNames: string;
  weddingDate: string;
  location: string;
  progress: number;
}

export const mockClients: Client[] = [
  {
    id: 1,
    coupleNames: 'Alice & Bob Johnson',
    weddingDate: '2024-06-15',
    location: 'Paris, France',
    progress: 75,
  },
  {
    id: 2,
    coupleNames: 'Emma & Liam Smith',
    weddingDate: '2024-08-22',
    location: 'Santorini, Greece',
    progress: 60,
  },
  {
    id: 3,
    coupleNames: 'Sophia & Noah Davis',
    weddingDate: '2024-09-10',
    location: 'Lake Tahoe, USA',
    progress: 85,
  },
  {
    id: 4,
    coupleNames: 'Olivia & Ethan Wilson',
    weddingDate: '2024-11-05',
    location: 'Kyoto, Japan',
    progress: 45,
  },
  {
    id: 5,
    coupleNames: 'Isabella & Mason Brown',
    weddingDate: '2025-01-18',
    location: 'Sydney, Australia',
    progress: 30,
  },
  {
    id: 6,
    coupleNames: 'Ava & Lucas Garcia',
    weddingDate: '2025-03-12',
    location: 'Barcelona, Spain',
    progress: 90,
  },
];