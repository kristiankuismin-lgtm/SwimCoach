import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function GoalScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="px-6 pt-14 pb-8">
        <StepIndicator current={3} total={4} />
        <Text className="text-2xl font-bold text-gray-900 mb-1">Kisatavoite</Text>
        <Text className="text-gray-500 mb-8">
          Mikä on tärkein kilpailutavoitteesi tälle kaudelle?
        </Text>

        {/* Laji */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Laji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-2">
            {STROKE_LIST.map(([s, info]) => (
              <TouchableOpacity
                key={s}
                onPress={() => setData({ goalStroke: s })}
                className={`px-4 py-2.5 rounded-xl border ${
                  data.goalStroke === s ? "bg-brand border-brand" : "bg-white border-gray-200"
                }`}
              >
                <Text className={`font-medium ${data.goalStroke === s ? "text-white" : "text-gray-700"}`}>
                  {info.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Matka */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Matka</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {RACE_DISTANCES.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setData({ goalDistance: d })}
              className={`px-4 py-2.5 rounded-xl border ${
                data.goalDistance === d ? "bg-brand border-brand" : "bg-white border-gray-200"
              }`}
            >
              <Text className={`font-medium ${data.goalDistance === d ? "text-white" : "text-gray-700"}`}>
                {d}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tavoiteaika */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Tavoiteaika</Text>
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-white mb-2"
          placeholder="esim. 2:05.00 tai 58.50"
          value={data.goalTimeString}
          onChangeText={v => setData({ goalTimeString: v })}
          keyboardType="numeric"
        />
        <Text className="text-xs text-gray-400 mb-8">
          Formaatti: minuutit:sekunnit.sadasosat
        </Text>

        {/* Navigointi */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 py-4 items-center border border-gray-200 rounded-2xl"
            onPress={() => router.back()}
          >
            <Text className="text-gray-600 font-medium">← Takaisin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-brand py-4 items-center rounded-2xl"
            onPress={() => router.push("/onboarding/done")}
          >
            <Text className="text-white font-semibold">Valmis →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
