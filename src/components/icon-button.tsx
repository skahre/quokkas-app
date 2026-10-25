import { Pressable } from "react-native";

export default function IconButton({
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
