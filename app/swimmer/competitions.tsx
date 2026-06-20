import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { getTimeProgression, getSwimmerProfile } from "@/lib/queries/swimmers";
import { msToTimeString } from "@/lib/utils/time";
import { STROKES } from "@/constants/strokes";

export default function SwimmerCompetitionsScreen() {
  const { swimmerId, ready } = useSwimmerContext();
  const [progression, setProgression] = useState<any[]>([]);

  useEffect(() => {
    if (!ready || !swimmerId) return;
    getTimeProgression(swimmerId).then(({ data }) => setProgression(data ?? []));
  }, [ready, swimmerId]);

  // Ryhmitä tapahtuman mukaan
  const byEvent: Record<string, any[]> = {};
  for (const r of progression) {
    const strokeLabel = STROKES[r.stroke as keyof typeof STROKES]?.label ?? r.stroke;
    const key = `${r.distance}m ${strokeLabel}`;
    if (!byEvent[key]) byEvent[key] = [];
    byEvent[key].push(r);
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Kilpailutulokset</Text>
        <Text style={s.subtitle}>{Object.keys(byEvent).length} tapahtumaa</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {Object.keys(byEvent).length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyText}>
              Ei kisatuloksia vielä.{"\n"}Valmentaja lisää tulokset.
            </Text>
          </View>
        ) : (
          Object.entries(byEvent).map(([event, results]) => {
            // Paras aika = PR
            const bestMs = Math.min(...results.map((r: any) => r.result_time_ms));
            // Järjestä uusin ensin
            const sorted = [...results].sort((a, b) =>
              b.competition_date.localeCompare(a.competition_date)
            );

            return (
              <View key={event} style={s.card}>
                <Text style={s.cardTitle}>{event}</Text>

                {/* Minichart — palkkigraafi */}
                <View style={s.chartWrap}>
                  {[...results]
                    .sort((a, b) => a.competition_date.localeCompare(b.competition_date))
                    .map((r, i, arr) => {
                      const maxMs = Math.max(...arr.map((x: any) => x.result_time_ms));
                      const minMs = Math.min(...arr.map((x: any) => x.result_time_ms));
                      const range = maxMs - minMs || 1;
                      const barH = Math.max(12, ((maxMs - r.result_time_ms) / range) * 60 + 12);
                      const isPR = r.result_time_ms === bestMs;
                      return (
                        <View key={i} style={s.barWrap}>
                          <View style={[s.bar, { height: barH, backgroundColor: isPR ? "#22C55E" : "#0EA5E9" }]} />
                          <Text style={s.barDate}>{r.competition_date.slice(5)}</Text>
                        </View>
                      );
                    })}
                </View>

                {/* Tuloslista */}
                {sorted.map((r: any, i: number) => {
                  const isPR = r.result_time_ms === bestMs;
                  return (
                    <View key={i} style={[s.row, i < sorted.length - 1 && s.rowBorder]}>
                      <View style={s.rowLeft}>
                        <Text style={s.rowDate}>{r.competition_date}</Text>
                        <Text style={s.rowComp} numberOfLines={1}>{r.competition_name}</Text>
                      </View>
                      <View style={s.rowRight}>
                        <Text style={[s.rowTime, isPR && s.rowTimePR]}>
                          {msToTimeString(r.result_time_ms)}
                        </Text>
                        {isPR && <Text style={s.prBadge}>PR</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4 },
  barDate: { fontSize: 8, color: "#94a3b8", marginTop: 3 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  rowLeft: { flex: 1, marginRight: 8 },
  rowDate: { fontSize: 12, color: "#94a3b8" },
  rowComp: { fontSize: 13, color: "#374151", marginTop: 1 },
  rowRight: { alignItems: "flex-end" },
  rowTime: { fontSize: 16, fontWeight: "700", color: "#374151" },
  rowTimePR: { color: "#22C55E" },
  prBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    overflow: "hidden",
  },
});
