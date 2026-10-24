import BottomNav from "@/components/bottom-nav";
import { Tabs } from "expo-router/js-tabs";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="search" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
