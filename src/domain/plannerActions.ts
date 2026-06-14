import { useCallback } from 'react';
import { useWedding } from '../contexts/useWedding';
import type { VendorType } from '../types';

export type PlannerAction =
  | { type: 'MARK_TIMELINE_COMPLETE'; id: string }
  | { type: 'CREATE_CONTRACT_FROM_VENDOR_GAP'; vendorType: VendorType }
  | { type: 'DELETE_CONTRACT'; id: string }
  | { type: 'DELETE_MOODBOARD_IMAGE'; id: string };

/**
 * Hook that returns a single executor for planner-scoped actions.
 * Internally uses `useWedding()` so UI components call this hook
 * instead of calling wedding mutations directly.
 */
export const usePlannerActions = () => {
  const {
    updateTimelineEvent,
    addContract,
    deleteContract,
    deleteMoodBoardImage,
  } = useWedding();

  const executePlannerAction = useCallback(
    async (action: PlannerAction) => {
      switch (action.type) {
        case 'MARK_TIMELINE_COMPLETE': {
          await updateTimelineEvent(action.id, { completed: true });
          return;
        }

        case 'CREATE_CONTRACT_FROM_VENDOR_GAP': {
          // create a minimal contract payload matching Omit<Contract,'id'>
          await addContract({
            vendorName: `New ${action.vendorType}`,
            vendorType: action.vendorType,
            fileName: '',
            fileUrl: 'pending-upload',
            uploadedDate: new Date().toISOString(),
            amount: 0,
            notes: 'Auto-created from Planner Focus Panel',
          });
          return;
        }

        case 'DELETE_CONTRACT': {
          await deleteContract(action.id);
          return;
        }

        case 'DELETE_MOODBOARD_IMAGE': {
          await deleteMoodBoardImage(action.id);
          return;
        }

        /* istanbul ignore next */
        default:
          return;
      }
    },
    [updateTimelineEvent, addContract, deleteContract, deleteMoodBoardImage]
  );

  return { executePlannerAction };
};

export default usePlannerActions;
