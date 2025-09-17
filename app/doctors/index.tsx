import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Define types for the doctor data
interface User {
  first_name: string;
  last_name: string;
}

interface Doctor {
  id: number;
  user: User;
  specialization: string;
  experience: number;
  consultation_fee: number;
  bio: string;
}

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // AsyncStorage থেকে token নিন
        const token = await AsyncStorage.getItem('access_token');
        
        if (!token) {
          Alert.alert('Error', 'Please login first');
          router.replace('/(auth)/login');
          return;
        }

        // console.log('Token:', token);

        const response = await fetch("https://health-care-backend-tawny.vercel.app/api/doctors/", {
          method: "GET",
          headers: {
            "Authorization": `JWT ${token}`, 
            "Content-Type": "application/json",
          },
        });

        // console.log('Response status:', response.status);

        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again');
          await AsyncStorage.removeItem('access_token');
          router.replace('/(auth)/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }

        const data = await response.json();
        // console.log('Doctors data:', data);
        setDoctors(data);
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', error.message || 'Failed to fetch doctors');
        
        // Fallback sample data
        // const sampleDoctors: Doctor[] = [
        //   {
        //     id: 1,
        //     user: { first_name: 'Sarah', last_name: 'Johnson' },
        //     specialization: 'Cardiologist',
        //     experience: 10,
        //     consultation_fee: 1500,
        //     bio: 'Experienced cardiologist'
        //   },
        //   {
        //     id: 2,
        //     user: { first_name: 'Michael', last_name: 'Chen' },
        //     specialization: 'Neurologist',
        //     experience: 8,
        //     consultation_fee: 1200,
        //     bio: 'Specialized in neurology'
        //   }
        // ];
        // setDoctors(sampleDoctors);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-2">Loading doctors...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
    <ScrollView 
    contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 80    
        }}>
      <Text className="text-2xl font-bold text-gray-800 mb-6">Find Doctors</Text>

      {doctors.length === 0 ? (
        <Text className="text-center text-gray-500 mt-10">No doctors available</Text>
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
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Text className="text-blue-600 text-lg">👨‍⚕️</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">
                  Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                </Text>
                <Text className="text-gray-600">{doctor.specialization}</Text>
                <Text className="text-yellow-500">
                  ⭐ {doctor.experience} yrs exp.
                </Text>
                <Text className="text-green-600 font-semibold">
                  ৳{doctor.consultation_fee}
                </Text>
              </View>
              <Text className="text-blue-600">→</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}