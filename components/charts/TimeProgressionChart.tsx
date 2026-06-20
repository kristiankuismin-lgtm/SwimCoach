import { View, Text, ScrollView } from "react-native";
import { msToTimeString, improvementPct } from "@/lib/utils/time";

interface DataPoint {
  date?: string;
  competition_date?: string;
  result_time_ms: number;
  competition_name: string;
  is_personal_best?: boolean;
}

interface Props {
  data: DataPoint[];
  baseline_ms?: number;
  label?: string;
}

export function TimeProgressionChart({ data, baseline_ms, label }: Props) {
  if (data.length === 0) {
    return (
      <View className="py-6 items-center">
        <Text className="text-gray-300 text-sm">Ei kisatuloksia vielä</Text>
      </View>
    );
  }

  const times = data.map(d => d.result_time_ms);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times, baseline_ms ?? 0);
  const range = maxTime - minTime || 1;
  const chartH = 80;

  return (
    <View>
      <Text className="text-xs font-semibold text-gray-500 mb-3">{label}</Text>

      {/* Graafi */}
      <View style={{ height: chartH + 24 }} className="mb-2">
        <View className="flex-row items-end gap-1" style={{ height: chartH }}>
          {data.map((d, i) => {
            const barH = Math.max(8, ((maxTime - d.result_time_ms) / range) * chartH);
            const isPR = d.result_time_ms === minTime;
            return (
              <View key={i} className="flex-1 items-center">
                <View
                  style={{ height: barH, backgroundColor: isPR ? "#22C55E" : "#0EA5E9" }}
                  className="w-full rounded-t-md opacity-80"
                />
              </View>
            );
          })}
        </View>
        {/* Päivämäärä-akseli */}
        <View className="flex-row gap-1 mt-1">
          {data.map((d, i) => (
            <Text key={i} className="flex-1 text-center text-gray-300"
              style={{ fontSize: 8 }} numberOfLines={1}>
              {(d.competition_date || d.date || "").slice(5)}
            </Text>
          ))}
        </View>
      </View>

      {/* Tuloshistoria */}
      {data.slice().reverse().slice(0, 5).map((d, i) => {
        const isPR = d.result_time_ms === minTime;
        const vsBaseline = baseline_ms ? improvementPct(baseline_ms, d.result_time_ms) : null;
        return (
          <View key={i} className="flex-row items-center py-2 border-b border-gray-50">
            <Text className="text-xs text-gray-400 w-20">{d.competition_date || d.date}</Text>
            <Text className="flex-1 text-xs text-gray-500 mx-2" numberOfLines={1}>
              {d.competition_name}
            </Text>
            <Text className={`font-bold text-sm ${isPR ? "text-green-500" : "text-gray-700"}`}>
              {msToTimeString(d.result_time_ms)}
            </Text>
            {isPR && <Text className="text-xs text-green-400 ml-1">PR</Text>}
            {vsBaseline != null && vsBaseline > 0 && (
              <Text className="text-xs text-green-500 ml-2">−{vsBaseline}%</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
