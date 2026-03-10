import { createClient } from '@supabase/supabase-js';

// Initialize Supabase - using demo credentials
// In production, these should be environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database helper functions
export const db = {
  // Timeline operations
  async getTimelineEvents(weddingId: string) {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addTimelineEvent(event: any) {
    const { data, error } = await supabase
      .from('timeline_events')
      .insert([event])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async updateTimelineEvent(id: string, updates: any) {
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Contract operations
  async getContracts(weddingId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('uploaded_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addContract(contract: any) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteContract(id: string) {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Mood board operations
  async getMoodBoardImages(weddingId: string) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('uploaded_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addMoodBoardImage(image: any) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .insert([image])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteMoodBoardImage(id: string) {
    const { error } = await supabase
      .from('mood_board_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Wedding operations
  async getWedding(id: string) {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrCreateDemoWedding() {
    // Demo wedding for testing
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('couple_names', 'Sarah & Michael')
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0];
    }
    
    // Create demo wedding if it doesn't exist
    const { data: newWedding, error: createError } = await supabase
      .from('weddings')
      .insert([{
        couple_names: 'Sarah & Michael',
        wedding_date: '2024-10-19',
        created_date: new Date().toISOString(),
      }])
      .select();
    
    if (createError) throw createError;
    return newWedding[0];
  },
};
