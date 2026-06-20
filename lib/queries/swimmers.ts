import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/realtime/useRealtimeInvalidation";
import type { SwimmerSummary } from "@/features/swimmer/swimmer-card.lib";

/** Query-key factory — the single source of truth for invalidation. */
export const swimmerKeys = {
  all: ["swimmers"] as const,
  seasonSummary: (clubId: string, year: number) =>
    [...swimmerKeys.all, "season-summary", clubId, year] as const,
};

/**
 * Coach roster: every swimmer's season summary for the club, kept live. A logged
 * attendance changes the summary, so the hook self-subscribes to
 * `workout_attendance` and invalidates — the screen never owns a realtime channel.
 */
export function useSeasonSummary(clubId: string | undefined, year: number) {
  useRealtimeInvalidation(
    "workout_attendance",
    clubId ? swimmerKeys.seasonSummary(clubId, year) : null,
  );
  return useQuery({
    queryKey: swimmerKeys.seasonSummary(clubId ?? "", year),
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await getSwimmerSeasonSummary(clubId!, year);
      if (error) throw error;
      // `swimmer_season_summary` is a view; generated types are still stubs
      // (Record<string, unknown>), so assert the domain shape at this boundary.
      return (data ?? []) as SwimmerSummary[];
    },
  });
}

export async function getSwimmerSeasonSummary(clubId: string, year?: number) {
  const season = year ?? new Date().getFullYear();
  return supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("club_id", clubId)
    .eq("season_year", season);
}

export async function getSwimmerProfile(swimmerId: string) {
  return supabase
    .from("swimmers")
    .select(`
      *,
      yearly_goals(*),
      personal_records(*)
    `)
    .eq("id", swimmerId)
    .single();
}

export async function getTimeProgression(swimmerId: string) {
  return supabase
    .from("swimmer_time_progression")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .order("competition_date", { ascending: true });
}

export async function getSwimmerSeasonDetail(swimmerId: string, year: number) {
  return supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("season_year", year)
    .single();
}

export async function getRecentWorkouts(swimmerId: string, limit = 10) {
  return supabase
    .from("workout_attendance")
    .select(`
      actual_pool_m,
      recorded_at,
      workouts(workout_date, workout_type, pool_sets(intensity_zone, total_m))
    `)
    .eq("swimmer_id", swimmerId)
    .order("recorded_at", { ascending: false })
    .limit(limit);
}
