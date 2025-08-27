import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import '../../global.css';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      {/* অন্যান্য tabs如果需要 */}
    </Tabs>
  );
}