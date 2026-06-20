import { View, Text, StyleSheet } from "react-native";

interface WeekData {
  week: string;
  pool_m: number;
  dryland_min: number;
}

interface Props {
  weeks: WeekData[];
}

export function WeeklyVolumeChart({ weeks }: Props) {
  if (weeks.length === 0) return null;
  const maxM = Math.max(...weeks.map(w => w.pool_m), 1);
  const chartH = 60;

  return (
    <View>
      <View style={[s.barsRow, { height: chartH }]}>
        {weeks.map((w, i) => {
          const barH = Math.max(4, (w.pool_m / maxM) * chartH);
          const isLatest = i === weeks.length - 1;
          return (
            <View key={i} style={s.barCol}>
              <Text style={s.barLabel}>
                {w.pool_m > 0 ? String(Math.round(w.pool_m / 100) / 10) : ""}
              </Text>
              <View
                style={[
                  s.bar,
                  { height: barH, backgroundColor: isLatest ? "#0EA5E9" : "#BFDBFE" },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={s.labelRow}>
        {weeks.map((w, i) => (
          <Text key={i} style={s.weekLabel}>{w.week}</Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barLabel: { fontSize: 8, color: "#D1D5DB", marginBottom: 2 },
  bar: { width: "100%", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  labelRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  weekLabel: { flex: 1, textAlign: "center", fontSize: 8, color: "#D1D5DB" },
});
