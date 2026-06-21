import { View, StyleSheet, type StyleProp, type ViewStyle, type DimensionValue } from "react-native";
import { type TrackTone } from "@/features/swimmer/swimmer-card.lib";
import { color, radius } from "@/constants/theme";

const TONE_COLOR: Record<TrackTone, string> = {
  good: color.good,
  warn: color.warn,
  risk: color.risk,
  default: color.inkFaint,
};

const clampPct = (p: number) => Math.min(Math.max(p, 0), 100);

interface Props {
  /** Fill — the season-goal completion %, clamped to 0–100. */
  pct: number;
  /** Optional marker — where the season clock says they should be (the tavoitetahti). */
  markerPct?: number;
  /** Track tone, drives the fill color (good/warn/risk). */
  tone: TrackTone;
  /** Bar height; defaults to the detail-hero thickness. */
  thickness?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The season-goal pace bar: a fill (how far toward the goal) over a marker (where
 * the season clock says they should be). The gap between the two is the at-a-glance
 * ahead/behind read. Shared by the roster card and the detail hero so they never drift.
 */
export function PaceBar({ pct, markerPct, tone, thickness = 8, style }: Props) {
  return (
    <View style={[styles.track, { height: thickness }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clampPct(pct)}%` as DimensionValue, height: thickness, backgroundColor: TONE_COLOR[tone] },
        ]}
      />
      {markerPct != null && (
        <View style={[styles.marker, { left: `${clampPct(markerPct)}%` as DimensionValue }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: color.bg, borderRadius: radius.pill, overflow: "hidden", position: "relative" },
  fill: { borderRadius: radius.pill },
  marker: { position: "absolute", top: -2, bottom: -2, width: 2, backgroundColor: color.ink, borderRadius: 1 },
});
