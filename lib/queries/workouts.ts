import { supabase } from "@/lib/supabase";

export async function getWorkoutWithSets(workoutId: string) {
  return supabase
    .from("workouts")
    .select(`
      *,
      pool_sets(*),
      dryland_sessions(*),
      workout_attendance(*, swimmers(full_name))
    `)
    .eq("id", workoutId)
    .single();
}

export async function createWorkout(data: {
  club_id: string;
  coach_id: string;
  group_id?: string;
  workout_date: string;
  workout_type: "uinti" | "kuiva" | "yhdistelma";
  title?: string;
}) {
  return supabase.from("workouts").insert(data).select().single();
}

export async function addPoolSets(sets: Array<{
  workout_id: string;
  set_order: number;
  repetitions: number;
  distance_m: number;
  stroke?: string;
  intensity_zone: string;
  description?: string;
}>) {
  return supabase.from("pool_sets").insert(sets).select();
}

export async function getGroupWorkouts(clubId: string, groupId?: string, limit = 20) {
  let query = supabase
    .from("workouts")
    .select("*, pool_sets(intensity_zone, total_m)")
    .eq("club_id", clubId)
    .order("workout_date", { ascending: false })
    .limit(limit);
  if (groupId) query = query.eq("group_id", groupId);
  return query;
}
