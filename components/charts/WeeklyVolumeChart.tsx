import { View, Text } from "react-native";

interface WeekData {
  week: string;   // "vk 22"
  pool_m: number;
  dryland_min: number;
}

interface Props {
  weeks: WeekData[];
}

export function WeeklyVolumeChart({ weeks }: Props) {
  if (weeks.length === 0) return null;
  const maxM = Math.max(...weeks.map(w => w.pool_m), 1);
  const chartH = 60;

  return (
    <View>
      <View className="flex-row items-end gap-1.5" style={{ height: chartH }}>
        {weeks.map((w, i) => {
          const barH = Math.max(4, (w.pool_m / maxM) * chartH);
          const isLatest = i === weeks.length - 1;
          return (
            <View key={i} className="flex-1 items-center justify-end">
              <Text className="text-gray-300 mb-0.5" style={{ fontSize: 8 }}>
                {w.pool_m > 0 ? `${Math.round(w.pool_m / 100) / 10}` : ""}
              </Text>
              <View
                style={{ height: barH, backgroundColor: isLatest ? "#0EA5E9" : "#BFDBFE" }}
                className="w-full rounded-t-md"
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row gap-1.5 mt-1">
        {weeks.map((w, i) => (
          <Text key={i} className="flex-1 text-center text-gray-300" style={{ fontSize: 8 }}>
            {w.week}
          </Text>
        ))}
      </View>
    </View>
  );
}
