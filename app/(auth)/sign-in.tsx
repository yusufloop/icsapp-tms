import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Error', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ImageBackground
        source={require('@/assets/images/container-truck-illustration-cargo-delivery-truck-side-view-isolated-on-white-background-vector.jpg')}
        style={{
          flex: 1,
          opacity: 1, // Very low opacity for subtle background effect
        }}
        imageStyle={{
          resizeMode: 'contain', // Maintains aspect ratio
          opacity: 0.05, // Additional opacity control for the image itself
          // Position the image - you can adjust these values as needed
          position: 'absolute',
          left: 50, // Move image to the right
          top: -100, // Move image up from bottom
          width: '120%', // Make image larger
          height: '60%', // Control height
        }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="max-w-sm w-full mx-auto">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="items-center justify-center mb-4" style={{ maxWidth: 280, width: '100%' }}>
                  <Image
                    source={require("@/assets/images/Logitrax_Lg.png")}
                    style={{
                      width: '100%',
                      height: 80,
                      maxWidth: 280,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Form */}
              <View className="bg-white rounded-2xl p-6 shadow-lg">
                <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Welcome Back
                </Text>
                <Text className="text-gray-600 text-center mb-8">
                  Sign in to your account to continue
                </Text>
                <AuthInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <AuthInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  error={errors.password}
                />

                <AuthButton
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={loading}
                  className="mb-4"
                />

                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600">Don't have an account? </Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity>
                      <Text className="text-blue-500 font-semibold">Sign up</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
