/**
 * Formats a date string for display.
 * Uses en-IN locale by default since the app is built in India,
 * but the output is universally readable.
 */
export const formatDate = (
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string => {
  // Parse as UTC to avoid timezone-induced off-by-one-day issues
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString("en-IN", { ...options, timeZone: "UTC" });
};

export const formatShortDate = (dateStr: string): string =>
  formatDate(dateStr, { day: "numeric", month: "short", year: "numeric" });

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = formatDate(startDate, { day: "numeric", month: "short" });
  const end = formatDate(endDate, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
};

/** Returns the number of nights between two date strings */
export const getNightCount = (startDate: string, endDate: string): number => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};
