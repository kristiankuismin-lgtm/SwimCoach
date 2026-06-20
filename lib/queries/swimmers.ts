import { supabase } from "@/lib/supabase";

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
  const { supabase: sb } = await import("@/lib/supabase");
  return (await import("@/lib/supabase")).supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("season_year", year)
    .single();
}

export async function getRecentWorkouts(swimmerId: string, limit = 10) {
  const { supabase: sb } = await import("@/lib/supabase");
  return sb
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
