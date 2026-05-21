/**
 * MODAL SYSTEM - USAGE GUIDE
 * 
 * A reusable, accessible modal component for your wedding planner app.
 * 
 * Features:
 * - Smooth open/close animations (scale + fade)
 * - ESC key to close
 * - Click outside to close
 * - Mobile responsive (different sizes: small, medium, large)
 * - Accessible structure with ARIA attributes
 * - Elegant luxury styling matching your wedding planner aesthetic
 * - No external dependencies (uses Tailwind CSS)
 */

// ============================================================================
// BASIC USAGE - Simple Modal
// ============================================================================

import React from 'react';
import { Modal, useModal } from './index';

export function BasicModalExample() {
  const modal = useModal();

  return (
    <>
      <button onClick={modal.open} className="btn">
        Open Modal
      </button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Confirm Action"
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
}

// ============================================================================
// WITH FOOTER ACTIONS - Modal with buttons
// ============================================================================

export function ModalWithFooter() {
  const modal = useModal();

  const handleConfirm = () => {
    console.log('Confirmed!');
    modal.close();
  };

  return (
    <>
      <button onClick={modal.open}>Delete Event</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Delete Timeline Event"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={modal.close}
              className="px-6 py-2 rounded-lg text-charcoal hover:bg-sand/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-charcoal/80">
          This action cannot be undone. The timeline event will be permanently deleted.
        </p>
      </Modal>
    </>
  );
}

// ============================================================================
// DIFFERENT SIZES - small, medium, large
// ============================================================================

export function ModalSizeExamples() {
  const smallModal = useModal();
  const mediumModal = useModal();
  const largeModal = useModal();

  return (
    <>
      <button onClick={smallModal.open}>Small Modal</button>
      <button onClick={mediumModal.open}>Medium Modal</button>
      <button onClick={largeModal.open}>Large Modal</button>

      <Modal
        isOpen={smallModal.isOpen}
        onClose={smallModal.close}
        title="Quick Confirmation"
        size="small"
      >
        <p>This is a small modal.</p>
      </Modal>

      <Modal
        isOpen={mediumModal.isOpen}
        onClose={mediumModal.close}
        title="Standard Modal"
        size="medium"
      >
        <p>This is a medium modal.</p>
      </Modal>

      <Modal
        isOpen={largeModal.isOpen}
        onClose={largeModal.close}
        title="Detailed Information"
        size="large"
      >
        <p>This is a large modal with more space for content.</p>
      </Modal>
    </>
  );
}

// ============================================================================
// RICH CONTENT - Modal with complex content
// ============================================================================

export function ModalWithRichContent() {
  const modal = useModal();

  return (
    <>
      <button onClick={modal.open}>Edit Notes</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Edit Vision Notes"
        size="large"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={modal.close}>Cancel</button>
            <button className="px-6 py-2 rounded-lg bg-gold text-white">
              Save Notes
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Vision Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gold/20 focus:border-gold focus:ring-1 focus:ring-gold/50"
              rows={6}
              placeholder="Describe your wedding vision..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Style Inspiration
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gold/20 focus:border-gold"
              placeholder="e.g., Minimalist, Rustic, Modern..."
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// CONTROLLED STATE - Manage modal externally
// ============================================================================

export function ModalControlledExample() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);

  const handleOpenModal = (eventName: string) => {
    setSelectedEvent(eventName);
    setIsOpen(true);
  };

  return (
    <>
      <button onClick={() => handleOpenModal('Send Invitations')}>
        Send Invitations
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Confirm: ${selectedEvent}`}
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="px-6 py-2 rounded-lg bg-gold text-white">
              Confirm
            </button>
          </div>
        }
      >
        <p>Are you ready to {selectedEvent?.toLowerCase()}?</p>
      </Modal>
    </>
  );
}

// ============================================================================
// USE IN TIMELINE PAGE
// ============================================================================

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
}

export function TimelineWithModal({ events }: { events: TimelineEvent[] }) {
  const addEventModal = useModal();
  const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);

  const handleEditEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    addEventModal.open();
  };

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg p-6">
            <h3 className="font-serif text-lg text-charcoal">{event.title}</h3>
            <p className="text-charcoal/70">{event.description}</p>
            <button
              onClick={() => handleEditEvent(event)}
              className="mt-4 text-gold hover:text-gold/80"
            >
              Edit
            </button>
          </div>
        ))}

        <button
          onClick={addEventModal.open}
          className="mt-6 px-6 py-3 rounded-lg bg-gold text-white"
        >
          Add Event
        </button>
      </div>

      <Modal
        isOpen={addEventModal.isOpen}
        onClose={addEventModal.close}
        title={selectedEvent ? 'Edit Event' : 'Add Timeline Event'}
        size="large"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={addEventModal.close}>Cancel</button>
            <button className="px-6 py-2 rounded-lg bg-gold text-white">
              {selectedEvent ? 'Update' : 'Add'} Event
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event title"
            defaultValue={selectedEvent?.title ?? ''}
            className="w-full px-4 py-3 rounded-lg border border-gold/20"
          />
          <textarea
            placeholder="Event description"
            defaultValue={selectedEvent?.description ?? ''}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gold/20"
          />
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// USE IN CONTRACTS PAGE
// ============================================================================

export function ContractVaultWithModal() {
  const downloadModal = useModal();

  return (
    <>
      <button onClick={downloadModal.open}>Download Contract</button>

      <Modal
        isOpen={downloadModal.isOpen}
        onClose={downloadModal.close}
        title="Download Contract"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={downloadModal.close}>Cancel</button>
            <a
              href="/contracts/sample.pdf"
              download
              className="px-6 py-2 rounded-lg bg-gold text-white"
            >
              Download
            </a>
          </div>
        }
      >
        <p>Select format:</p>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand/30">
            <input type="radio" name="format" value="pdf" defaultChecked />
            <span>PDF</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand/30">
            <input type="radio" name="format" value="docx" />
            <span>Word Document</span>
          </label>
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// USE IN MOOD BOARD PAGE
// ============================================================================

export function MoodBoardWithModal() {
  const uploadModal = useModal();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Uploading files:', files);
      uploadModal.close();
    }
  };

  return (
    <>
      <button onClick={uploadModal.open} className="px-6 py-3 bg-gold text-white rounded-lg">
        Upload Images
      </button>

      <Modal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.close}
        title="Upload to Mood Board"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={uploadModal.close}>Cancel</button>
            <button className="px-6 py-2 rounded-lg bg-gold text-white">
              Upload
            </button>
          </div>
        }
      >
        <div className="border-2 border-dashed border-gold/30 rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <p className="text-charcoal/70">Drag and drop images here or click to select</p>
          </label>
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// MODAL PROPS REFERENCE
// ============================================================================

/**
 * Modal Props:
 * 
 * @prop isOpen - Required. Boolean to control modal visibility
 * @prop onClose - Required. Callback function when modal should close
 * @prop title - Required. Modal header title (string)
 * @prop children - Required. Modal body content (React.ReactNode)
 * @prop footer - Optional. Footer section with actions (React.ReactNode)
 * @prop disableBackdropClose - Optional. Prevent closing on backdrop click (default: false)
 * @prop className - Optional. Additional CSS classes for modal container
 * @prop size - Optional. Modal width: 'small' | 'medium' | 'large' (default: 'medium')
 */

// ============================================================================
// STYLING GUIDE
// ============================================================================

/**
 * The Modal component uses your existing design system:
 * 
 * Colors used:
 * - bg: cream (modal background)
 * - text: charcoal (main text)
 * - accent: gold (highlights, borders in footer)
 * - hover: sand (hover states)
 * - border: gold/20 (subtle borders)
 * 
 * The footer has a subtle sand/20 background to distinguish it from body.
 * All transitions are 200-300ms with ease-out timing.
 * 
 * Close button (X) has hover state for better UX.
 * Smooth scale + fade animation on open/close.
 */
