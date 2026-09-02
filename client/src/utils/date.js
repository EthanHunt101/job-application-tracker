// The backend stores date_applied as a plain SQL `date` (no time/timezone).
// Converting through Date.toISOString() would shift the date by up to a day
// for anyone west of UTC (it converts to UTC first), so these two helpers
// stick to the browser's local calendar date instead.

export function dateToInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// The API returns date_applied as an ISO timestamp string (midnight UTC on
// the stored date). Parsing that with `new Date(...)` and reading it back
// with local getters can land on the wrong day, so this reads the
// YYYY-MM-DD prefix directly and builds a local date from those parts.
export function parseApiDate(isoString) {
  const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}
