
import { useAuth } from '@/lib/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface SignOutButtonProps {
  style?: any;
}

export function SignOutButton({ style }: SignOutButtonProps) {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)/signin');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity 
      className="flex-row items-center justify-between py-4 px-5 bg-bg-secondary rounded-xl shadow-lg"
      style={style}
      onPress={handleSignOut}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <MaterialIcons name="logout" size={20} color="#FF453A" className="mr-3" />
        <Text className="text-base text-red-500 font-semibold">
          Sign Out
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#FF453A" />
    </TouchableOpacity>
  );
}

// Usage example for your More tab:
// This component is already integrated in the updated More tab above
// The component uses your design system colors:
// - bg-bg-secondary: Pure white for the button background
// - text-red-500: Red color for the sign out text
// - shadow-lg: Soft shadow for depth
// - rounded-xl: Rounded corners matching your design system