import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

const colors = require("../constants/colors");

type Variant = "primary" | "secondary";
type IconName = React.ComponentProps<typeof Ionicons>["name"];

const buttonStyles: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "border-2 border-primary",
};

const textStyles: Record<Variant, string> = {
  primary: "text-background",
  secondary: "text-primary",
};

// Icons take a color value, not a className, so these must match textStyles.
const iconColors: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.primary,
};

export default function Button({
  label,
  className,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
}: {
  label: string;
  className?: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconPosition?: "left" | "right";
}) {
  const iconEl = icon ? (
    <Ionicons name={icon} size={28} color={iconColors[variant]} />
  ) : null;

  const padding = !icon
    ? "px-8"
    : iconPosition === "left"
      ? "pl-6 pr-8"
      : "pl-8 pr-6";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-2 self-start rounded-full py-4 active:opacity-80 ${padding} ${buttonStyles[variant]} ${className ?? ""}`}
    >
      {iconPosition === "left" && iconEl}
      <Text className={`text-2xl font-semibold ${textStyles[variant]}`}>
        {label}
      </Text>
      {iconPosition === "right" && iconEl}
    </Pressable>
  );
}
