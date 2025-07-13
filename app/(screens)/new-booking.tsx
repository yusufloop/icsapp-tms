import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function NewBookingScreen() {
  const [formData, setFormData] = useState({
    bookingName: '',
    client: '',
    consignee: '',
    date: new Date(),
    pickupState: '',
    pickupAddress: '',
    pickupTime: new Date(),
    deliveryState: '',
    deliveryAddress: '',
    deliveryTime: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Mock client data for autocomplete
  const mockClients = [
    'John@gmail.com',
    'Johan@gmail.com',
    'Johnson@gmail.com',
    'Jonathan@gmail.com',
    'Jane@gmail.com',
    'Jack@gmail.com',
  ];

  const handleClientChange = (text: string) => {
    setFormData({ ...formData, client: text });
    
    if (text.length > 0) {
      const filtered = mockClients.filter(client => 
        client.toLowerCase().includes(text.toLowerCase())
      );
      setClientSuggestions(filtered);
      setShowClientSuggestions(true);
    } else {
      setShowClientSuggestions(false);
    }
  };

  const selectClient = (client: string) => {
    setFormData({ ...formData, client });
    setShowClientSuggestions(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const handlePickupTimeChange = (event: any, selectedTime?: Date) => {
    setShowPickupTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, pickupTime: selectedTime });
    }
  };

  const handleDeliveryTimeChange = (event: any, selectedTime?: Date) => {
    setShowDeliveryTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, deliveryTime: selectedTime });
    }
  };

  const handleContinue = () => {
    // Basic validation
    if (!formData.bookingName.trim()) {
      Alert.alert('Error', 'Please enter a booking name');
      return;
    }
    if (!formData.client.trim()) {
      Alert.alert('Error', 'Please select a client');
      return;
    }
    if (!formData.consignee.trim()) {
      Alert.alert('Error', 'Please enter a consignee');
      return;
    }
    if (!formData.pickupState.trim() || !formData.pickupAddress.trim()) {
      Alert.alert('Error', 'Please fill in pickup details');
      return;
    }
    if (!formData.deliveryState.trim() || !formData.deliveryAddress.trim()) {
      Alert.alert('Error', 'Please fill in delivery details');
      return;
    }

    // Navigate to step 2
    router.push('/new-booking-step2');
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            New Booking
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            Fill in the information below for requests
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="px-6 py-4 bg-bg-secondary">
        <View className="flex-row items-center justify-between">
          {/* Step 1 - Active */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-sm font-bold">1</Text>
            </View>
            <View className="flex-1 h-1 bg-primary ml-2" />
          </View>
          
          {/* Step 2 - Inactive */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
              <Text className="text-gray-600 text-sm font-bold">2</Text>
            </View>
            <View className="flex-1 h-1 bg-gray-300 ml-2" />
          </View>
          
          {/* Step 3 - Inactive */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
              <Text className="text-gray-600 text-sm font-bold">3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Booking Name
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
              <TextInput
                className="flex-1 text-base text-text-primary"
                value={formData.bookingName}
                onChangeText={(text: string) => setFormData({ ...formData, bookingName: text })}
                placeholder="Enter booking name"
                placeholderTextColor="#8A8A8E"
              />
            </View>
          </View>

          {/* Client with Autocomplete */}
          <View className="relative">
            <View className="mb-4">
              <Text className="text-sm font-semibold text-text-primary mb-2">
                Client
              </Text>
              <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                <TextInput
                  className="flex-1 text-base text-text-primary"
                  value={formData.client}
                  onChangeText={handleClientChange}
                  placeholder="Search for client..."
                  placeholderTextColor="#8A8A8E"
                  onFocus={() => {
                    if (formData.client.length > 0) {
                      setShowClientSuggestions(true);
                    }
                  }}
                />
              </View>
            </View>
            
            {/* Client Suggestions */}
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
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Consignee (Receiver)
            </Text>
            <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
              <TextInput
                className="flex-1 text-base text-text-primary"
                value={formData.consignee}
                onChangeText={(text: string) => setFormData({ ...formData, consignee: text })}
                placeholder="Enter consignee name"
                placeholderTextColor="#8A8A8E"
              />
            </View>
          </View>

          {/* Date Picker */}
          <View>
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
            >
              <MaterialIcons name="event" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
              <Text className="flex-1 text-base text-text-primary">
                {formatDate(formData.date)}
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
                  value={formData.pickupState}
                  onChangeText={(text: string) => setFormData({ ...formData, pickupState: text })}
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
                <MaterialIcons name="location-on" size={20} color="#8A8A8E" style={{ marginRight: 12, marginTop: 2 }} />
                <TextInput
                  value={formData.pickupAddress}
                  onChangeText={(text) => setFormData({ ...formData, pickupAddress: text })}
                  placeholder="Enter pickup address"
                  placeholderTextColor="#8A8A8E"
                  multiline
                  numberOfLines={3}
                  className="flex-1 text-base text-text-primary"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Pickup Time */}
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">
                Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowPickupTimePicker(true)}
                className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
              >
                <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
                <Text className="flex-1 text-base text-text-primary">
                  {formatTime(formData.pickupTime)}
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
                  value={formData.deliveryState}
                  onChangeText={(text: string) => setFormData({ ...formData, deliveryState: text })}
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
                <MaterialIcons name="location-on" size={20} color="#8A8A8E" style={{ marginRight: 12, marginTop: 2 }} />
                <TextInput
                  value={formData.deliveryAddress}
                  onChangeText={(text) => setFormData({ ...formData, deliveryAddress: text })}
                  placeholder="Enter delivery address"
                  placeholderTextColor="#8A8A8E"
                  multiline
                  numberOfLines={3}
                  className="flex-1 text-base text-text-primary"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Delivery Time */}
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">
                Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeliveryTimePicker(true)}
                className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
              >
                <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
                <Text className="flex-1 text-base text-text-primary">
                  {formatTime(formData.deliveryTime)}
                </Text>
              </TouchableOpacity>
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
            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-gray-600">Back</Text>
          </TouchableOpacity>
          
          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="flex-1 active:opacity-80"
          >
            <LinearGradient
              colors={['#409CFF', '#0A84FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
            >
              <Text className="text-base font-semibold text-white">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {showPickupTimePicker && (
        <DateTimePicker
          value={formData.pickupTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickupTimeChange}
        />
      )}

      {showDeliveryTimePicker && (
        <DateTimePicker
          value={formData.deliveryTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDeliveryTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
