import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PaceClock } from "@/components/ui/PaceClock";
import { Text } from "@/components/ui/Text";
import { SwimmerDetail } from "@/features/swimmer/SwimmerDetail";
import { useSwimmerProfile, useTimeProgression, useSwimmerSeasonDetail } from "@/lib/queries/swimmers";
import { seasonProgress } from "@/lib/utils/season";
import { color } from "@/constants/theme";

export default function SwimmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const year = new Date().getFullYear();

  const profileQ = useSwimmerProfile(id);
  const progressionQ = useTimeProgression(id);
  const detailQ = useSwimmerSeasonDetail(id, year);

  if (profileQ.isLoading) {
    return <View style={styles.center}><PaceClock size={48} /></View>;
  }

  if (profileQ.isError || !profileQ.data) {
    return (
      <View style={styles.center}>
        <Text variant="body" color={color.inkMuted}>Uimaria ei löytynyt.</Text>
      </View>
    );
  }

  return (
    <SwimmerDetail
      profile={profileQ.data}
      summary={detailQ.data ?? null}
      progression={progressionQ.data ?? []}
      year={year}
      seasonProgress={seasonProgress(new Date())}
      onBack={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg, gap: 12 },
});
