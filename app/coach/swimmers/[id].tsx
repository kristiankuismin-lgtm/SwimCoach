import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSwimmerProfile, getTimeProgression, getSwimmerSeasonDetail } from "@/lib/queries/swimmers";
import { msToTimeString } from "@/lib/utils/time";
import { STROKES } from "@/constants/strokes";

const BRAND = "#0EA5E9";

function ProgressBar({ pct, color = BRAND }: { pct: number; color?: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function GoalRow({ label, current, target, unit = "" }: {
  label: string; current: number; target: number; unit?: string;
}) {
  const pct = target > 0 ? Math.round((current / target) * 100) : 0;
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalRowTop}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalValue}>
          {current}{unit} / {target}{unit}
          <Text style={styles.goalPct}> {pct}%</Text>
        </Text>
      </View>
      <ProgressBar pct={pct} />
    </View>
  );
}

const ZONE_COLORS: Record<string, string> = {
  pk: "#38BDF8", vk: "#34D399", mk: "#FBBF24", mak: "#F87171",
};
const ZONE_LABELS: Record<string, string> = {
  pk: "PK", vk: "VK", mk: "MK", mak: "MAK",
};

function ZoneBar({ actual, target }: { actual: any; target: any }) {
  const zones = ["pk", "vk", "mk", "mak"] as const;
  const total = zones.reduce((s, z) => s + (actual[z] ?? 0), 0);
  return (
    <View>
      <View style={styles.zoneBarRow}>
        {zones.map(z => {
          const pct = total > 0 ? (actual[z] ?? 0) / total * 100 : 0;
          return pct > 0 ? (
            <View key={z} style={[styles.zoneSegment, { flex: pct, backgroundColor: ZONE_COLORS[z] }]} />
          ) : null;
        })}
      </View>
      <View style={styles.zoneLegend}>
        {zones.map(z => {
          const pct = total > 0 ? Math.round((actual[z] ?? 0) / total * 100) : 0;
          const tgt = target?.[z] ?? 0;
          const diff = pct - tgt;
          return (
            <View key={z} style={styles.zoneLegendItem}>
              <View style={[styles.zoneDot, { backgroundColor: ZONE_COLORS[z] }]} />
              <Text style={styles.zoneLabel}>{ZONE_LABELS[z]}</Text>
              <Text style={styles.zonePct}>{pct}%</Text>
              {tgt > 0 && (
                <Text style={[styles.zoneDiff, { color: Math.abs(diff) <= 3 ? "#22C55E" : diff < 0 ? "#F87171" : "#FBBF24" }]}>
                  {diff > 0 ? "+" : ""}{diff}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function SwimmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [progression, setProgression] = useState<any[]>([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getSwimmerProfile(id).then(({ data }) => setProfile(data)),
      getTimeProgression(id).then(({ data }) => setProgression(data ?? [])),
      getSwimmerSeasonDetail(id, year).then(({ data }) => setSummary(data)),
    ]);
  }, [id]);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Ladataan...</Text>
      </View>
    );
  }

  const goal = profile.yearly_goals?.find((g: any) => g.season_year === year);
  const prs = profile.personal_records ?? [];

  const actualZones = {
    pk: summary?.pct_pk ?? 0,
    vk: summary?.pct_vk ?? 0,
    mk: summary?.pct_mk ?? 0,
    mak: summary?.pct_mak ?? 0,
  };
  const targetZones = goal ? {
    pk: goal.target_pct_pk ?? 0,
    vk: goal.target_pct_vk ?? 0,
    mk: goal.target_pct_mk ?? 0,
    mak: goal.target_pct_mak ?? 0,
  } : undefined;

  const currentKm = summary ? Math.round((summary.total_pool_m ?? 0) / 100) / 10 : 0;
  const targetKm = goal?.target_pool_km ?? 0;
  const currentWorkouts = summary?.total_workouts ?? 0;
  const targetWorkouts = goal?.target_workouts ?? 0;

  // Group progression by event
  const progressionByEvent: Record<string, any[]> = {};
  for (const r of progression) {
    const key = `${r.distance}m ${r.stroke}`;
    if (!progressionByEvent[key]) progressionByEvent[key] = [];
    progressionByEvent[key].push(r);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.full_name}</Text>
        {profile.birth_date && (
          <Text style={styles.birthYear}>s. {new Date(profile.birth_date).getFullYear()}</Text>
        )}
      </View>

      <View style={styles.body}>
        {/* Vuositavoite */}
        {goal && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vuositavoite {year}</Text>
            <GoalRow label="Uintimetrit" current={currentKm} target={targetKm} unit=" km" />
            <GoalRow label="Harjoituskerrat" current={currentWorkouts} target={targetWorkouts} />
            {goal.target_stroke && (
              <View style={styles.raceGoal}>
                <Text style={styles.raceGoalText}>
                  🎯 {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.label}
                </Text>
                <Text style={styles.raceGoalTime}>
                  {goal.target_time_ms ? msToTimeString(goal.target_time_ms) : "—"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tehoaluejakauma */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tehoaluejakauma</Text>
          {(summary?.total_pool_m ?? 0) > 0
            ? <ZoneBar actual={actualZones} target={targetZones} />
            : <Text style={styles.emptyText}>Ei harjoitusdataa vielä.</Text>
          }
        </View>

        {/* PR:t */}
        {prs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Henkilökohtaiset ennätykset</Text>
            {prs.map((pr: any) => (
              <View key={pr.id} style={styles.prRow}>
                <Text style={styles.prEvent}>
                  {pr.distance}m {STROKES[pr.stroke as keyof typeof STROKES]?.label ?? pr.stroke}
                </Text>
                <Text style={styles.prTime}>{msToTimeString(pr.best_time_ms)}</Text>
                {pr.is_baseline && <Text style={styles.prBaseline}>lähtötaso</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Kisatuloskehitys */}
        {Object.entries(progressionByEvent).map(([event, results]) => {
          const latest = results[results.length - 1];
          const baseline = results[0];
          const improved = latest && baseline && latest.competition_date !== baseline.competition_date
            ? baseline.result_time_ms - latest.result_time_ms
            : null;
          return (
            <View key={event} style={styles.card}>
              <View style={styles.eventHeader}>
                <Text style={styles.cardTitle}>{event}</Text>
                {improved != null && (
                  <Text style={[styles.improvement, { color: improved > 0 ? "#22C55E" : "#F87171" }]}>
                    {improved > 0 ? "−" : "+"}{msToTimeString(Math.abs(improved))}
                  </Text>
                )}
              </View>
              {results.slice(-5).map((r: any) => (
                <View key={r.competition_date + r.result_time_ms} style={styles.resultRow}>
                  <Text style={styles.resultDate}>{r.competition_date}</Text>
                  <Text style={styles.resultTime}>{msToTimeString(r.result_time_ms)}</Text>
                  {r.improvement_pct != null && r.improvement_pct > 0 && (
                    <Text style={styles.resultImprovement}>−{r.improvement_pct}%</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 32 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#94A3B8" },

  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backBtn: { marginBottom: 8 },
  backText: { color: BRAND, fontSize: 14 },
  name: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  birthYear: { fontSize: 13, color: "#94A3B8", marginTop: 2 },

  body: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 12 },
  emptyText: { fontSize: 13, color: "#94A3B8" },

  // Goal rows
  goalRow: { marginBottom: 10 },
  goalRowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  goalLabel: { fontSize: 13, color: "#475569" },
  goalValue: { fontSize: 13, color: "#0F172A", fontWeight: "500" },
  goalPct: { color: BRAND },
  barTrack: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },

  // Race goal
  raceGoal: { marginTop: 8, backgroundColor: "#EFF6FF", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between" },
  raceGoalText: { fontSize: 13, color: "#1D4ED8" },
  raceGoalTime: { fontSize: 13, fontWeight: "700", color: "#1D4ED8" },

  // Zone bar
  zoneBarRow: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 10 },
  zoneSegment: { height: 10 },
  zoneLegend: { flexDirection: "row", justifyContent: "space-between" },
  zoneLegendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneLabel: { fontSize: 11, color: "#64748B" },
  zonePct: { fontSize: 11, fontWeight: "600", color: "#0F172A" },
  zoneDiff: { fontSize: 10 },

  // PRs
  prRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  prEvent: { flex: 1, fontSize: 13, color: "#334155" },
  prTime: { fontSize: 13, fontWeight: "700", color: BRAND },
  prBaseline: { fontSize: 11, color: "#94A3B8", marginLeft: 8 },

  // Competition results
  eventHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  improvement: { fontSize: 13, fontWeight: "700" },
  resultRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  resultDate: { flex: 1, fontSize: 12, color: "#94A3B8" },
  resultTime: { fontSize: 13, fontWeight: "500", color: "#1E293B" },
  resultImprovement: { fontSize: 11, color: "#22C55E", marginLeft: 8 },
});
