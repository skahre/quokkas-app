import Button from "@/components/button";
import RestrictionsEditor from "@/components/restrictions-editor";
import { useProfile } from "@/context/profile-context";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_NAME = "Ny lista";

export default function EditListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, renameList, setListSeverity } = useProfile();

  const list = getList(id);

  if (!list) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-6 bg-background p-6">
        <Text className="text-center text-lg text-ink">
          Den här listan finns inte längre.
        </Text>
        <Button label="Tillbaka" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <RestrictionsEditor
      title={
        <TextInput
          value={list.name}
          onChangeText={(text) => renameList(list.id, text)}
          onEndEditing={() => {
            if (!list.name.trim()) renameList(list.id, FALLBACK_NAME);
          }}
          placeholder="Namn på lista"
          maxLength={40}
          selectTextOnFocus
          returnKeyType="done"
          accessibilityLabel="Namn på lista"
          className="flex-1 border-b-2 border-ink/20 py-1 text-center font-bold text-3xl text-ink"
        />
      }
      items={list.restrictions}
      onSetSeverity={(item, severity) =>
        setListSeverity(list.id, item, severity)
      }
      onDone={() => router.back()}
    />
  );
}
