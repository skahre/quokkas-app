import { LinearGradient } from "expo-linear-gradient";
const colors = require("../constants/colors");

export default function GradientBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[colors.mist.top, colors.mist.mid, colors.mist.bottom]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
