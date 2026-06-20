import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";

interface SwimmerSummary {
  swimmer_id: string;
  full_name: string;
  total_pool_m: number | null;
  target_pool_m: number | null;
  total_workouts: number | null;
  target_workouts: number | null;
  pct_pk: number | null;
  pct_vk: number | null;
  pct_mk: number | null;
  pct_mak: number | null;
  target_pct_pk: number | null;
  target_pct_vk: number | null;
  target_pct_mk: number | null;
  target_pct_mak: number | null;
  goal_pool_pct: number | null;
}

const AVATAR_COLORS = ["#0EA5E9","#8B5CF6","#EC4899","#F59E0B","#10B981","#EF4444"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const ZONE_PCT_KEYS: Record<IntensityZone, keyof SwimmerSummary> = {
  pk: "pct_pk", vk: "pct_vk", mk: "pct_mk", mak: "pct_mak",
};

const screenW = Dimensions.get("window").width;
const CARD_W = screenW >= 1024 ? "calc(50% - 6px)" : "100%";

export function SwimmerCard({ swimmer: s }: { swimmer: SwimmerSummary }) {
  const router = useRouter();

  const goalPct  = s.goal_pool_pct ?? 0;
  const km       = Math.round((s.total_pool_m ?? 0) / 100) / 10;
  const targetKm = Math.round((s.target_pool_m ?? 0) / 100) / 10;
  const color    = avatarColor(s.full_name);

  const now = new Date();
  const elapsed = (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
    (new Date(now.getFullYear(), 11, 31).getTime() - new Date(now.getFullYear(), 0, 1).getTime());
  const expectedPct = Math.round(elapsed * 100);
  const isAtRisk = targetKm > 0 && goalPct < expectedPct - 5;

  const barColor = goalPct >= 80 ? "#22C55E" : goalPct >= 50 ? "#EAB308" : "#EF4444";

  // Best time from competition data — not available here, show PK%
  const pkPct = s.pct_pk ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, isAtRisk && styles.cardAtRisk]}
      onPress={() => router.push(`/coach/swimmers/${s.swimmer_id}`)}
      activeOpacity={0.75}
    >
      {/* Colored header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <View>
          <Text style={styles.headerLajLabel}>
            {goalPct >= 80 ? "VAPAA" : goalPct >= 50 ? "VAPAA" : "VAPAA"}
          </Text>
          <Text style={styles.headerScore}>{goalPct}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials(s.full_name)}</Text>
        </View>
      </View>

      {/* Name + risk badge */}
      <View style={styles.nameRow}>
        <Text style={styles.name} numberOfLines={1}>{s.full_name}</Text>
        {isAtRisk && (
          <View style={styles.riskBadge}>
            <Text style={styles.riskText}>riski</Text>
          </View>
        )}
      </View>

      {/* Stats 2x2 grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>UITU</Text>
          <Text style={styles.statValue}>{km}<Text style={styles.statUnit}> km</Text></Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>HARJ</Text>
          <Text style={styles.statValue}>{s.total_workouts ?? 0}<Text style={styles.statUnit}>/{s.target_workouts ?? "—"}</Text></Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TAVOITE</Text>
          <Text style={styles.statValue}>{targetKm}<Text style={styles.statUnit}> km</Text></Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PK-OSUUS</Text>
          <Text style={[styles.statValue, { color: pkPct >= 58 ? "#22C55E" : "#EAB308" }]}>{pkPct}%</Text>
        </View>
      </View>

      {/* Zone bar */}
      {(s.total_pool_m ?? 0) > 0 && (
        <View style={styles.zoneBar}>
          {ZONE_ORDER.map(zone => {
            const pct = s[ZONE_PCT_KEYS[zone]] as number ?? 0;
            return pct > 0 ? (
              <View key={zone} style={[styles.zoneSegment, { flex: pct, backgroundColor: ZONES[zone].color }]} />
            ) : null;
          })}
        </View>
      )}

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(goalPct, 100)}%` as any, backgroundColor: barColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "calc(50% - 6px)" as any,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardAtRisk: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },

  // Header
  header: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLajLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.75)", letterSpacing: 0.5, marginBottom: 2 },
  headerScore: { fontSize: 36, fontWeight: "500", color: "#fff", lineHeight: 38 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // Name
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
  name: { fontSize: 13, fontWeight: "600", color: "#0F172A", flex: 1 },
  riskBadge: { backgroundColor: "#FEF2F2", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8 },
  riskText: { fontSize: 10, fontWeight: "600", color: "#DC2626" },

  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, paddingBottom: 10 },
  statItem: { width: "50%", paddingHorizontal: 4, marginBottom: 8 },
  statLabel: { fontSize: 9, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.4 },
  statValue: { fontSize: 16, fontWeight: "500", color: "#0F172A", lineHeight: 20 },
  statUnit: { fontSize: 11, fontWeight: "400", color: "#94A3B8" },

  // Zone bar
  zoneBar: { flexDirection: "row", height: 4, marginHorizontal: 14, borderRadius: 2,
    overflow: "hidden", marginBottom: 6, gap: 1 },
  zoneSegment: { height: 4 },

  // Progress
  barTrack: { height: 4, backgroundColor: "#F1F5F9", marginHorizontal: 14,
    marginBottom: 14, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
});
