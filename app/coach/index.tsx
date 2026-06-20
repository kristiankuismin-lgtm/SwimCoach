import { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Waves } from "lucide-react-native";
import { SwimmerCard } from "@/features/swimmer/SwimmerCard";
import { RosterStats } from "@/features/swimmer/RosterStats";
import { LensTabs } from "@/features/swimmer/LensTabs";
import { Text } from "@/components/ui/Text";
import { PaceClock } from "@/components/ui/PaceClock";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useSeasonSummary, swimmerKeys } from "@/lib/queries/swimmers";
import { useClubGroups } from "@/lib/queries/groups";
import { supabase } from "@/lib/supabase";
import { type SwimmerSummary, type LensKey, rankSwimmers, km } from "@/features/swimmer/swimmer-card.lib";
import { color, space, radius, shadow } from "@/constants/theme";

function seasonProgressNow(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear(), 11, 31).getTime();
  return (now.getTime() - start) / (end - start);
}

export default function CoachDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clubId, ready } = useCoachContext();
  const year = new Date().getFullYear();
  const seasonProgress = seasonProgressNow();

  const [lens, setLens] = useState<LensKey>("goal");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const summaryQ = useSeasonSummary(ready ? clubId : undefined, year);
  const groupsQ = useClubGroups(ready ? clubId : undefined);

  // Realtime: a logged attendance changes the season summary — invalidate, don't refetch by hand.
  useEffect(() => {
    if (!clubId) return;
    const channel = supabase
      .channel("coach-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_attendance" }, () =>
        queryClient.invalidateQueries({ queryKey: swimmerKeys.seasonSummary(clubId, year) }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clubId, year, queryClient]);

  const swimmers = (summaryQ.data ?? []) as SwimmerSummary[];
  const groups = groupsQ.data ?? [];
  const ranked = rankSwimmers(lens, swimmers);

  const totalPoolKm = km(ranked.reduce((acc, x) => acc + (x.total_pool_m ?? 0), 0));
  const avgGoalPct = ranked.length > 0
    ? Math.round(ranked.reduce((acc, x) => {
        const pct = (x.target_pool_m ?? 0) > 0 ? (x.total_pool_m ?? 0) / (x.target_pool_m ?? 1) * 100 : 0;
        return acc + pct;
      }, 0) / ranked.length)
    : 0;

  if (!ready || summaryQ.isLoading) {
    return <View style={s.center}><PaceClock size={48} /></View>;
  }

  if (summaryQ.isError) {
    return (
      <View style={s.center}>
        <Text variant="body" color={color.inkMuted}>Tietojen lataus epäonnistui.</Text>
        <TouchableOpacity onPress={() => summaryQ.refetch()} style={s.retryBtn}>
          <Text variant="bodyStrong" color={color.primary}>Yritä uudelleen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text variant="title">Uimarit</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={s.logoutBtn}>
            <Text variant="caption" color={color.inkMuted}>Kirjaudu ulos</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <RosterStats totalKm={totalPoolKm} avgGoalPct={avgGoalPct} count={ranked.length} />
        </View>

        {groups.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.section}>
            <View style={s.filterRow}>
              <Chip label="Kaikki" active={!selectedGroup} onPress={() => setSelectedGroup(null)} />
              {groups.map((g) => (
                <Chip key={g.id} label={g.name} active={selectedGroup === g.id} onPress={() => setSelectedGroup(g.id)} />
              ))}
            </View>
          </ScrollView>
        )}

        <LensTabs value={lens} onChange={setLens} />
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={summaryQ.isRefetching} onRefresh={() => summaryQ.refetch()} tintColor={color.primary} />
        }
      >
        {ranked.length === 0 ? (
          <View style={s.empty}>
            <Waves size={40} color={color.inkFaint} strokeWidth={1.5} />
            <Text variant="body" color={color.inkMuted} style={s.emptyText}>
              Ei uimareita vielä.{"\n"}Lisää uimareita seuran hallinnasta.
            </Text>
          </View>
        ) : (
          <View style={s.grid}>
            {ranked.map((sw, i) => (
              <SwimmerCard
                key={sw.swimmer_id}
                swimmer={sw}
                lens={lens}
                rank={i + 1}
                seasonProgress={seasonProgress}
                onPress={() => router.push(`/coach/swimmers/${sw.swimmer_id}`)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 96 }} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push("/coach/workout/new")}>
        <Plus size={18} color={color.onPrimary} strokeWidth={2.5} />
        <Text variant="bodyStrong" color={color.onPrimary}>Harjoitus</Text>
      </TouchableOpacity>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.filterChip, active && s.filterChipActive]}>
      <Text variant="caption" color={active ? color.onPrimary : color.inkMuted}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg, gap: space.md },
  retryBtn: { paddingHorizontal: space.lg, paddingVertical: space.sm },
  header: {
    backgroundColor: color.surface,
    paddingTop: 56,
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.lg },
  section: { marginBottom: space.md },
  logoutBtn: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: color.border },
  filterRow: { flexDirection: "row", gap: space.sm },
  filterChip: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  filterChipActive: { backgroundColor: color.primary, borderColor: color.primary },
  list: { flex: 1 },
  listContent: { padding: space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  empty: { alignItems: "center", paddingVertical: 64, gap: space.md },
  emptyText: { textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: space.xxl,
    right: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: color.primary,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    ...shadow.fab,
  },
});
