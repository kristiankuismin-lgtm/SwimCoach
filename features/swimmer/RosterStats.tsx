import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius } from "@/constants/theme";

interface Props {
  totalKm: number;
  avgGoalPct: number;
  count: number;
}

/** The coach roster's season-summary strip (3 stat cards). Presentational. */
export function RosterStats({ totalKm, avgGoalPct, count }: Props) {
  return (
    <View style={styles.row}>
      <Stat label="Yhteensä uitu" value={totalKm} unit="km" />
      <Stat label="Tavoite keskim." value={avgGoalPct} unit="%" valueColor={color.primaryInk} />
      <Stat label="Uimareita" value={count} />
    </View>
  );
}

function Stat({ label, value, unit, valueColor }: { label: string; value: number; unit?: string; valueColor?: string }) {
  return (
    <View style={styles.card}>
      <Text variant="label">{label}</Text>
      <Text variant="statValue" color={valueColor} style={styles.value}>
        {value}
        {unit ? <Text variant="caption" color={color.inkFaint}>{` ${unit}`}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space.sm },
  card: {
    flex: 1,
    borderRadius: radius.md,
    padding: space.md,
    backgroundColor: color.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
  },
  value: { marginTop: 2 },
});
