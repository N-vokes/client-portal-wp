import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close (ESC, backdrop click, or close button)
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title: string;

  /**
   * Modal content - render children inside the body
   */
  children: React.ReactNode;

  /**
   * Optional footer actions (typically buttons)
   */
  footer?: React.ReactNode;

  /**
   * Disable closing on backdrop click
   */
  disableBackdropClose?: boolean;

  /**
   * Optional CSS class for modal container
   */
  className?: string;

  /**
   * Optional size variant (small, medium, large)
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable accessible modal component with smooth animations.
 * Supports ESC key to close, click outside to close, and mobile responsiveness.
 *
 * @example
 * const [isOpen, setIsOpen] = React.useState(false);
 *
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Open Modal</button>
 *     <Modal
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       title="Confirm Action"
 *       footer={
 *         <div className="flex gap-3">
 *           <button onClick={() => setIsOpen(false)}>Cancel</button>
 *           <button onClick={handleConfirm}>Confirm</button>
 *         </div>
 *       }
 *     >
 *       <p>Are you sure?</p>
 *     </Modal>
 *   </>
 * );
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  disableBackdropClose = false,
  className = '',
  size = 'medium',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal to close
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disableBackdropClose) return;

    // Only close if clicking directly on backdrop, not modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Determine modal width based on size prop
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-charcoal/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Modal container with centered positioning */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
        onClick={handleBackdropClick}
        role="presentation"
      >
        {/* Modal content with scale and fade animation */}
        <div
          ref={modalRef}
          className={`${sizeClasses[size]} w-full bg-cream rounded-lg shadow-2xl transform transition-all duration-300 ease-out ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header with title and close button */}
          <div className="border-b border-gold/20 px-6 py-6 md:px-8 md:py-8 flex items-center justify-between">
            <h2
              id="modal-title"
              className="text-xl md:text-2xl font-serif font-semibold text-charcoal"
            >
              {title}
            </h2>
            {/* Close button */}
            <button
              onClick={onClose}
              className="ml-4 p-2 text-charcoal/60 hover:text-charcoal hover:bg-sand/50 rounded-lg transition-colors duration-200"
              aria-label="Close modal"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body content */}
          <div className="px-6 py-6 md:px-8 md:py-8 text-charcoal/80">
            {children}
          </div>

          {/* Footer actions (optional) */}
          {footer && (
            <div className="border-t border-gold/20 px-6 py-4 md:px-8 md:py-6 bg-sand/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
