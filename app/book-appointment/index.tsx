import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const doctor = params.doctor ? JSON.parse(params.doctor as string) : null;

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch slots from backend
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;

      try {
        const response = await fetch(
          `https://health-care-backend-tawny.vercel.app/api/doctors/${doctor.id}/slots/`
        );
        const data = await response.json();
        setAvailableSlots(data.slots);
      } catch (error) {
        console.error("Error fetching slots:", error);
        Alert.alert("Error", "Failed to load available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor]);

  // Confirm Booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setBookingLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        router.replace("/(auth)/login");
        return;
      }

      const [date, time] = selectedSlot.split(" ");

      const response = await fetch(`https://health-care-backend-tawny.vercel.app/api/appointments/`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor: doctor.id,
          date,
          time,
          reason: "Checkup", // optionally make this dynamic
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Your appointment has been booked!", [
          { text: "OK", onPress: () => router.push("/book-appointment") },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Doctor information not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 90,
          paddingHorizontal: 16,
        }}
      >
        {/* Doctor Info */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Dr. {doctor.user.first_name} {doctor.user.last_name}
          </Text>
          <Text className="text-blue-600 mb-1">{doctor.specialization}</Text>
          <Text className="text-yellow-500 mb-3">
            ⭐ {doctor.experience} years experience
          </Text>
          <Text className="text-green-600 font-bold text-lg">
            Fee: ৳{doctor.consultation_fee}
          </Text>
        </View>

        {/* Slots */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Select Time Slot
          </Text>

          {loadingSlots ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : availableSlots.length > 0 ? (
            <View className="flex-row flex-wrap -m-1">
              {availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  className={`m-1 p-3 rounded-lg border w-28 ${
                    selectedSlot === slot
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    className={`text-center ${
                      selectedSlot === slot ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {slot.split(" ")[1]} {/* time */}
                  </Text>
                  <Text className="text-center text-gray-400 text-xs">
                    {slot.split(" ")[0]} {/* date */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500">No available slots found</Text>
          )}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          className={`py-4 rounded-full ${
            bookingLoading ? "bg-gray-400" : "bg-green-600"
          }`}
          onPress={handleConfirmBooking}
          disabled={bookingLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
