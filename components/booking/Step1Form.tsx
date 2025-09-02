// components/booking/Step1Form.tsx

import { BookingData } from '@/types/booking';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Step1FormProps {
  data: BookingData;
  onDataChange: (field: keyof BookingData, value: any) => void;
}

export default function Step1Form({ data, onDataChange }: Step1FormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const mockClients = ['John@gmail.com', 'Johan@gmail.com', 'Johnson@gmail.com', 'Jonathan@gmail.com', 'Jane@gmail.com', 'Jack@gmail.com'];

  const handleClientChange = (text: string) => {
    onDataChange('client', text);
    if (text.length > 0) {
      const filtered = mockClients.filter(client => client.toLowerCase().includes(text.toLowerCase()));
      setClientSuggestions(filtered);
      setShowClientSuggestions(true);
    } else {
      setShowClientSuggestions(false);
    }
  };

  const selectClient = (client: string) => {
    onDataChange('client', client);
    setShowClientSuggestions(false);
  };
  
  const formatDate = (date: Date) => date.toLocaleDateString();
  const formatTime = (time: Date) => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Basic Information */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-text-primary mb-2">Booking Name</Text>
        <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
          <TextInput
            className="flex-1 text-base text-text-primary"
            value={data.bookingName}
            onChangeText={(text) => onDataChange('bookingName', text)}
            placeholder="Enter booking name"
            placeholderTextColor="#8A8A8E"
          />
        </View>
      </View>

      {/* Client with Autocomplete */}
      <View className="relative z-10">
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Client</Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.client}
              onChangeText={handleClientChange}
              placeholder="Search for client..."
              placeholderTextColor="#8A8A8E"
              onFocus={() => { if (data.client.length > 0) setShowClientSuggestions(true); }}
            />
          </View>
        </View>
        {showClientSuggestions && clientSuggestions.length > 0 && (
          <View className="absolute top-full left-0 right-0 bg-bg-secondary border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
            {clientSuggestions.map((client, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => selectClient(client)}
                className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
              >
                <Text className="text-text-primary">{client}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-text-primary mb-2">Consignee (Receiver)</Text>
        <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
          <TextInput
            className="flex-1 text-base text-text-primary"
            value={data.consignee}
            onChangeText={(text) => onDataChange('consignee', text)}
            placeholder="Enter consignee name"
            placeholderTextColor="#8A8A8E"
          />
        </View>
      </View>

      <View>
        <Text className="text-sm font-semibold text-text-primary mb-2">Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
        >
          <MaterialIcons name="event" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
          <Text className="flex-1 text-base text-text-primary">{formatDate(data.date)}</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Section */}
      <View className="mt-8">
        <Text className="text-lg font-bold text-text-primary mb-4">Pickup</Text>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">State</Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.pickupState}
              onChangeText={(text) => onDataChange('pickupState', text)}
              placeholder="Enter pickup state"
              placeholderTextColor="#8A8A8E"
            />
          </View>
        </View>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Address</Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
            <MaterialIcons name="location-on" size={20} color="#8A8A8E" style={{ marginRight: 12, marginTop: 2 }} />
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
          <Text className="text-sm font-semibold text-text-primary mb-2">Time</Text>
          <TouchableOpacity
            onPress={() => setShowPickupTimePicker(true)}
            className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
          >
            <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-base text-text-primary">{formatTime(data.pickupTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delivery Section */}
      <View className="mt-8">
        <Text className="text-lg font-bold text-text-primary mb-4">Delivery</Text>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">State</Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={data.deliveryState}
              onChangeText={(text) => onDataChange('deliveryState', text)}
              placeholder="Enter delivery state"
              placeholderTextColor="#8A8A8E"
            />
          </View>
        </View>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Address</Text>
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
            <MaterialIcons name="location-on" size={20} color="#8A8A8E" style={{ marginRight: 12, marginTop: 2 }} />
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
          <Text className="text-sm font-semibold text-text-primary mb-2">Time</Text>
          <TouchableOpacity
            onPress={() => setShowDeliveryTimePicker(true)}
            className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
          >
            <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-base text-text-primary">{formatTime(data.deliveryTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker value={data.date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowDatePicker(false); if (d) onDataChange('date', d); }} />
      )}
      {showPickupTimePicker && (
        <DateTimePicker value={data.pickupTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowPickupTimePicker(false); if (d) onDataChange('pickupTime', d); }} />
      )}
      {showDeliveryTimePicker && (
        <DateTimePicker value={data.deliveryTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowDeliveryTimePicker(false); if (d) onDataChange('deliveryTime', d); }} />
      )}
    </>
  );
}