// components/booking/Step1Form.web.tsx

import { BookingData } from '@/types/booking';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Step1FormProps {
  data: BookingData;
  onDataChange: (field: keyof BookingData, value: any) => void;
}

export default function Step1Form({ data, onDataChange }: Step1FormProps) {
  // Helper functions for formatting, consistent with the original code
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Form Content */}
      <View className="px-6 py-6 space-y-6">
        {/* Basic Information */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">
            Booking Name
          </Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.bookingName}
              onChangeText={(text: string) => onDataChange('bookingName', text)}
              placeholder="Enter booking name"
              placeholderTextColor="#8A8A8E"
            />
          </View>
        </View>

        {/* Client */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">
            Client
          </Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.client}
              onChangeText={(text: string) => onDataChange('client', text)}
              placeholder="Enter client name"
              placeholderTextColor="#8A8A8E"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">
            Consignee (Receiver)
          </Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.consignee}
              onChangeText={(text: string) => onDataChange('consignee', text)}
              placeholder="Enter consignee name"
              placeholderTextColor="#8A8A8E"
            />
          </View>
        </View>

        {/* Date Picker - Display only for web, as per reference */}
        <View>
          <Text className="text-sm font-semibold text-text-primary mb-2">
            Date
          </Text>
          <TouchableOpacity
            // onPress={() => setShowDatePicker(true)} // Logic would be in parent if needed
            className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
          >
            <MaterialIcons
              name="event"
              size={20}
              color="#8A8A8E"
              style={{ marginRight: 12 }}
            />
            <Text className="flex-1 text-base text-text-primary">
              {formatDate(data.date)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pickup Section */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-text-primary mb-4">
            Pickup
          </Text>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              State
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
              <TextInput
                className="flex-1 text-base text-text-primary"
                value={data.pickupState}
                onChangeText={(text: string) => onDataChange('pickupState', text)}
                placeholder="Enter pickup state"
                placeholderTextColor="#8A8A8E"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Address
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
              <MaterialIcons
                name="location-on"
                size={20}
                color="#8A8A8E"
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <TextInput
                value={data.pickupAddress}
                onChangeText={(text) => onDataChange('pickupAddress', text)}
                placeholder="Enter pickup address"
                placeholderTextColor="#8A8A8E"
                multiline
                numberOfLines={3}
                className="flex-1 text-base text-text-primary"
                textAlignVertical="top"
              />
            </View>
          </View>
          <View>
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Time
            </Text>
            <TouchableOpacity
              // onPress={() => setShowPickupTimePicker(true)}
              className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
            >
              <MaterialIcons
                name="access-time"
                size={20}
                color="#8A8A8E"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-base text-text-primary">
                {formatTime(data.pickupTime)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Section */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-text-primary mb-4">
            Delivery
          </Text>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              State
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
              <TextInput
                className="flex-1 text-base text-text-primary"
                value={data.deliveryState}
                onChangeText={(text: string) => onDataChange('deliveryState', text)}
                placeholder="Enter delivery state"
                placeholderTextColor="#8A8A8E"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Address
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
              <MaterialIcons
                name="location-on"
                size={20}
                color="#8A8A8E"
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <TextInput
                value={data.deliveryAddress}
                onChangeText={(text) => onDataChange('deliveryAddress', text)}
                placeholder="Enter delivery address"
                placeholderTextColor="#8A8A8E"
                multiline
                numberOfLines={3}
                className="flex-1 text-base text-text-primary"
                textAlignVertical="top"
              />
            </View>
          </View>
          <View>
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Time
            </Text>
            <TouchableOpacity
              // onPress={() => setShowDeliveryTimePicker(true)}
              className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
            >
              <MaterialIcons
                name="access-time"
                size={20}
                color="#8A8A8E"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-base text-text-primary">
                {formatTime(data.deliveryTime)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}