import moment from "moment";

export const MATCH_DISPLAY_TZ_LABEL = "GMT+6";
const MATCH_DISPLAY_UTC_OFFSET_MINUTES = 6 * 60;

function getMatchMoment(
  date: string | null | undefined,
  time?: string | null | undefined,
) {
  if (!date) return null;
  let parsed;
  if (date.includes("T") || date.includes("Z")) {
    if (time && /^\d{2}:\d{2}/.test(time)) {
      const datePart = date.split("T")[0];
      const normalizedTime = time.slice(0, 5);
      parsed = moment.utc(`${datePart}T${normalizedTime}:00Z`);
    } else {
      parsed = moment.utc(date);
    }
  } else {
    const normalizedTime = time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : "00:00";
    parsed = moment.utc(`${date}T${normalizedTime}:00Z`);
  }
  if (!parsed.isValid()) return null;
  return parsed.utcOffset(MATCH_DISPLAY_UTC_OFFSET_MINUTES);
}

/**
 * Extracts a "YYYY-MM-DD" date string from a potentially full ISO/UTC string.
 */
export function getFormDate(date: string | null | undefined): string {
  if (!date) return "";
  if (date.includes("T")) {
    return date.split("T")[0];
  }
  return date;
}

/**
 * Extracts a "HH:mm" time string from a time field, or falls back to extracting it
 * from the date field if the date field is a full ISO/UTC string.
 */
export function getFormTime(
  date: string | null | undefined,
  time: string | null | undefined,
): string {
  if (time && /^\d{2}:\d{2}/.test(time)) {
    return time.slice(0, 5);
  }
  if (date && date.includes("T")) {
    const parts = date.split("T")[1];
    if (parts && /^\d{2}:\d{2}/.test(parts)) {
      return parts.slice(0, 5);
    }
  }
  return "";
}

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

export function formatMatchDate(
  date: string | null | undefined,
  time?: string | null | undefined,
  formatStr = "ll",
): string {
  const parsed = getMatchMoment(date, time);
  if (!parsed) return date || "";
  return parsed.format(formatStr);
}

export function formatMatchTime(
  date: string | null | undefined,
  time: string | null | undefined,
  formatStr = `LT [${MATCH_DISPLAY_TZ_LABEL}]`,
): string {
  const parsed = getMatchMoment(date, time);
  if (!parsed) return time || "";
  return parsed.format(formatStr);
}

export function formatMatchDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
  formatStr = `lll [${MATCH_DISPLAY_TZ_LABEL}]`,
): string {
  const parsed = getMatchMoment(date, time);
  if (!parsed) return [date, time].filter(Boolean).join(" ");
  return parsed.format(formatStr);
}

export function getMatchDayKey(
  date: string | null | undefined,
  time?: string | null | undefined,
): string {
  const parsed = getMatchMoment(date, time);
  if (!parsed) return date || "";
  return parsed.format("YYYY-MM-DD");
}

export function getMatchTimestamp(
  date: string | null | undefined,
  time?: string | null | undefined,
): number | null {
  const parsed = getMatchMoment(date, time);
  return parsed ? parsed.valueOf() : null;
}
