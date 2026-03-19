import React from 'react';
import type { VisionNote } from '../../types/clientProfile';

interface VisionNotesSectionProps {
  visionNotes: VisionNote[];
  visionTitle: string;
  visionCategory: string;
  visionDescription: string;
  onTitleChange: (next: string) => void;
  onCategoryChange: (next: string) => void;
  onDescriptionChange: (next: string) => void;
  onAddVisionNote: () => void;
}

export const VisionNotesSection: React.FC<VisionNotesSectionProps> = ({
  visionNotes,
  visionTitle,
  visionCategory,
  visionDescription,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  onAddVisionNote,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-charcoal">Vision Notes</h2>
        <span className="text-sm text-slate">{visionNotes.length} items</span>
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-gold/20 mb-6">
        <p className="text-sm text-slate mb-3">This is a lightweight planning summary for aesthetic direction and client preferences, not a full mood board editor.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="block text-sm text-charcoal mb-2" htmlFor="vision-title">Title</label>
            <input
              id="vision-title"
              value={visionTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Soft garden palette"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-charcoal mb-2" htmlFor="vision-category">Category</label>
            <input
              id="vision-category"
              value={visionCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="decor / colors / floral"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-charcoal mb-2" htmlFor="vision-description">Description</label>
            <textarea
              id="vision-description"
              value={visionDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Detailed vision note for mood board direction"
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onAddVisionNote}
            className="bg-gold text-white px-4 py-2 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Vision Note
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {visionNotes.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gold/20 text-slate">No vision notes yet. Add an inspiring concept above.</div>
        ) : (
          visionNotes.slice().reverse().map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-lg border border-gold/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-charcoal">{note.title}</h3>
                  <p className="text-sm text-slate">{note.description}</p>
                </div>
                <span className="text-xs text-slate">{note.category || 'General'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};