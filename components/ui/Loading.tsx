import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function Loading({ 
  message = "Loading...", 
  size = "large" 
}: LoadingProps) {
  return (
    <View className="flex-1 justify-center items-center bg-white bg-opacity-90">
      <ActivityIndicator 
        size={size} 
        color="#2563eb" // blue-600
        className="mb-4"
      />
      <Text className="text-gray-600 text-lg">{message}</Text>
    </View>
  );
}