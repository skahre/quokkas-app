import Allergen from "@/components/allergen";
import Button from "@/components/button";
import SearchBar from "@/components/search-bar";
import SponsorFooter from "@/components/sponsor-footer";
import { useProfile } from "@/context/profile-context";
import useKeyboardVisible from "@/hooks/use-keyboard-visible";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: replace with API
const INGREDIENTS = [
  "Fisk",
  "Gluten",
  "Jordnötter",
  "Laktos",
  "Lök",
  "Mjölk",
  "Nötter",
  "Selleri",
  "Senap",
  "Sesamfrön",
  "Skaldjur",
  "Sojabönor",
  "Ägg",
];

export default function RestrictionsSetupScreen() {
  const { restrictions, hasRestriction, toggleRestriction } = useProfile();
  const [query, setQuery] = useState("");
  const keyboardVisible = useKeyboardVisible();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    const pool = Array.from(new Set([...INGREDIENTS, ...restrictions]));
    return pool.filter((i) => i.toLowerCase().includes(q));
  }, [q, restrictions]);

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <SafeAreaView
        edges={keyboardVisible ? ["top"] : ["top", "bottom"]}
        className="flex-1 bg-background"
      >
        <Text
          accessibilityRole="header"
          className="text-center font-bold text-3xl text-black"
        >
          Dina restriktioner
        </Text>

        <View className="flex-1 p-4 gap-4">
          <SearchBar query={query} setQuery={setQuery} />

          {/* While searching: results. Otherwise: the chosen restrictions. */}
          <View className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-2 pb-24"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {q ? (
                results.length > 0 ? (
                  results.map((item) =>
                    hasRestriction(item) ? (
                      // Already added: same spot as the plus button, but just
                      // an indicator, not tappable.
                      <Allergen
                        key={item}
                        label={item}
                        severity="allergy"
                        actionType="remove"
                        onAction={() => toggleRestriction(item)}
                      />
                    ) : (
                      <Allergen
                        key={item}
                        label={item}
                        actionType="add"
                        onAction={() => toggleRestriction(item)}
                      />
                    ),
                  )
                ) : (
                  <Text className="text-center text-lg text-ink">
                    Inga ingredienser hittades.
                  </Text>
                )
              ) : (
                restrictions.map((item: string) => (
                  <Allergen
                    key={item}
                    label={item}
                    severity="allergy"
                    actionType="remove"
                    onAction={() => toggleRestriction(item)}
                  />
                ))
              )}
            </ScrollView>

            <Button
              label="Börja handla tryggt"
              onPress={() => router.replace("/scan")}
              className="absolute bottom-0 right-0 shadow-lg shadow-ink/30"
            />
          </View>
        </View>

        {!keyboardVisible && <SponsorFooter />}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
