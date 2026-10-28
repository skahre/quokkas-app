import ProductResultSheet, { buildMatches } from "@/components/result-sheet";
import SearchBar from "@/components/search-bar";
import type { RestrictionList } from "@/context/profile-context";
import { useProfile } from "@/context/profile-context";
import {
  getProductDetails,
  RateLimitError,
  searchProducts,
  uncheckable,
  type FoodProduct,
  type ProductDetails,
} from "@/lib/open-food-facts";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SearchError = "rate" | "generic" | null;

export default function SearchScreen() {
  const { restrictions, lists } = useProfile();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [searched, setSearched] = useState(false); // has a search been run?
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchError>(null);
  const [openingCode, setOpeningCode] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductDetails | null>(null);
  const [filters, setFilters] = useState<string[]>(["mine"]);

  const filterOptions: RestrictionList[] = [
    {
      id: "mine",
      name: "Mina restriktioner",
      restrictions,
    },
    ...lists.filter((list) => list.id !== "mine"),
  ];

  const activeRestrictions = filterOptions
    .filter((list) => filters.includes(list.id))
    .flatMap((list) => list.restrictions);
  const matches = selected
    ? buildMatches(
        activeRestrictions,
        selected.contains,
        selected.traces,
        uncheckable(activeRestrictions, selected),
      )
    : [];

  const abortRef = useRef<AbortController | null>(null);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      abortRef.current?.abort();
      setResults([]);
      setSearched(false);
      setError(null);
      setLoading(false);
    }
  };

  const runSearch = async () => {
    const q = query.trim();
    if (q.length < 2) return;

    abortRef.current?.abort(); // drop an older request that's still running
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await searchProducts(q, controller.signal);
      if (controller.signal.aborted) return;
      setResults(data);
      setSearched(true);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof RateLimitError ? "rate" : "generic");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const openProduct = async (item: FoodProduct) => {
    if (openingCode) return;
    setOpeningCode(item.code);
    try {
      const details = await getProductDetails(item.code);
      setSelected(details);
    } catch (e) {
      Alert.alert(
        e instanceof RateLimitError
          ? "För många förfrågningar"
          : "Kunde inte hämta produkten",
        "Försök igen om en stund.",
      );
    } finally {
      setOpeningCode(null);
    }
  };

  const emptyText = error
    ? error === "rate"
      ? "Du har sökt för många gånger. Vänta en minut och försök igen."
      : "Något gick fel. Försök igen."
    : searched
      ? "Inga produkter hittades."
      : "Skriv en produkt och tryck på sök.";

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 gap-4 px-4 pt-4">
          <SearchBar
            query={query}
            setQuery={handleQueryChange}
            onSubmit={runSearch}
            placeholder="Sök produkt eller märke..."
          />

          {loading && <ActivityIndicator />}

          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ItemSeparatorComponent={() => <View className="h-2.5" />}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                opening={openingCode === item.code}
                onPress={() => openProduct(item)}
              />
            )}
            ListEmptyComponent={
              loading ? undefined : (
                <Text className="text-center text-lg text-ink">
                  {emptyText}
                </Text>
              )
            }
            ListFooterComponent={
              results.length > 0 ? (
                <Text className="py-4 text-center text-sm text-ink/70">
                  Produktdata från Open Food Facts
                </Text>
              ) : undefined
            }
          />
        </View>
      </SafeAreaView>

      {/* Covers the screen above the nav bar */}
      <ProductResultSheet
        visible={selected !== null}
        product={selected}
        matches={matches}
        onClose={() => setSelected(null)}
        onShowIngredients={() => {
          if (!selected) return;
          router.push({
            pathname: "/product/[id]",
            params: { id: selected.code },
          });
          setSelected(null);
        }}
        filterOptions={filterOptions}
        filters={filters}
        setFilters={setFilters}
      />
    </View>
  );
}

function ProductCard({
  product,
  opening,
  onPress,
}: {
  product: FoodProduct;
  opening: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.brand}`}
      className="flex-row gap-4 items-center rounded-3xl bg-white px-4 py-5 shadow-md shadow-black/20 active:opacity-80"
    >
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          className="h-12 w-20"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="h-12 w-20 rounded-lg bg-background" />
      )}
      <View className="flex-1">
        <Text className="text-lg leading-6 text-ink">{product.name}</Text>
        {product.brand ? (
          <Text className="text-base text-ink/70">{product.brand}</Text>
        ) : null}
      </View>
      {opening && <ActivityIndicator />}
    </Pressable>
  );
}
