import { supabase } from "@/lib/supabase";

export async function upsertYearlyGoal(goal: {
  swimmer_id: string;
  season_year: number;
  target_pool_km?: number;
  target_dryland_hours?: number;
  target_workouts?: number;
  target_pct_pk?: number;
  target_pct_vk?: number;
  target_pct_mk?: number;
  target_pct_mak?: number;
  target_stroke?: string;
  target_distance?: string;
  target_time_ms?: number;
}) {
  return supabase
    .from("yearly_goals")
    .upsert(goal, { onConflict: "swimmer_id,season_year" })
    .select()
    .single();
}

export async function getYearlyGoal(swimmerId: string, year: number) {
  return supabase
    .from("yearly_goals")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("season_year", year)
    .single();
}
