/**
 * Format a date string or ISO timestamp into a human-readable format.
 * Handles ISO 8601 (2024-07-01T07:00:00Z), date-only (2024-07-01), and null/undefined.
 *
 * @param {string|null|undefined} dateStr - The date string to format
 * @param {object} [options] - Formatting options
 * @param {boolean} [options.short] - Use short month (Jan vs January)
 * @returns {string} Formatted date or '—' if invalid/missing
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';

  try {
    // Handle date-only strings (2024-07-01) by treating as local date
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    const date = isDateOnly
      ? new Date(dateStr + 'T12:00:00') // Noon to avoid timezone shifts
      : new Date(dateStr);

    if (isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: options.short ? 'short' : '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Calculate days remaining until a date.
 * @param {string|null} dateStr - The expiration/due date
 * @returns {number|null} Days remaining (negative if past), or null if no date
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  try {
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
