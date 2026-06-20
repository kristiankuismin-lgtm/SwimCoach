import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCompetitionWithResults, upsertCompetitionResult, updatePersonalRecord } from "@/lib/queries/competitions";
import { getSwimmerSeasonSummary } from "@/lib/queries/swimmers";
import { useCoachContext } from "@/hooks/useCoachContext";
import { timeStringToMs, msToTimeString, improvementPct } from "@/lib/utils/time";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

interface ResultEntry {
  swimmerId: string;
  swimmerName: string;
  stroke: SwimStroke;
  distance: RaceDistance;
  timeString: string;
  placeOverall?: string;
  existingMs?: number;       // aiempi PR
  baselineMs?: number;       // lähtötaso
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clubId } = useCoachContext();

  const [competition, setCompetition] = useState<any>(null);
  const [swimmers, setSwimmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modaali uuden tuloksen syöttöön
  const [modalVisible, setModalVisible] = useState(false);
  const [entry, setEntry] = useState<Partial<ResultEntry>>({
    stroke: "vapaa",
    distance: 100,
    timeString: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCompetitionWithResults(id).then(({ data }) => setCompetition(data)),
      clubId
        ? getSwimmerSeasonSummary(clubId).then(({ data }) => setSwimmers(data ?? []))
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [id, clubId]);

  function openModal(swimmerId?: string, swimmerName?: string) {
    setEntry({
      swimmerId,
      swimmerName,
      stroke: "vapaa",
      distance: 100,
      timeString: "",
      placeOverall: "",
    });
    setModalVisible(true);
  }

  async function saveResult() {
    if (!entry.swimmerId || !entry.timeString?.trim()) {
      Alert.alert("Täytä kaikki pakolliset kentät"); return;
    }
    const timeMs = timeStringToMs(entry.timeString);
    if (timeMs <= 0) { Alert.alert("Tarkista aika-formaatti (esim. 1:02.45)"); return; }

    setSaving(true);
    try {
      // 1. Tallenna kilpailutulos
      await upsertCompetitionResult({
        competition_id: id!,
        swimmer_id: entry.swimmerId!,
        stroke: entry.stroke!,
        distance: String(entry.distance),
        result_time_ms: timeMs,
        place_overall: entry.placeOverall ? parseInt(entry.placeOverall) : undefined,
      });

      // 2. Päivitä PR automaattisesti jos parempi aika
      await updatePersonalRecord(
        entry.swimmerId!,
        entry.stroke!,
        String(entry.distance),
        timeMs,
        competition.competition_date,
        id!
      );

      // 3. Päivitä näkymä
      const { data } = await getCompetitionWithResults(id!);
      setCompetition(data);
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Virhe tallennuksessa", e?.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );

  const results = competition?.competition_results ?? [];

  // Ryhmittele tulokset uimarin mukaan
  const bySwimmer: Record<string, { name: string; results: any[] }> = {};
  for (const r of results) {
    const sid = r.swimmer_id;
    if (!bySwimmer[sid]) bySwimmer[sid] = { name: r.swimmers?.full_name ?? "—", results: [] };
    bySwimmer[sid].results.push(r);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-brand text-sm">← Kilpailut</Text>
        </TouchableOpacity>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-xl font-bold text-gray-900">{competition?.name}</Text>
            <Text className="text-gray-400 text-sm mt-0.5">
              {competition?.competition_date}
              {competition?.location ? ` · ${competition.location}` : ""}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-brand px-3 py-2 rounded-xl"
            onPress={() => openModal()}
          >
            <Text className="text-white font-semibold text-sm">+ Tulos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Pikavalinnat: uimarit joilta puuttuu tulos */}
        {swimmers.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs text-gray-400 mb-2 font-medium">LISÄÄ TULOS UIMARILLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {swimmers.map(s => (
                  <TouchableOpacity
                    key={s.swimmer_id}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2"
                    onPress={() => openModal(s.swimmer_id, s.full_name)}
                  >
                    <Text className="text-sm font-medium text-gray-700">{s.full_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tulokset uimarittain */}
        {Object.keys(bySwimmer).length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <Text className="text-3xl mb-2">📋</Text>
            <Text className="text-gray-400 text-sm text-center">
              Ei tuloksia vielä.{"\n"}Lisää ensimmäinen tulos yllä.
            </Text>
          </View>
        ) : (
          Object.entries(bySwimmer).map(([sid, { name, results: sResults }]) => (
            <View key={sid} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <Text className="font-semibold text-base mb-3">{name}</Text>
              {sResults.map((r: any) => {
                const isPR = r.is_personal_best;
                const label = `${r.distance}m ${STROKES[r.stroke as SwimStroke]?.short ?? r.stroke}`;
                return (
                  <View key={r.id} className="flex-row items-center py-2.5 border-b border-gray-50">
                    <Text className="flex-1 text-sm text-gray-700">{label}</Text>
                    {r.place_overall && (
                      <Text className="text-xs text-gray-400 mr-3">#{r.place_overall}</Text>
                    )}
                    <Text className={`font-bold text-sm ${isPR ? "text-green-500" : "text-brand"}`}>
                      {msToTimeString(r.result_time_ms)}
                    </Text>
                    {isPR && <Text className="text-xs text-green-400 ml-1">PR</Text>}
                  </View>
                );
              })}
              <TouchableOpacity
                className="mt-2 py-1.5 items-center"
                onPress={() => openModal(sid, name)}
              >
                <Text className="text-brand text-sm">+ Lisää suoritus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Tuloksen syöttömodaali */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-8 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Lisää tulos</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-400 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Uimarin valinta jos ei valittu pikakuvakkeesta */}
            {!entry.swimmerId ? (
              <>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Uimari</Text>
                <ScrollView className="mb-5" style={{ maxHeight: 180 }}>
                  {swimmers.map(s => (
                    <TouchableOpacity
                      key={s.swimmer_id}
                      className="py-3 border-b border-gray-100"
                      onPress={() => setEntry(e => ({ ...e, swimmerId: s.swimmer_id, swimmerName: s.full_name }))}
                    >
                      <Text className="text-base text-gray-700">{s.full_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <View className="bg-blue-50 rounded-xl px-4 py-3 mb-5 flex-row items-center justify-between">
                <Text className="font-semibold text-blue-700">{entry.swimmerName}</Text>
                <TouchableOpacity onPress={() => setEntry(e => ({ ...e, swimmerId: undefined, swimmerName: undefined }))}>
                  <Text className="text-blue-400 text-sm">vaihda</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Laji */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">Laji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {STROKE_LIST.map(([s, info]) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setEntry(e => ({ ...e, stroke: s }))}
                    className={`px-4 py-2.5 rounded-xl border ${
                      entry.stroke === s ? "bg-brand border-brand" : "bg-white border-gray-200"
                    }`}
                  >
                    <Text className={`font-medium text-sm ${entry.stroke === s ? "text-white" : "text-gray-700"}`}>
                      {info.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Matka */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">Matka</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {RACE_DISTANCES.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setEntry(e => ({ ...e, distance: d }))}
                  className={`px-4 py-2.5 rounded-xl border ${
                    entry.distance === d ? "bg-brand border-brand" : "bg-white border-gray-200"
                  }`}
                >
                  <Text className={`font-medium ${entry.distance === d ? "text-white" : "text-gray-700"}`}>
                    {d}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Aika */}
            <Text className="text-sm font-semibold text-gray-700 mb-1">Aika *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base mb-4 bg-white"
              placeholder="esim. 2:05.34 tai 58.22"
              value={entry.timeString}
              onChangeText={v => setEntry(e => ({ ...e, timeString: v }))}
              keyboardType="numeric"
              autoFocus
            />

            {/* Sijoitus */}
            <Text className="text-sm font-semibold text-gray-700 mb-1">Sijoitus (valinnainen)</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base mb-6 bg-white"
              placeholder="esim. 3"
              value={entry.placeOverall}
              onChangeText={v => setEntry(e => ({ ...e, placeOverall: v }))}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${
                entry.swimmerId && entry.timeString ? "bg-brand" : "bg-gray-200"
              }`}
              onPress={saveResult}
              disabled={saving || !entry.swimmerId || !entry.timeString}
            >
              {saving
                ? <ActivityIndicator color="white" />
                : <Text className={`font-bold text-base ${entry.swimmerId && entry.timeString ? "text-white" : "text-gray-400"}`}>
                    Tallenna tulos
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
