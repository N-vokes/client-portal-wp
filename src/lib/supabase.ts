import { createClient } from '@supabase/supabase-js';
import type { ClientRecord, MoodBoardCommentRecord, UserRole } from '../types';
import type { CommunicationEntry, MilestoneEntry, Note, PaymentEntry, VendorEntry, VisionNote } from '../types/clientProfile';

// Initialize Supabase using environment variables or fallback values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const mapClientRecord = (row: Record<string, any>): ClientRecord => ({
  id: row.id,
  weddingId: row.wedding_id,
  coupleNames: row.couple_names,
  weddingDate: row.wedding_date,
  ceremonyVenue: row.ceremony_venue ?? null,
  receptionVenue: row.reception_venue ?? null,
  guestCount: row.guest_count ?? null,
  budget: row.budget ?? null,
  planningStage: row.planning_stage ?? null,
  weddingStyle: row.wedding_style ?? null,
  preferredColors: row.preferred_colors ?? null,
  topPriorities: row.top_priorities ?? null,
  mustHaves: row.must_haves ?? null,
  doNotWant: row.do_not_want ?? null,
  mainHelpNeeded: row.main_help_needed ?? null,
  biggestConcern: row.biggest_concern ?? null,
  communicationPreference: row.communication_preference ?? null,
  additionalNotes: row.additional_notes ?? null,
  createdDate: row.created_date,
});

const mapClientInput = (data: Partial<Omit<ClientRecord, 'id' | 'createdDate'>>): Record<string, unknown> => {
  const mapped: Record<string, unknown> = {};

  if (data.weddingId !== undefined) mapped.wedding_id = data.weddingId;
  if (data.coupleNames !== undefined) mapped.couple_names = data.coupleNames;
  if (data.weddingDate !== undefined) mapped.wedding_date = data.weddingDate;
  if (data.ceremonyVenue !== undefined) mapped.ceremony_venue = data.ceremonyVenue;
  if (data.receptionVenue !== undefined) mapped.reception_venue = data.receptionVenue;
  if (data.guestCount !== undefined) mapped.guest_count = data.guestCount;
  if (data.budget !== undefined) mapped.budget = data.budget;
  if (data.planningStage !== undefined) mapped.planning_stage = data.planningStage;
  if (data.weddingStyle !== undefined) mapped.wedding_style = data.weddingStyle;
  if (data.preferredColors !== undefined) mapped.preferred_colors = data.preferredColors;
  if (data.topPriorities !== undefined) mapped.top_priorities = data.topPriorities;
  if (data.mustHaves !== undefined) mapped.must_haves = data.mustHaves;
  if (data.doNotWant !== undefined) mapped.do_not_want = data.doNotWant;
  if (data.mainHelpNeeded !== undefined) mapped.main_help_needed = data.mainHelpNeeded;
  if (data.biggestConcern !== undefined) mapped.biggest_concern = data.biggestConcern;
  if (data.communicationPreference !== undefined) mapped.communication_preference = data.communicationPreference;
  if (data.additionalNotes !== undefined) mapped.additional_notes = data.additionalNotes;

  return mapped;
};

const normalizeVendorStatus = (value: unknown): 'pending' | 'contacted' | 'booked' => {
  if (value === 'pending' || value === 'contacted' || value === 'booked') {
    return value;
  }

  throw new Error(`Unsupported vendor status: ${String(value)}`);
};

const mapVendorRow = (row: Record<string, any>): VendorEntry => ({
  id: String(row.id),
  vendorName: row.vendor_name ?? '',
  category: row.category ?? '',
  status: normalizeVendorStatus(row.status),
  note: row.note ?? undefined,
});

const normalizePaymentStatus = (value: unknown): 'paid' | 'partial' | 'unpaid' => {
  if (value === 'paid' || value === 'partial' || value === 'unpaid') {
    return value;
  }

  throw new Error(`Unsupported payment status: ${String(value)}`);
};

const mapPaymentRow = (row: Record<string, any>): PaymentEntry => ({
  id: String(row.id),
  title: row.title ?? '',
  amount: Number(row.amount ?? 0),
  status: normalizePaymentStatus(row.status),
  dueDate: row.due_date ?? '',
  note: row.note ?? undefined,
});

const mapVisionNoteRow = (row: Record<string, any>): VisionNote => ({
  id: String(row.id),
  title: row.title ?? '',
  description: row.description ?? '',
  category: row.category ?? undefined,
});

const normalizeMilestoneStatus = (value: unknown): 'upcoming' | 'in progress' | 'completed' => {
  if (value === 'upcoming' || value === 'in progress' || value === 'completed') {
    return value;
  }

  throw new Error(`Unsupported milestone status: ${String(value)}`);
};

const mapMilestoneRow = (row: Record<string, any>): MilestoneEntry => ({
  id: String(row.id),
  title: row.title ?? '',
  dueDate: row.due_date ?? '',
  status: normalizeMilestoneStatus(row.status),
  note: row.note ?? undefined,
});

const mapMoodBoardCommentRow = (row: Record<string, any>): MoodBoardCommentRecord => {
  if (row.author_role !== 'planner' && row.author_role !== 'couple') {
    throw new Error(`Unsupported Mood Board comment author role: ${String(row.author_role)}`);
  }

  return {
    id: row.id,
    weddingId: row.wedding_id,
    imageId: row.image_id,
    parentCommentId: row.parent_comment_id,
    userId: row.user_id,
    authorRole: row.author_role,
    text: row.text,
    createdAt: row.created_at,
    isDecision: row.is_decision,
  };
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getSession = async () => {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

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
  async updateTimelineEvent(weddingId: string, id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', id)
      .eq('wedding_id', weddingId)
      .select();
    
    if (error) throw error;
    if (!data?.[0]) {
      throw new Error('No timeline event was returned after updating it.');
    }
    return data[0];
  },

  /**
   * Delete a timeline event (implicitly scoped by ID + wedding context)
   * @param id Event ID to delete
   */
  async deleteTimelineEvent(weddingId: string, id: string) {
    const { data, error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id)
      .eq('wedding_id', weddingId)
      .select('id');

    if (error) throw error;
    if (!data?.length) {
      throw new Error('No timeline event was deleted.');
    }
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

  async uploadContractFile(weddingId: string, file: File) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'contract';
    const storagePath = `${weddingId}/${crypto.randomUUID()}-${safeFileName}`;
    const { data, error } = await supabase.storage
      .from('wedding-contracts')
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (error) throw error;
    return data.path;
  },

  async removeContractFile(filePath: string) {
    const { error } = await supabase.storage
      .from('wedding-contracts')
      .remove([filePath]);

    if (error) throw error;
  },

  async getContractSignedUrl(filePath: string, downloadFileName?: string) {
    const { data, error } = await supabase.storage
      .from('wedding-contracts')
      .createSignedUrl(filePath, 60, downloadFileName ? { download: downloadFileName } : undefined);

    if (error) throw error;
    return data.signedUrl;
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
      .select('id, wedding_id, image_url, uploaded_date, title, category, notes, status')
      .eq('wedding_id', weddingId)
      .order('uploaded_date', { ascending: false });
    
    if (error) throw error;
    return Promise.all(
      data.map(async (image) => {
        if (!image.image_url.startsWith(`${weddingId}/`)) {
          throw new Error('A Mood Board image is not stored in the active wedding folder.');
        }
        return {
          ...image,
          url: await this.getMoodBoardImageSignedUrl(image.image_url),
        };
      })
    );
  },

  /**
   * Upload a Mood Board image under its wedding-scoped Storage folder.
   */
  async uploadMoodBoardImageFile(weddingId: string, file: File) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'inspiration';
    const storagePath = `${weddingId}/${crypto.randomUUID()}-${safeFileName}`;
    const { data, error } = await supabase.storage
      .from('mood-board-images')
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (error) throw error;
    return data.path;
  },

  async getMoodBoardImageSignedUrl(storagePath: string) {
    const { data, error } = await supabase.storage
      .from('mood-board-images')
      .createSignedUrl(storagePath, 60 * 60);

    if (error) throw error;
    return data.signedUrl;
  },

  async removeMoodBoardImageFile(storagePath: string) {
    const { error } = await supabase.storage
      .from('mood-board-images')
      .remove([storagePath]);

    if (error) throw error;
  },

  /**
   * Add the supported Mood Board metadata for an uploaded file.
   */
  async addMoodBoardImage(
    weddingId: string,
    storagePath: string,
    details: {
      title?: string;
      category?: string;
      notes?: string;
      status?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .insert([{
        wedding_id: weddingId,
        image_url: storagePath,
        uploaded_date: new Date().toISOString(),
        title: details.title,
        category: details.category,
        notes: details.notes,
        status: details.status,
      }])
      .select('id, wedding_id, image_url, uploaded_date, title, category, notes, status')
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No Mood Board image record was returned after upload.');
    return data;
  },

  async updateMoodBoardImage(
    weddingId: string,
    id: string,
    updates: {
      title?: string;
      category?: string;
      notes?: string;
      status?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .update(updates)
      .eq('id', id)
      .eq('wedding_id', weddingId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No Mood Board image was updated in the active wedding.');
  },

  async getMoodBoardImagePath(weddingId: string, id: string) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .select('image_url')
      .eq('id', id)
      .eq('wedding_id', weddingId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('This image was not found in the active wedding.');
    if (!data.image_url.startsWith(`${weddingId}/`)) {
      throw new Error('This image is not stored in the active wedding folder.');
    }
    return data.image_url;
  },

  /**
   * Delete a Mood Board metadata row scoped to its wedding.
   * @param id Image ID to delete
   */
  async deleteMoodBoardImage(weddingId: string, id: string) {
    const { data, error } = await supabase
      .from('mood_board_images')
      .delete()
      .eq('id', id)
      .eq('wedding_id', weddingId)
      .select('id');
    
    if (error) throw error;
    if (!data?.length) throw new Error('No Mood Board image record was deleted.');
  },

  async getMoodBoardImageComments(weddingId: string, imageId: string) {
    const { data, error } = await supabase
      .from('mood_board_image_comments')
      .select('id, wedding_id, image_id, parent_comment_id, user_id, author_role, text, created_at, is_decision')
      .eq('wedding_id', weddingId)
      .eq('image_id', imageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapMoodBoardCommentRow);
  },

  async addMoodBoardComment(
    weddingId: string,
    imageId: string,
    userId: string,
    authorRole: UserRole,
    text: string
  ) {
    const { data, error } = await supabase
      .from('mood_board_image_comments')
      .insert({
        wedding_id: weddingId,
        image_id: imageId,
        user_id: userId,
        author_role: authorRole,
        text,
        parent_comment_id: null,
        is_decision: false,
      })
      .select('id, wedding_id, image_id, parent_comment_id, user_id, author_role, text, created_at, is_decision')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No Mood Board comment was returned after saving.');
    return mapMoodBoardCommentRow(data);
  },

  async addMoodBoardReply(
    weddingId: string,
    imageId: string,
    parentCommentId: string,
    userId: string,
    authorRole: UserRole,
    text: string
  ) {
    const { data: parentComment, error: parentError } = await supabase
      .from('mood_board_image_comments')
      .select('id')
      .eq('wedding_id', weddingId)
      .eq('image_id', imageId)
      .eq('id', parentCommentId)
      .is('parent_comment_id', null)
      .maybeSingle();

    if (parentError) throw parentError;
    if (!parentComment) throw new Error('Replies can only be added to a top-level comment.');

    const { data, error } = await supabase
      .from('mood_board_image_comments')
      .insert({
        wedding_id: weddingId,
        image_id: imageId,
        parent_comment_id: parentCommentId,
        user_id: userId,
        author_role: authorRole,
        text,
        is_decision: false,
      })
      .select('id, wedding_id, image_id, parent_comment_id, user_id, author_role, text, created_at, is_decision')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No Mood Board reply was returned after saving.');
    return mapMoodBoardCommentRow(data);
  },

  async deleteMoodBoardComment(weddingId: string, imageId: string, commentId: string) {
    const { data, error } = await supabase
      .from('mood_board_image_comments')
      .delete()
      .eq('wedding_id', weddingId)
      .eq('image_id', imageId)
      .eq('id', commentId)
      .is('parent_comment_id', null)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('The comment was not deleted. Check your access or refresh the discussion.');
  },

  async updateMoodBoardCommentDecision(
    weddingId: string,
    imageId: string,
    commentId: string,
    isDecision: boolean
  ) {
    const { data, error } = await supabase
      .from('mood_board_image_comments')
      .update({ is_decision: isDecision })
      .eq('wedding_id', weddingId)
      .eq('image_id', imageId)
      .eq('id', commentId)
      .is('parent_comment_id', null)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('The decision marker was not updated. Check your access or refresh the discussion.');
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
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getWeddingsForUser(userId: string) {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async uploadWeddingCoverPhoto(weddingId: string, file: File) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'cover';
    const storagePath = `${weddingId}/cover/${crypto.randomUUID()}-${safeFileName}`;
    const { data, error } = await supabase.storage
      .from('wedding-cover-photos')
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (error) throw error;
    return data.path;
  },

  async getWeddingCoverPhotoSignedUrl(weddingId: string, storagePath: string) {
    if (!storagePath.startsWith(`${weddingId}/cover/`)) {
      throw new Error('This cover photo is not stored in the active wedding folder.');
    }

    const { data, error } = await supabase.storage
      .from('wedding-cover-photos')
      .createSignedUrl(storagePath, 60 * 60);

    if (error) throw error;
    return data.signedUrl;
  },

  async updateWeddingCoverImagePath(weddingId: string, storagePath: string | null) {
    if (storagePath && !storagePath.startsWith(`${weddingId}/cover/`)) {
      throw new Error('This cover photo is not stored in the active wedding folder.');
    }

    const { data, error } = await supabase
      .from('weddings')
      .update({ cover_image_path: storagePath })
      .eq('id', weddingId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No wedding cover photo was updated. Check your access and try again.');
  },

  async removeWeddingCoverPhoto(weddingId: string, storagePath: string) {
    if (!storagePath.startsWith(`${weddingId}/cover/`)) {
      throw new Error('This cover photo is not stored in the active wedding folder.');
    }

    const { error } = await supabase.storage
      .from('wedding-cover-photos')
      .remove([storagePath]);

    if (error) throw error;
  },

  async createWeddingForUser(
    userId: string,
    coupleNames: string,
    weddingDate: string
  ) {
    const weddingData: Record<string, unknown> = {
      user_id: userId,
      couple_names: coupleNames,
      wedding_date: weddingDate,
      created_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('weddings')
      .insert([weddingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWedding(
    weddingId: string,
    updates: Record<string, unknown>
  ) {
    const { data, error } = await supabase
      .from('weddings')
      .update(updates)
      .eq('id', weddingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNotesForWedding(weddingId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title ?? '',
      content: row.content ?? '',
      createdAt: new Date(row.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  },

  async createNoteForWedding(weddingId: string, title: string, content: string): Promise<Note> {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          wedding_id: weddingId,
          title: trimmedTitle,
          content: trimmedContent,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No note was returned after creating it.');
    }

    return {
      id: data.id,
      title: data.title ?? '',
      content: data.content ?? '',
      createdAt: new Date(data.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  },

  async getCommunicationLogsForWedding(weddingId: string): Promise<CommunicationEntry[]> {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      type: row.type ?? '',
      summary: row.summary ?? '',
      date: row.date ?? '',
      followUp: row.follow_up ?? undefined,
    }));
  },

  async createCommunicationLogForWedding(
    weddingId: string,
    entry: Pick<CommunicationEntry, 'type' | 'summary' | 'date' | 'followUp'>
  ): Promise<CommunicationEntry> {
    const trimmedType = entry.type.trim();
    const trimmedSummary = entry.summary.trim();
    const trimmedDate = entry.date.trim();
    const trimmedFollowUp = entry.followUp?.trim();

    const { data, error } = await supabase
      .from('communication_logs')
      .insert([
        {
          wedding_id: weddingId,
          type: trimmedType,
          summary: trimmedSummary,
          date: trimmedDate,
          follow_up: trimmedFollowUp ? trimmedFollowUp : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No communication log entry was returned after creating it.');
    }

    return {
      id: data.id,
      type: data.type ?? '',
      summary: data.summary ?? '',
      date: data.date ?? '',
      followUp: data.follow_up ?? undefined,
    };
  },

  async getVendorsForWedding(weddingId: string): Promise<VendorEntry[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => mapVendorRow(row));
  },

  async createVendorForWedding(
    weddingId: string,
    entry: Pick<VendorEntry, 'vendorName' | 'category' | 'status' | 'note'>
  ): Promise<VendorEntry> {
    const trimmedName = entry.vendorName.trim();
    const trimmedCategory = entry.category.trim();
    const normalizedStatus = normalizeVendorStatus(entry.status);
    const trimmedNote = entry.note?.trim() ?? '';

    const { data, error } = await supabase
      .from('vendors')
      .insert([
        {
          wedding_id: weddingId,
          vendor_name: trimmedName,
          category: trimmedCategory,
          status: normalizedStatus,
          note: trimmedNote || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No vendor was returned after creating it.');
    }

    return mapVendorRow(data);
  },

  async getPaymentsForWedding(weddingId: string): Promise<PaymentEntry[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => mapPaymentRow(row));
  },

  async createPaymentForWedding(
    weddingId: string,
    payment: Pick<PaymentEntry, 'title' | 'amount' | 'status' | 'dueDate' | 'note'>
  ): Promise<PaymentEntry> {
    const trimmedTitle = payment.title.trim();
    const normalizedStatus = normalizePaymentStatus(payment.status);
    const trimmedNote = payment.note?.trim() ?? '';

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          wedding_id: weddingId,
          title: trimmedTitle,
          amount: payment.amount,
          status: normalizedStatus,
          due_date: payment.dueDate,
          note: trimmedNote || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No payment was returned after creating it.');
    }

    return mapPaymentRow(data);
  },

  async getVisionNotesForWedding(weddingId: string): Promise<VisionNote[]> {
    const { data, error } = await supabase
      .from('vision_notes')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => mapVisionNoteRow(row));
  },

  async createVisionNoteForWedding(
    weddingId: string,
    visionNote: Pick<VisionNote, 'title' | 'description' | 'category'>
  ): Promise<VisionNote> {
    const trimmedTitle = visionNote.title.trim();
    const trimmedDescription = visionNote.description.trim();
    const trimmedCategory = visionNote.category?.trim() ?? '';

    const { data, error } = await supabase
      .from('vision_notes')
      .insert([
        {
          wedding_id: weddingId,
          title: trimmedTitle,
          description: trimmedDescription,
          category: trimmedCategory || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No vision note was returned after creating it.');
    }

    return mapVisionNoteRow(data);
  },

  async getMilestonesForWedding(weddingId: string): Promise<MilestoneEntry[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => mapMilestoneRow(row));
  },

  async createMilestoneForWedding(
    weddingId: string,
    milestone: Pick<MilestoneEntry, 'title' | 'dueDate' | 'status' | 'note'>
  ): Promise<MilestoneEntry> {
    const trimmedTitle = milestone.title.trim();
    const trimmedNote = milestone.note?.trim() ?? '';
    const normalizedStatus = normalizeMilestoneStatus(milestone.status);

    const { data, error } = await supabase
      .from('milestones')
      .insert([
        {
          wedding_id: weddingId,
          title: trimmedTitle,
          due_date: milestone.dueDate,
          status: normalizedStatus,
          note: trimmedNote || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('No milestone was returned after creating it.');
    }

    return mapMilestoneRow(data);
  },

  async getClientForWedding(weddingId: string): Promise<ClientRecord | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('wedding_id', weddingId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapClientRecord(data) : null;
  },

  async createClientForWedding(data: Omit<ClientRecord, 'id' | 'createdDate'>): Promise<ClientRecord> {
    const clientExists = await supabase
      .from('clients')
      .select('id')
      .eq('wedding_id', data.weddingId)
      .maybeSingle();

    if (clientExists.error) throw clientExists.error;
    if (clientExists.data) {
      throw new Error('A client record already exists for this wedding.');
    }

    const clientData = mapClientInput(data);

    const { data: createdClient, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return mapClientRecord(createdClient);
  },

  async updateClientForWedding(
    weddingId: string,
    data: Partial<Omit<ClientRecord, 'id' | 'createdDate'>>
  ): Promise<ClientRecord> {
    const mappedUpdates = mapClientInput(data);

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(mappedUpdates)
      .eq('wedding_id', weddingId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedClient) {
      throw new Error('No client record found for this wedding to update.');
    }

    return mapClientRecord(updatedClient);
  },

};
