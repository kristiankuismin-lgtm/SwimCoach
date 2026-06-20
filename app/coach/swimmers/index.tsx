import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCoachContext } from "@/hooks/useCoachContext";
import { getSwimmerSeasonSummary } from "@/lib/queries/swimmers";

const BRAND = "#0EA5E9";
const AVATAR_COLORS = ["#0EA5E9","#8B5CF6","#EC4899","#F59E0B","#10B981","#EF4444"];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

type SortKey = "name" | "goal" | "workouts";

export default function SwimmersListScreen() {
  const router = useRouter();
  const { clubId, ready } = useCoachContext();
  const [swimmers, setSwimmers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    if (ready && clubId) {
      getSwimmerSeasonSummary(clubId).then(({ data }) => {
        if (data) setSwimmers(data);
      });
    }
  }, [ready, clubId]);

  const filtered = swimmers
    .filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "goal") return (b.goal_pool_pct ?? 0) - (a.goal_pool_pct ?? 0);
      if (sort === "workouts") return (b.total_workouts ?? 0) - (a.total_workouts ?? 0);
      return a.full_name.localeCompare(b.full_name, "fi");
    });

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Uimarit</Text>
        <TextInput
          style={s.search}
          placeholder="Hae nimellä..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <View style={s.sortRow}>
          {(["name","goal","workouts"] as SortKey[]).map(k => (
            <TouchableOpacity key={k} style={[s.sortBtn, sort === k && s.sortBtnActive]} onPress={() => setSort(k)}>
              <Text style={[s.sortText, sort === k && s.sortTextActive]}>
                {k === "name" ? "A–Z" : k === "goal" ? "Tavoite %" : "Harjoitukset"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filtered.map(sw => {
          const km = Math.round((sw.total_pool_m ?? 0) / 100) / 10;
          const targetKm = Math.round((sw.target_pool_m ?? 0) / 100) / 10;
          const pct = targetKm > 0 ? Math.min(Math.round((km / targetKm) * 100), 100) : null;
          const color = pct == null ? "#9CA3AF" : pct >= 80 ? "#22C55E" : pct >= 50 ? "#EAB308" : "#EF4444";
          const bg = avatarColor(sw.full_name);
          return (
            <TouchableOpacity key={sw.swimmer_id} style={s.row} onPress={() => router.push(`/coach/swimmers/${sw.swimmer_id}`)} activeOpacity={0.7}>
              <View style={[s.avatar, { backgroundColor: bg }]}>
                <Text style={s.avatarText}>{initials(sw.full_name)}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{sw.full_name}</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${pct ?? 0}%` as any, backgroundColor: color }]} />
                </View>
              </View>
              <View style={s.stats}>
                <Text style={[s.pct, { color }]}>{pct ?? "—"}%</Text>
                <Text style={s.sub}>{km} / {targetKm} km</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
  search: { backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: "#0F172A", marginBottom: 10 },
  sortRow: { flexDirection: "row", gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#F1F5F9" },
  sortBtnActive: { backgroundColor: "#0F172A" },
  sortText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  sortTextActive: { color: "#fff" },

  list: { flex: 1 },
  listContent: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 38, height: 38, borderRadius: 10, alignItems: "center",
    justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 6 },
  barTrack: { height: 4, backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  stats: { alignItems: "flex-end", marginRight: 8 },
  pct: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  chevron: { color: "#CBD5E1", fontSize: 18 },
});
