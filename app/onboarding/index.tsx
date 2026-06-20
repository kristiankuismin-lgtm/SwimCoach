import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="mb-12">
        <Text className="text-5xl mb-4">🏊</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Tervetuloa SwimCoachiin
        </Text>
        <Text className="text-gray-500 text-base leading-6">
          Asetetaan ensin lähtötasosi ja vuositavoitteesi.
          Tämä kestää noin 2 minuuttia.
        </Text>
      </View>

      <View className="gap-3">
        <TouchableOpacity
          className="bg-brand rounded-2xl py-4 items-center"
          onPress={() => router.push("/onboarding/baseline")}
        >
          <Text className="text-white font-semibold text-base">Aloitetaan →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-4 items-center"
          onPress={() => router.replace("/swimmer")}
        >
          <Text className="text-gray-400 text-sm">Ohita toistaiseksi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
