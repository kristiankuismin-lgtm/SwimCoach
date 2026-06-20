import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCoachContext } from "@/hooks/useCoachContext";
import { getClubCompetitions } from "@/lib/queries/competitions";

const BRAND = "#0EA5E9";
const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  SM:             { bg: "#FEF9C3", text: "#A16207" },
  piiri:          { bg: "#DBEAFE", text: "#1D4ED8" },
  seura:          { bg: "#DCFCE7", text: "#15803D" },
  kansainvälinen: { bg: "#F3E8FF", text: "#7E22CE" },
};

export default function CompetitionsScreen() {
  const router = useRouter();
  const { clubId, ready } = useCoachContext();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!clubId) return;
    const { data } = await getClubCompetitions(clubId);
    if (data) setCompetitions(data);
  }

  useEffect(() => { if (ready) load(); }, [ready, clubId]);

  const byYear: Record<string, any[]> = {};
  for (const c of competitions) {
    const year = c.competition_date.slice(0, 4);
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(c);
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Kilpailut</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => router.push("/coach/competitions/new")}>
          <Text style={s.newBtnText}>+ Uusi kisa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        {competitions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyText}>Ei kilpailuja vielä.{"\n"}Lisää ensimmäinen kisa.</Text>
          </View>
        ) : (
          Object.entries(byYear).sort(([a],[b]) => Number(b)-Number(a)).map(([year, comps]) => (
            <View key={year} style={s.yearGroup}>
              <Text style={s.yearLabel}>{year}</Text>
              {comps.map(c => {
                const lc = LEVEL_COLORS[c.level] ?? { bg: "#F1F5F9", text: "#475569" };
                return (
                  <TouchableOpacity key={c.id} style={s.card} onPress={() => router.push(`/coach/competitions/${c.id}`)} activeOpacity={0.75}>
                    <View style={s.cardMain}>
                      <Text style={s.cardName}>{c.name}</Text>
                      <Text style={s.cardSub}>{c.competition_date}{c.location ? ` · ${c.location}` : ""}</Text>
                    </View>
                    <View style={s.cardRight}>
                      {c.level && (
                        <View style={[s.levelBadge, { backgroundColor: lc.bg }]}>
                          <Text style={[s.levelText, { color: lc.text }]}>{c.level}</Text>
                        </View>
                      )}
                      <Text style={s.chevron}>›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  newBtn: { backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  newBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#94A3B8", textAlign: "center", lineHeight: 22 },
  yearGroup: { marginBottom: 16 },
  yearLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 8,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardMain: { flex: 1, marginRight: 12 },
  cardName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  cardSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: "600" },
  chevron: { color: "#CBD5E1", fontSize: 18 },
});
