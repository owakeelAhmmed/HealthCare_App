import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';
import { AvailabilityResponse, Doctor } from '../types';

export default function DoctorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(false);

  useEffect(() => {
    if (params.doctor) {
      try {
        const doctorData = JSON.parse(params.doctor as string);
        setDoctor(doctorData);
      } catch (error) {
        console.error('Error parsing doctor data:', error);
        Alert.alert('Error', 'Failed to load doctor details');
        router.back();
      }
      setLoading(false);
    }
  }, [params.doctor, router]);

  const handleBookAppointment = async () => {
    if (!doctor) return;

    setAppointmentLoading(true);
    try {
      const response = await apiService.get(API_ENDPOINTS.DOCTOR_AVAILABILITY(doctor.id));
      
      if (response.error) {
        router.push({
          pathname: "/book-appointment",
          params: { doctor: JSON.stringify(doctor) },
        });
        return;
      }

      const availability = response.data as AvailabilityResponse;

      if (availability.available) {
        router.push({
          pathname: "/book-appointment",
          params: { 
            doctor: JSON.stringify(doctor),
            available_slots: JSON.stringify(availability.slots || [])
          }
        });
      } else {
        Alert.alert(
          "Not Available",
          "This doctor is currently not available for appointments. Please try another doctor or check back later."
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Error",
        "Could not check doctor availability. Please try again later."
      );
    } finally {
      setAppointmentLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-2">Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-lg mb-4">Doctor not found</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const services = [
    "General Consultation",
    "Specialist Advice",
    "Follow-up Visits",
    "Medical Prescriptions",
    "Health Checkup",
    "Treatment Planning"
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 20,
          paddingHorizontal: 16
        }}
      >
        {/* Header */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Text className="text-blue-600 text-2xl">👨‍⚕️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                Dr. {doctor.user_details?.first_name} {doctor.user_details?.last_name}
              </Text>
              <Text className="text-lg text-blue-600">{doctor.specialization}</Text>
              <Text className="text-yellow-500">
                ⭐ {doctor.experience} years experience
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mt-4">
            <View>
              <Text className="text-gray-600">Consultation Fee</Text>
              <Text className="text-green-600 font-bold text-xl">
                ৳{doctor.consultation_fee}
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-blue-600 px-6 py-3 rounded-full"
              onPress={handleBookAppointment}
              disabled={appointmentLoading}
            >
              {appointmentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Book Appointment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">About Doctor</Text>
          <Text className="text-gray-600 leading-6">
            {doctor.bio || "No biography available. This doctor specializes in " + doctor.specialization + "."}
          </Text>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Contact Information</Text>
          
          {doctor.user_details?.phone && (
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-500 w-24">Phone:</Text>
              <Text className="text-gray-800">{doctor.user_details.phone}</Text>
            </View>
          )}
          
          {doctor.user_details?.email && (
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-500 w-24">Email:</Text>
              <Text className="text-blue-600">{doctor.user_details.email}</Text>
            </View>
          )}
          
          {doctor.address && (
            <View className="flex-row items-start mb-3">
              <Text className="text-gray-500 w-24">Address:</Text>
              <Text className="text-gray-800 flex-1">{doctor.address}</Text>
            </View>
          )}
          
          {!doctor.user_details?.phone && !doctor.user_details?.email && !doctor.address && (
            <Text className="text-gray-500">Contact information not available</Text>
          )}
        </View>

        {/* Availability */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Availability</Text>
          <Text className="text-gray-600">
            {doctor.available_days ? `Available on: ${doctor.available_days}` : 'Availability not specified'}
          </Text>
          {doctor.available_time_start && doctor.available_time_end && (
            <Text className="text-gray-600 mt-2">
              Timing: {doctor.available_time_start} - {doctor.available_time_end}
            </Text>
          )}
          {doctor.available_hours && (
            <Text className="text-gray-600 mt-2">
              Hours: {doctor.available_hours}
            </Text>
          )}
        </View>

        {/* Services */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Services Offered</Text>
          <View className="space-y-2">
            {services.map((service, index) => (
              <View key={index} className="flex-row items-center">
                <Text className="text-green-500 mr-2">•</Text>
                <Text className="text-gray-600">{service}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}