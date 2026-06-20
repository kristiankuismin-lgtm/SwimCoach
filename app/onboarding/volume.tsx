import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
}

function GoalField({ label, hint, value, onChange, unit, placeholder }: FieldProps) {
  return (
    <View className="mb-5">
      <Text className="font-semibold text-gray-800 mb-1">{label}</Text>
      <Text className="text-xs text-gray-400 mb-2">{hint}</Text>
      <View className="flex-row items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
        <TextInput
          className="flex-1 px-4 py-3 text-base"
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder={placeholder}
        />
        <View className="px-4 py-3 bg-gray-50">
          <Text className="text-gray-500 font-medium">{unit}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VolumeScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="px-6 pt-14 pb-6">
        <StepIndicator current={1} total={4} />
        <Text className="text-2xl font-bold text-gray-900 mb-1">Volyymitavoite</Text>
        <Text className="text-gray-500 mb-8">
          Kuinka paljon haluat harjoitella tällä kaudella?
        </Text>

        <GoalField
          label="Uintimetrit"
          hint="Esim. 400 km on noin 5 harjoitusta viikossa"
          value={data.targetPoolKm}
          onChange={v => setData({ targetPoolKm: v })}
          unit="km"
          placeholder="esim. 400"
        />
        <GoalField
          label="Kuivaharjoittelu"
          hint="Kaikki salitreenit, joustavuus, koordinaatio"
          value={data.targetDrylandHours}
          onChange={v => setData({ targetDrylandHours: v })}
          unit="h"
          placeholder="esim. 60"
        />
        <GoalField
          label="Harjoituskerrat"
          hint="Yhteensä uinti + kuiva"
          value={data.targetWorkouts}
          onChange={v => setData({ targetWorkouts: v })}
          unit="krt"
          placeholder="esim. 200"
        />

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 py-4 items-center border border-gray-200 rounded-2xl"
            onPress={() => router.back()}
          >
            <Text className="text-gray-600 font-medium">← Takaisin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-brand py-4 items-center rounded-2xl"
            onPress={() => router.push("/onboarding/zones")}
          >
            <Text className="text-white font-semibold">Seuraava →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
