import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';
import { Doctor } from '../types';



export default function DoctorsScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(API_ENDPOINTS.DOCTORS);
      // console.log('Doctors API Response:', response);
      
      if (response.error) {
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again');
          router.replace('/(auth)/login');
          return;
        }
        throw new Error(response.error);
      }

      // Ensure we have an array of doctors
      const doctorsData = Array.isArray(response.data) ? response.data : [];
      setDoctors(doctorsData);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDoctors();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-2">Loading doctors...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity 
          onPress={handleRetry}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <ScrollView 
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 20    
        }}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-6">Find Doctors</Text>

        {doctors.length === 0 ? (
          <View className="bg-white p-6 rounded-xl items-center">
            <Text className="text-gray-600 text-lg mb-2">No doctors available</Text>
            <Text className="text-gray-400 text-center">Please check back later or contact support</Text>
          </View>
        ) : (
          doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-4"
              onPress={() => router.push({
                pathname: `/doctors/${doctor.id}`,
                params: { doctor: JSON.stringify(doctor) }
              })}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-600 text-2xl">👨‍⚕️</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800 text-lg">
                    Dr. {doctor.user_details?.first_name} {doctor.user_details?.last_name}
                  </Text>
                  <Text className="text-blue-600 text-sm mb-1">{doctor.specialization}</Text>
                  <Text className="text-yellow-500 text-sm mb-1">
                    ⭐ {doctor.experience} years experience
                  </Text>
                  <Text className="text-green-600 font-semibold">
                    Fee: ৳{doctor.consultation_fee}
                  </Text>
                  {doctor.available_hours && (
                    <Text className="text-gray-500 text-xs mt-1">
                      Available: {doctor.available_hours}
                    </Text>
                  )}
                </View>
                <Text className="text-blue-600 text-lg">→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}