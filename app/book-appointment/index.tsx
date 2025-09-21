import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Use useMemo to avoid recreating the array on every render
  const availableSlotsParam = useMemo(() => {
    return params.available_slots ? JSON.parse(params.available_slots as string) : [];
  }, [params.available_slots]); // Only recreate when params.available_slots changes

  const doctor = useMemo(() => {
    return params.doctor ? JSON.parse(params.doctor as string) : null;
  }, [params.doctor]);

  const [availableSlots, setAvailableSlots] = useState<string[]>(availableSlotsParam);
  const [loadingSlots, setLoadingSlots] = useState(!availableSlotsParam.length);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch slots from backend if not passed as params
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor || availableSlotsParam.length > 0) {
        setLoadingSlots(false);
        return;
      }

      try {
        const response = await apiService.get(API_ENDPOINTS.DOCTOR_SLOTS(doctor.id));
        
        if (response.error) {
          Alert.alert("Error", response.error || "Failed to load available slots");
          return;
        }

        setAvailableSlots(response.data?.slots || []);
      } catch (error: any) {
        console.error("Error fetching slots:", error);
        Alert.alert("Error", "Failed to load available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor, availableSlotsParam]); // Now the dependencies are stable

  // Confirm Booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setBookingLoading(true);
    try {
      const [date, time] = selectedSlot.split(" ");

      const response = await apiService.post(API_ENDPOINTS.APPOINTMENTS, {
        doctor: doctor.id,
        date,
        time,
        reason: "Medical Consultation",
      });

      if (response.error) {
        Alert.alert("Error", response.error || "Failed to book appointment");
        return;
      }

      Alert.alert("Success", "Your appointment has been booked!", [
        { 
          text: "OK", 
          onPress: () => router.push("/appointments") 
        },
      ]);
    } catch (error: any) {
      console.error("Booking error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-lg mb-4">Doctor information not found</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 20,
          paddingHorizontal: 16,
        }}
      >
        {/* Doctor Info */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Dr. {doctor.user_details?.first_name} {doctor.user_details?.last_name}
          </Text>
          <Text className="text-blue-600 mb-1">{doctor.specialization}</Text>
          <Text className="text-yellow-500 mb-3">
            ⭐ {doctor.experience} years experience
          </Text>
          <Text className="text-green-600 font-bold text-lg">
            Consultation Fee: ৳{doctor.consultation_fee}
          </Text>
        </View>

        {/* Slots */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Select Time Slot
          </Text>

          {loadingSlots ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-2">Loading available slots...</Text>
            </View>
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
                  disabled={bookingLoading}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedSlot === slot ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {slot.split(" ")[1]} {/* time */}
                  </Text>
                  <Text className={`text-center text-xs ${
                    selectedSlot === slot ? "text-blue-100" : "text-gray-400"
                  }`}>
                    {slot.split(" ")[0]} {/* date */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-lg mb-2">No available slots</Text>
              <Text className="text-gray-400 text-center">
                This doctor doesn`t have any available time slots at the moment.
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Button */}
        {availableSlots.length > 0 && (
          <TouchableOpacity
            className={`py-4 rounded-full ${
              bookingLoading || !selectedSlot ? "bg-gray-400" : "bg-green-600"
            }`}
            onPress={handleConfirmBooking}
            disabled={bookingLoading || !selectedSlot}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {selectedSlot ? "Confirm Booking" : "Select a Time Slot"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className="py-3 rounded-full bg-gray-500 mt-4"
          onPress={() => router.back()}
          disabled={bookingLoading}
        >
          <Text className="text-white text-center font-semibold">
            Back to Doctor Details
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}