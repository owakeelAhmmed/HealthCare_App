import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600 mb-4">Please login first</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login')}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 20,
        }}
      >
        {/* Header Section */}
        <View className="bg-white px-6 py-6 mb-4 rounded-b-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-6 bg-[#44e394] px-4 pt-4 rounded-2xl">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold ">
                HEALTH<Text className=""> CARE</Text>
              </Text>
              <Text className="text-white text-sm">
                Your Health, Our Priority
              </Text>
            </View>

            <View className="flex-row items-center">
              <Image
                className="w-[100px] h-[100px] mr-4"
                source={require("../../assets/images/hederImg.png")}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={logout}
                className="bg-red-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-red-600 font-medium">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Message */}
          <View className="p-4">
            <Text className="text-3xl font-bold text-gray-800">
              Welcome,{" "}
              {user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : "User"}
              !
            </Text>
            <Text className="text-gray-600 mt-2 text-lg">
              How can we help you today?
            </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 mt-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {/* Book Appointment */}
            <TouchableOpacity
              className="w-[48%] mb-4"
              onPress={() => router.push("/book-appointment")}
            >
              <View className="bg-white p-5 rounded-xl shadow-sm items-center">
                <View className="bg-blue-100 p-3 rounded-full mb-3">
                  <Text className="text-blue-600 text-2xl">📅</Text>
                </View>
                <Text className="font-semibold text-gray-800 text-center">
                  Book Appointment
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1">
                  Schedule with doctors
                </Text>
              </View>
            </TouchableOpacity>

            {/* Find Doctors */}
            <TouchableOpacity
              className="w-[48%] mb-4"
              onPress={() => router.push("/doctors")}
            >
              <View className="bg-white p-5 rounded-xl shadow-sm items-center">
                <View className="bg-green-100 p-3 rounded-full mb-3">
                  <Text className="text-green-600 text-2xl">👨‍⚕️</Text>
                </View>
                <Text className="font-semibold text-gray-800 text-center">
                  Find Doctors
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1">
                  Browse specialists
                </Text>
              </View>
            </TouchableOpacity>

            {/* My Appointments */}
            <TouchableOpacity
              className="w-[48%] mb-4"
              onPress={() => router.push("/appointments")}
            >
              <View className="bg-white p-5 rounded-xl shadow-sm items-center">
                <View className="bg-purple-100 p-3 rounded-full mb-3">
                  <Text className="text-purple-600 text-2xl">📋</Text>
                </View>
                <Text className="font-semibold text-gray-800 text-center">
                  My Appointments
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1">
                  View bookings
                </Text>
              </View>
            </TouchableOpacity>

            {/* Emergency */}
            <TouchableOpacity
              className="w-[48%] mb-4"
              onPress={() => router.push("/emergency")}
            >
              <View className="bg-white p-5 rounded-xl shadow-sm items-center">
                <View className="bg-red-100 p-3 rounded-full mb-3">
                  <Text className="text-red-600 text-2xl">🚑</Text>
                </View>
                <Text className="font-semibold text-gray-800 text-center">
                  Emergency
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1">
                  Immediate help
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
