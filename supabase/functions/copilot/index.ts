import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")\!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")\!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { question, club_id } = await req.json();
    if (\!question) throw new Error("Kysymys puuttuu");

    // 1. Hae JWT:stä club_id jos ei annettu
    const authHeader = req.headers.get("Authorization");
    let resolvedClubId = club_id;
    if (\!resolvedClubId && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: u } = await supabase
          .from("users").select("club_id").eq("id", user.id).single();
        resolvedClubId = u?.club_id;
      }
    }
    if (\!resolvedClubId) throw new Error("Seura ei löydy");

    // 2. Hae kauden koostedata (swimmer_season_summary -näkymä)
    const year = new Date().getFullYear();
    const { data: summaries } = await supabase
      .from("swimmer_season_summary")
      .select("*")
      .eq("club_id", resolvedClubId)
      .eq("season_year", year);

    // 3. Hae PR:t ja kisatulokset
    const swimmerIds = (summaries ?? []).map((s: any) => s.swimmer_id);
    const { data: prs } = swimmerIds.length > 0
      ? await supabase
          .from("personal_records")
          .select("swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at")
          .in("swimmer_id", swimmerIds)
      : { data: [] };

    const { data: recentResults } = swimmerIds.length > 0
      ? await supabase
          .from("competition_results")
          .select("swimmer_id, stroke, distance, result_time_ms, competitions(name, competition_date)")
          .in("swimmer_id", swimmerIds)
          .order("competitions(competition_date)", { ascending: false })
          .limit(50)
      : { data: [] };

    // 4. Muodosta kontekstiteksti
    const context = buildContext(summaries ?? [], prs ?? [], recentResults ?? []);

    // 5. Kutsu GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Olet asiantunteva uintivalmentajan AI-avustaja nimeltä Copilot.
Vastaat AINA suomeksi, tiiviisti ja konkreettisesti.
Viittaat aina oikeisiin lukuihin ja nimiin — älä koskaan keksi tietoja.
Jos data ei riitä vastaamiseen, sano se selkeästi.

Tänään on ${new Date().toLocaleDateString("fi-FI")}, kausi ${year}.

RYHMÄDATA:
${context}`,
        },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const answer = completion.choices[0].message.content ?? "En osaa vastata.";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});

// ─── Apufunktiot ───────────────────────────────────────────

function msToTime(ms: number): string {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return m > 0 ? `${m}:${sec}` : sec;
}

function buildContext(
  summaries: any[],
  prs: any[],
  results: any[]
): string {
  if (summaries.length === 0) return "Ei dataa vielä.";

  const prBySwimmer: Record<string, any[]> = {};
  for (const pr of prs) {
    if (\!prBySwimmer[pr.swimmer_id]) prBySwimmer[pr.swimmer_id] = [];
    prBySwimmer[pr.swimmer_id].push(pr);
  }

  const resultBySwimmer: Record<string, any[]> = {};
  for (const r of results) {
    if (\!resultBySwimmer[r.swimmer_id]) resultBySwimmer[r.swimmer_id] = [];
    resultBySwimmer[r.swimmer_id].push(r);
  }

  return summaries.map(s => {
    const goalPct = s.target_pool_m > 0
      ? Math.round((s.total_pool_m ?? 0) / s.target_pool_m * 100) : null;

    const zones = [
      `PK ${s.pct_pk ?? 0}% (tavoite ${s.target_pct_pk ?? "?"}%)`,
      `VK ${s.pct_vk ?? 0}% (tavoite ${s.target_pct_vk ?? "?"}%)`,
      `MK ${s.pct_mk ?? 0}% (tavoite ${s.target_pct_mk ?? "?"}%)`,
      `MAK ${s.pct_mak ?? 0}% (tavoite ${s.target_pct_mak ?? "?"}%)`,
    ].join(", ");

    const swimmerPrs = (prBySwimmer[s.swimmer_id] ?? [])
      .map(pr => `${pr.distance}m ${pr.stroke} ${msToTime(pr.best_time_ms)}${pr.is_baseline ? " (lähtötaso)" : " (PR)"}`)
      .join("; ");

    const swimmerResults = (resultBySwimmer[s.swimmer_id] ?? [])
      .slice(0, 5)
      .map(r => `${r.competitions?.competition_date} ${r.distance}m ${r.stroke} ${msToTime(r.result_time_ms)}`)
      .join("; ");

    return [
      `## ${s.full_name}`,
      `Uitu: ${Math.round((s.total_pool_m ?? 0) / 1000 * 10) / 10} km` +
        (s.target_pool_m > 0 ? ` / ${Math.round(s.target_pool_m / 1000 * 10) / 10} km tavoite (${goalPct}%)` : ""),
      `Harjoitukset: ${s.total_workouts ?? 0}` +
        (s.target_workouts ? ` / ${s.target_workouts}` : ""),
      `Tehoalueet: ${zones}`,
      swimmerPrs   ? `Tulokset: ${swimmerPrs}` : "",
      swimmerResults ? `Viimeisimmät kisat: ${swimmerResults}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}
