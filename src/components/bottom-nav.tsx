import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../constants/colors");

// Order here = order on screen. `name` must match the file name in app/(tabs)/.
const TABS = [
  { name: "search", label: "Sök", icon: "search-outline", lib: "ion" },
  { name: "scan", label: "Skanna", icon: "line-scan", lib: "mci" },
  {
    name: "profile",
    label: "Profil",
    icon: "account-circle-outline",
    lib: "mci",
  },
] as const;

function TabIcon({
  tab,
  size,
  color,
}: {
  tab: (typeof TABS)[number];
  size: number;
  color: string;
}) {
  return tab.lib === "ion" ? (
    <Ionicons name={tab.icon} size={size} color={color} />
  ) : (
    <MaterialCommunityIcons name={tab.icon} size={size} color={color} />
  );
}

export default function BottomNav({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const activeName = state.routes[state.index].name;

  return (
    <View className="bg-white">
      <SafeAreaView edges={["bottom"]}>
        <View className="h-20 flex-row">
          {TABS.map((tab) => {
            const route = state.routes.find((r) => r.name === tab.name);
            if (!route) return null; // tab file doesn't exist (yet)
            const focused = activeName === tab.name;

            const onPress = () => {
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigateToTab(route.key);
              }
            };

            return (
              <Pressable
                key={tab.name}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: focused }}
                className="flex-1 items-center justify-center"
              >
                {focused ? (
                  // Raised active tab: primary circle with a white halo
                  <View className="absolute -top-10 rounded-full bg-white p-2">
                    <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
                      <TabIcon tab={tab} size={56} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <TabIcon tab={tab} size={44} color={colors.ink} />
                )}
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
