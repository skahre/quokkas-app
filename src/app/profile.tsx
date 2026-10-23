import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Same palette as theme/colors.js. Icons take a color prop, not className,
// so we import the values directly.
const colors = require("../constants/colors");

type Props = {
  name?: string;
  restrictions?: string[];
  lists?: string[];
  onSettings?: () => void;
  onShare?: () => void;
  onAddRestriction?: () => void;
  onEditRestriction?: (item: string) => void;
  onAddList?: () => void;
  onEditList?: (item: string) => void;
  onDeleteList?: (item: string) => void;
};

export default function ProfileScreen({
  name = "Lasse Andersson",
  restrictions = ["Lök", "Nötter", "Soja"],
  lists = ["Alice Cohen", "Phöseriet 2026", "Familjen"],
  onSettings,
  onShare,
  onAddRestriction,
  onEditRestriction,
  onAddList,
  onEditList,
  onDeleteList,
}: Props) {
  return (
    <View className="flex-1 bg-cream">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-40 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <View className="flex-row items-center rounded-3xl bg-white px-4 py-4">
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={72}
              color={colors.primary.DEFAULT}
            />
            <Text className="ml-4 flex-1 font-nunito-bold text-lg text-ink">
              {name}
            </Text>
            <IconButton label="Inställningar" onPress={onSettings}>
              <Ionicons name="settings-sharp" size={28} color={colors.ink} />
            </IconButton>
          </View>

          {/* Restrictions */}
          <View className="mt-10 flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="font-nunito-bold text-xl text-ink"
            >
              Dina restriktioner
            </Text>
            <Pressable
              onPress={onShare}
              accessibilityRole="button"
              className="flex-row items-center rounded-full border-2 border-primary px-4 py-1.5 active:opacity-70"
            >
              <Text className="mr-1.5 font-nunito-semibold text-base text-primary">
                Dela
              </Text>
              <Ionicons
                name="share-social-outline"
                size={18}
                color={colors.primary.DEFAULT}
              />
            </Pressable>
          </View>

          <View className="mt-3 gap-2.5">
            {restrictions.map((item) => (
              <Row key={item}>
                <MaterialCommunityIcons
                  name="emoticon-sad"
                  size={34}
                  color={colors.danger}
                />
                <Text className="ml-4 flex-1 font-nunito text-lg text-ink">
                  {item}
                </Text>
                <IconButton
                  label={`Redigera ${item}`}
                  onPress={() => onEditRestriction?.(item)}
                >
                  <MaterialIcons name="edit" size={24} color={colors.ink} />
                </IconButton>
              </Row>
            ))}
          </View>

          <Pressable
            onPress={onAddRestriction}
            accessibilityRole="button"
            className="mt-4 flex-row items-center self-center rounded-full bg-primary px-6 py-3 active:opacity-80"
          >
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
            <Text className="ml-1.5 font-nunito-bold text-2xl text-white">
              Lägg till
            </Text>
          </Pressable>

          {/* Lists */}
          <View className="mt-10 flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="font-nunito-bold text-xl text-ink"
            >
              Dina listor
            </Text>
            <IconButton label="Skapa ny lista" onPress={onAddList}>
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={colors.primary.DEFAULT}
              />
            </IconButton>
          </View>

          <View className="mt-3 gap-2.5">
            {lists.map((item) => (
              <Row key={item}>
                <Text className="flex-1 font-nunito text-lg text-ink">
                  {item}
                </Text>
                <IconButton
                  label={`Redigera ${item}`}
                  onPress={() => onEditList?.(item)}
                >
                  <MaterialIcons name="edit" size={24} color={colors.ink} />
                </IconButton>
                <IconButton
                  label={`Ta bort ${item}`}
                  onPress={() => onDeleteList?.(item)}
                  className="ml-4"
                >
                  <MaterialIcons
                    name="delete"
                    size={26}
                    color={colors.danger}
                  />
                </IconButton>
              </Row>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ---------- Building blocks ---------- */

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-center rounded-3xl bg-white px-5 py-4 shadow-md shadow-black/20">
      {children}
    </View>
  );
}

function IconButton({
  children,
  label,
  onPress,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      className={`active:opacity-60 ${className}`}
    >
      {children}
    </Pressable>
  );
}
