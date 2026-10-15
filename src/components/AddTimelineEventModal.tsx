import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import type { TimelineEvent } from '../types';
import { getErrorMessage, validators } from '../utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  editingEvent?: TimelineEvent | null;
  mode: 'create' | 'edit';
}

export const AddTimelineEventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  editingEvent = null,
  mode,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(editingEvent?.title ?? '');
    setDate(editingEvent?.date ?? '');
    setCompleted(editingEvent?.completed ?? false);
    setErrorMessage(null);
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const isValidDate = (value: string) => validators.validateDate(value).length === 0;

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required.';
    if (!date.trim()) return 'Date is required.';
    if (!isValidDate(date)) return 'Please enter a valid date.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const payload: Omit<TimelineEvent, 'id'> = {
        title: title.trim(),
        date,
        completed,
      };

      if (mode === 'edit') {
        if (!editingEvent || !onUpdate) {
          throw new Error('Unable to edit this milestone. Close the dialog and try again.');
        }
        await onUpdate(editingEvent.id, payload);
      } else {
        await onCreate(payload);
      }

      onClose();
    } catch (err) {
      const message = getErrorMessage(err);
      setErrorMessage(message);
      console.error('Timeline modal save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Milestone' : 'Add Milestone'}
      size="large"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-gold/20 bg-sand px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-sand/90 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-2xl bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition hover:bg-slate disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save milestone'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-gold/20 bg-cream px-4 py-3 text-charcoal shadow-sm focus:border-charcoal focus:outline-none"
              placeholder="Milestone title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-2xl border border-gold/20 bg-cream px-4 py-3 text-charcoal shadow-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-gold/20 bg-cream px-4 py-3">
              <div>
                <p className="text-sm font-medium text-charcoal">Completed</p>
                <p className="text-sm text-slate">Mark milestone as complete</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(event) => setCompleted(event.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-12 h-6 rounded-full shadow-inner transition-colors duration-200 ${
                    completed ? 'bg-charcoal' : 'bg-slate/30'
                  }`}
                />
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-cream transition-transform duration-200 ${
                    completed ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddTimelineEventModal;
