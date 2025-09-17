import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type UserType = 'patient' | 'doctor' | 'admin';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'patient' as UserType,
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.username.length > 150) {
      Alert.alert('Error', 'Username must be 150 characters or fewer');
      return;
    }

    if (!/^[\w.@+-]+$/.test(formData.username)) {
      Alert.alert('Error', 'Username can only contain letters, digits and @/./+/-/_');
      return;
    }

    setLoading(true);
    try {
      // Prepare data according to your UserRegisterSerializer
      const requestData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password2: formData.confirmPassword
      };

      // console.log('Sending data:', requestData);

      // Use your custom registration endpoint
      const response = await fetch('https://health-care-backend-tawny.vercel.app/api/auth/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      // console.log('Response:', responseData);

      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        router.replace('/(auth)/login');
      } else {
        // Handle different error cases
        let errorMessage = 'Registration failed. Please try again.';
        
        if (responseData.username) {
          errorMessage = responseData.username[0];
        } else if (responseData.email) {
          errorMessage = responseData.email[0];
        } else if (responseData.password) {
          errorMessage = responseData.password[0];
        } else if (responseData.non_field_errors) {
          errorMessage = responseData.non_field_errors[0];
        }
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <Loading message="Creating account..." />;
  }

  return (
    <ScrollView className="flex-1 bg-white mt-12">
      <View className="flex-1 px-6 py-8">
        <Text className="text-2xl font-bold text-center text-blue-800 mb-2">
          Create Account
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Join our healthcare platform
        </Text>

        <View className="space-y-4">
          {/* Username */}
          <Input
            label="Username *"
            placeholder="Enter username (letters, digits, @/./+/-/_ only)"
            value={formData.username}
            onChangeText={(value) => updateField('username', value)}
            maxLength={150}
            autoCapitalize="none"
          />

          {/* Email */}
          <Input
            label="Email Address *"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* First Name - Optional in your serializer but you can keep it */}
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChangeText={(value) => updateField('first_name', value)}
          />

          {/* Last Name - Optional in your serializer but you can keep it */}
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChangeText={(value) => updateField('last_name', value)}
          />

          {/* User Type - Removed as your serializer doesn't accept it */}
          {/* Your UserRegisterSerializer doesn't accept user_type field */}
          {/* The backend will force it to be patient (1) anyway */}

          {/* Phone */}
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
          />

          {/* Password */}
          <Input
            label="Password *"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password *"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry
          />

          {/* Register Button */}
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mt-6"
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="items-center mt-6">
            <Text className="text-gray-600">
              Already have an account?{' '}
              <Text 
                className="text-blue-600 font-semibold"
                onPress={() => router.back()}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}