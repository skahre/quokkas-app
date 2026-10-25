import Button from "@/components/button";
import GradientBackground from "@/components/gradient-background";
import SponsorFooter from "@/components/sponsor-footer";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onLogin?: () => void;
};

export default function WelcomeScreen({ onLogin }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <View className="flex-1 gap-12 items-center justify-center">
          <Text
            accessibilityRole="header"
            className="text-center text-5xl font-bold text-ink"
          >
            [APP NAME]
          </Text>

          <Text className="text-center text-lg text-ink">
            För att du ska kunna handla utan oro
          </Text>

          <View className="items-center gap-4">
            <Button onPress={onLogin} variant="primary" label="Logga in" />
            <Button
              onPress={() => router.push("/onboarding")}
              variant="secondary"
              label="Skapa konto"
            />
          </View>
        </View>
        <SponsorFooter />
      </SafeAreaView>
    </GradientBackground>
  );
}
