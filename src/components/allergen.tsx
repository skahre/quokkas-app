import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
const colors = require("../constants/colors");

type AllergenProps = {
  label: string;
  actionType: "add" | "remove" | "edit";
  severity?: "allergy" | "intolerance" | null;
  onAction: () => void;
};

export default function Allergen({
  label,
  actionType,
  severity = null,
  onAction,
}: AllergenProps) {
  return (
    <View className="flex-row gap-4 items-center rounded-3xl bg-white px-5 py-4 shadow-md shadow-ink/20">
      {severity && (
        <MaterialCommunityIcons
          name={severity == "allergy" ? "emoticon-sad" : "emoticon-neutral"}
          size={34}
          color={severity == "allergy" ? colors.danger : colors.warn}
        />
      )}

      <Text className="flex-1 text-lg text-ink">{label}</Text>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`Ta bort ${label}`}
        hitSlop={10}
        className="active:opacity-60"
      >
        {actionType !== "edit" && (
          <Ionicons
            name={
              actionType === "remove"
                ? "close-circle-outline"
                : "add-circle-outline"
            }
            size={36}
            color={
              actionType === "remove"
                ? colors.danger
                : actionType === "add"
                  ? colors.primary
                  : colors.ink
            }
          />
        )}
        {actionType === "edit" && (
          <MaterialCommunityIcons name="pencil" size={24} color={colors.ink} />
        )}
      </Pressable>
    </View>
  );
}
