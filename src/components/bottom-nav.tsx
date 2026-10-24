import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

const INACTIVE_SIZE = 28;
const ACTIVE_SIZE = 36;

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

// Shared progress value: 1 when focused, 0 when not. Starts at the right value,
// so icons are visible on the very first render.
function useFocusProgress(focused: boolean) {
  const p = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    p.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, p]);

  return p;
}

// Dark icon in the bar: fades/shrinks out when its tab becomes active
function InactiveIcon({
  tab,
  focused,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
}) {
  const p = useFocusProgress(focused);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ scale: 1 - 0.4 * p.value }],
  }));

  return (
    <Animated.View style={style}>
      <TabIcon tab={tab} size={INACTIVE_SIZE} color={colors.ink} />
    </Animated.View>
  );
}

// White icon inside the sliding circle: cross-fades with the others
function ActiveIcon({
  tab,
  focused,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
}) {
  const p = useFocusProgress(focused);

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.6 + 0.4 * p.value }],
  }));

  return (
    <Animated.View style={[{ position: "absolute" }, style]}>
      <TabIcon tab={tab} size={ACTIVE_SIZE} color="#fff" />
    </Animated.View>
  );
}

export default function BottomNav({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const activeName = state.routes[state.index].name;

  // Only tabs whose route file exists
  const visibleTabs = TABS.filter((t) =>
    state.routes.some((r) => r.name === t.name),
  );
  const activeIndex = visibleTabs.findIndex((t) => t.name === activeName);

  const [width, setWidth] = useState(0);
  const tabWidth = width / Math.max(visibleTabs.length, 1);

  const x = useSharedValue(0);
  const hasPositioned = useRef(false);

  useEffect(() => {
    if (!width || activeIndex < 0) return;
    const target = activeIndex * tabWidth;
    if (!hasPositioned.current) {
      x.value = target; // no animation on first layout
      hasPositioned.current = true;
    } else {
      x.value = withSpring(target, { damping: 16, stiffness: 180, mass: 0.8 });
    }
  }, [activeIndex, tabWidth, width, x]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View className="bg-white">
      <SafeAreaView edges={["bottom"]}>
        <View
          className="h-20 flex-row"
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          {visibleTabs.map((tab) => {
            const route = state.routes.find((r) => r.name === tab.name)!;
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
                <InactiveIcon tab={tab} focused={focused} />
              </Pressable>
            );
          })}

          {/* Sliding circle (primary circle with white halo), vertically centered on the icons */}
          {width > 0 && activeIndex >= 0 && (
            <Animated.View
              pointerEvents="none"
              className="absolute left-0 top-0 h-full items-center justify-center"
              style={[{ width: tabWidth }, bubbleStyle]}
            >
              <View className="rounded-full bg-white p-2">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
                  {visibleTabs.map((tab) => (
                    <ActiveIcon
                      key={tab.name}
                      tab={tab}
                      focused={activeName === tab.name}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
