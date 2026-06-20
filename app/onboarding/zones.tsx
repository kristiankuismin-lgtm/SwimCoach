import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

const ZONE_KEYS = {
  pk: "targetPctPk",
  vk: "targetPctVk",
  mk: "targetPctMk",
  mak: "targetPctMak",
} as const;

export default function ZonesScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  const total = data.targetPctPk + data.targetPctVk + data.targetPctMk + data.targetPctMak;
  const remaining = 100 - total;

  function adjust(zone: IntensityZone, delta: number) {
    const key = ZONE_KEYS[zone];
    const current = data[key];
    const next = Math.max(0, Math.min(100, current + delta));
    setData({ [key]: next } as any);
  }

  return (
    <View className="flex-1 bg-white px-6 pt-14">
      <StepIndicator current={2} total={4} />
      <Text className="text-2xl font-bold text-gray-900 mb-1">Tehoaluejakauma</Text>
      <Text className="text-gray-500 mb-2">
        Miten harjoittelusi jakautuu tehoalueille? Summan tulee olla 100%.
      </Text>

      {/* Jäljellä-indikaattori */}
      <View className={`rounded-xl px-4 py-2 mb-6 ${total === 100 ? "bg-green-50" : "bg-amber-50"}`}>
        <Text className={`text-sm font-medium ${total === 100 ? "text-green-700" : "text-amber-700"}`}>
          {total === 100
            ? "✓ Jakauma täynnä"
            : total < 100
            ? `Jäljellä ${remaining}% jaettavaksi`
            : `Ylitetty ${-remaining}% — vähennä jostakin`}
        </Text>
      </View>

      {/* Visualisointi */}
      <View className="flex-row h-4 rounded-full overflow-hidden mb-6">
        {ZONE_ORDER.map(z => {
          const pct = data[ZONE_KEYS[z]];
          return pct > 0 ? (
            <View key={z} style={{ flex: pct, backgroundColor: ZONES[z].color }} />
          ) : null;
        })}
        {remaining > 0 && <View style={{ flex: remaining, backgroundColor: "#E5E7EB" }} />}
      </View>

      {/* Säätö per tehoalue */}
      {ZONE_ORDER.map(zone => {
        const { label, color, description } = ZONES[zone];
        const value = data[ZONE_KEYS[zone]];
        return (
          <View key={zone} className="flex-row items-center mb-4">
            <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color }} />
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{label}</Text>
              <Text className="text-xs text-gray-400">{description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => adjust(zone, -5)}
              className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">−</Text>
            </TouchableOpacity>
            <Text className="w-12 text-center font-bold text-base" style={{ color }}>
              {value}%
            </Text>
            <TouchableOpacity
              onPress={() => adjust(zone, 5)}
              className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">+</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View className="flex-row gap-3 mt-auto pb-8">
        <TouchableOpacity
          className="flex-1 py-4 items-center border border-gray-200 rounded-2xl"
          onPress={() => router.back()}
        >
          <Text className="text-gray-600 font-medium">← Takaisin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center rounded-2xl ${total === 100 ? "bg-brand" : "bg-gray-300"}`}
          onPress={() => total === 100 && router.push("/onboarding/goal")}
          disabled={total !== 100}
        >
          <Text className="text-white font-semibold">Seuraava →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
