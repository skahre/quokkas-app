import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const colors = require("../constants/colors");

type Props = {
  onLogin?: () => void;
};

export default function WelcomeScreen({ onLogin }: Props) {
  return (
    <LinearGradient
      colors={[colors.mist.top, colors.mist.mid, colors.mist.bottom]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Centered block: title, tagline, buttons */}
        <View className="flex-1 items-center justify-center px-8">
          <Text
            accessibilityRole="header"
            className="text-center text-5xl font-bold text-ink"
          >
            [APP NAME]
          </Text>

          <Text className="mt-10 text-center text-lg text-ink">
            För att du ska kunna handla utan oro
          </Text>

          <View className="mt-12 items-center gap-4">
            <Pressable
              onPress={onLogin}
              accessibilityRole="button"
              className="rounded-full bg-primary px-10 py-4 active:opacity-80"
            >
              <Text className="text-2xl font-semibold text-background">
                Logga in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/onboarding")}
              accessibilityRole="button"
              className="rounded-full border-[3px] border-primary px-10 py-4 active:opacity-70"
            >
              <Text className="text-2xl font-semibold text-primary">
                Skapa konto
              </Text>
            </Pressable>
          </View>
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
