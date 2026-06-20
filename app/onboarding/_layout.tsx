import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="baseline" />
      <Stack.Screen name="volume" />
      <Stack.Screen name="zones" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="done" />
    </Stack>
  );
}
