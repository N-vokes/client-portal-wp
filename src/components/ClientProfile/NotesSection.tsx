import React from 'react';
import type { Note } from '../../types/clientProfile';

interface NotesSectionProps {
  notes: Note[];
  noteTitle: string;
  noteContent: string;
  onTitleChange: (next: string) => void;
  onContentChange: (next: string) => void;
  onAddNote: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  noteTitle,
  noteContent,
  onTitleChange,
  onContentChange,
  onAddNote,
}) => {
  return (
    <div id="notes-section" className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-charcoal tracking-tight">Notes</h2>
        <span className="text-sm text-slate">{notes.length} entries</span>
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-gold/20 mb-6">
        <div className="mb-3">
          <label className="block text-sm text-charcoal mb-2" htmlFor="note-title">Note title</label>
          <input
            id="note-title"
            value={noteTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Short note heading"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-charcoal mb-2" htmlFor="note-content">Content</label>
          <textarea
            id="note-content"
            value={noteContent}
            onChange={(e) => onContentChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Add details for the planner or team"
          />
        </div>
        <button
          type="button"
          onClick={onAddNote}
          className="bg-gold text-white px-4 py-2 rounded-md hover:bg-gold/80 transition-colors font-medium"
        >
          Add Note
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gold/20 text-slate">No notes yet. Add your first planner note above.</div>
        ) : (
          notes.slice().reverse().map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-lg border border-gold/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-charcoal">{note.title}</h3>
                <span className="text-xs text-slate">{note.createdAt}</span>
              </div>
              <p className="text-slate">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};