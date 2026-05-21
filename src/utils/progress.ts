export const calculateProgressPercent = (
  timelineEvents: Array<{ completed: boolean }> = []
): number => {
  const totalCount = timelineEvents.length;
  if (totalCount === 0) return 0;

  const completedCount = timelineEvents.filter(
    (event) => event.completed
  ).length;

  return Math.round((completedCount / totalCount) * 100);
};
