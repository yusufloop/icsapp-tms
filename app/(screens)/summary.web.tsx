import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SummaryWebScreen() {
  // Mock data representing a completed booking
  const bookingData = {
    bookingName: 'PNG to KL',
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
              Summary
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
            {/* Content Card */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Content */}
              <View className="px-6 py-6 space-y-6">
                {/* Booking Info Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Booking Information
                  </Text>
                  
                  <View className="space-y-4">
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Booking Name
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.bookingName}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Booking ID
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.bookingId}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Client
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.client}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Consignee (Receiver)
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.consignee}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Pick up Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Pick up
                  </Text>
                  
                  <View className="space-y-4">
                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-secondary mb-1">
                          Date
                        </Text>
                        <Text className="text-base text-text-primary">
                          {formatDate(bookingData.pickup.date)}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-secondary mb-1">
                          Time
                        </Text>
                        <Text className="text-base text-text-primary">
                          {formatTime(bookingData.pickup.time)}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Address
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.pickup.address}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Delivery Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Delivery
                  </Text>
                  
                  <View className="space-y-4">
                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-secondary mb-1">
                          Date
                        </Text>
                        <Text className="text-base text-text-primary">
                          {formatDate(bookingData.delivery.date)}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-secondary mb-1">
                          Time
                        </Text>
                        <Text className="text-base text-text-primary">
                          {formatTime(bookingData.delivery.time)}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Address
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.delivery.address}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-300 mb-6" />

                {/* Shipment Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Shipment Details
                  </Text>
                  
                  <View className="space-y-4">
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-text-secondary mb-1">
                        Shipment Type
                      </Text>
                      <Text className="text-base text-text-primary">
                        {bookingData.shipmentType}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-text-secondary mb-2">
                        Items
                      </Text>
                      <View className="bg-gray-50 rounded-lg p-4">
                        {bookingData.items.map((item, index) => (
                          <Text key={index} className="text-base text-text-primary mb-1">
                            • {item}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4">
                  {/* Timeline Button */}
                  <TouchableOpacity
                    onPress={handleTimeline}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons name="timeline" size={18} color="#374151" style={{ marginRight: 8 }} />
                      <Text className="text-base font-semibold text-gray-600">Timeline</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Invoice Button */}
                  <TouchableOpacity
                    onPress={handleInvoice}
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={['#409CFF', '#0A84FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
                    >
                      <View className="flex-row items-center">
                        <MaterialIcons name="receipt" size={18} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-base font-semibold text-white">Invoice</Text>
                      </View>
                    </LinearGradient>
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
