import React, { useState } from 'react';

export interface UseModalReturn {
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean;

  /**
   * Opens the modal
   */
  open: () => void;

  /**
   * Closes the modal
   */
  close: () => void;

  /**
   * Toggles the modal open/closed
   */
  toggle: () => void;
}

/**
 * Custom hook for managing modal state.
 * Simplifies open/close logic in components.
 *
 * @param initialState - Initial open state (default: false)
 * @returns Object with isOpen state and control methods
 *
 * @example
 * const modal = useModal();
 *
 * return (
 *   <>
 *     <button onClick={modal.open}>Open Modal</button>
 *     <Modal
 *       isOpen={modal.isOpen}
 *       onClose={modal.close}
 *       title="My Modal"
 *     >
 *       Content here
 *     </Modal>
 *   </>
 * );
 */
export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
