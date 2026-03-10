/**
 * Validation utilities for wedding planner inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export const validators = {
  // File validation
  validateFile: (file: File | null, options?: { maxSizeMB?: number; allowedTypes?: string[] }): ValidationError[] => {
    const errors: ValidationError[] = [];
    const maxSizeMB = options?.maxSizeMB || 10;
    const allowedTypes = options?.allowedTypes || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!file) {
      errors.push({ field: 'file', message: 'Please select a file' });
      return errors;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      errors.push({ field: 'file', message: `File size must be less than ${maxSizeMB}MB` });
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push({ field: 'file', message: 'Invalid file type. Please upload a PDF or Word document' });
    }

    return errors;
  },

  // Image validation
  validateImage: (file: File | null, options?: { maxSizeMB?: number }): ValidationError[] => {
    const errors: ValidationError[] = [];
    const maxSizeMB = options?.maxSizeMB || 5;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!file) {
      errors.push({ field: 'image', message: 'Please select an image' });
      return errors;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      errors.push({ field: 'image', message: `Image size must be less than ${maxSizeMB}MB` });
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push({ field: 'image', message: 'Invalid image type. Please upload PNG, JPG, or WebP' });
    }

    return errors;
  },

  // Text input validation
  validateText: (text: string | null, minLength = 1, maxLength = 1000): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!text || text.trim().length === 0) {
      errors.push({ field: 'text', message: 'This field is required' });
      return errors;
    }

    if (text.length < minLength) {
      errors.push({ field: 'text', message: `Must be at least ${minLength} characters` });
    }

    if (text.length > maxLength) {
      errors.push({ field: 'text', message: `Must be less than ${maxLength} characters` });
    }

    return errors;
  },

  // Date validation
  validateDate: (date: string | null): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!date) {
      errors.push({ field: 'date', message: 'Please select a date' });
      return errors;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }

    return errors;
  },

  // Amount validation
  validateAmount: (amount: number | null): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (amount === null || amount === undefined) {
      errors.push({ field: 'amount', message: 'Please enter an amount' });
      return errors;
    }

    if (amount < 0) {
      errors.push({ field: 'amount', message: 'Amount must be positive' });
    }

    if (!Number.isFinite(amount)) {
      errors.push({ field: 'amount', message: 'Please enter a valid amount' });
    }

    return errors;
  },
};

/**
 * Get user-friendly error message from API errors
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }

    // File upload errors
    if (error.message.includes('file') || error.message.includes('upload')) {
      return 'File upload failed. Please try again.';
    }

    // Generic error message
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('offline')
    );
  }
  return false;
};

/**
 * Retry logic for failed requests
 */
export const retryRequest = async <T,>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on network errors
      if (!isNetworkError(error)) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
};
