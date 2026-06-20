import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={s.iconWrap}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
    </View>
  );
}

export default function SwimmerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Kehitys" focused={focused} /> }} />
      <Tabs.Screen name="workouts"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏊" label="Harjoitukset" focused={focused} /> }} />
      <Tabs.Screen name="competitions"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Kisat" focused={focused} /> }} />
      <Tabs.Screen name="goals"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" label="Tavoitteet" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: { alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: "#9ca3af", marginTop: 2 },
  labelActive: { color: "#0EA5E9", fontWeight: "600" },
});
