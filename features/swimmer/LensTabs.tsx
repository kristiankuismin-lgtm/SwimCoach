import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { LENSES, type LensKey } from "@/features/swimmer/swimmer-card.lib";
import { color, space, radius } from "@/constants/theme";

interface Props {
  value: LensKey;
  onChange: (lens: LensKey) => void;
}

/** The roster lens: pick what to rank + headline the cards by. Presentational. */
export function LensTabs({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {LENSES.map((l) => {
          const active = value === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              onPress={() => onChange(l.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text variant="caption" color={active ? color.onPrimary : color.inkMuted}>{l.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space.sm },
  chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: color.bg },
  chipActive: { backgroundColor: color.ink },
});
