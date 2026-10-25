import { Image, Text, View } from "react-native";

export default function SponsorFooter() {
  return (
    <View className="flex-row items-center justify-center">
      <Text className="text-base font-medium text-ink">Med stöd från</Text>
      <Image
        source={require("../../assets/astma-allergi-forbundet.png")}
        className="h-[60px] w-[160px]"
        resizeMode="contain"
        accessibilityLabel="Astma- och Allergiförbundet"
      />
    </View>
  );
}
