import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-4xl font-bold mb-4">
        HEALTH<Text className="text-[#16ea7f]">CARE</Text>{" "}
      </Text>
      <Text className="text-gray-600 mb-8">Your Personal Health Assistant</Text>

      <Image
        className="w-[300px] h-[250px]"
        source={require("../assets/images/signup.png")}
        style={{
          width: 300,
          height: 250,
          resizeMode: "contain",
        }}
      />

      <View className="space-y-4 w-full max-w-xs">
        <Link
          href="/(auth)/login"
          className="bg-[#16ea7f] text-xl text-white text-center py-3 rounded-lg font-semibold mb-4"
        >
          Sign In
        </Link>

        <Link
          href="/(auth)/register"
          className="border border-blue-600 text-blue-600 text-center py-3 rounded-lg font-semibold"
        >
          Create Account
        </Link>
      </View>
    </View>
  );
}
