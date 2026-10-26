import Allergen from "@/components/allergen";
import Button from "@/components/button";
import IconButton from "@/components/icon-button";
import SearchBar from "@/components/search-bar";
import SponsorFooter from "@/components/sponsor-footer";
import ToleranceModal from "@/components/tolerance-modal";
import type { Restriction, Severity } from "@/context/profile-context";
import useKeyboardVisible from "@/hooks/use-keyboard-visible";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../constants/colors");

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

type Props = {
  /** Rendered in the header row. Give it `flex-1` so it fills the space. */
  title: ReactNode;
  /** The restrictions being edited: your own, or a saved list's. */
  items: Restriction[];
  /** Called when the user confirms a tolerance in the popup. */
  onSetSeverity: (name: string, severity: Severity) => void;
  onDone: () => void;
  doneLabel?: string;
  doneIcon?: ComponentProps<typeof Button>["icon"];
  /** Back chevron in the header. Turn off for the onboarding step. */
  showBack?: boolean;
  showSponsor?: boolean;
};

export default function RestrictionsEditor({
  title,
  items,
  onSetSeverity,
  onDone,
  doneLabel = "Klar",
  doneIcon = "checkmark",
  showBack = true,
  showSponsor = false,
}: Props) {
  const [query, setQuery] = useState("");
  // Name of the ingredient whose tolerance is being chosen, or null when the
  // popup is closed. Used both for adding a new item and editing an old one.
  const [editing, setEditing] = useState<string | null>(null);
  const keyboardVisible = useKeyboardVisible();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    const pool = Array.from(
      new Set([...INGREDIENTS, ...items.map((r) => r.name)]),
    );
    return pool.filter((name) => name.toLowerCase().includes(q));
  }, [q, items]);

  const severityOf = (name: string) =>
    items.find((r) => r.name === name)?.severity;

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <SafeAreaView
        edges={keyboardVisible ? ["top"] : ["top", "bottom"]}
        className="flex-1 bg-background"
      >
        {/* Header */}
        <View className="flex-row items-center gap-2 px-4">
          {showBack && (
            <IconButton label="Tillbaka" onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={32} color={colors.ink} />
            </IconButton>
          )}
          {title}
          {/* Invisible spacer so the title stays centered */}
          {showBack && <View className="w-8" />}
        </View>

        <View className="flex-1 p-4 gap-4">
          <SearchBar query={query} setQuery={setQuery} />

          {/* While searching: results. Otherwise: the current restrictions. */}
          <View className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-2 pb-24"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {q ? (
                results.length > 0 ? (
                  results.map((name) => {
                    const severity = severityOf(name);
                    // New items: "add" opens the popup. Existing ones: "edit"
                    // opens it with their current tolerance.
                    return severity ? (
                      <Allergen
                        key={name}
                        label={name}
                        severity={severity}
                        actionType="edit"
                        onAction={() => setEditing(name)}
                      />
                    ) : (
                      <Allergen
                        key={name}
                        label={name}
                        actionType="add"
                        onAction={() => setEditing(name)}
                      />
                    );
                  })
                ) : (
                  <Text className="text-center text-lg text-ink">
                    Inga ingredienser hittades.
                  </Text>
                )
              ) : items.length > 0 ? (
                items.map((item) => (
                  <Allergen
                    key={item.name}
                    label={item.name}
                    severity={item.severity}
                    actionType="edit"
                    onAction={() => setEditing(item.name)}
                  />
                ))
              ) : (
                <Text className="text-center text-base text-ink">
                  Sök efter ingredienser för att lägga till dem.
                </Text>
              )}
            </ScrollView>

            <Button
              label={doneLabel}
              onPress={onDone}
              className="absolute bottom-0 right-0 shadow-lg shadow-ink/30"
              icon={doneIcon}
              iconPosition="right"
            />
          </View>
        </View>

        {showSponsor && !keyboardVisible && <SponsorFooter />}
      </SafeAreaView>

      {/* Nothing is added or changed until the user presses OK. "Kan äta"
          removes the item. */}
      <ToleranceModal
        visible={editing !== null}
        value={editing ? severityOf(editing) : undefined}
        onSelect={(severity) => {
          if (editing) onSetSeverity(editing, severity);
        }}
        onClose={() => setEditing(null)}
      />
    </KeyboardAvoidingView>
  );
}
