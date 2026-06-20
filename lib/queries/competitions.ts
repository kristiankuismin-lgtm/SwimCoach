import { supabase } from "@/lib/supabase";

export async function getClubCompetitions(clubId: string) {
  return supabase
    .from("competitions")
    .select("*")
    .eq("club_id", clubId)
    .order("competition_date", { ascending: false });
}

export async function getCompetitionWithResults(competitionId: string) {
  return supabase
    .from("competitions")
    .select(`
      *,
      competition_results(
        *,
        swimmers(id, full_name)
      )
    `)
    .eq("id", competitionId)
    .single();
}

export async function createCompetition(data: {
  club_id: string;
  name: string;
  competition_date: string;
  location?: string;
  level?: string;
}) {
  return supabase.from("competitions").insert(data).select().single();
}

export async function upsertCompetitionResult(result: {
  competition_id: string;
  swimmer_id: string;
  stroke: string;
  distance: string;
  result_time_ms: number;
  place_overall?: number;
  place_age_group?: number;
  notes?: string;
}) {
  return supabase
    .from("competition_results")
    .upsert(result, { onConflict: "competition_id,swimmer_id,stroke,distance" })
    .select()
    .single();
}

export async function updatePersonalRecord(
  swimmerId: string,
  stroke: string,
  distance: string,
  timeMs: number,
  competitionDate: string,
  competitionId: string
) {
  // Hae nykyinen PR
  const { data: existing } = await supabase
    .from("personal_records")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("stroke", stroke)
    .eq("distance", distance)
    .single();

  // Päivitä vain jos parempi aika (tai ei ole PR:ää vielä)
  if (!existing || timeMs < existing.best_time_ms) {
    return supabase
      .from("personal_records")
      .upsert({
        swimmer_id: swimmerId,
        stroke,
        distance,
        best_time_ms: timeMs,
        set_at: competitionDate,
        competition_id: competitionId,
        is_baseline: false,
      }, { onConflict: "swimmer_id,stroke,distance" })
      .select()
      .single();
  }
  return { data: existing, error: null };
}
