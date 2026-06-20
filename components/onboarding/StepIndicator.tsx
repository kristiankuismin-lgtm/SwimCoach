import { View, Text } from "react-native";

interface Props {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: Props) {
  return (
    <View className="flex-row items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < current ? "bg-brand" : i === current ? "bg-brand opacity-40" : "bg-gray-200"
          }`}
        />
      ))}
      <Text className="text-xs text-gray-400 ml-1">{current + 1}/{total}</Text>
    </View>
  );
}
