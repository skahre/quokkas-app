import Allergen from "@/components/allergen";
import Button from "@/components/button";
import IconButton from "@/components/icon-button";
import LogoutModal from "@/components/logout-modal";
import ToleranceModal from "@/components/tolerance-modal";
import type { Ingredient } from "@/context/profile-context";
import { useProfile } from "@/context/profile-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../../constants/colors");

export default function ProfileScreen() {
  const { name, restrictions, lists, createList, deleteList, setSeverity } =
    useProfile();
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const editList = (id: string) =>
    router.push({ pathname: "/list/[id]", params: { id } });

  // TODO: A link that can be uploaded in the app
  const shareRestrictions = () =>
    Share.share({
      message: `Mina restriktioner: ${restrictions.join(", ")}`,
    });

  const addList = () => {
    const id = createList("Ny lista");
    editList(id); // open it straight away so it can be renamed and filled
  };

  const confirmDeleteList = (id: string, listName: string) =>
    Alert.alert(`Ta bort "${listName}"?`, "Det går inte att ångra.", [
      { text: "Avbryt", style: "cancel" },
      { text: "Ta bort", style: "destructive", onPress: () => deleteList(id) },
    ]);

  return (
    <>
      <ToleranceModal
        visible={editing !== null}
        value={"allergy"}
        onSelect={(s) => setSeverity(editing!, s)} // only runs on OK
        onClose={() => setEditing(null)}
      />
      <LogoutModal
        visible={isLoggingOut}
        onClose={() => setIsLoggingOut(false)}
      />
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 gap-8">
            {/* Profile card */}
            <View className="flex-row gap-4 items-center rounded-3xl bg-white px-4 py-4">
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={72}
                color={colors.primary}
              />
              <Text className="flex-1 font-bold text-lg text-ink">
                {name || "Din profil"}
              </Text>
              <IconButton
                label="Inställningar"
                onPress={() => setIsLoggingOut(true)}
              >
                <Ionicons name="settings-sharp" size={28} color={colors.ink} />
              </IconButton>
            </View>

            {/* Restrictions */}
            <View className="flex-col gap-2">
              <View className="flex-row items-center justify-between">
                <Text
                  accessibilityRole="header"
                  className="font-bold text-xl text-ink"
                >
                  Dina restriktioner
                </Text>
                {restrictions.length > 0 && (
                  <Pressable
                    onPress={shareRestrictions}
                    accessibilityRole="button"
                    className="flex-row items-center gap-1 rounded-full px-4 py-2 active:opacity-80 border-2 border-primary"
                  >
                    <Text className="text-base text-primary">Dela</Text>
                    <Ionicons
                      name="share-social-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </Pressable>
                )}
              </View>

              <View className="gap-2">
                {restrictions.length > 0 ? (
                  restrictions.map((item) => (
                    <Allergen
                      key={item.name}
                      label={item.name}
                      severity={item.severity}
                      actionType="edit"
                      onAction={() => setEditing(item)}
                    />
                  ))
                ) : (
                  <Text className="text-base text-ink">
                    Du har inga restriktioner ännu.
                  </Text>
                )}
              </View>

              <Button
                label="Lägg till"
                icon="add-circle-outline"
                iconPosition="left"
                onPress={() => router.push("/edit-restrictions")}
                className="self-center"
              />
            </View>

            {/* Lists */}
            <View className="flex-col gap-2">
              <View className="flex-row items-center justify-between">
                <Text
                  accessibilityRole="header"
                  className="font-bold text-xl text-ink"
                >
                  Dina listor
                </Text>
                <IconButton label="Skapa ny lista" onPress={addList}>
                  <Ionicons
                    name="add-circle-outline"
                    size={32}
                    color={colors.primary}
                  />
                </IconButton>
              </View>

              <View className="gap-2">
                {lists.length > 0 ? (
                  lists.map((list) => (
                    <View
                      key={list.id}
                      className="flex-row items-center rounded-3xl bg-white px-5 py-4 shadow-md shadow-black/20"
                    >
                      <Text className="flex-1 text-lg text-ink">
                        {list.name}
                      </Text>
                      <View className="flex-row gap-1 items-center">
                        <IconButton
                          label={`Redigera ${list.name}`}
                          onPress={() => editList(list.id)}
                        >
                          <MaterialIcons
                            name="edit"
                            size={24}
                            color={colors.ink}
                          />
                        </IconButton>
                        <IconButton
                          label={`Ta bort ${list.name}`}
                          onPress={() => confirmDeleteList(list.id, list.name)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={26}
                            color={colors.danger}
                          />
                        </IconButton>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-base text-ink">
                    Du har inga listor ännu.
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
