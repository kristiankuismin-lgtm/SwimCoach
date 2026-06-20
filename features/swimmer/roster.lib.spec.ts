import { describe, expect, it } from "vitest";
import { filterRoster } from "./roster.lib";
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

describe("filterRoster", () => {
  const roster = [
    swimmer({ swimmer_id: "1", full_name: "Aino Virtanen" }),
    swimmer({ swimmer_id: "2", full_name: "Veikko Mäki" }),
  ];

  it("returns everyone for an empty query", () => {
    expect(filterRoster(roster, "  ")).toHaveLength(2);
  });

  it("matches names case-insensitively", () => {
    expect(filterRoster(roster, "veik").map((s) => s.swimmer_id)).toEqual(["2"]);
  });
});
