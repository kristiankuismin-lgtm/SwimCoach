import { supabase } from "@/lib/supabase";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function msToTime(ms: number): string {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return m > 0 ? `${m}:${sec}` : `${sec}`;
}

async function getClubId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Kirjaudu sisään ensin.");
  const { data } = await supabase
    .from("users").select("club_id").eq("id", user.id).single();
  if (!data?.club_id) throw new Error("Seura ei löydy.");
  return data.club_id;
}

async function getSummaries(clubId: string) {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("club_id", clubId)
    .eq("season_year", year);
  if (error) throw error;
  return data ?? [];
}

// ── question handlers ─────────────────────────────────────────────────────────

async function mostSwum(summaries: any[]): Promise<string> {
  if (!summaries.length) return "Ei dataa vielä tältä kaudelta.";
  const sorted = [...summaries].sort((a, b) => (b.total_pool_m ?? 0) - (a.total_pool_m ?? 0));
  const top = sorted[0];
  const km = ((top.total_pool_m ?? 0) / 1000).toFixed(1);
  const lines = sorted.map((s, i) => {
    const k = ((s.total_pool_m ?? 0) / 1000).toFixed(1);
    const pct = s.goal_pool_pct ?? 0;
    return `${i + 1}. ${s.full_name} — ${k} km (${pct}% tavoitteesta)`;
  });
  return `🏊 **${top.full_name}** on uinut eniten tällä kaudella: **${km} km**.\n\nKoko ryhmä:\n${lines.join("\n")}`;
}

async function riskBehindGoal(summaries: any[]): Promise<string> {
  if (!summaries.length) return "Ei dataa vielä tältä kaudelta.";
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  const elapsed = (now.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime());
  const expectedPct = Math.round(elapsed * 100);

  const atRisk = summaries
    .filter(s => s.target_pool_m > 0 && (s.goal_pool_pct ?? 0) < expectedPct - 5)
    .sort((a, b) => ((a.goal_pool_pct ?? 0) - (b.goal_pool_pct ?? 0)));

  if (!atRisk.length) {
    return `✅ Kaikki uimarit ovat aikataulussa (tavoite-% odotusarvo nyt ${expectedPct}%).`;
  }

  const lines = atRisk.map(s => {
    const gap = expectedPct - (s.goal_pool_pct ?? 0);
    return `⚠️ ${s.full_name}: ${s.goal_pool_pct ?? 0}% tehty (${gap} pp jäljessä aikataulusta)`;
  });

  return `🚨 Suurin riski jäädä tavoitteesta (odotusarvo nyt ${expectedPct}% vuodesta kulunut):\n\n${lines.join("\n")}`;
}

async function zoneBreakdown(summaries: any[]): Promise<string> {
  if (!summaries.length) return "Ei dataa vielä tältä kaudelta.";
  const lines = summaries.map(s => {
    const pkDiff = (s.pct_pk ?? 0) - (s.target_pct_pk ?? 0);
    const flag = Math.abs(pkDiff) > 5 ? (pkDiff < 0 ? "⬇️" : "⬆️") : "✅";
    return `${flag} ${s.full_name}: PK ${s.pct_pk ?? 0}% (tavoite ${s.target_pct_pk ?? "?"}%), VK ${s.pct_vk ?? 0}%, MK ${s.pct_mk ?? 0}%, MAK ${s.pct_mak ?? 0}%`;
  });
  return `📊 Tehoaluejakauma vs. tavoite:\n\n${lines.join("\n")}`;
}

async function mostImproved(clubId: string, summaries: any[]): Promise<string> {
  const swimmerIds = summaries.map(s => s.swimmer_id);
  if (!swimmerIds.length) return "Ei uimareita.";

  const { data } = await supabase
    .from("swimmer_time_progression")
    .select("swimmer_id, stroke, distance, improvement_pct, result_time_ms, baseline_ms, competition_date")
    .in("swimmer_id", swimmerIds)
    .not("improvement_pct", "is", null)
    .order("improvement_pct", { ascending: false });

  if (!data || data.length === 0) return "Kisatuloksia ei löydy vielä.";

  // Best improvement per swimmer
  const best: Record<string, any> = {};
  for (const r of data) {
    if (!best[r.swimmer_id] || r.improvement_pct > best[r.swimmer_id].improvement_pct) {
      best[r.swimmer_id] = r;
    }
  }

  const nameMap: Record<string, string> = {};
  for (const s of summaries) nameMap[s.swimmer_id] = s.full_name;

  const sorted = Object.values(best).sort((a, b) => b.improvement_pct - a.improvement_pct);
  const lines = sorted.map((r, i) => {
    const name = nameMap[r.swimmer_id] ?? r.swimmer_id;
    const event = `${r.distance}m ${r.stroke}`;
    return `${i + 1}. ${name}: +${r.improvement_pct}% parannus (${event}, ${msToTime(r.baseline_ms)} → ${msToTime(r.result_time_ms)})`;
  });

  return `🏆 Eniten parantuneet lähtötasostaan:\n\n${lines.join("\n")}`;
}

async function lowPkZone(summaries: any[]): Promise<string> {
  const low = summaries.filter(s => {
    const target = s.target_pct_pk ?? 60;
    return (s.pct_pk ?? 0) < target - 5 && s.total_pool_m > 0;
  });
  if (!low.length) return "✅ Kaikilla uimareilla PK-osuus on tavoitteessa.";
  const lines = low.sort((a, b) => (a.pct_pk ?? 0) - (b.pct_pk ?? 0)).map(s => {
    const gap = (s.target_pct_pk ?? 60) - (s.pct_pk ?? 0);
    return `⚠️ ${s.full_name}: PK ${s.pct_pk ?? 0}% (tavoite ${s.target_pct_pk ?? 60}%, ${gap} pp vajaa)`;
  });
  return `🔵 Liian alhainen PK-osuus:\n\n${lines.join("\n")}`;
}

async function workoutsRemaining(summaries: any[]): Promise<string> {
  const with_target = summaries.filter(s => s.target_workouts > 0);
  if (!with_target.length) return "Harjoitustavoitetta ei ole asetettu.";
  const sorted = [...with_target].sort((a, b) => {
    const remA = (a.target_workouts - (a.total_workouts ?? 0));
    const remB = (b.target_workouts - (b.total_workouts ?? 0));
    return remB - remA;
  });
  const lines = sorted.map((s, i) => {
    const done = s.total_workouts ?? 0;
    const rem = Math.max(0, s.target_workouts - done);
    const pct = Math.round((done / s.target_workouts) * 100);
    return `${i + 1}. ${s.full_name}: ${rem} harjoitusta jäljellä (${done}/${s.target_workouts}, ${pct}%)`;
  });
  return `📅 Harjoituksia jäljellä tavoitteeseen:\n\n${lines.join("\n")}`;
}

async function generalStats(summaries: any[]): Promise<string> {
  if (!summaries.length) return "Ei dataa vielä tältä kaudelta.";
  const totalKm = summaries.reduce((s, r) => s + (r.total_pool_m ?? 0), 0) / 1000;
  const avgPct = summaries.reduce((s, r) => s + (r.goal_pool_pct ?? 0), 0) / summaries.length;
  const totalWorkouts = summaries.reduce((s, r) => s + (r.total_workouts ?? 0), 0);
  return `📊 Ryhmän yhteenveto ${new Date().getFullYear()}:\n\n` +
    `• Uimareita: ${summaries.length}\n` +
    `• Yhteensä uitu: ${totalKm.toFixed(1)} km\n` +
    `• Harjoituksia yhteensä: ${totalWorkouts}\n` +
    `• Tavoitteen toteutuminen (ka): ${avgPct.toFixed(0)}%`;
}

// ── router ────────────────────────────────────────────────────────────────────

export async function askCopilot(question: string): Promise<string> {
  const clubId = await getClubId();
  const summaries = await getSummaries(clubId);
  const q = question.toLowerCase();

  // Volume / most swum
  if (q.includes("eniten") && (q.includes("uinut") || q.includes("uida") || q.includes("uimari") || q.includes("km"))) {
    return mostSwum(summaries);
  }
  // Risk / behind goal / 1-on-1 / who needs attention
  if (q.includes("riski") || q.includes("jäljessä") || q.includes("jää") ||
      q.includes("1-1") || q.includes("1:1") || q.includes("kahdestaan") ||
      q.includes("huolestut") || q.includes("tukea") || q.includes("auttaa") ||
      q.includes("raitoille") || q.includes("takaisin") ||
      (q.includes("alle") && q.includes("tavoite"))) {
    return riskBehindGoal(summaries);
  }
  // Zone breakdown
  if (q.includes("tehoalue") || q.includes("jakauma") || q.includes("vastaa") ||
      q.includes("intensiteetti") || q.includes("vyöhyke")) {
    return zoneBreakdown(summaries);
  }
  // Improvement / progress
  if (q.includes("paranta") || q.includes("lähtötaso") || q.includes("kehitty") ||
      q.includes("edistyn") || q.includes("tulosta") || q.includes("nopeutu")) {
    return mostImproved(clubId, summaries);
  }
  // Low PK zone
  if (q.includes("pk") && (q.includes("liian") || q.includes("pieni") || q.includes("alhainen") || q.includes("vähän"))) {
    return lowPkZone(summaries);
  }
  // Workouts remaining
  if ((q.includes("harjoitus") || q.includes("treeni")) &&
      (q.includes("jäljellä") || q.includes("jäljell") || q.includes("jäljelle") || q.includes("montako"))) {
    return workoutsRemaining(summaries);
  }
  // General summary fallback
  return generalStats(summaries);
}

// Valmiit esimerkkikysymykset
export const COPILOT_SUGGESTIONS = [
  "Kuka on uinut eniten tällä kaudella?",
  "Kenellä on suurin riski jäädä alle vuositavoitteen?",
  "Miten ryhmän tehoaluejakauma vastaa tavoitetta?",
  "Ketkä ovat parantaneet eniten lähtötasostaan?",
  "Kenen PK-osuus on liian pieni?",
  "Kenellä on eniten harjoituksia jäljellä tavoitteeseen?",
];
