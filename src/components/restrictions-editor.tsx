import Allergen from "@/components/allergen";
import Button from "@/components/button";
import IconButton from "@/components/icon-button";
import SearchBar from "@/components/search-bar";
import SponsorFooter from "@/components/sponsor-footer";
import ToleranceModal from "@/components/tolerance-modal";
import type {
  Ingredient,
  Restriction,
  Severity,
} from "@/context/profile-context";
import useKeyboardVisible from "@/hooks/use-keyboard-visible";
import { RateLimitError, searchIngredients } from "@/lib/open-food-facts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../constants/colors");

// Wait this long after the last keystroke before asking Open Food Facts.
const DEBOUNCE_MS = 500;
const MIN_CHARS = 2;

type Props = {
  title: ReactNode;
  items: Restriction[];
  onSetSeverity: (item: Ingredient, severity: Severity) => void;
  onDone: () => void;
  doneLabel?: string;
  doneIcon?: ComponentProps<typeof Button>["icon"];
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
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"rate" | "generic" | null>(null);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const keyboardVisible = useKeyboardVisible();

  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (q.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const found = await searchIngredients(q, controller.signal);
        if (!controller.signal.aborted) setSuggestions(found);
      } catch (e) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setError(e instanceof RateLimitError ? "rate" : "generic");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const severityOf = (id: string) => items.find((r) => r.id === id)?.severity;

  const results = useMemo(() => {
    if (q.length < MIN_CHARS) return [];
    const local = items.filter((r) => r.name.toLowerCase().includes(q));
    const seen = new Set(local.map((r) => r.id));
    return [...local, ...suggestions.filter((s) => !seen.has(s.id))];
  }, [q, items, suggestions]);

  const emptyText =
    error === "rate"
      ? "Du har sökt för många gånger. Vänta en minut och försök igen."
      : error === "generic"
        ? "Kunde inte söka just nu. Försök igen."
        : "Inga ingredienser hittades.";

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
          <SearchBar
            query={query}
            setQuery={setQuery}
            placeholder="Sök ingrediens eller allergen..."
          />

          {/* While searching: results. Otherwise: the current restrictions. */}
          <View className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-2 pb-24"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {q.length >= MIN_CHARS ? (
                <>
                  {results.map((item) => {
                    const severity = severityOf(item.id);
                    return severity ? (
                      <Allergen
                        key={item.id}
                        label={item.name}
                        severity={severity}
                        actionType="edit"
                        onAction={() => setEditing(item)}
                      />
                    ) : (
                      <Allergen
                        key={item.id}
                        label={item.name}
                        actionType="add"
                        onAction={() => setEditing(item)}
                      />
                    );
                  })}

                  {loading && <ActivityIndicator className="mt-2" />}

                  {!loading && results.length === 0 && (
                    <Text className="text-center text-lg text-ink">
                      {emptyText}
                    </Text>
                  )}

                  {results.length > 0 && (
                    <Text className="py-2 text-center text-sm text-ink/70">
                      Ingredienser från Open Food Facts
                    </Text>
                  )}
                </>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <Allergen
                    key={item.id}
                    label={item.name}
                    severity={item.severity}
                    actionType="edit"
                    onAction={() => setEditing(item)}
                  />
                ))
              ) : (
                <Text className="text-center text-base text-ink">
                  Sök efter en ingrediens eller allergen för att lägga till den.
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

      <ToleranceModal
        visible={editing !== null}
        value={editing ? severityOf(editing.id) : undefined}
        onSelect={(severity) => {
          if (editing) onSetSeverity(editing, severity);
        }}
        onClose={() => setEditing(null)}
        onLearnMore={() => {
          const item = editing;
          setEditing(null);
          if (item)
            router.push({
              pathname: "/allergen/[id]",
              params: { id: item.id, name: item.name },
            });
        }}
      />
    </KeyboardAvoidingView>
  );
}
