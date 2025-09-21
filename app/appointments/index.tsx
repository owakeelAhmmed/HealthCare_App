// AppointmentsScreen.tsx (updated)
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';
import { Appointment } from '../types';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Payment states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('');

  // Video call states
  const [videoLoading, setVideoLoading] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.APPOINTMENTS);
      
      if (response.error) {
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again');
          router.replace('/(auth)/login');
          return;
        }
        throw new Error(response.error);
      }

      setAppointments(response.data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const handleBookNew = () => {
    router.push('/doctors');
  };

  const cancelAppointment = async (appointmentId: number) => {
    try {
      Alert.alert(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: async () => {
              const response = await apiService.patch(
                API_ENDPOINTS.APPOINTMENT_DETAIL(appointmentId),
                { status: 'cancelled' }
              );
              
              if (response.error) {
                Alert.alert('Error', response.error);
                return;
              }
              
              Alert.alert('Success', 'Appointment cancelled successfully');
              fetchAppointments();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  // Video Call Functions - Improved error handling
  const handleVideoCall = async (appointment: Appointment) => {
    setVideoLoading(appointment.id);
    try {
      console.log('Creating video room for appointment:', appointment.id);
      
      // 1. Create Daily.co room
      const roomResponse = await apiService.post(
        API_ENDPOINTS.VIDEO_CALL.CREATE_ROOM(appointment.id),
        {}
      );

      console.log('Room response:', roomResponse);

      if (roomResponse.error) {
        const errorMsg = roomResponse.details || roomResponse.error || 'Failed to create video room';
        Alert.alert('Error', errorMsg);
        return;
      }

      // 2. Generate meeting token
      const tokenResponse = await apiService.get(
        API_ENDPOINTS.VIDEO_CALL.GET_TOKEN(appointment.id)
      );

      if (tokenResponse.error) {
        Alert.alert('Error', 'Failed to generate meeting token: ' + tokenResponse.error);
        return;
      }

      // 3. Navigate to video call screen
      router.push({
        pathname: '/video-call',
        params: {
          roomName: roomResponse.room_name,
          roomUrl: roomResponse.room_url,
          token: tokenResponse.token,
          appointmentId: appointment.id.toString(),
          doctorName: `Dr. ${appointment.doctor_details?.user_details?.first_name} ${appointment.doctor_details?.user_details?.last_name}`
        }
      });

    } catch (error: any) {
      console.error('Video call error:', error);
      Alert.alert('Error', 'Failed to initiate video call: ' + error.message);
    } finally {
      setVideoLoading(null);
    }
  };

  // Payment Functions
  const openPaymentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCardHolder(`${user?.first_name} ${user?.last_name}`.trim());
    setPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedAppointment(null);
    setCardNumber('4242 4242 4242 4242');
    setExpiryDate('12/25');
    setCvv('123');
    setCardHolder('');
  };

  const processPayment = async () => {
    if (!selectedAppointment) return;

    setPaymentLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark appointment as paid
      const response = await apiService.patch(
        API_ENDPOINTS.APPOINTMENT_DETAIL(selectedAppointment.id),
        { status: 'paid' }
      );

      if (response.error) {
        Alert.alert('Payment Failed', response.error);
        return;
      }

      Alert.alert('Success', 'Payment processed successfully!');
      closePaymentModal();
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayNow = (appointment: Appointment) => {
    Alert.alert(
      'Process Payment',
      `Pay ৳${appointment.doctor_details?.consultation_fee} for your appointment with Dr. ${appointment.doctor_details?.user_details?.first_name} ${appointment.doctor_details?.user_details?.last_name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Pay Now',
          onPress: () => openPaymentModal(appointment)
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-2">Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">My Appointments</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text className="text-blue-600 font-semibold">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      
        {appointments.length === 0 ? (
          <View className="bg-white p-6 rounded-xl items-center">
            <Text className="text-gray-600 text-lg mb-2">No appointments yet</Text>
            <Text className="text-gray-400 text-center mb-4">
              Book your first appointment to get started with our healthcare services
            </Text>
            <TouchableOpacity 
              className="bg-[#16ea7f] px-6 py-3 rounded-lg"
              onPress={handleBookNew}
            >
              <Text className="text-white font-semibold">Find Doctors</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appointment) => {
            const statusColors = getStatusColor(appointment.status);
            const showPayButton = appointment.status === 'confirmed' || appointment.status === 'pending';
            const showVideoCallButton = appointment.status === 'paid';
            
            return (
              <View key={appointment.id} className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <Text className="font-semibold text-gray-800 text-lg">
                  Dr. {appointment.doctor_details?.user_details?.first_name} {appointment.doctor_details?.user_details?.last_name}
                </Text>
                <Text className="text-blue-600 mb-2">{appointment.doctor_details?.specialization}</Text>
                <Text className="text-gray-600 mb-1">📅 {formatDate(appointment.date)}</Text>
                <Text className="text-gray-600 mb-3">⏰ {formatTime(appointment.time)}</Text>
                <Text className="text-gray-600 mb-3">Reason: {appointment.reason || 'Not specified'}</Text>
                
                <View className="flex-row justify-between items-center mb-3">
                  <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
                    <Text className={`font-medium capitalize ${statusColors.text}`}>
                      {appointment.status}
                    </Text>
                  </View>
                  
                  <Text className="text-green-600 font-semibold">
                    ৳{appointment.doctor_details?.consultation_fee}
                  </Text>
                </View>

                <View className="flex-row justify-between space-x-2">
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <TouchableOpacity 
                      className="bg-red-100 px-4 py-2 rounded-full flex-1 mr-1"
                      onPress={() => cancelAppointment(appointment.id)}
                    >
                      <Text className="text-red-600 font-medium text-center">Cancel</Text>
                    </TouchableOpacity>
                  )}
                  
                  {showPayButton && (
                    <TouchableOpacity 
                      className="bg-green-600 px-4 py-2 rounded-full flex-1 ml-1"
                      onPress={() => handlePayNow(appointment)}
                    >
                      <Text className="text-white font-medium text-center">Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  {showVideoCallButton && (
                    <TouchableOpacity 
                      className="bg-blue-600 px-4 py-2 rounded-full flex-1 ml-1"
                      onPress={() => handleVideoCall(appointment)}
                      disabled={videoLoading === appointment.id}
                    >
                      {videoLoading === appointment.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text className="text-white font-medium text-center">Video Call</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {appointment.status === 'paid' && (
                  <View className="mt-3 bg-green-50 p-3 rounded-lg">
                    <Text className="text-green-700 text-sm text-center">
                      ✅ Payment Completed - ৳{appointment.doctor_details?.consultation_fee}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
        
        {appointments.length > 0 && (
          <TouchableOpacity 
            className="bg-[#16ea7f] py-4 rounded-xl mt-6 items-center"
            onPress={handleBookNew}
          >
            <Text className="text-white font-semibold">Book New Appointment</Text>
          </TouchableOpacity>
        )}

        {/* Payment Modal */}
        <Modal
          visible={paymentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closePaymentModal}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
              <Text className="text-xl font-bold text-center mb-4">Payment Details</Text>
              
              {selectedAppointment && (
                <View className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="font-semibold">
                    Dr. {selectedAppointment.doctor_details?.user_details?.first_name} {selectedAppointment.doctor_details?.user_details?.last_name}
                  </Text>
                  <Text>Amount: ৳{selectedAppointment.doctor_details?.consultation_fee}</Text>
                  <Text>Date: {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}</Text>
                </View>
              )}

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
              
              <View className="flex-row mb-3 space-x-2">
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-1"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                />
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-1"
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Card Holder Name"
                value={cardHolder}
                onChangeText={setCardHolder}
              />

              <View className="flex-row justify-between space-x-3 gap-2">
                <TouchableOpacity
                  className="bg-gray-500 py-3 rounded-lg flex-1"
                  onPress={closePaymentModal}
                  disabled={paymentLoading}
                >
                  <Text className="text-white text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-green-600 py-3 rounded-lg flex-1"
                  onPress={processPayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Pay ৳{selectedAppointment?.doctor_details?.consultation_fee}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-gray-500 text-xs text-center mt-4">
                💡 This is a demo payment. Use card number: 4242 4242 4242 4242
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}