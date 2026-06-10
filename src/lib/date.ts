import moment from "moment";

/**
 * Formats a date string (e.g., "2026-06-10") into a readable format.
 * Defaults to "ll" (e.g., "Jun 10, 2026").
 */
export function formatDate(date: string | Date | null | undefined, formatStr = "ll"): string {
  if (!date) return "";
  const parsed = moment(date);
  if (!parsed.isValid()) return String(date);
  return parsed.format(formatStr);
}

/**
 * Formats a time string (e.g., "14:30") into a readable format.
 * Defaults to "LT" (e.g., "2:30 PM").
 */
export function formatTime(time: string | null | undefined, formatStr = "LT"): string {
  if (!time) return "";
  // Check if it's a raw time string (e.g., "14:30" or "14:30:00")
  if (/^\d{2}:\d{2}/.test(time)) {
    const parsed = moment(time, "HH:mm");
    if (parsed.isValid()) return parsed.format(formatStr);
  }
  const parsed = moment(time);
  if (!parsed.isValid()) return String(time);
  return parsed.format(formatStr);
}

/**
 * Formats a combined date and time.
 * Defaults to "lll" (e.g., "Jun 10, 2026 2:30 PM").
 */
export function formatDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
  formatStr = "lll",
): string {
  if (!date) return "";
  const combined = time ? `${date}T${time}` : date;
  const parsed = moment(combined);
  if (!parsed.isValid()) return combined;
  return parsed.format(formatStr);
}

/**
 * Formats a date to relative time (e.g., "in 2 days", "3 hours ago").
 */
export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return "";
  const parsed = moment(date);
  if (!parsed.isValid()) return String(date);
  return parsed.fromNow();
}
