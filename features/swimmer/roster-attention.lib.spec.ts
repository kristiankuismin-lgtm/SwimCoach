import { describe, expect, it } from "vitest";
import { rosterAttention } from "./roster-attention.lib";
import type { SwimmerSummary } from "./swimmer-card.lib";

/** Minimal valid summary row; override only the fields a case cares about. */
function swimmer(over: Partial<SwimmerSummary>): SwimmerSummary {
  return {
    swimmer_id: "x",
    full_name: "Test",
    total_pool_m: 0,
    target_pool_m: 0,
    total_workouts: 0,
    target_workouts: 0,
    pct_pk: null,
    pct_vk: null,
    pct_mk: null,
    pct_mak: null,
    target_pct_pk: null,
    target_pct_vk: null,
    target_pct_mk: null,
    target_pct_mak: null,
    goal_pool_pct: 0,
    ...over,
  };
}

/** A zone split far off its plan — drives tehoScore below the risk threshold. */
const TEHO_OFF = {
  target_pct_pk: 40, target_pct_vk: 30, target_pct_mk: 20, target_pct_mak: 10,
  pct_pk: 100, pct_vk: 0, pct_mk: 0, pct_mak: 0,
} as const;

describe("rosterAttention", () => {
  it("flags no one on an empty roster", () => {
    expect(rosterAttention([], 0.5)).toEqual([]);
  });

  it("leaves an on-pace swimmer with no off-plan zones unflagged", () => {
    const items = rosterAttention([swimmer({ target_pool_m: 100_000, goal_pool_pct: 50 })], 0.5);
    expect(items).toEqual([]);
  });

  it("flags a swimmer behind the season pace", () => {
    const items = rosterAttention(
      [swimmer({ swimmer_id: "b", full_name: "Behind", target_pool_m: 100_000, goal_pool_pct: 20 })],
      0.5,
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ swimmer_id: "b", reason: "behind" });
    expect(items[0].detail).toContain("30%");
  });

  it("flags an on-pace swimmer whose zone split drifts from plan", () => {
    const items = rosterAttention(
      [swimmer({ swimmer_id: "t", target_pool_m: 100_000, goal_pool_pct: 50, ...TEHO_OFF })],
      0.5,
    );
    expect(items).toHaveLength(1);
    expect(items[0].reason).toBe("teho");
  });

  it("reports behind once, not also for teho, when both apply", () => {
    const items = rosterAttention(
      [swimmer({ swimmer_id: "c", target_pool_m: 100_000, goal_pool_pct: 20, ...TEHO_OFF })],
      0.5,
    );
    expect(items).toHaveLength(1);
    expect(items[0].reason).toBe("behind");
  });

  it("sorts the most-behind swimmer first", () => {
    const items = rosterAttention(
      [
        swimmer({ swimmer_id: "less", target_pool_m: 100_000, goal_pool_pct: 35 }),
        swimmer({ swimmer_id: "more", target_pool_m: 100_000, goal_pool_pct: 20 }),
      ],
      0.5,
    );
    expect(items.map((i) => i.swimmer_id)).toEqual(["more", "less"]);
  });
});
