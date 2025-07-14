import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RecallWebScreen() {
  const [reasonOfRecall, setReasonOfRecall] = useState('Just because.....');

  // Mock data representing a completed booking (subset of summary data)
  const bookingData = {
    bookingName: 'Uranium to KL',
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center max-w-4xl mx-auto w-full">
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
      </View>

      {/* Main Content Container */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6">
          <View className="max-w-2xl mx-auto w-full">
            {/* Form Card */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Form Content */}
              <View className="px-6 py-6 space-y-6">
                {/* Static Summary Section */}
                <View className="mb-8">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Booking Information
                  </Text>
                  
                  <View className="space-y-4">
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Booking Name
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 px-4 py-3 min-h-[44px] justify-center">
                        <Text className="text-base text-text-primary">
                          {bookingData.bookingName}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Booking ID
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 px-4 py-3 min-h-[44px] justify-center">
                        <Text className="text-base text-text-primary font-mono">
                          {bookingData.bookingId}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary mb-2">
                          Client
                        </Text>
                        <View className="rounded-lg bg-bg-secondary border border-gray-300 px-4 py-3 min-h-[44px] justify-center">
                          <Text className="text-base text-text-primary">
                            {bookingData.client}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary mb-2">
                          Consignee (Receiver)
                        </Text>
                        <View className="rounded-lg bg-bg-secondary border border-gray-300 px-4 py-3 min-h-[44px] justify-center">
                          <Text className="text-base text-text-primary">
                            {bookingData.consignee}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Items Section */}
                    <View>
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Items
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 px-4 py-3 min-h-[100px]">
                        {bookingData.items.map((item, index) => (
                          <Text key={index} className="text-base text-text-primary mb-1">
                            • {item}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Reason of Recall Section */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Reason of Recall <Text className="text-red-500">*</Text>
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
                  <Text className="text-xs text-text-secondary mt-1">
                    Please provide a detailed explanation for the recall request
                  </Text>
                </View>
              </View>

              {/* Sticky Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4">
                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-gray-600">Cancel</Text>
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
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
