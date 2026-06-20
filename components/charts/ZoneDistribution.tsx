import { View, Text, StyleSheet } from "react-native";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { zonePct, type ZoneDistribution } from "@/lib/utils/zones";

interface Props {
  actual: ZoneDistribution;
  target?: Partial<Record<IntensityZone, number>>;
}

export function ZoneDistributionChart({ actual, target }: Props) {
  return (
    <View>
      {ZONE_ORDER.map((zone) => {
        const pct = zonePct(actual, zone);
        const { label, color, description } = ZONES[zone];
        const tgt = target?.[zone];
        return (
          <View key={zone} style={s.row}>
            <View style={s.labelRow}>
              <View style={[s.dot, { backgroundColor: color }]} />
              <Text style={s.zoneName}>{label}</Text>
              <Text style={s.zoneDesc}>{description}</Text>
            </View>
            <View style={s.rightCol}>
              <Text style={[s.pct, { color }]}>{pct}%{tgt != null ? ` / ${tgt}%` : ""}</Text>
              <View style={s.track}>
                <View style={[s.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
                {tgt != null && (
                  <View style={[s.marker, { left: `${tgt}%` as any }]} />
                )}
              </View>
            </View>
          </View>
        );
      })}
      <Text style={s.total}>Yhteensä {Math.round(actual.total / 1000 * 10) / 10} km</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { marginBottom: 14 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  zoneDesc: { fontSize: 11, color: "#94A3B8" },
  rightCol: {},
  pct: { fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 3 },
  track: { height: 7, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" },
  fill: { height: 7, borderRadius: 4 },
  marker: { position: "absolute", top: 0, width: 2, height: 7, backgroundColor: "#64748B", opacity: 0.6 },
  total: { fontSize: 11, color: "#94A3B8", textAlign: "right", marginTop: 4 },
});
