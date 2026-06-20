import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SwimmerCard } from "@/components/swimmer/SwimmerCard";
import { useCoachContext } from "@/hooks/useCoachContext";
import { getSwimmerSeasonSummary } from "@/lib/queries/swimmers";
import { getClubGroups } from "@/lib/queries/groups";
import { supabase } from "@/lib/supabase";

type SortKey = "name" | "goal_pct" | "workouts";

export default function CoachDashboard() {
  const router = useRouter();
  const { clubId, ready } = useCoachContext();

  const [swimmers, setSwimmers] = useState<any[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  const load = useCallback(async () => {
    if (!clubId) return;
    const [sumRes, grpRes] = await Promise.all([
      getSwimmerSeasonSummary(clubId, year),
      getClubGroups(clubId),
    ]);
    if (sumRes.data) setSwimmers(sumRes.data);
    if (grpRes.data) setGroups(grpRes.data);
    setLoading(false);
  }, [clubId]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  useEffect(() => {
    if (!clubId) return;
    const channel = supabase
      .channel("coach-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_attendance" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clubId, load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = swimmers
    .filter(() => true)
    .sort((a, b) => {
      if (sort === "name") return a.full_name.localeCompare(b.full_name);
      if (sort === "goal_pct") {
        const pA = (a.total_pool_m ?? 0) / Math.max(a.target_pool_m ?? 1, 1);
        const pB = (b.total_pool_m ?? 0) / Math.max(b.target_pool_m ?? 1, 1);
        return pB - pA;
      }
      if (sort === "workouts") return (b.total_workouts ?? 0) - (a.total_workouts ?? 0);
      return 0;
    });

  const totalPoolKm = Math.round(filtered.reduce((s, x) => s + (x.total_pool_m ?? 0), 0) / 100) / 10;
  const avgGoalPct = filtered.length > 0
    ? Math.round(filtered.reduce((s, x) => {
        const pct = x.target_pool_m > 0 ? (x.total_pool_m ?? 0) / x.target_pool_m * 100 : 0;
        return s + pct;
      }, 0) / filtered.length)
    : 0;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "name", label: "A–Z" },
    { key: "goal_pct", label: "Tavoite %" },
    { key: "workouts", label: "Harjoitukset" },
  ];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.title}>Ryhmä</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={s.logoutBtn}>
            <Text style={s.logoutText}>Kirjaudu ulos</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: "#eff6ff" }]}>
            <Text style={[s.statLabel, { color: "#93c5fd" }]}>Yhteensä uitu</Text>
            <Text style={[s.statValue, { color: "#1d4ed8" }]}>{totalPoolKm} km</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#f0fdf4" }]}>
            <Text style={[s.statLabel, { color: "#86efac" }]}>Tavoite keskim.</Text>
            <Text style={[s.statValue, { color: "#15803d" }]}>{avgGoalPct}%</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#f8fafc" }]}>
            <Text style={[s.statLabel, { color: "#94a3b8" }]}>Uimareita</Text>
            <Text style={[s.statValue, { color: "#374151" }]}>{filtered.length}</Text>
          </View>
        </View>

        {/* Group filter */}
        {groups.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            <View style={s.filterRow}>
              <TouchableOpacity
                onPress={() => setSelectedGroup(null)}
                style={[s.filterChip, !selectedGroup && s.filterChipActive]}
              >
                <Text style={[s.filterChipText, !selectedGroup && s.filterChipTextActive]}>Kaikki</Text>
              </TouchableOpacity>
              {groups.map(g => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGroup(g.id)}
                  style={[s.filterChip, selectedGroup === g.id && s.filterChipActive]}
                >
                  <Text style={[s.filterChipText, selectedGroup === g.id && s.filterChipTextActive]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Sort */}
        <View style={s.sortRow}>
          {SORT_OPTIONS.map(o => (
            <TouchableOpacity
              key={o.key}
              onPress={() => setSort(o.key)}
              style={[s.sortChip, sort === o.key && s.sortChipActive]}
            >
              <Text style={[s.sortChipText, sort === o.key && s.sortChipTextActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏊</Text>
            <Text style={s.emptyText}>
              Ei uimareita vielä.{"\n"}Lisää uimareita seuran hallinnasta.
            </Text>
          </View>
        ) : (
          
<View style={s.grid}>
  {filtered.map(sw => <SwimmerCard key={sw.swimmer_id} swimmer={sw} />)}
</View>
        )}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push("/coach/workout/new")}
      >
        <Text style={s.fabText}>+ Harjoitus</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  yearBadge: { fontSize: 13, color: "#94a3b8" },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  logoutText: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 10 },
  statLabel: { fontSize: 11, fontWeight: "500", marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "700" },
  filterScroll: { marginBottom: 10 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  filterChipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  filterChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  filterChipTextActive: { color: "#ffffff" },
  sortRow: { flexDirection: "row", gap: 8 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  sortChipActive: { backgroundColor: "#1e293b" },
  sortChipText: { fontSize: 12, fontWeight: "500", color: "#6b7280" },
  sortChipTextActive: { color: "#ffffff" },
  list: { flex: 1 },
  listContent: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 16,
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
});
