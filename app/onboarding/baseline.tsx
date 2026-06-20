import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import type { BaselineResult } from "@/types/onboarding";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function BaselineScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  const [stroke, setStroke] = useState<SwimStroke>("vapaa");
  const [distance, setDistance] = useState<RaceDistance>(100);
  const [time, setTime] = useState("");

  function addResult() {
    if (!time.trim()) { Alert.alert("Syötä aika"); return; }
    const exists = data.baselines.find(
      b => b.stroke === stroke && b.distance === distance
    );
    if (exists) {
      Alert.alert("Tämä laji+matka on jo lisätty", "Poista ensin aiempi tulos.");
      return;
    }
    const result: BaselineResult = {
      id: Date.now().toString(),
      stroke, distance,
      timeString: time,
    };
    setData({ baselines: [...data.baselines, result] });
    setTime("");
  }

  function remove(id: string) {
    setData({ baselines: data.baselines.filter(b => b.id !== id) });
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="px-6 pt-14 pb-6">
        <StepIndicator current={0} total={4} />
        <Text className="text-2xl font-bold text-gray-900 mb-1">Lähtötaso</Text>
        <Text className="text-gray-500 mb-6">
          Lisää aiemmat kisatuloksesi. Näitä käytetään kehityksesi mittaamiseen.
        </Text>

        {/* Lisätyt tulokset */}
        {data.baselines.length > 0 && (
          <View className="mb-6">
            {data.baselines.map(b => (
              <View key={b.id} className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="flex-1 font-medium text-gray-800">
                  {b.distance}m {STROKES[b.stroke].label}
                </Text>
                <Text className="text-brand font-bold mr-4">{b.timeString}</Text>
                <TouchableOpacity onPress={() => remove(b.id)}>
                  <Text className="text-red-400 text-lg">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Uuden tuloksen syöttö */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="font-semibold text-gray-700 mb-3">Lisää tulos</Text>

          {/* Laji */}
          <Text className="text-xs text-gray-500 mb-2">Uintilaji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {STROKE_LIST.map(([s, info]) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStroke(s)}
                  className={`px-4 py-2 rounded-xl border ${
                    stroke === s
                      ? "bg-brand border-brand"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text className={`font-medium text-sm ${stroke === s ? "text-white" : "text-gray-700"}`}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Matka */}
          <Text className="text-xs text-gray-500 mb-2">Matka</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {RACE_DISTANCES.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDistance(d)}
                className={`px-4 py-2 rounded-xl border ${
                  distance === d
                    ? "bg-brand border-brand"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text className={`font-medium text-sm ${distance === d ? "text-white" : "text-gray-700"}`}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Aika */}
          <Text className="text-xs text-gray-500 mb-2">Aika (esim. 1:02.45 tai 58.30)</Text>
          <View className="flex-row gap-3">
            <TextInput
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white text-base"
              placeholder="mm:ss.hh"
              value={time}
              onChangeText={setTime}
              keyboardType="numeric"
            />
            <TouchableOpacity
              className="bg-brand rounded-xl px-5 items-center justify-center"
              onPress={addResult}
            >
              <Text className="text-white font-semibold">+</Text>
            </TouchableOpacity>
          </View>
        </View>

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
            onPress={() => router.push("/onboarding/volume")}
          >
            <Text className="text-white font-semibold">
              {data.baselines.length === 0 ? "Ohita →" : "Seuraava →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
