import Button from "@/components/button";
import GradientBackground from "@/components/gradient-background";
import SponsorFooter from "@/components/sponsor-footer";
import { useProfile } from "@/context/profile-context";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 14 allergens required to be declared in the EU
const DEFAULT_OPTIONS = [
  "Gluten",
  "Skaldjur",
  "Ägg",
  "Fisk",
  "Jordnötter",
  "Sojabönor",
  "Mjölk",
  "Nötter",
  "Selleri",
  "Senap",
  "Sesamfrön",
];

type Props = {
  options?: string[];
  onSkip?: () => void;
};

export default function OnboardingScreen({
  options = DEFAULT_OPTIONS,
  onSkip,
}: Props) {
  const { hasRestriction, toggleRestriction } = useProfile();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-12">
          <Text
            accessibilityRole="header"
            className="text-center font-bold text-5xl text-ink"
          >
            Kom igång
          </Text>

          <Text className="text-center text-base text-ink">
            Välj dina matpreferenser (fler val finns i nästa steg)
          </Text>

          {/* Chips */}
          <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-4">
            {options.map((option) => {
              const isSelected = hasRestriction(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => toggleRestriction(option)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  className={`rounded-full px-4 py-2 active:opacity-80 ${
                    isSelected ? "bg-danger" : "bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      isSelected ? "text-white" : "text-ink"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            onPress={() => router.push("/restrictions-setup")}
            label="Nästa steg"
            className="self-center"
          />

          <Pressable
            onPress={() => router.replace("/(tabs)/profile")}
            accessibilityRole="button"
            hitSlop={12}
            className="active:opacity-60"
          >
            <Text className="font-nunito text-xl text-primary underline">
              Hoppa över
            </Text>
          </Pressable>
        </View>

        <SponsorFooter />
      </SafeAreaView>
    </GradientBackground>
  );
}
