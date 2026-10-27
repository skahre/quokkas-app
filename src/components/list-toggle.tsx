import type { RestrictionList } from "@/context/profile-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import Button from "./button";
const colors = require("../constants/colors");

type MultiSelectDropdownProps = {
  options: RestrictionList[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export default function ListToggle({
  options,
  value,
  onChange,
  placeholder = "Select options",
}: MultiSelectDropdownProps) {
  const [visible, setVisible] = useState(false);

  const toggleOption = (optionValue: string) => {
    const nextValue = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange(nextValue);
  };

  return (
    <View className="">
      {/* Dropdown trigger */}
      <Pressable
        onPress={() => setVisible(true)}
        className="rounded-full shadow-md shadow-ink/20 bg-white px-3.5 py-3 self-start items-center justify-center"
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Ionicons name="filter" size={28} color={colors.ink} />
      </Pressable>

      {/* Dropdown modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/60 px-4">
          <Pressable
            className="absolute inset-0"
            onPress={() => setVisible(false)}
            accessibilityLabel="Close dropdown"
          />

          <View className="max-h-[75%] overflow-hidden rounded-3xl bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink">
                  Filtrera enligt lista
                </Text>
                <Text className="text-sm text-ink/50">
                  {value.length} filter
                </Text>
              </View>

              <Pressable
                onPress={() => onChange([])}
                className=""
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text className="font-medium text-primary">Rensa</Text>
              </Pressable>
            </View>

            {/* Options */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = value.includes(item.id);

                return (
                  <Pressable
                    onPress={() => toggleOption(item.id)}
                    className="flex-row items-center justify-between border-b border-ink/10 px-4 py-4"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <Text
                      className={`flex-1 text-base ${
                        selected ? "font-semibold text-primary" : "text-ink"
                      }`}
                    >
                      {item.name}
                    </Text>

                    <View
                      className={`h-6 w-6 items-center justify-center rounded-md border ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-ink/30 bg-white"
                      }`}
                    >
                      {selected && (
                        <Text className="text-sm font-bold text-white">✓</Text>
                      )}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text className="p-6 text-center text-ink">
                  No options available.
                </Text>
              }
            />

            {/* Footer */}
            <View className="p-4">
              <Button
                label="Klar"
                className="w-full"
                onPress={() => setVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
