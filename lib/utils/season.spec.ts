import { describe, expect, it } from "vitest";
import { seasonProgress } from "./season";

describe("seasonProgress", () => {
  it("is 0 at the first instant of the year", () => {
    expect(seasonProgress(new Date(2026, 0, 1, 0, 0, 0))).toBe(0);
  });

  it("is ~0.5 at mid-year", () => {
    // 2026 is not a leap year (365 days); July 2 noon ≈ day 182.5.
    const p = seasonProgress(new Date(2026, 6, 2, 12, 0, 0));
    expect(p).toBeGreaterThan(0.49);
    expect(p).toBeLessThan(0.51);
  });

  it("approaches 1 at the end of the year", () => {
    expect(seasonProgress(new Date(2026, 11, 31, 23, 59, 59))).toBeGreaterThan(0.99);
  });
});
