import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { upsertYearlyGoal } from "@/lib/queries/goals";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { timeStringToMs } from "@/lib/utils/time";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingDone() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, reset } = useOnboardingStore();
  const [status, setStatus] = useState<"saving" | "done" | "error">("saving");

  useEffect(() => {
    save();
  }, []);

  async function save() {
    try {
      // Hae swimmer_id käyttäjältä
      const { data: swimmer } = await supabase
        .from("swimmers")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!swimmer) throw new Error("Uimaria ei löydy");

      const year = new Date().getFullYear();

      // 1. Tallenna vuositavoite
      await upsertYearlyGoal({
        swimmer_id: swimmer.id,
        season_year: year,
        target_pool_km: data.targetPoolKm ? parseFloat(data.targetPoolKm) : undefined,
        target_dryland_hours: data.targetDrylandHours ? parseFloat(data.targetDrylandHours) : undefined,
        target_workouts: data.targetWorkouts ? parseInt(data.targetWorkouts) : undefined,
        target_pct_pk: data.targetPctPk,
        target_pct_vk: data.targetPctVk,
        target_pct_mk: data.targetPctMk,
        target_pct_mak: data.targetPctMak,
        target_stroke: data.goalStroke,
        target_distance: String(data.goalDistance),
        target_time_ms: data.goalTimeString ? timeStringToMs(data.goalTimeString) : undefined,
      });

      // 2. Tallenna lähtötason kisatulokset henkilökohtaisina ennätyksinä
      if (data.baselines.length > 0) {
        await supabase.from("personal_records").upsert(
          data.baselines.map(b => ({
            swimmer_id: swimmer.id,
            stroke: b.stroke,
            distance: String(b.distance),
            best_time_ms: timeStringToMs(b.timeString),
            set_at: new Date().toISOString().split("T")[0],
            is_baseline: true,
          })),
          { onConflict: "swimmer_id,stroke,distance" }
        );
      }

      // 3. Merkitse onboarding tehdyksi
      await supabase
        .from("swimmers")
        .update({ onboarding_done: true })
        .eq("id", swimmer.id);

      setStatus("done");
      reset();

      // Siirry dashboardille pienen viiveen jälkeen
      setTimeout(() => router.replace("/swimmer"), 1500);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {status === "saving" && (
        <>
          <ActivityIndicator size="large" color="#0EA5E9" className="mb-4" />
          <Text className="text-gray-500">Tallennetaan tietojasi...</Text>
        </>
      )}
      {status === "done" && (
        <>
          <Text className="text-6xl mb-6">🎯</Text>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Kaikki valmista!</Text>
          <Text className="text-gray-500 text-center">
            Lähtötasosi ja tavoitteesi on tallennettu. Hyvää kautta!
          </Text>
        </>
      )}
      {status === "error" && (
        <>
          <Text className="text-5xl mb-4">⚠️</Text>
          <Text className="text-gray-700 font-semibold mb-2">Tallennus epäonnistui</Text>
          <Text className="text-gray-400 text-sm text-center">
            Tarkista nettiyhteys ja yritä uudelleen.
          </Text>
        </>
      )}
    </View>
  );
}
