import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { apiService } from '../services/api';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length > 150) {
      newErrors.username = 'Username must be 150 characters or fewer';
    } else if (!/^[\w.@+-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, digits and @/./+/-/_';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        password: formData.password,
        password2: formData.confirmPassword
      };

      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, requestData);

      if (response.error) {
        // Handle backend validation errors
        const backendErrors: Record<string, string> = {};
        
        if (response.error && typeof response.error === 'object') {
          const errorData = response.error as any;
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key]) && errorData[key].length > 0) {
              backendErrors[key] = errorData[key][0];
            }
          });
        }

        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          Alert.alert('Error', 'Please fix the validation errors');
        } else {
          Alert.alert('Error', response.error || 'Registration failed');
        }
      } else {
        Alert.alert(
          'Success', 
          'Registration successful! Please login to continue.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <Loading message="Creating account..." />;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <Text className="text-2xl font-bold text-center text-blue-800 mb-2">
          Create Account
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Join our healthcare platform
        </Text>

        <View className="space-y-4">
          {/* Username */}
          <View>
            <Input
              label="Username *"
              placeholder="Enter username (letters, digits, @/./+/-/_ only)"
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              maxLength={150}
              autoCapitalize="none"
              error={errors.username}
            />
          </View>

          {/* Email */}
          <View>
            <Input
              label="Email Address *"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          </View>

          {/* First Name */}
          <View>
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChangeText={(value) => updateField('first_name', value)}
              error={errors.first_name}
            />
          </View>

          {/* Last Name */}
          <View>
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChangeText={(value) => updateField('last_name', value)}
              error={errors.last_name}
            />
          </View>

          {/* Phone */}
          <View>
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>

          {/* Password */}
          <View>
            <Input
              label="Password *"
              placeholder="Enter your password (min. 8 characters)"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              error={errors.password}
            />
          </View>

          {/* Confirm Password */}
          <View>
            <Input
              label="Confirm Password *"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mt-6"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Create Account
              </Text>
            )}
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