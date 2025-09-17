import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      // 1. Get JWT token
      const tokenRes = await fetch("https://health-care-backend-tawny.vercel.app/api/auth/jwt/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access) {
        throw new Error(tokenData.detail || "Invalid credentials");
      }

      // 2. Get user details
      const userRes = await fetch("https://health-care-backend-tawny.vercel.app/api/auth/users/me/", {
        headers: {
          "Authorization": `JWT ${tokenData.access}`,
        },
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error("Failed to fetch user data");
      }

      // 3. DEBUG: Check what data comes from API
      // console.log("Full user data from API:", userData);

      // 4. Ensure all required fields with fallback values
      const completeUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name || userData.username || "",
        last_name: userData.last_name || "",
        user_type: userData.user_type || "patient",
        phone: userData.phone || ""
      };

      // console.log("Complete user data to save:", completeUserData);

      // 5. Save in AuthContext & AsyncStorage
      await login(completeUserData, tokenData.access);

      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center min-h-screen">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold mb-4">
            HEALTH<Text className="text-[#16ea7f]">CARE</Text>
          </Text>
          <Text className="text-gray-600 mt-2">Sign in to your account</Text>
        </View>

        {/* Login Form */}
        <View className="space-y-6">
          <View>
            <Text className="text-gray-700 mb-2">Username or Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              placeholder="Enter your username or email"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 mt-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white mb-3"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-[#16ea7f] py-4 rounded-lg items-center mb-3"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <Text className="text-blue-600">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8">
          <Text className="text-gray-600">
            Don`t have an account?{" "}
            <Text
              className="text-blue-600 font-semibold"
              onPress={() => router.push("/(auth)/register")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}