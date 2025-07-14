import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';

export default function WebTabsLayout() {
  // On web, we don't show the bottom tabs since we have sidebar navigation
  // This layout just renders the content without any tab navigation
  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
}
