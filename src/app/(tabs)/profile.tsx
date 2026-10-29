import Allergen from "@/components/allergen";
import Button from "@/components/button";
import IconButton from "@/components/icon-button";
import ImportLinkModal from "@/components/import-link-modal";
import LogoutModal from "@/components/logout-modal";
import ToleranceModal from "@/components/tolerance-modal";
import type { Ingredient, Restriction } from "@/context/profile-context";
import { useProfile } from "@/context/profile-context";
import { buildShareUrl } from "@/lib/share-link";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = require("../../constants/colors");

type ViewRef =
  NonNullable<ComponentProps<typeof View>["ref"]> extends
    { current: infer T } | ((instance: infer T) => void)
    ? T
    : never;

export default function ProfileScreen() {
  const { name, restrictions, lists, createList, deleteList, setSeverity } =
    useProfile();
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { width } = useWindowDimensions();
  const plusRef = useRef<ViewRef>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );
  const [isImporting, setIsImporting] = useState(false);

  const openMenu = () =>
    plusRef.current?.measureInWindow((x, y, w, h) =>
      setMenuPos({ top: y + h + 4, right: width - (x + w) }),
    );
  const closeMenu = () => setMenuPos(null);

  const addList = () => {
    closeMenu();
    const id = createList("Ny lista");
    editList(id);
  };

  const importList = (listName: string, items: Restriction[]) => {
    const id = createList(listName, items);
    editList(id); // opens it so it can be renamed or adjusted
  };

  const editList = (id: string) =>
    router.push({ pathname: "/list/[id]", params: { id } });

  const shareRestrictions = () => {
    const url = buildShareUrl(name, restrictions);
    Share.share({
      message: `${name || "Någon"} delar sina restriktioner i Qoll:\n${url}`,
    });
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
        onSelect={(s) => setSeverity(editing!, s)}
        onClose={() => setEditing(null)}
        onLearnMore={() => {
          const item = editing;
          setEditing(null);
          if (item)
            router.push({
              pathname: "/allergen/[id]",
              params: { id: item.id, name: item.name },
            });
        }}
      />
      <LogoutModal
        visible={isLoggingOut}
        onClose={() => setIsLoggingOut(false)}
      />
      <Modal
        visible={menuPos !== null}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <Pressable
          onPress={closeMenu}
          accessibilityLabel="Stäng"
          className="flex-1"
        >
          {menuPos && (
            <View
              style={{
                position: "absolute",
                top: menuPos.top,
                right: menuPos.right,
              }}
              className="min-w-[170px] rounded-2xl bg-white py-2 shadow-lg shadow-ink/30"
            >
              <Pressable
                onPress={addList}
                accessibilityRole="menuitem"
                className="px-5 py-3 active:opacity-60"
              >
                <Text className="text-base text-ink">Skapa ny lista</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  closeMenu();
                  setIsImporting(true);
                }}
                accessibilityRole="menuitem"
                className="px-5 py-3 active:opacity-60"
              >
                <Text className="text-base text-ink">Importera länk</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>

      <ImportLinkModal
        visible={isImporting}
        onClose={() => setIsImporting(false)}
        onImport={importList}
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
                <View ref={plusRef} collapsable={false}>
                  <IconButton label="Skapa ny lista" onPress={openMenu}>
                    <Ionicons
                      name="add-circle-outline"
                      size={32}
                      color={colors.primary}
                    />
                  </IconButton>
                </View>
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
