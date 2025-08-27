import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppointmentsScreen() {
  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', date: 'Aug 28, 2024', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Michael Chen', date: 'Sep 02, 2024', time: '2:30 PM', status: 'Pending' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <ScrollView 
        contentContainerStyle={{
          paddingBottom: 40, // নিচে space
          paddingTop: 20     // উপরে space
        }}
      >
      <Text className="text-2xl font-bold text-gray-800 mb-6">My Appointments</Text>
      
      {appointments.length === 0 ? (
        <View className="bg-white p-6 rounded-xl items-center">
          <Text className="text-gray-600 text-lg">No appointments yet</Text>
          <Text className="text-gray-400 mt-2">Book your first appointment to get started</Text>
        </View>
      ) : (
        appointments.map((appointment) => (
          <View key={appointment.id} className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <Text className="font-semibold text-gray-800 text-lg">{appointment.doctor}</Text>
            <Text className="text-gray-600 mt-2">📅 {appointment.date}</Text>
            <Text className="text-gray-600">⏰ {appointment.time}</Text>
            <View className={`mt-3 px-3 py-1 rounded-full self-start ${
              appointment.status === 'Confirmed' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Text className={
                appointment.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'
              }>
                {appointment.status}
              </Text>
            </View>
          </View>
        ))
      )}
      
      <TouchableOpacity className="bg-[#16ea7f] py-4 rounded-xl mt-6 items-center">
        <Text className="text-white font-semibold">Book New Appointment</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}