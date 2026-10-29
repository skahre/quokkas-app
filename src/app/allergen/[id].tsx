import { ALLERGEN_INFO, type Block } from "@/constants/allergen-info";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../../constants/colors");

// Where "här" in the footer points. Replace with your own page.
const METHOD_URL = "https://www.astmaoallergiforbundet.se";

export default function AllergenInfoScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const info = ALLERGEN_INFO[id];
  const title = info?.title ?? name ?? "Information";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 p-4 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Tillbaka"
          hitSlop={10}
          className="flex-row items-center gap-2 self-start active:opacity-60"
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text className="text-lg text-primary">Tillbaka</Text>
        </Pressable>

        <Text
          accessibilityRole="header"
          className="text-center font-bold text-5xl text-ink capitalize"
        >
          {title}
        </Text>

        {info ? (
          info.sections.map((section) => (
            <View key={section.title} className="gap-2">
              <Text
                accessibilityRole="header"
                className="font-bold text-2xl text-ink"
              >
                {section.title}
              </Text>
              <View className="gap-3 rounded-3xl bg-white p-4">
                {section.blocks.map((block, i) => (
                  <BlockView key={i} block={block} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View className="rounded-3xl bg-white p-4">
            <Text className="text-base text-ink">
              Vi har ingen information om {title.toLowerCase()} ännu.
            </Text>
          </View>
        )}

        <Text className="text-base text-ink">
          Informationen är sammanställd med hjälp av forskare. Läs mer om hur vi
          tar fram allergiinformation{" "}
          <Text
            accessibilityRole="link"
            onPress={() => openBrowserAsync(info?.sourceUrl ?? METHOD_URL)}
            className="text-primary underline"
          >
            här
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Rendering ---------- */

// Turns "text **bold** text" into nested <Text>.
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <Text className="text-base leading-6 text-ink">
      {parts.map((part, i) => (
        <Text key={i} className={i % 2 === 1 ? "font-bold" : ""}>
          {part}
        </Text>
      ))}
    </Text>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <RichText text={block.text} />;
    case "heading":
      return (
        <Text
          accessibilityRole="header"
          className="mt-1 font-bold text-base text-ink"
        >
          {block.text}
        </Text>
      );
    case "list":
      return (
        <View className="gap-1">
          {block.items.map((item, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="text-base leading-6 text-ink">•</Text>
              <View className="flex-1">
                <RichText text={item} />
              </View>
            </View>
          ))}
        </View>
      );
  }
}
