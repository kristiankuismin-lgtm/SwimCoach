import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <Text style={s.emoji}>🏊</Text>
        <Text style={s.title}>Tervetuloa SwimCoachiin</Text>
        <Text style={s.subtitle}>
          Asetetaan ensin lähtötasosi ja vuositavoitteesi.{" "}
          Tämä kestää noin 2 minuuttia.
        </Text>
      </View>

      <View style={s.buttons}>
        <TouchableOpacity
          style={s.primary}
          onPress={() => router.push("/onboarding/baseline")}
        >
          <Text style={s.primaryText}>Aloitetaan →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondary}
          onPress={() => router.replace("/swimmer")}
        >
          <Text style={s.secondaryText}>Ohita toistaiseksi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, justifyContent: "center" },
  hero: { marginBottom: 48 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: "700", color: "#111827", marginBottom: 12 },
  subtitle: { color: "#6B7280", fontSize: 16, lineHeight: 24 },
  buttons: { gap: 12 },
  primary: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  secondary: { paddingVertical: 16, alignItems: "center" },
  secondaryText: { color: "#9CA3AF", fontSize: 14 },
});
