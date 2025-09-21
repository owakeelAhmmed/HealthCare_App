import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function DoctorDashboard() {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="text-3xl font-bold text-green-600 mb-6">
        👨‍⚕️ Doctor Dashboard
      </Text>

      <Text className="text-gray-700 mb-4">
        Welcome, Doctor! Manage your appointments and patients here.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        className="bg-green-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Go to Patient Tabs</Text>
      </TouchableOpacity>
    </View>
  );
}
