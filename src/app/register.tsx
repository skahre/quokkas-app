import Button from "@/components/button";
import GradientBackground from "@/components/gradient-background";
import SponsorFooter from "@/components/sponsor-footer";
import { useProfile } from "@/context/profile-context";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const { setName } = useProfile();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function onRegister() {
    setError("");
    if (input.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (input.length > 15) {
      setError("Name can be no longer that 15 characters");
      return;
    }
    setName(input);
    setError("");
    router.push("/onboarding");
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center gap-12">
              <Text className="text-center font-bold text-5xl text-ink">
                Skapa konto
              </Text>

              <View className="w-full gap-2">
                <Text className="ml-3 text-base font-bold text-ink">Namn</Text>
                <TextInput
                  className="h-[52px] w-full rounded-full bg-white px-4"
                  value={input}
                  onChangeText={setInput}
                  returnKeyType="done"
                />
                {error && (
                  <Text className="ml-3 text-sm text-danger">{error}</Text>
                )}
              </View>

              <Button
                onPress={onRegister}
                label="Skapa konto"
                className="self-center"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <SponsorFooter />
      </SafeAreaView>
    </GradientBackground>
  );
}
