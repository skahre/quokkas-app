import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../constants/colors");

type Product = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
};

// TODO: replace with your real API call.
async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(
    `https://example.com/api/products?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

type Props = {
  onSelectProduct?: (product: Product) => void;
};

export default function SearchScreen({ onSelectProduct }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Debounced search: wait 300 ms after the last keystroke, and ignore
  // responses that arrive after the query has already changed.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchProducts(q);
        if (!cancelled) {
          setResults(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const showEmpty =
    query.trim().length >= 2 && !loading && !error && results.length === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-cream">
      {/* Search bar */}
      <View className="mx-4 mt-2 h-[52px] flex-row items-center rounded-full bg-white px-4">
        <Ionicons name="search-outline" size={24} color={colors.ink} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sök produkt"
          placeholderTextColor="#8A9695"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Sök produkt"
          className="ml-3 flex-1 font-nunito text-lg text-ink"
        />
        {loading && (
          <ActivityIndicator color={colors.primary.DEFAULT} className="mr-2" />
        )}
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Rensa sökning"
            hitSlop={10}
            className="active:opacity-60"
          >
            <Ionicons
              name="close-circle-outline"
              size={28}
              color={colors.ink}
            />
          </Pressable>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="px-4 pb-8 pt-16"
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => onSelectProduct?.(item)} />
        )}
        ListEmptyComponent={
          showEmpty || error ? (
            <Text className="mt-8 text-center font-nunito text-lg text-ink">
              {error
                ? "Något gick fel. Försök igen."
                : "Inga produkter hittades."}
            </Text>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.brand}`}
      className="flex-row items-center rounded-3xl bg-white px-4 py-5 shadow-md shadow-black/20 active:opacity-80"
    >
      <Image
        source={{ uri: product.imageUrl }}
        className="h-12 w-20"
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View className="ml-5 flex-1">
        <Text className="font-nunito text-lg leading-6 text-ink">
          {product.name}
        </Text>
        <Text className="font-nunito text-base text-ink/70">
          {product.brand}
        </Text>
      </View>
    </Pressable>
  );
}
