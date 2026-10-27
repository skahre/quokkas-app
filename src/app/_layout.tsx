import { ProfileProvider } from "@/context/profile-context";
import { prefetchIngredients } from "@/lib/open-food-facts";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    prefetchIngredients();
  }, []);

  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="list/[id]" />
      </Stack>
    </ProfileProvider>
  );
}
