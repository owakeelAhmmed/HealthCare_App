import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function DoctorsScreen() {
  const router = useRouter();

  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', rating: 4.8 },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Neurologist', rating: 4.7 },
    { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrician', rating: 4.9 },
    { id: 4, name: 'Dr. Robert Brown', specialty: 'Dermatologist', rating: 4.6 },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Find Doctors</Text>
      
      {doctors.map((doctor) => (
        <TouchableOpacity
          key={doctor.id}
          className="bg-white p-4 rounded-xl shadow-sm mb-4"
          onPress={() => router.push(`/doctors/${doctor.id}`)}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Text className="text-blue-600 text-lg">👨‍⚕️</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{doctor.name}</Text>
              <Text className="text-gray-600">{doctor.specialty}</Text>
              <Text className="text-yellow-500">⭐ {doctor.rating}</Text>
            </View>
            <Text className="text-blue-600">→</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}