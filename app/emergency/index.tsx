import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function EmergencyScreen() {
  const emergencyContacts = [
    { name: 'Emergency Ambulance', number: '999', description: '24/7 emergency medical service' },
    { name: 'Police', number: '100', description: 'Emergency police service' },
    { name: 'Fire Service', number: '101', description: 'Fire emergency service' },
    { name: 'Hospital Emergency', number: '+880-XXXX-XXXX', description: 'Local hospital emergency' },
  ];

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-red-600 mb-2">Emergency Contacts</Text>
      <Text className="text-gray-600 mb-6">Immediate help when you need it most</Text>
      
      <View className="bg-red-50 p-4 rounded-xl mb-6">
        <Text className="text-red-800 font-semibold text-center">
          🚨 In case of emergency, call immediately!
        </Text>
      </View>

      {emergencyContacts.map((contact, index) => (
        <TouchableOpacity
          key={index}
          className="bg-white p-4 rounded-xl shadow-sm mb-4"
          onPress={() => handleCall(contact.number)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-800 text-lg">{contact.name}</Text>
              <Text className="text-gray-600">{contact.description}</Text>
              <Text className="text-blue-600 mt-1">{contact.number}</Text>
            </View>
            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
              <Text className="text-red-600 text-lg">📞</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View className="bg-blue-50 p-4 rounded-xl mt-6">
        <Text className="text-blue-800 font-semibold mb-2">Important Notes:</Text>
        <Text className="text-blue-600 text-sm">
          • Stay calm and provide clear information{'\n'}
          • Share your exact location{'\n'}
          • Follow instructions from emergency services{'\n'}
          • Keep emergency numbers saved in your phone
        </Text>
      </View>
    </ScrollView>
  );
}