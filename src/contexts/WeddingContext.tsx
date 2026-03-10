import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TimelineEvent, Contract, MoodBoardImage, WeddingData } from '../types';
import { db } from '../lib/supabase';

interface WeddingContextType {
  wedding: WeddingData | null;
  timelineEvents: TimelineEvent[];
  contracts: Contract[];
  moodBoardImages: MoodBoardImage[];
  loading: boolean;
  error: string | null;
  
  // Timeline actions
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  
  // Contract actions
  addContract: (contract: Omit<Contract, 'id'>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  
  // Mood board actions
  addMoodBoardImage: (image: Omit<MoodBoardImage, 'id'>) => Promise<void>;
  deleteMoodBoardImage: (id: string) => Promise<void>;
  
  // Refresh
  refreshData: () => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [moodBoardImages, setMoodBoardImages] = useState<MoodBoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create demo wedding
      const weddingData = await db.getOrCreateDemoWedding();
      
      // Transform wedding data from snake_case to camelCase
      setWedding({
        id: weddingData.id,
        coupleNames: weddingData.couple_names || weddingData.coupleNames,
        weddingDate: weddingData.wedding_date || weddingData.weddingDate,
        timeline: [],
        contracts: [],
        moodBoard: [],
        createdDate: weddingData.created_date || weddingData.createdDate,
      });

      // Load all data for this wedding
      const [events, contractsList, images] = await Promise.all([
        db.getTimelineEvents(weddingData.id),
        db.getContracts(weddingData.id),
        db.getMoodBoardImages(weddingData.id),
      ]);

      setTimelineEvents(
        events.map((e: any) => ({
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
        contractsList.map((c: any) => ({
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
        images.map((i: any) => ({
          id: i.id,
          url: i.url,
          title: i.title,
          category: i.category,
          uploadedBy: i.uploaded_by,
          uploadedDate: i.uploaded_date,
          notes: i.notes,
        }))
      );
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load wedding data. Using demo mode.');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback to demo data if Supabase is not configured
  const loadDemoData = () => {
    setWedding({
      id: 'demo-1',
      coupleNames: 'Sarah & Michael',
      weddingDate: '2024-10-19',
      timeline: [],
      contracts: [],
      moodBoard: [],
      createdDate: new Date().toISOString(),
    });

    setTimelineEvents([
      {
        id: '1',
        title: 'Engagement Party',
        description: 'Celebrate with close family and friends',
        date: '2024-04-20',
        category: 'celebration',
        completed: true,
      },
      {
        id: '2',
        title: 'Book Venue',
        description: 'Finalize venue reservation and contract',
        date: '2024-05-15',
        category: 'logistics',
        completed: true,
      },
      {
        id: '3',
        title: 'Select Catering',
        description: 'Meet with caterer and choose menu',
        date: '2024-06-10',
        category: 'planning',
        completed: false,
      },
    ]);

    setContracts([
      {
        id: '1',
        vendorName: 'Pinnacle Events Catering',
        vendorType: 'caterer',
        fileName: 'Catering-Contract-2024.pdf',
        fileUrl: '/contracts/Catering-Contract-2024.pdf',
        uploadedDate: '2024-05-20',
        amount: 4500,
        notes: 'Includes cocktail hour, plated dinner, and dessert service for 150 guests',
      },
      {
        id: '2',
        vendorName: 'Sophia Photography Studio',
        vendorType: 'photographer',
        fileName: 'Photography-Services-Agreement.pdf',
        fileUrl: '/contracts/Photography-Services-Agreement.pdf',
        uploadedDate: '2024-05-22',
        amount: 2800,
        notes: '10 hours coverage, engagement shoot included, 600+ edited photos',
      },
    ]);

    setMoodBoardImages([
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
        title: 'Garden Roses Centerpiece',
        category: 'flowers',
        uploadedBy: 'Sarah',
        uploadedDate: '2024-06-01',
        notes: 'Love the blush and cream color combination',
      },
    ]);
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    if (!wedding) return;

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

      setTimelineEvents([
        ...timelineEvents,
        {
          id: newEvent.id,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          category: newEvent.category,
          completed: newEvent.completed,
          assignedTo: newEvent.assigned_to,
        },
      ]);
    } catch (err) {
      console.error('Failed to add timeline event:', err);
      throw err;
    }
  };

  const updateTimelineEvent = async (id: string, updates: Partial<TimelineEvent>) => {
    try {
      const dbUpdates: any = {};
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;

      await db.updateTimelineEvent(id, dbUpdates);

      setTimelineEvents(
        timelineEvents.map((event) =>
          event.id === id ? { ...event, ...updates } : event
        )
      );
    } catch (err) {
      console.error('Failed to update timeline event:', err);
      throw err;
    }
  };

  const addContract = async (contract: Omit<Contract, 'id'>) => {
    if (!wedding) return;

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

      setContracts([
        ...contracts,
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

  const deleteContract = async (id: string) => {
    try {
      await db.deleteContract(id);
      setContracts(contracts.filter((contract) => contract.id !== id));
    } catch (err) {
      console.error('Failed to delete contract:', err);
      throw err;
    }
  };

  const addMoodBoardImage = async (image: Omit<MoodBoardImage, 'id'>) => {
    if (!wedding) return;

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

      setMoodBoardImages([
        ...moodBoardImages,
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

  const deleteMoodBoardImage = async (id: string) => {
    try {
      await db.deleteMoodBoardImage(id);
      setMoodBoardImages(moodBoardImages.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Failed to delete mood board image:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const value: WeddingContextType = {
    wedding,
    timelineEvents,
    contracts,
    moodBoardImages,
    loading,
    error,
    addTimelineEvent,
    updateTimelineEvent,
    addContract,
    deleteContract,
    addMoodBoardImage,
    deleteMoodBoardImage,
    refreshData,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
