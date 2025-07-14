import React from 'react';
import { View, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { Sidebar } from '@/components/ui/Sidebar';

export default function WebLayout() {
  // Only apply web layout on web platform
  if (Platform.OS !== 'web') {
    return <Slot />;
  }

  return (
    <View className="flex-1 flex-row bg-gray-50 h-screen">
      {/* Sidebar */}
      <Sidebar className="h-full" />
      
      {/* Main Content Area */}
      <View className="flex-1 overflow-hidden">
        <Slot />
      </View>
    </View>
  );
}
