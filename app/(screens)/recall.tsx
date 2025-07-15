import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecallScreen() {
  const [reasonOfRecall, setReasonOfRecall] = useState('Just because.....');

  // Mock data representing a completed booking (subset of summary data)
  const bookingData = {
    bookingName: 'Melaka to KL',
    bookingId: 'xxxxxPNGxKLGxxxx',
    client: 'Johan',
    consignee: 'Johani',
    items: [
      'Nvidia 10180',
      'Nvidia 10180x',
      'Nvidia 10180x mini',
      'Nvidia 10180x Max'
    ]
  };

  const handleBack = () => {
    router.back();
  };

  const handleRecall = () => {
    if (!reasonOfRecall.trim()) {
      Alert.alert('Error', 'Please provide a reason for recall');
      return;
    }

    Alert.alert(
      'Recall Submitted',
      'Your recall request has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to previous screen or requests page
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-bg-secondary shadow-sm">
        <TouchableOpacity 
          onPress={handleBack}
          className="mr-4 p-2 -ml-2 active:opacity-80"
        >
          <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text-primary">
            Recall
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            Fill in the information below for requests
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6">
          {/* Static Summary Section */}
          <View className="mb-8">
            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Booking Name
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.bookingName}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Booking ID
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.bookingId}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Client
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.client}
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-text-secondary mb-1">
                Consignee (Receiver)
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.consignee}
              </Text>
            </View>

            {/* Items Section */}
            <View>
              <Text className="text-sm text-text-secondary mb-2">
                Items
              </Text>
              {bookingData.items.map((item, index) => (
                <Text key={index} className="text-base text-text-primary mb-1">
                  {item}
                </Text>
              ))}
            </View>
          </View>

          {/* Reason of Recall Section */}
          <View className="mb-8">
            <Text className="text-sm text-text-secondary mb-2">
              Reason of Recall
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 p-4 min-h-[120px]">
              <TextInput
                value={reasonOfRecall}
                onChangeText={setReasonOfRecall}
                placeholder="Enter reason for recall..."
                placeholderTextColor="#8A8A8E"
                multiline
                numberOfLines={6}
                className="flex-1 text-base text-text-primary"
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer with Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-text-primary">Back</Text>
          </TouchableOpacity>
          
          {/* Recall Button */}
          <TouchableOpacity
            onPress={handleRecall}
            className="flex-1 bg-red-500 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">Recall</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
