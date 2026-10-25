import { Pressable, Text } from "react-native";

const buttonStyles = {
  primary: "bg-primary",
  secondary: "border-2 border-primary",
};

const textStyles = { primary: "text-background", secondary: "text-primary" };

export default function Button({
  label,
  className,
  onPress,
  variant = "primary",
}: {
  label: string;
  className?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-full px-10 py-4 active:opacity-80 ${buttonStyles[variant]} ${className ? className : ""}`}
    >
      <Text className={`text-2xl font-semibold ${textStyles[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
