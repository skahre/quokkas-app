import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const colors = require("../constants/colors");

export type Severity = "allergy" | "intolerance" | "ok";

const OPTIONS: {
  value: Severity;
  label: string;
  icon: "emoticon-sad" | "emoticon-neutral" | "emoticon-happy";
  color: string;
}[] = [
  {
    value: "allergy",
    label: "Inte alls / kraftig allergi",
    icon: "emoticon-sad",
    color: colors.danger,
  },
  {
    value: "intolerance",
    label: "Undviker / intolerans",
    icon: "emoticon-neutral",
    color: colors.warn,
  },
  {
    value: "ok",
    label: "Kan äta",
    icon: "emoticon-happy",
    color: colors.safe,
  },
];

type Props = {
  visible: boolean;
  value?: Severity;
  onSelect: (value: Severity) => void;
  onClose: () => void;
  onLearnMore?: () => void;
};

export default function ToleranceModal({
  visible,
  value,
  onSelect,
  onClose,
  onLearnMore,
}: Props) {
  const { width } = useWindowDimensions();
  const sideBySide = width >= 600;

  const [draft, setDraft] = useState<Severity | undefined>(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const confirm = () => {
    if (draft) onSelect(draft);
    onClose();
  };

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
            Ändra tolerans
          </Text>

          <View className={sideBySide ? "flex-row gap-4" : "gap-4"}>
            {/* Options */}
            <View
              accessibilityRole="radiogroup"
              className={sideBySide ? "flex-1 gap-2" : "gap-2"}
            >
              {OPTIONS.map((option) => {
                const selected = option.value === draft;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setDraft(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    className={`flex-row items-center gap-4 rounded-2xl px-4 py-3 shadow-md shadow-ink/20 active:opacity-80 ${
                      selected ? "bg-primary/25" : "bg-background"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={36}
                      color={option.color}
                    />
                    <Text className="flex-1 text-lg text-ink">
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Info card */}
            <View
              className={`items-center justify-center gap-3 rounded-2xl border border-ink/10 p-4 ${
                sideBySide ? "w-[38%]" : ""
              }`}
            >
              <Ionicons
                name="information-circle-outline"
                size={32}
                color={colors.ink}
              />
              <Text className="text-center text-base text-ink">
                Vill du veta mer om din allergi? Eller läsa på om potentiella
                korsallergier?
              </Text>
              <Pressable
                onPress={onLearnMore}
                accessibilityRole="button"
                className="rounded-full bg-primary px-5 py-2 active:opacity-80"
              >
                <Text className="font-semibold text-base text-background">
                  Läs mer
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              hitSlop={8}
              className="rounded-full px-5 py-2 active:opacity-60"
            >
              <Text className="font-semibold text-lg text-primary">Avbryt</Text>
            </Pressable>
            <Pressable
              onPress={confirm}
              disabled={!draft}
              accessibilityRole="button"
              accessibilityState={{ disabled: !draft }}
              className={`rounded-full bg-primary px-8 py-2 active:opacity-80 ${
                draft ? "" : "opacity-40"
              }`}
            >
              <Text className="font-semibold text-lg text-background">OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
