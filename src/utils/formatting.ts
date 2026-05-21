export const formatShortDate = (
  date: string,
  locale = 'en-US'
): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }

  return parsed.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateDaysUntil = (date?: string): number => {
  if (!date) return 0;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 0;

  const diff = parsed.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const isValidDateString = (date: string): boolean => {
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime());
};
