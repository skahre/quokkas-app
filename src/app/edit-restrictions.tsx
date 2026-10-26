import RestrictionsEditor from "@/components/restrictions-editor";
import { useProfile } from "@/context/profile-context";
import { router } from "expo-router";
import { Text } from "react-native";

export default function EditRestrictionsScreen() {
  const { restrictions, setSeverity } = useProfile();

  return (
    <RestrictionsEditor
      title={
        <Text
          accessibilityRole="header"
          className="flex-1 text-center font-bold text-3xl text-ink"
        >
          Dina restriktioner
        </Text>
      }
      items={restrictions}
      onSetSeverity={setSeverity}
      onDone={() => router.back()}
    />
  );
}
