import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface User {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface Doctor {
  id: number;
  user: User;
  specialization: string;
  experience: number;
  consultation_fee: number;
  bio: string;
  address?: string;
  available_hours?: string;
}

const API_BASE = __DEV__
  ? "https://health-care-backend-tawny.vercel.app"
  : "https://your-production-domain.com";

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
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        Alert.alert("Login Required", "Please login to book an appointment.");
        router.replace("/(auth)/login");
        return;
      }

      const url = `${API_BASE}/api/doctors/${doctor.id}/availability/`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Availability API failed, skipping check.");
        // Corrected route path
        router.push({
          pathname: "/book-appointment",
          params: { doctor: JSON.stringify(doctor) },
        });
        return;
      }

      const availability = await response.json();

      if (availability.available) {
        // Corrected route path
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
          "This doctor is currently not available for appointments."
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
        <Text className="text-gray-600">Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Doctor not found</Text>
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
          paddingTop: 20, // Reduced padding top
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
                Dr. {doctor.user.first_name} {doctor.user.last_name}
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
              <Text className="text-white font-semibold">
                {appointmentLoading ? 'Checking...' : 'Book Appointment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">About Doctor</Text>
          <Text className="text-gray-600 leading-6">{doctor.bio}</Text>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Contact Information</Text>
          
          {doctor.user.phone && (
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-500 w-24">Phone:</Text>
              <Text className="text-gray-800">{doctor.user.phone}</Text>
            </View>
          )}
          
          {doctor.user.email && (
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-500 w-24">Email:</Text>
              <Text className="text-blue-600">{doctor.user.email}</Text>
            </View>
          )}
          
          {doctor.address && (
            <View className="flex-row items-start">
              <Text className="text-gray-500 w-24">Address:</Text>
              <Text className="text-gray-800 flex-1">{doctor.address}</Text>
            </View>
          )}
        </View>

        {/* Availability */}
        {doctor.available_hours && (
          <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Text className="text-xl font-semibold text-gray-800 mb-4">Available Hours</Text>
            <Text className="text-gray-600">{doctor.available_hours}</Text>
          </View>
        )}

        {/* Services */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Services</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">•</Text>
              <Text className="text-gray-600">General Consultation</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">•</Text>
              <Text className="text-gray-600">Specialist Advice</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">•</Text>
              <Text className="text-gray-600">Follow-up Visits</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">•</Text>
              <Text className="text-gray-600">Medical Prescriptions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}