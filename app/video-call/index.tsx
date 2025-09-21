// app/video-call.tsx (complete version)
import { DailyCall } from '@daily-co/daily-js';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';

export default function VideoCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [call, setCall] = useState<DailyCall | null>(null);
  const callFrameRef = useRef<any>(null);

  const {
    roomUrl,
    token,
    appointmentId,
    doctorName
  } = params;

  // Type-safe parameter extraction
  const roomUrlString = Array.isArray(roomUrl) ? roomUrl[0] : roomUrl;
  const tokenString = Array.isArray(token) ? token[0] : token;
  const appointmentIdNumber = Number(Array.isArray(appointmentId) ? appointmentId[0] : appointmentId);
  const doctorNameString = Array.isArray(doctorName) ? doctorName[0] : doctorName;

  const handleEndCall = useCallback(async () => {
    try {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
      }
      
      await apiService.post(
        API_ENDPOINTS.VIDEO_CALL.END_CALL(appointmentIdNumber),
        {}
      );
      
      router.back();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [appointmentIdNumber, router]);

  const initializeVideoCall = useCallback(async () => {
    if (!roomUrlString || !tokenString) return;

    try {
      // Start video call recording in backend
      await apiService.post(
        API_ENDPOINTS.VIDEO_CALL.START_CALL(appointmentIdNumber),
        {}
      );

      // Load Daily.co
      const daily = await import('@daily-co/daily-js');
      
      const callFrame = daily.createFrame({
        url: roomUrlString,
        token: tokenString,
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          position: 'fixed',
          width: '100%',
          height: '100%',
        },
      });

      callFrame.join();
      callFrameRef.current = callFrame;
      setCall(callFrame);
      setLoading(false);

      // Handle call events
      callFrame.on('left-meeting', handleEndCall);
      callFrame.on('error', (e) => {
        console.error('Daily.co error:', e);
        Alert.alert('Error', 'Video call failed');
      });

    } catch (error) {
      console.error('Error initializing video call:', error);
      Alert.alert('Error', 'Failed to start video call');
      setLoading(false);
    }
  }, [roomUrlString, tokenString, appointmentIdNumber, handleEndCall]);

  useEffect(() => {
    if (roomUrlString && tokenString) {
      initializeVideoCall();
    }
  }, [roomUrlString, tokenString, initializeVideoCall]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-2">Joining video call with {doctorNameString}...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Daily.co iframe will be injected here */}
      <View className="flex-1">
        {/* Call controls overlay */}
        <View className="absolute bottom-10 left-0 right-0 z-10 items-center">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-4 rounded-full"
            onPress={handleEndCall}
          >
            <Text className="text-white font-semibold text-lg">End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}