import { useFilters } from "@/context/filter-context";
import { useProfile } from "@/context/profile-context";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";

export default function LogoutModal({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) {
  const { reset } = useProfile();
  const { resetFilters } = useFilters();

  function onLogout() {
    reset();
    resetFilters();
    onClose();
    router.push("/welcome");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose} // Android back button
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Stäng"
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        <Pressable
          accessibilityViewIsModal
          className="w-full max-w-[640px] gap-4 rounded-3xl bg-white p-5"
        >
          <Text
            accessibilityRole="header"
            className="font-bold text-2xl text-ink"
          >
            Logga ut?
          </Text>
          <Text className="text-base text-ink">
            Denna prototyp sparar enbart din data lokalt. Genom att logga ut
            kommer du att förlora alla ändringar som gjorts. Är du säker på att
            du vill logga ut?
          </Text>
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              hitSlop={8}
              className="rounded-full px-5 py-2 active:opacity-60"
            >
              <Text className="font-semibold text-lg text-primary">Avbryt</Text>
            </Pressable>
            <Pressable
              onPress={onLogout}
              accessibilityRole="button"
              className="rounded-full bg-danger px-8 py-2 active:opacity-80"
            >
              <Text className="font-semibold text-lg text-background">
                Logga ut
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
