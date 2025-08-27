import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="space-y-2 mb-2 mt-2">
      <Text className="text-gray-700 font-medium">{label}</Text>
      <TextInput
        className={`border rounded-lg px-4 py-3 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm">{error}</Text>}
    </View>
  );
}