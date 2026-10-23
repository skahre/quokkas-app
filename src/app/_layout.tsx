import * as SplashScreen from "expo-splash-screen";

import AppTabs from "@/components/app-tabs";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return <AppTabs />;
}
