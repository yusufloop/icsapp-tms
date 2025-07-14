import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function EditBookingWebScreen() {
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState({
    // Step 1 data
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
    
    // Step 2 data
    shipmentType: '',
    containerSize: '',
    items: ['Electronics', 'Computer Parts'],
    totalGrossWeight: '',
    totalVolume: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [showShipmentTypePicker, setShowShipmentTypePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Mock client data for autocomplete
  const mockClients = [
    'John@gmail.com',
    'Johan@gmail.com',
    'Johnson@gmail.com',
    'Jonathan@gmail.com',
    'Jane@gmail.com',
    'Jack@gmail.com',
  ];

  const shipmentTypes = ['LFC', 'CLC'];
  const containerSizes = ['20ft', '40ft', '40ft HC', '45ft'];

  // Pre-populate form with booking data
  useEffect(() => {
    if (params && params.bookingName) {
      setFormData({
        bookingName: (params.bookingName as string) || 'Nvidia 1999 to KL',
        client: (params.client as string) || 'John@gmail.com',
        consignee: (params.consignee as string) || 'Jane Doe',
        date: params.date ? new Date(params.date as string) : new Date(),
        pickupState: (params.pickupState as string) || 'Selangor',
        pickupAddress: (params.pickupAddress as string) || '123 Pickup Street, Petaling Jaya',
        pickupTime: params.pickupTime ? new Date(params.pickupTime as string) : new Date(),
        deliveryState: (params.deliveryState as string) || 'Kuala Lumpur',
        deliveryAddress: (params.deliveryAddress as string) || '456 Delivery Avenue, KLCC',
        deliveryTime: params.deliveryTime ? new Date(params.deliveryTime as string) : new Date(),
        shipmentType: (params.shipmentType as string) || 'LFC',
        containerSize: (params.containerSize as string) || '40ft',
        items: params.items ? JSON.parse(params.items as string) : ['Electronics', 'Computer Parts'],
        totalGrossWeight: (params.totalGrossWeight as string) || '1500',
        totalVolume: (params.totalVolume as string) || '25',
      });
    }
  }, [params]);

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

  const handleShipmentTypeSelect = (type: string) => {
    setFormData({ ...formData, shipmentType: type });
    setShowShipmentTypePicker(false);
  };

  const handleContainerSizeSelect = (size: string) => {
    setFormData({ ...formData, containerSize: size });
    setShowContainerSizePicker(false);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(null);
  };

  const handleEditItem = (index: number, newValue: string) => {
    const newItems = [...formData.items];
    newItems[index] = newValue;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddNewItem = () => {
    const newItems = [...formData.items, ''];
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(newItems.length - 1);
  };

  const handleItemBlur = () => {
    setEditingItemIndex(null);
    // Remove empty items when user finishes editing
    const filteredItems = formData.items.filter(item => item.trim() !== '');
    setFormData({ ...formData, items: filteredItems });
  };

  const handleUpdate = () => {
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

    Alert.alert(
      'Success',
      'Booking has been updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.push('/requests'),
        },
      ]
    );
  };

  const handleBack = () => {
    router.push('/requests');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateEstimatedTotal = () => {
    let baseRate = 0;
    
    if (formData.shipmentType === 'LFC') {
      baseRate = 2500;
    } else if (formData.shipmentType === 'CLC') {
      baseRate = 4500;
    }
    
    const weight = parseFloat(formData.totalGrossWeight) || 0;
    const weightCost = weight * 3.5;
    
    const volume = parseFloat(formData.totalVolume) || 0;
    const volumeCost = volume * 85;
    
    const itemCount = formData.items.filter(item => item.trim() !== '').length;
    const itemHandlingFee = itemCount * 150;
    
    let containerMultiplier = 1;
    if (formData.containerSize === '40ft' || formData.containerSize === '40ft HC') {
      containerMultiplier = 1.5;
    } else if (formData.containerSize === '45ft') {
      containerMultiplier = 1.8;
    }
    
    const subtotal = (baseRate + weightCost + volumeCost + itemHandlingFee) * containerMultiplier;
    const serviceTax = subtotal * 0.06;
    
    return Math.round(subtotal + serviceTax);
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
              Edit Booking
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Update booking information
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
                {/* Basic Information Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Basic Information
                  </Text>

                  {/* Booking Name */}
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
                  <View className="relative mb-4">
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
                    
                    {/* Client Suggestions - Pushes content below */}
                    {showClientSuggestions && clientSuggestions.length > 0 && (
                      <View className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                          Select Client
                        </Text>
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

                  {/* Consignee and Date Row */}
                  <View className="flex-row space-x-4 mb-4">
                    <View className="flex-1">
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

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Date
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <MaterialIcons name="event" size={20} color="#8A8A8E" style={{ marginRight: 8 }} />
                        <Text className="flex-1 text-base text-text-primary">
                          {formatDate(formData.date)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Pickup Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Pickup Information
                  </Text>
                  
                  <View className="flex-row space-x-4 mb-4">
                    <View className="flex-1">
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

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Time
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowPickupTimePicker(true)}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 8 }} />
                        <Text className="flex-1 text-base text-text-primary">
                          {formatTime(formData.pickupTime)}
                        </Text>
                      </TouchableOpacity>
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
                </View>

                {/* Delivery Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Delivery Information
                  </Text>
                  
                  <View className="flex-row space-x-4 mb-4">
                    <View className="flex-1">
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

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Time
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDeliveryTimePicker(true)}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <MaterialIcons name="access-time" size={20} color="#8A8A8E" style={{ marginRight: 8 }} />
                        <Text className="flex-1 text-base text-text-primary">
                          {formatTime(formData.deliveryTime)}
                        </Text>
                      </TouchableOpacity>
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
                </View>

                {/* Shipment Details Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Shipment Details
                  </Text>
                  
                  <View className="flex-row space-x-4 mb-4">
                    {/* Shipment Type */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Shipment Type
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowShipmentTypePicker(!showShipmentTypePicker);
                          setShowContainerSizePicker(false);
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.shipmentType ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {formData.shipmentType || 'Select type'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>

                    {/* Container Size */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Container Size(ft)
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowContainerSizePicker(!showContainerSizePicker);
                          setShowShipmentTypePicker(false);
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.containerSize ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {formData.containerSize || 'Select size'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Shipment Type Picker - Pushes content below */}
                  {showShipmentTypePicker && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Shipment Type
                      </Text>
                      {shipmentTypes.map((type, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleShipmentTypeSelect(type)}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Container Size Picker - Pushes content below */}
                  {showContainerSizePicker && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Container Size
                      </Text>
                      {containerSizes.map((size, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleContainerSizeSelect(size)}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Items List */}
                  <View className="mt-6">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Items List
                    </Text>
                    
                    {/* Items */}
                    {formData.items.map((item, index) => (
                      <View key={index} className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2">
                        {editingItemIndex === index ? (
                          <TextInput
                            className="flex-1 text-base text-text-primary"
                            value={item}
                            onChangeText={(text) => handleEditItem(index, text)}
                            onBlur={handleItemBlur}
                            placeholder="Enter item name"
                            placeholderTextColor="#8A8A8E"
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleItemBlur}
                          />
                        ) : (
                          <TouchableOpacity
                            className="flex-1"
                            onPress={() => setEditingItemIndex(index)}
                          >
                            <Text className="text-base text-text-primary">
                              {item || 'Tap to edit'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(index)}
                          className="ml-3 p-1 active:opacity-80"
                        >
                          <MaterialIcons name="close" size={20} color="#8A8A8E" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    
                    {/* Add New Button */}
                    <TouchableOpacity
                      onPress={handleAddNewItem}
                      className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex-row items-center justify-center active:opacity-80"
                    >
                      <MaterialIcons name="add" size={20} color="#0A84FF" style={{ marginRight: 8 }} />
                      <Text className="text-base font-medium text-primary">Add New</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Measurements */}
                  <View className="mt-6">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Measurements
                    </Text>
                    
                    <View className="flex-row space-x-4">
                      {/* Total Gross Weight */}
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary mb-2">
                          Total Gross Weight(KG)
                        </Text>
                        <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                          <TextInput
                            className="flex-1 text-base text-text-primary"
                            value={formData.totalGrossWeight}
                            onChangeText={(text: string) => setFormData({ ...formData, totalGrossWeight: text })}
                            placeholder="0.00"
                            placeholderTextColor="#8A8A8E"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      {/* Total Volume */}
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary mb-2">
                          Total Volume(CBM)
                        </Text>
                        <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                          <TextInput
                            className="flex-1 text-base text-text-primary"
                            value={formData.totalVolume}
                            onChangeText={(text: string) => setFormData({ ...formData, totalVolume: text })}
                            placeholder="0.00"
                            placeholderTextColor="#8A8A8E"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Estimated Total */}
                <View className="bg-bg-secondary border border-gray-300 rounded-lg p-6 mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Updated Cost Estimate
                  </Text>
                  
                  <View className="border-t border-gray-300 pt-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-bold text-text-primary">
                        Estimated Total
                      </Text>
                      <Text className="text-2xl font-bold text-primary">
                        RM {calculateEstimatedTotal().toLocaleString()}
                      </Text>
                    </View>
                    <Text className="text-xs text-text-secondary mt-1">
                      *Final cost may vary based on actual measurements and additional services
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sticky Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4">
                  {/* Cancel Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  
                  {/* Update Button */}
                  <TouchableOpacity
                    onPress={handleUpdate}
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={['#409CFF', '#0A84FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
                    >
                      <Text className="text-base font-semibold text-white">Update</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
    </View>
  );
}
