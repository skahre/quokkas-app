import Button from "@/components/button";
import { buildMatches, getStatus } from "@/components/result-sheet";
import { useProfile } from "@/context/profile-context";
import { parseIngredients } from "@/lib/hightlight-ingredients";
import {
  getProductDetails,
  uncheckable,
  type ProductDetails,
} from "@/lib/open-food-facts";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../../constants/colors");

const BANNER = {
  safe: {
    icon: "emoticon-happy",
    color: colors.safe,
    bgClass: "bg-safe/15",
    textClass: "text-safe",
  },
  warning: {
    icon: "emoticon-neutral",
    color: colors.warn,
    bgClass: "bg-warn/15",
    textClass: "text-warn",
  },
  danger: {
    icon: "emoticon-sad",
    color: colors.danger,
    bgClass: "bg-danger/15",
    textClass: "text-danger",
  },
} as const;

const HIGHLIGHT = {
  allergy: "bg-danger/40",
  intolerance: "bg-warning/40",
} as const;

export default function ProductScreen() {
  const { id: code } = useLocalSearchParams<{ id: string }>();
  const { restrictions } = useProfile();

  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    const controller = new AbortController();
    setDetails(null);
    setError(false);
    getProductDetails(code, controller.signal)
      .then((d) => {
        if (!controller.signal.aborted) setDetails(d);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [code, attempt]);

  const ingredients = useMemo(
    () =>
      details?.ingredientsText
        ? parseIngredients(details.ingredientsText, restrictions)
        : [],
    [details, restrictions],
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 p-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Tillbaka"
          hitSlop={10}
          className="flex-row items-center gap-2 self-start active:opacity-60"
        >
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
          <Text className="text-xl text-primary">Tillbaka</Text>
        </Pressable>

        {!details && !error && <ActivityIndicator className="mt-16" />}

        {error && (
          <View className="mt-16 items-center gap-6">
            <Text className="text-center text-lg text-ink">
              Kunde inte hämta produkten.
            </Text>
            <Button
              label="Försök igen"
              onPress={() => setAttempt((a) => a + 1)}
            />
          </View>
        )}

        {details && (
          <ProductContent
            details={details}
            ingredients={ingredients}
            restrictions={restrictions}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductContent({
  details,
  ingredients,
  restrictions,
}: {
  details: ProductDetails;
  ingredients: ReturnType<typeof parseIngredients>;
  restrictions: ReturnType<typeof useProfile>["restrictions"];
}) {
  const matches = buildMatches(
    restrictions,
    details.contains,
    details.traces,
    uncheckable(restrictions, details),
  );
  const status = getStatus(matches);
  const banner = BANNER[status];

  const bannerText =
    status === "safe"
      ? "Inga allergener hittades"
      : status === "danger"
        ? "Innehåller dina allergener"
        : matches.some((m) => m.presence === "contains")
          ? "Innehåller något du undviker"
          : matches.some((m) => m.presence === "traces")
            ? "Kan innehålla spår av dina allergener"
            : "Vi kan inte kontrollera allt";

  const rows = nutritionRows(details);

  return (
    <>
      {/* Product header */}
      <View className="flex-row items-center gap-4">
        {details.imageUrl ? (
          <Image
            source={{ uri: details.imageUrl }}
            className="h-32 w-32"
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-32 w-32 rounded-2xl bg-white" />
        )}
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            className="font-bold text-4xl text-ink"
          >
            {details.name}
          </Text>
          {details.brand ? (
            <Text className="text-xl text-ink">{details.brand}</Text>
          ) : null}
        </View>
      </View>

      {/* Status banner */}
      <View
        accessibilityLiveRegion="polite"
        className={`flex-row items-center gap-4 rounded-3xl px-4 py-4 ${banner.bgClass}`}
      >
        <MaterialCommunityIcons
          name={banner.icon}
          size={72}
          color={banner.color}
        />
        <Text className={`flex-1 font-bold text-2xl ${banner.textClass}`}>
          {bannerText}
        </Text>
      </View>

      {/* Ingredients */}
      <Section title="Innehållsförteckning">
        {ingredients.length > 0 ? (
          <Text className="text-base leading-7 text-ink">
            {ingredients.map((item, i) => (
              <Text key={i}>
                {item.lead}
                <Text className={item.severity ? HIGHLIGHT[item.severity] : ""}>
                  {item.parts.map((p, j) => (
                    <Text
                      key={j}
                      className={`${p.bold ? "font-bold" : ""} ${p.muted ? "text-ink/40" : ""}`}
                    >
                      {p.text}
                    </Text>
                  ))}
                </Text>
              </Text>
            ))}
          </Text>
        ) : (
          <Text className="text-base text-ink">
            Innehållsförteckning saknas för den här produkten.
          </Text>
        )}
      </Section>

      {/* Description */}
      {details.description ? (
        <Section title="Beskrivning">
          <Text className="text-base leading-6 text-ink">
            {details.description}
          </Text>
        </Section>
      ) : null}

      {/* Nutrition */}
      {rows.length > 0 && (
        <Section title="Näringsinnehåll">
          <View accessibilityRole="summary">
            <Text className="px-2 pb-1 text-right font-bold text-base text-ink">
              100 g
            </Text>
            {rows.map((row, i) => (
              <View
                key={row.label}
                className={`flex-row justify-between px-2 py-1 ${
                  i % 2 === 0 ? "bg-background" : ""
                }`}
              >
                <Text
                  className={
                    row.sub ? "text-sm text-ink/50" : "text-base text-ink"
                  }
                >
                  {row.label}
                </Text>
                <Text
                  className={
                    row.sub ? "text-sm text-ink/50" : "text-base text-ink"
                  }
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="font-bold text-xl text-ink">
        {title}
      </Text>
      <View className="rounded-3xl bg-white p-4">{children}</View>
    </View>
  );
}

/* ---------- Nutrition table ---------- */

const fmt = (n: number, unit: string) => `${Number(n.toFixed(1))} ${unit}`;

function nutritionRows(d: ProductDetails) {
  const n = d.nutrition;
  const rows: { label: string; value: string; sub?: boolean }[] = [];

  if (n.energyKj !== undefined || n.energyKcal !== undefined) {
    const kj = n.energyKj !== undefined ? `${Math.round(n.energyKj)} kJ` : "";
    const kcal =
      n.energyKcal !== undefined ? `${Math.round(n.energyKcal)} kcal` : "";
    rows.push({
      label: "Energi",
      value: [kj, kcal].filter(Boolean).join(" / "),
    });
  }
  if (n.fat !== undefined) rows.push({ label: "Fett", value: fmt(n.fat, "g") });
  if (n.saturatedFat !== undefined)
    rows.push({
      label: "Varav mättat fett",
      value: fmt(n.saturatedFat, "g"),
      sub: true,
    });
  if (n.carbohydrates !== undefined)
    rows.push({ label: "Kolhydrater", value: fmt(n.carbohydrates, "g") });
  if (n.sugars !== undefined)
    rows.push({
      label: "Varav sockerarter",
      value: fmt(n.sugars, "g"),
      sub: true,
    });
  if (n.fiber !== undefined)
    rows.push({ label: "Fiber", value: fmt(n.fiber, "g") });
  if (n.protein !== undefined)
    rows.push({ label: "Protein", value: fmt(n.protein, "g") });
  if (n.salt !== undefined)
    rows.push({ label: "Salt", value: fmt(n.salt, "g") });

  return rows;
}
