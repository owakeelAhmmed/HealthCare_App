import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from "../config/api";

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);


  // Function to map integer user_type to string
  const getUserTypeString = (userTypeInt) => {
    switch (userTypeInt) {
      case 1: return 'patient';
      case 2: return 'doctor';
      case 3: return 'admin';
      default: return 'patient';
    }
  };

  // Function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      // 1. Login API call to get JWT token
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData),
      });

      const tokenData = await response.json();

      if (!response.ok) {
        throw new Error(tokenData.detail || tokenData.error || "Invalid credentials");
      }

      // console.log("Login API response:", tokenData);

      // Check if we have access token
      if (!tokenData.access) {
        throw new Error("Access token not found in response");
      }

      // 2. Decode JWT token to get user information
      const decodedToken = decodeJWT(tokenData.access);


      if (!decodedToken) {
        throw new Error("Failed to decode JWT token");
      }

      // 3. Get user details from token or fetch from API
      let userData;
      
      // Try to fetch user profile from API
      try {
        const userResponse = await fetch(API_ENDPOINTS.AUTH.USER_PROFILE, {
          headers: {
            "Authorization": `JWT ${tokenData.access}`,
          },
        });

        if (userResponse.ok) {
          userData = await userResponse.json();
          console.log("User profile from API:", userData);
        } else {
          throw new Error("Failed to fetch user profile");
        }
      } catch (profileError) {
        console.log("Using user data from JWT token");
        // If API call fails, use data from JWT token
        userData = {
          id: decodedToken.user_id || 0,
          username: decodedToken.username || formData.username,
          email: decodedToken.email || '',
          first_name: decodedToken.first_name || formData.username,
          last_name: decodedToken.last_name || '',
          user_type: decodedToken.user_type || 1, // Default to patient
          phone: decodedToken.phone || ''
        };
      }

      // Convert integer user_type to string format
      const processedUserData = {
        ...userData,
        user_type: getUserTypeString(userData.user_type)
      };

      

      // 4. Save in AuthContext & AsyncStorage
      await login(processedUserData, tokenData.access);

      Alert.alert("Success", "Login successful!");
      
      // 5. Redirect based on user role
      if (processedUserData.user_type === 'doctor') {
        console.log("Redirecting to doctor dashboard");
        router.replace("/(dashboard)/doctor");
      } else if (processedUserData.user_type === 'admin') {
        console.log("Redirecting to admin dashboard");
        router.replace("/(dashboard)/admin");
      } else {
        console.log("Redirecting to patient dashboard");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // More specific error messages
      if (error.message.includes('token') || error.message.includes('JWT')) {
        Alert.alert("Login Error", "Invalid session. Please try again.");
      } else if (error.message.includes('credentials')) {
        Alert.alert("Login Error", "Invalid username or password");
      } else if (error.message.includes('network')) {
        Alert.alert("Network Error", "Please check your internet connection");
      } else {
        Alert.alert("Error", error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 mt-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white mb-3"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-[#16ea7f] py-4 rounded-lg items-center mb-3"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <Text className="text-blue-600">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8">
          <Text className="text-gray-600">
            Don&#39;t have an account?{" "}
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