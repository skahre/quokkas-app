import IconButton from "@/components/icon-button";
import ListToggle from "@/components/list-toggle";
import type { Restriction, RestrictionList } from "@/context/profile-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const colors = require("../constants/colors");

export type SheetProduct = {
  name: string;
  brand: string;
  imageUrl?: string;
};

export type Presence = "contains" | "traces" | "unknown" | "none";

export type ProductMatch = {
  id: string;
  name: string;
  severity: Restriction["severity"];
  presence: Presence;
};

export function buildMatches(
  restrictions: Restriction[],
  contains: string[],
  traces: string[],
  unknown: string[] = [],
): ProductMatch[] {
  return restrictions.map((r) => ({
    ...r,
    presence: contains.includes(r.id)
      ? "contains"
      : traces.includes(r.id)
        ? "traces"
        : unknown.includes(r.id)
          ? "unknown"
          : "none",
  }));
}

type Status = "safe" | "warning" | "danger";

const STATUS = {
  safe: {
    icon: "emoticon-happy",
    color: colors.safe,
    textClass: "text-safe",
  },
  warning: {
    icon: "emoticon-neutral",
    color: colors.warn,
    textClass: "text-warn",
  },
  danger: {
    icon: "emoticon-sad",
    color: colors.danger,
    textClass: "text-danger",
  },
} as const;

const ROW_ICON = {
  free: { icon: "emoticon-happy", color: colors.safe },
  traces: { icon: "emoticon-neutral", color: colors.warn },
  unknown: { icon: "help-circle", color: colors.ink },
  allergy: { icon: "emoticon-sad", color: colors.danger },
  intolerance: { icon: "emoticon-neutral", color: colors.warn },
} as const;

export function getStatus(matches: ProductMatch[]): Status {
  if (
    matches.some((m) => m.presence === "contains" && m.severity === "allergy")
  )
    return "danger";
  if (matches.some((m) => m.presence !== "none")) return "warning";
  return "safe";
}

function getHeadline(status: Status, matches: ProductMatch[]) {
  if (status === "safe") return "Inga allergener hittades!";
  if (status === "danger") return "Allergener hittades!";
  if (matches.some((m) => m.presence === "contains"))
    return "Innehåller något du undviker";
  if (matches.some((m) => m.presence === "traces"))
    return "Kan innehålla spår av allergener";
  return "Vi kan inte kontrollera allt";
}

const RANK: Record<Presence, number> = {
  contains: 0,
  traces: 1,
  unknown: 2,
  none: 3,
};

const PREFIX: Record<Presence, string> = {
  contains: "Innehåller ",
  traces: "Kan innehålla spår av ",
  unknown: "Kan inte kontrollera ",
  none: "Fri från ",
};

type Props = {
  visible: boolean;
  product: SheetProduct | null;
  matches: ProductMatch[];
  onClose: () => void;
  onShowIngredients?: () => void;
  filterOptions: RestrictionList[];
  filters: string[];
  setFilters: (value: string[]) => void;
};

export default function ProductResultSheet({
  visible,
  product,
  matches,
  onClose,
  onShowIngredients,
  filterOptions,
  filters,
  setFilters,
}: Props) {
  const { height } = useWindowDimensions();

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 300 : 220,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  if (!product) return null;

  const status = getStatus(matches);
  const s = STATUS[status];

  const rows = [...matches].sort((a, b) => RANK[a.presence] - RANK[b.presence]);

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute inset-0 justify-end"
    >
      {/* Dimmed backdrop: tap to close */}
      <Animated.View
        style={{ opacity: progress }}
        className="absolute inset-0 bg-black/40"
      >
        <Pressable
          onPress={onClose}
          accessibilityLabel="Stäng"
          className="flex-1"
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        accessibilityViewIsModal
        style={{
          maxHeight: height * 0.8,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              }),
            },
          ],
        }}
        className="overflow-hidden rounded-t-[40px] bg-background"
      >
        {/* Product header */}
        <View className="flex-row items-center gap-4 rounded-t-[40px] bg-white px-6 py-6">
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              className="h-20 w-14"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="h-20 w-14 rounded-lg bg-background" />
          )}
          <View className="flex-1">
            <Text className="text-xl text-ink">{product.name}</Text>
            <Text className="text-base text-ink/70">{product.brand}</Text>
          </View>
          <IconButton label="Stäng" onPress={onClose}>
            <Ionicons
              name="close-circle-outline"
              size={44}
              color={colors.ink}
            />
          </IconButton>
        </View>

        <View className="self-end place-self-end">
          <ListToggle
            options={filterOptions}
            value={filters}
            onChange={setFilters}
          />
        </View>

        {/* Result */}
        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerClassName="gap-6 px-5 pb-6 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-4 px-1">
            <MaterialCommunityIcons name={s.icon} size={76} color={s.color} />
            <Text
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
              className={`flex-1 font-bold text-2xl ${s.textClass}`}
            >
              {getHeadline(status, matches)}
            </Text>
          </View>

          <View className="gap-2">
            {rows.map((m) => {
              const icon =
                m.presence === "none"
                  ? ROW_ICON.free
                  : m.presence === "traces"
                    ? ROW_ICON.traces
                    : m.presence === "unknown"
                      ? ROW_ICON.unknown
                      : ROW_ICON[m.severity];
              const prefix = PREFIX[m.presence];
              return (
                <View
                  key={m.id}
                  className="flex-row items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-md shadow-ink/20"
                >
                  <MaterialCommunityIcons
                    name={icon.icon}
                    size={32}
                    color={icon.color}
                  />
                  <Text className="flex-1 text-lg text-ink">
                    {prefix}
                    <Text className="font-bold">{m.name.toLowerCase()}</Text>
                  </Text>
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={onShowIngredients}
            accessibilityRole="button"
            className="self-center rounded-full bg-primary px-8 py-2.5 active:opacity-80"
          >
            <Text className="font-semibold text-lg text-background">
              Se innehåll
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
