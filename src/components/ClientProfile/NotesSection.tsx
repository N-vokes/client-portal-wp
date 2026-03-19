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
    <div id="notes-section" className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-serif text-charcoal tracking-tight">Notes</h2>
        <span className="text-sm text-slate">{notes.length} entries</span>
      </div>

      <div className="bg-sand/50 p-3 sm:p-4 rounded-lg border border-gold/20 mb-5 sm:mb-6">
        <div className="mb-3">
          <label className="block text-sm text-charcoal mb-2" htmlFor="note-title">Note title</label>
          <input
            id="note-title"
            value={noteTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
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
          className="w-full sm:w-auto bg-gold text-white px-4 py-2.5 rounded-md hover:bg-gold/80 transition-colors font-medium"
        >
          Add Note
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notes.length === 0 ? (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20 text-slate text-sm sm:text-base">No notes yet. Add your first planner note above.</div>
        ) : (
          notes.slice().reverse().map((note) => (
            <div key={note.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className="font-medium text-charcoal break-words">{note.title}</h3>
                <span className="text-xs text-slate break-words">{note.createdAt}</span>
              </div>
              <p className="text-sm sm:text-base text-slate leading-relaxed break-words">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};