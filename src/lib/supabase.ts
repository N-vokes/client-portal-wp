import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using environment variables or fallback values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Database operations - All scoped to specific weddings via wedding_id
 * ⚠️ WEDDING-SCOPED SaaS: Every operation requires or filters by wedding_id
 * This ensures data isolation between different weddings
 */
export const db = {
  // ⚠️ Timeline operations - WEDDING-SCOPED
  /**
   * Get all timeline events for a specific wedding
   * @param weddingId The wedding ID to filter by (required for scoping)
   */
  async getTimelineEvents(weddingId: string) {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Add a timeline event to a specific wedding
   * @param event Event data including wedding_id (required)
   */
  async addTimelineEvent(event: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('timeline_events')
      .insert([event])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Update a timeline event (implicitly scoped by ID + wedding context)
   * @param id Event ID to update
   * @param updates Fields to update
   */
  async updateTimelineEvent(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Delete a timeline event (implicitly scoped by ID + wedding context)
   * @param id Event ID to delete
   */
  async deleteTimelineEvent(id: string) {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ⚠️ Contract operations - WEDDING-SCOPED
  /**
   * Get all contracts for a specific wedding
   * @param weddingId The wedding ID to filter by (required for scoping)
   */
  async getContracts(weddingId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('uploaded_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Add a contract to a specific wedding
   * @param contract Contract data including wedding_id (required)
   */
  async addContract(contract: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Delete a contract (implicitly scoped by ID + wedding context)
   * @param id Contract ID to delete
   */
  async deleteContract(id: string) {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ⚠️ Mood board operations - WEDDING-SCOPED
  /**
   * Get all mood board images for a specific wedding
   * @param weddingId The wedding ID to filter by (required for scoping)
   */
  async getMoodBoardImages(weddingId: string) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('uploaded_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Add a mood board image to a specific wedding
   * @param image Image data including wedding_id (required)
   */
  async addMoodBoardImage(image: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .insert([image])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Delete a mood board image (implicitly scoped by ID + wedding context)
   * @param id Image ID to delete
   */
  async deleteMoodBoardImage(id: string) {
    const { error } = await supabase
      .from('mood_board_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ⚠️ Wedding operations - WEDDING-SPECIFIC
  /**
   * Get a specific wedding by ID
   * @param id The wedding ID
   */
  async getWedding(id: string) {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWeddingForUser(userId: string) {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .or(`user_id.eq.${userId},planner_id.eq.${userId},couple_id.eq.${userId}`)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createWeddingForUser(
    userId: string,
    userRole: 'planner' | 'couple',
    coupleNames: string,
    weddingDate: string
  ) {
    const weddingData: Record<string, unknown> = {
      user_id: userId,
      couple_names: coupleNames,
      wedding_date: weddingDate,
      created_date: new Date().toISOString(),
    };

    if (userRole === 'planner') {
      weddingData.planner_id = userId;
    } else {
      weddingData.couple_id = userId;
    }

    const { data, error } = await supabase
      .from('weddings')
      .insert([weddingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

};
