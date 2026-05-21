import React, { useState } from 'react';
import type { TimelineEvent } from '../types';
import { validators } from '../utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Omit<TimelineEvent, 'id' | 'completed'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  editingEvent?: TimelineEvent | null;
}

const validCategories: TimelineEvent['category'][] = [
  'planning',
  'design',
  'logistics',
  'celebration',
];

const isValidCategory = (c: string): c is TimelineEvent['category'] =>
  validCategories.includes(c as TimelineEvent['category']);

export const AddTimelineEventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  editingEvent = null,
}) => {
  const [title, setTitle] = useState(editingEvent?.title ?? '');
  const [description, setDescription] = useState(editingEvent?.description ?? '');
  const [date, setDate] = useState(editingEvent?.date ?? '');
  const [category, setCategory] = useState<TimelineEvent['category']>(
    editingEvent?.category ?? 'planning'
  );
  const [assignedTo, setAssignedTo] = useState(editingEvent?.assignedTo ?? '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setTitle(editingEvent?.title ?? '');
    setDescription(editingEvent?.description ?? '');
    setDate(editingEvent?.date ?? '');
    setCategory(editingEvent?.category ?? 'planning');
    setAssignedTo(editingEvent?.assignedTo ?? '');
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const isValidDate = (d: string) => validators.validateDate(d).length === 0;

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required';
    if (!isValidDate(date)) return 'Date is invalid';
    if (!isValidCategory(category)) return 'Category is invalid';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      // simple alert fallback
      alert(err);
      return;
    }

    setSaving(true);

    try {
      if (editingEvent && onUpdate) {
        await onUpdate(editingEvent.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          category,
          assignedTo: assignedTo || undefined,
        });
      } else {
        await onCreate({
          title: title.trim(),
          description: description.trim(),
          date,
          category,
          assignedTo: assignedTo || undefined,
        });
      }

      onClose();
    } catch (err) {
      // minimal error handling
      // eslint-disable-next-line no-console
      console.error(err);
      alert('Failed to save milestone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 px-4 py-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden my-auto mx-auto animate-modal-enter p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-charcoal">
            {editingEvent ? 'Edit Milestone' : 'Add Milestone'}
          </h2>
          <button onClick={onClose} className="text-slate">Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-slate">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-slate">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-slate">Category</label>
            <select value={category} onChange={(e) => isValidCategory(e.target.value) && setCategory(e.target.value as TimelineEvent['category'])} className="w-full border rounded px-3 py-2">
              {validCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate">Assigned To (optional)</label>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-sand">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded bg-charcoal text-cream">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTimelineEventModal;
