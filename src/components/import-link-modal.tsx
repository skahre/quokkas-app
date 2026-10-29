import type { Restriction } from "@/context/profile-context";
import { parseShareLink } from "@/lib/share-link";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ImportLinkModal({
  visible,
  onClose,
  onImport,
}: {
  visible: boolean;
  onClose: () => void;
  onImport: (name: string, items: Restriction[]) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setText("");
      setError(false);
    }
  }, [visible]);

  const submit = () => {
    const result = parseShareLink(text);
    if (!result) {
      setError(true);
      return;
    }
    const name = result.sender
      ? `Lista från ${result.sender}`.slice(0, 40)
      : "Delad lista";
    onImport(name, result.items);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
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
              className="font-bold text-xl text-ink"
            >
              Importera allergilista
            </Text>

            <View className="gap-2">
              <TextInput
                value={text}
                onChangeText={(t) => {
                  setText(t);
                  setError(false);
                }}
                placeholder="https://exempel.se"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={submit}
                accessibilityLabel="Länk till allergilista"
                className="h-[52px] rounded-2xl border border-ink/10 bg-background px-4 text-base text-ink"
              />
              {error && (
                <Text className="ml-2 text-sm text-danger">
                  Länken är ogiltig eller saknar en lista.
                </Text>
              )}
            </View>

            <View className="flex-row items-center justify-end gap-3">
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                hitSlop={8}
                className="rounded-full px-5 py-2 active:opacity-60"
              >
                <Text className="font-semibold text-lg text-primary">
                  Avbryt
                </Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={!text.trim()}
                accessibilityRole="button"
                className={`rounded-full bg-primary px-8 py-2 active:opacity-80 ${
                  text.trim() ? "" : "opacity-40"
                }`}
              >
                <Text className="font-semibold text-lg text-background">
                  Importera
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
