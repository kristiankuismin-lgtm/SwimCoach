/**
 * Fraction of the calendar year elapsed at `now`, as 0–1.
 *
 * Pure — takes `now` explicitly rather than reading the clock, so it stays
 * testable and so the season "yardstick" the roster measures goal completion
 * against is reproducible. Callers pass `new Date()`.
 */
export function seasonProgress(now: Date): number {
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  return (now.getTime() - start) / (end - start);
}
