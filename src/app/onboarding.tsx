import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../constants/colors");

const DEFAULT_OPTIONS = [
  "Laktos",
  "Ägg",
  "Nötter",
  "Gluten",
  "Mjölkprotein",
  "Vegetariskt",
  "Vegan",
  "Halal",
  "Låg FODMAP",
  "Soja",
];

type Props = {
  options?: string[];
  onNext?: (selected: string[]) => void;
  onSkip?: () => void;
};

export default function OnboardingScreen({
  options = DEFAULT_OPTIONS,
  onNext,
  onSkip,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (option: string) =>
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );

  return (
    <LinearGradient
      colors={[colors.mist.top, colors.mist.mid, colors.mist.bottom]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text
            accessibilityRole="header"
            className="text-center font-nunito-bold text-4xl text-ink"
          >
            Kom igång
          </Text>

          <Text className="mt-8 text-center font-nunito text-base text-black">
            Välj dina matpreferenser (fler val finns i nästa steg)
          </Text>

          {/* Chips */}
          <View className="mt-10 flex-row flex-wrap justify-center gap-x-4 gap-y-2.5">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => toggle(option)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  className={`rounded-full px-4 py-2 active:opacity-80 ${
                    isSelected ? "bg-primary" : "bg-white"
                  }`}
                >
                  <Text
                    className={`font-nunito-semibold text-base ${
                      isSelected ? "text-white" : "text-ink"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => onNext?.(selected)}
            accessibilityRole="button"
            className="mt-12 rounded-full bg-primary px-9 py-3.5 active:opacity-80"
          >
            <Text className="font-nunito-semibold text-2xl text-white">
              Nästa steg
            </Text>
          </Pressable>

          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            hitSlop={12}
            className="mt-10 active:opacity-60"
          >
            <Text className="font-nunito text-xl text-primary underline">
              Hoppa över
            </Text>
          </Pressable>
        </View>

        {/* Footer: sponsor */}
        <View className="flex-row items-center justify-center pb-6">
          <Text className="mr-4 text-base font-medium text-ink">
            Med stöd från
          </Text>
          <Image
            source={require("../../assets/astma-allergi-forbundet.png")}
            className="h-[60px] w-[160px]"
            resizeMode="contain"
            accessibilityLabel="Astma- och Allergiförbundet"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
