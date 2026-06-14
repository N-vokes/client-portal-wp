import { useContext } from 'react';
import { WeddingContext } from './WeddingContextValue';

/**
 * Hook to access the currently active wedding context.
 * ⚠️ WEDDING-SCOPED: Returns wedding-specific data and operations.
 * 
 * MUST be used within a <WeddingProvider>.
 * Throws error if wedding context is not available.
 * 
 * @throws {Error} If used outside of WeddingProvider
 * @returns {WeddingContextType} Wedding context including data and operations
 */
export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('[useWedding] Must be used within a WeddingProvider. Wedding context is required for all data operations.');
  }
  return context;
};
