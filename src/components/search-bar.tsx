import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";
const colors = require("../constants/colors");

export default function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <View className="h-[52px] flex-row items-center rounded-full bg-white px-4">
      <Ionicons name="search-outline" size={24} color={colors.ink} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Sök allergen..."
        autoCorrect={false}
        accessibilityLabel="Sök ingrediens"
        className="ml-3 flex-1 text-lg text-ink"
      />
      {query.length > 0 && (
        <Pressable
          onPress={() => setQuery("")}
          accessibilityRole="button"
          accessibilityLabel="Rensa sökning"
          hitSlop={10}
          className="active:opacity-60"
        >
          <Ionicons name="close-circle-outline" size={26} color={colors.ink} />
        </Pressable>
      )}
    </View>
  );
}
