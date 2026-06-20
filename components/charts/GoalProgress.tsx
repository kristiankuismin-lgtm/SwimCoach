import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export function GoalProgress({ label, current, target, unit = "" }: Props) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const color = pct >= 80 ? "#22C55E" : pct >= 50 ? "#EAB308" : "#3B82F6";
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.right}>
          {current}{unit} / {target}{unit}{" "}
          <Text style={[s.pct, { color }]}>{Math.round(pct)}%</Text>
        </Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151" },
  right: { fontSize: 13, color: "#6B7280" },
  pct: { fontWeight: "700" },
  track: { height: 7, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden" },
  fill: { height: 7, borderRadius: 4 },
});
