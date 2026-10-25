import { ProfileProvider } from "@/context/profile-context";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ProfileProvider>
  );
}
