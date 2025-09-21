import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentScreen() {
  const { id, fee, doctor } = useLocalSearchParams();
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/25");
  const [cvv, setCvv] = useState("123");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Generate and send demo OTP
  const sendDemoOtp = () => {
    setSendingOtp(true);
    
    // Simulate OTP sending process
    setTimeout(() => {
      // Generate 6-digit OTP
      const newOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(newOtp);
      setOtpSent(true);
      setSendingOtp(false);
      
      Alert.alert(
        "Demo OTP Sent", 
        `Your OTP is: ${newOtp}\n\nUse this code to complete the payment.`,
        [{ text: "OK" }]
      );
    }, 1500);
  };

  const handleConfirmPayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert("Error", "Please fill all card details");
      return;
    }

    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }

    // OTP verification (demo purpose)
    if (generatedOtp && otp !== generatedOtp) {
      Alert.alert("Error", "Invalid OTP. Please enter the correct OTP.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        router.replace("/(auth)/login");
        return;
      }

      // Try to update appointment status to paid
      let response = await fetch(
        `https://health-care-backend-tawny.vercel.app/api/appointments/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({ status: "paid" }),
        }
      );

      // If PATCH fails, try POST to mark_paid endpoint
      if (!response.ok) {
        response = await fetch(
          `https://health-care-backend-tawny.vercel.app/api/appointments/${id}/mark_paid/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${token}`,
            },
          }
        );
      }

      if (response.ok) {
        Alert.alert(
          "Payment Successful", 
          `Payment of ৳${fee} for Appointment #${id} has been processed successfully.`,
          [
            {
              text: "OK",
              onPress: () => router.replace("/appointments?refresh=true"),
            },
          ]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        // console.log("Payment error response:", errorData);
        Alert.alert(
          "Error", 
          errorData.detail || errorData.error || "Payment failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Something went wrong while processing payment");
    } finally {
      setLoading(false);
    }
  };

  // Parse doctor information safely
  const getDoctorName = () => {
    try {
      if (doctor && typeof doctor === 'string') {
        const doctorData = JSON.parse(doctor);
        if (doctorData.user) {
          return `Dr. ${doctorData.user.first_name} ${doctorData.user.last_name}`;
        }
        if (doctorData.first_name) {
          return `Dr. ${doctorData.first_name} ${doctorData.last_name || ''}`;
        }
      }
      return "Unknown Doctor";
    } catch {
      return "Unknown Doctor";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <View className="flex-1 bg-white p-6 rounded-xl">
        <Text className="text-2xl font-bold text-center mb-6 text-gray-800">
          Payment Gateway
        </Text>
        
        {/* Appointment Summary */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <Text className="text-lg font-semibold text-center text-blue-800">
            Amount: ৳{fee || "500"}
          </Text>
          <Text className="text-gray-600 text-center mt-1">
            Appointment ID: #{id}
          </Text>
          <Text className="text-gray-600 text-center">
            Doctor: {getDoctorName()}
          </Text>
        </View>

        {/* Card Details */}
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Card Details
        </Text>
        
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Card Number</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            editable={!loading}
          />
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-gray-700 mb-2">Expiry Date</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              placeholder="MM/YY"
              value={expiry}
              onChangeText={setExpiry}
              editable={!loading}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-gray-700 mb-2">CVV</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              placeholder="123"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
              editable={!loading}
            />
          </View>
        </View>

        {/* OTP Section */}
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          OTP Verification
        </Text>
        
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Enter OTP</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter 6-digit OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            editable={!loading && otpSent}
          />
        </View>

        <TouchableOpacity
          className={`bg-blue-500 py-3 rounded-lg mb-4 ${sendingOtp ? "opacity-50" : ""}`}
          onPress={sendDemoOtp}
          disabled={sendingOtp || otpSent}
        >
          {sendingOtp ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-center">
              {otpSent ? "OTP Sent" : "Send OTP"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity
          className={`bg-[#16ea7f] py-4 rounded-lg mb-3 ${loading ? "opacity-50" : ""}`}
          onPress={handleConfirmPayment}
          disabled={loading || !otpSent}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Confirm Payment - ৳{fee || "500"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-500 py-3 rounded-lg"
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-center">
            Cancel Payment
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

