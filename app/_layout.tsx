import { useEffect } from "react";
import { Platform, View, Dimensions } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

const screenW = Dimensions.get("window").width;
const MAX_W = screenW >= 1280 ? screenW * 0.85 : screenW >= 1024 ? screenW * 0.90 : screenW >= 640 ? 640 : 480;

export default function RootLayout() {
  const { session, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth    = segments[0] === "auth";
    const inCoach   = segments[0] === "coach";
    const inSwimmer = segments[0] === "swimmer";
    const isCoach   = role === "coach" || role === "club_admin";

    if (!session && !inAuth) {
      router.replace("/auth/login");
    } else if (session && inAuth) {
      router.replace(isCoach ? "/coach" : "/swimmer");
    } else if (session && !inAuth) {
      if (isCoach && !inCoach) router.replace("/coach");
      if (!isCoach && role && !inSwimmer) router.replace("/swimmer");
    }
  }, [session, role, loading, segments]);

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="coach" />
      <Stack.Screen name="swimmer" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#e2e8f0", alignItems: "center" }}>
        <View style={{
          width: "100%",
          maxWidth: MAX_W,
          flex: 1,
          backgroundColor: "#f8fafc",
          boxShadow: "0 0 40px rgba(0,0,0,0.10)",
        }}>
          {stack}
        </View>
      </View>
    );
  }

  return stack;
}
