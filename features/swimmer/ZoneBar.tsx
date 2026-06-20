import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { radius } from "@/constants/theme";

interface Props {
  /** Per-zone weight (% or metres); segments are proportional, zeros dropped. */
  weights: Record<IntensityZone, number>;
  /** Bar height; defaults to the card/hero thickness. */
  thickness?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The PK→MAK intensity split as one proportional heat-ramp bar. Shared by the
 * roster card (under the harjoitukset hero) and the detail page's zone plan.
 */
export function ZoneBar({ weights, thickness = 8, style }: Props) {
  const segments = ZONE_ORDER.filter((z) => weights[z] > 0);
  if (segments.length === 0) return null;
  return (
    <View style={[styles.row, { height: thickness }, style]}>
      {segments.map((z) => (
        <View key={z} style={{ flex: weights[z], height: thickness, backgroundColor: ZONES[z].color }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderRadius: radius.pill, overflow: "hidden", gap: 1.5 },
});
