import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SummaryScreen() {
  // Mock data representing a completed booking
  const bookingData = {
    bookingName: 'Melaka to KL',
    bookingId: 'xxxxxPNGxKLGxxxx',
    client: 'Johan',
    consignee: 'Johani',
    pickup: {
      date: '2025-04-06',
      time: '1030',
      address: 'Jalan................'
    },
    delivery: {
      date: '2025-04-06', 
      time: '1030',
      address: 'Jalan................'
    },
    shipmentType: 'FLC',
    items: [
      'Nvidia 10180',
      'Nvidia 10180x',
      'Nvidia 10180x mini'
    ]
  };

  const handleBack = () => {
    router.back();
  };

  const handleTimeline = () => {
    router.push('/timeline');
  };

  const handleInvoice = () => {
    router.push('/invoice');
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
            Summary
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
          {/* Booking Info Section */}
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

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Consignee (Receiver)
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.consignee}
              </Text>
            </View>
          </View>

          {/* Pick up Section */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Pick up
            </Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-sm text-text-secondary mb-1">
                  Date
                </Text>
                <Text className="text-base text-text-primary">
                  {formatDate(bookingData.pickup.date)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-text-secondary mb-1">
                  Time
                </Text>
                <Text className="text-base text-text-primary">
                  {formatTime(bookingData.pickup.time)}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Address
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.pickup.address}
              </Text>
            </View>
          </View>

          {/* Delivery Section */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Delivery
            </Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-sm text-text-secondary mb-1">
                  Date
                </Text>
                <Text className="text-base text-text-primary">
                  {formatDate(bookingData.delivery.date)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-text-secondary mb-1">
                  Time
                </Text>
                <Text className="text-base text-text-primary">
                  {formatTime(bookingData.delivery.time)}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Address
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.delivery.address}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-300 mb-8" />

          {/* Shipment Section */}
          <View className="mb-8">
            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Shipment Type
              </Text>
              <Text className="text-base text-text-primary">
                {bookingData.shipmentType}
              </Text>
            </View>

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
        </View>
      </ScrollView>

      {/* Sticky Footer with Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4">
          {/* Timeline Button */}
          <TouchableOpacity
            onPress={handleTimeline}
            className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-text-primary">Timeline</Text>
          </TouchableOpacity>
          
          {/* Invoice Button */}
          <TouchableOpacity
            onPress={handleInvoice}
            className="flex-1 bg-primary rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
