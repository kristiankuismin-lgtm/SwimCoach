import {
  View, ScrollView, RefreshControl, StyleSheet, type DimensionValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import { msToTimeString } from "@/lib/utils/time";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { STROKES } from "@/constants/strokes";
import { ZONES, type IntensityZone } from "@/constants/zones";
import { goalForYear, type SwimmerProfile } from "@/features/swimmer/swimmer-detail.lib";
import { recentSets, recentVolume, type RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

interface Props {
  profile: SwimmerProfile;
  recentWorkouts: RecentWorkout[];
  year: number;
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * Kehitys — the swimmer's season overview: progress against goal, only. The
 * full workout log and competition history are the sibling bottom tabs, so this
 * no longer carries its own internal kehitys/harjoitukset/kisat tab bar (that
 * duplicated the tabs one level down). The full goal spec lives in Tavoitteet;
 * here it's progress-against-goal plus the target race as a glanceable north star.
 */
export function SwimmerHome({ profile, recentWorkouts, year, refreshing, onRefresh }: Props) {
  const insets = useSafeAreaInsets();

  const goal = goalForYear(profile, year);
  const zoneDist = calcZoneDistribution(recentSets(recentWorkouts));
  const { totalKm } = recentVolume(recentWorkouts);

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + space.sm }]}>
        <View>
          <Text variant="title" style={s.headerName}>{profile.full_name}</Text>
          <Text variant="caption" color={color.inkFaint} style={s.headerSub}>Kausi {year}</Text>
        </View>
        {goal?.target_stroke && (
          <View style={s.goalBadge}>
            <Text variant="label" color={color.primary}>Tavoite</Text>
            <Text variant="bodyStrong" color={color.primaryInk} style={s.goalBadgeValue}>
              {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.short ?? goal.target_stroke}
              {goal.target_time_ms ? "  " + msToTimeString(goal.target_time_ms) : ""}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.huge }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={s.card}>
          <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Uintimetrit kaudella</Text>
          <Text variant="display" style={s.bigNumber}>{totalKm} <Text variant="title" color={color.inkFaint}>km</Text></Text>
          {goal?.target_pool_km ? (
            <>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${Math.min(100, totalKm / goal.target_pool_km * 100)}%` as DimensionValue, backgroundColor: color.primary }]} />
              </View>
              <Text variant="caption" color={color.inkFaint}>{Math.round(totalKm / goal.target_pool_km * 100)}% tavoitteesta ({goal.target_pool_km} km)</Text>
            </>
          ) : null}
        </View>

        <View style={s.card}>
          <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Tehoaluejakauma</Text>
          {zoneDist.total > 0 ? (
            <>
              <View style={s.zoneBar}>
                {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
                  const pct = zoneDist[z] / zoneDist.total;
                  return pct > 0 ? (
                    <View key={z} style={{ flex: pct, backgroundColor: ZONES[z].color, height: 12 }} />
                  ) : null;
                })}
              </View>
              <View style={s.zoneLegend}>
                {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => (
                  <View key={z} style={s.zoneLegendItem}>
                    <View style={[s.zoneDot, { backgroundColor: ZONES[z].color }]} />
                    <Text variant="caption" color={color.inkMuted}>{ZONES[z].label} {Math.round(zoneDist[z] / zoneDist.total * 100)}%</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text variant="caption" color={color.inkFaint} style={s.empty}>Ei vielä harjoitusdataa</Text>
          )}
        </View>

        {goal?.target_workouts ? (
          <View style={s.card}>
            <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Harjoituskerrat</Text>
            <Text variant="display" style={s.bigNumber}>{recentWorkouts.length} <Text variant="title" color={color.inkFaint}>/ {goal.target_workouts}</Text></Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.min(100, recentWorkouts.length / goal.target_workouts * 100)}%` as DimensionValue, backgroundColor: color.good }]} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: color.bg },
  header:          { backgroundColor: color.surface, paddingBottom: space.md, paddingHorizontal: space.xl, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  headerName:      {},
  headerSub:       { marginTop: 2 },
  goalBadge:       { backgroundColor: color.primaryWash, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: "flex-end" },
  goalBadgeValue:  {},
  scroll:          { flex: 1 },
  card:            { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, marginBottom: space.md, ...shadow.card },
  cardTitle:       { marginBottom: space.md },
  bigNumber:       { marginBottom: space.sm },
  progressBg:      { height: 8, backgroundColor: color.border, borderRadius: radius.sm / 2, overflow: "hidden", marginBottom: space.xs },
  progressFill:    { height: 8, borderRadius: radius.sm / 2 },
  zoneBar:         { flexDirection: "row", height: 12, borderRadius: radius.sm - 2, overflow: "hidden", marginBottom: space.sm + 2 },
  zoneLegend:      { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  zoneLegendItem:  { flexDirection: "row", alignItems: "center", gap: space.xs },
  zoneDot:         { width: 8, height: 8, borderRadius: 4 },
  empty:           { textAlign: "center" },
});
