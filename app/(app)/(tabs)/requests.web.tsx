import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { addApproval } from '@/services/approvalService';
import { router } from 'expo-router';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BookingData {
  id: string;
  name: string;
  bookingNumber: string;
  price: string;
  shipmentType: string;
  containerSize: string;
  pickup: string;
  delivery: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Picked Up';
}

export default function WebBookingsScreen() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [animatedValues] = useState(() => new Map<string, Animated.Value>());

  // Mock data for the bookings table
  const bookings: BookingData[] = [
    {
      id: '1',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'In Transit'
    },
    {
      id: '2',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'In Transit'
    },
    {
      id: '3',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'In Transit'
    },
    {
      id: '4',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'Delivered'
    },
    {
      id: '5',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'Delivered'
    },
    {
      id: '6',
      name: 'Macbook Pro',
      bookingNumber: 'xxxKLGxPNGxxxxx',
      price: '5000',
      shipmentType: 'LCL',
      containerSize: '40',
      pickup: 'PNG',
      delivery: 'KLG',
      date: '2025-05-09',
      status: 'Delivered'
    },
  ];

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === bookings.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(bookings.map(b => b.id)));
    }
  };

  const getStatusType = (status: string): 'warning' | 'success' | 'info' | 'neutral' => {
    switch (status) {
      case 'In Transit':
        return 'warning';
      case 'Delivered':
        return 'success';
      case 'Picked Up':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const handleNewBooking = () => {
    router.push('/new-booking');
  };

  // Initialize animated value for a row if it doesn't exist
  const getAnimatedValue = (id: string) => {
    if (!animatedValues.has(id)) {
      animatedValues.set(id, new Animated.Value(0));
    }
    return animatedValues.get(id)!;
  };

  const handleRowClick = (booking: BookingData, event?: any) => {
    // Prevent expansion if clicking on checkbox
    if (event?.target?.closest('[data-checkbox]')) {
      return;
    }

    const isCurrentlyExpanded = expandedRow === booking.id;
    const newExpandedRow = isCurrentlyExpanded ? null : booking.id;

    // Animate current expanded row to collapse
    if (expandedRow && expandedRow !== booking.id) {
      const currentAnimatedValue = getAnimatedValue(expandedRow);
      Animated.timing(currentAnimatedValue, {
        toValue: 0,
        duration: DesignSystem.animation.duration.normal,
        useNativeDriver: false,
      }).start();
    }

    // Animate new row
    if (!isCurrentlyExpanded) {
      const animatedValue = getAnimatedValue(booking.id);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: DesignSystem.animation.duration.normal,
        useNativeDriver: false,
      }).start();
    } else {
      const animatedValue = getAnimatedValue(booking.id);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: DesignSystem.animation.duration.normal,
        useNativeDriver: false,
      }).start();
    }

    setExpandedRow(newExpandedRow);
  };

  // Action button handlers
  const handleTimeline = (booking: BookingData) => {
    router.push('/timeline');
  };

  const handleEdit = (booking: BookingData) => {
    // Navigate to edit booking page with current booking data
    router.push({
      pathname: '/edit-booking',
      params: {
        bookingName: booking.name,
        client: 'John@gmail.com',
        consignee: 'Jane Doe',
        date: booking.date,
        pickupState: 'Selangor',
        pickupAddress: '123 Pickup Street, Petaling Jaya',
        pickupTime: new Date().toISOString(),
        deliveryState: 'Kuala Lumpur',
        deliveryAddress: '456 Delivery Avenue, KLCC',
        deliveryTime: new Date().toISOString(),
        shipmentType: booking.shipmentType,
        containerSize: booking.containerSize + 'ft',
        items: JSON.stringify(['Electronics', 'Computer Parts']),
        totalGrossWeight: '1500',
        totalVolume: '25',
      },
    });
  };

  const handleInvoice = (booking: BookingData) => {
    router.push('/invoice');
  };

  const handleRecall = (booking: BookingData) => {
    router.push(`/recall?id=${booking.id}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Bar */}
      <View className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <View className="flex-row items-center justify-between">
          {/* Search Input */}
          <View className="flex-1 max-w-md">
            <View className="relative">
              <MaterialIcons 
                name="search" 
                size={20} 
                color={DesignSystem.colors.text.secondary}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search product, supplier, order"
                placeholderTextColor={DesignSystem.colors.text.tertiary}
                className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                style={{ fontSize: 14 }}
              />
            </View>
          </View>

          {/* Right Side Controls */}
          <View className="flex-row items-center space-x-4 ml-6">
            {/* Filters Button */}
            <TouchableOpacity className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <MaterialIcons name="tune" size={20} color={DesignSystem.colors.text.secondary} />
              <Text className="ml-2 text-gray-700 font-medium">Filters</Text>
            </TouchableOpacity>

            {/* New Booking Button */}
            <TouchableOpacity 
              onPress={handleNewBooking}
              className="bg-blue-600 rounded-lg px-6 py-3 flex-row items-center"
              style={{
                shadowColor: DesignSystem.colors.primary[500],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text className="ml-2 text-white font-semibold">New Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content View */}
      <View className="flex-1 p-6">
        <PremiumCard className="flex-1">
          {/* Title */}
          <View className="px-6 py-4 border-b border-gray-100">
            <Text className="text-xl font-semibold text-gray-900">Request List</Text>
          </View>

          {/* Data Table */}
          <ScrollView className="flex-1">
            {/* Table Header */}
            <View className="bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center px-6 py-4">
                {/* Checkbox Column */}
                <TouchableOpacity 
                  onPress={handleSelectAll}
                  className="w-12 items-center"
                >
                  <View className={`w-5 h-5 border-2 rounded ${
                    selectedRows.size === bookings.length 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  } items-center justify-center`}>
                    {selectedRows.size === bookings.length && (
                      <MaterialIcons name="check" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Table Headers */}
                <View className="flex-1 flex-row">
                  <Text className="flex-1 text-sm font-semibold text-gray-700">Name</Text>
                  <Text className="w-32 text-sm font-semibold text-gray-700">Booking Number</Text>
                  <Text className="w-20 text-sm font-semibold text-gray-700">Price (RM)</Text>
                  <Text className="w-24 text-sm font-semibold text-gray-700">Shipment Type</Text>
                  <Text className="w-24 text-sm font-semibold text-gray-700">Container Size</Text>
                  <Text className="w-20 text-sm font-semibold text-gray-700">Pickup</Text>
                  <Text className="w-20 text-sm font-semibold text-gray-700">Delivery</Text>
                  <Text className="w-24 text-sm font-semibold text-gray-700">Date</Text>
                  <Text className="w-24 text-sm font-semibold text-gray-700">Status</Text>
                </View>
              </View>
            </View>

            {/* Table Rows */}
            {bookings.map((booking, index) => {
              const isExpanded = expandedRow === booking.id;
              const animatedValue = getAnimatedValue(booking.id);
              
              return (
                <View key={booking.id}>
                  {/* Main Row */}
                  <TouchableOpacity
                    onPress={() => handleRowClick(booking)}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } ${isExpanded ? 'bg-blue-50' : ''}`}
                  >
                    <View className="flex-row items-center px-6 py-4">
                      {/* Checkbox */}
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRowSelect(booking.id);
                        }}
                        className="w-12 items-center"
                        data-checkbox="true"
                      >
                        <View className={`w-5 h-5 border-2 rounded ${
                          selectedRows.has(booking.id) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        } items-center justify-center`}>
                          {selectedRows.has(booking.id) && (
                            <MaterialIcons name="check" size={14} color="white" />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Table Data */}
                      <View className="flex-1 flex-row items-center">
                        <Text className="flex-1 text-sm text-gray-900">{booking.name}</Text>
                        <Text className="w-32 text-sm text-gray-700">{booking.bookingNumber}</Text>
                        <Text className="w-20 text-sm text-gray-700">{booking.price}</Text>
                        <Text className="w-24 text-sm text-gray-700">{booking.shipmentType}</Text>
                        <Text className="w-24 text-sm text-gray-700">{booking.containerSize}</Text>
                        <Text className="w-20 text-sm text-gray-700">{booking.pickup}</Text>
                        <Text className="w-20 text-sm text-gray-700">{booking.delivery}</Text>
                        <Text className="w-24 text-sm text-gray-700">{booking.date}</Text>
                        <View className="w-24">
                          <PremiumStatusBadge 
                            status={getStatusType(booking.status)}
                            text={booking.status}
                            size="sm"
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Expandable Action Panel */}
                  <Animated.View
                    style={{
                      height: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 80],
                      }),
                      opacity: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      overflow: 'hidden',
                    }}
                  >
                    <View className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <View className="flex-row items-center justify-start space-x-3 ml-12">
                        {/* Timeline Button - Secondary with light border */}
                        <TouchableOpacity
                          onPress={() => handleTimeline(booking)}
                          className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex-row items-center"
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <MaterialIcons name="timeline" size={16} color={DesignSystem.colors.text.secondary} />
                          <Text className="ml-2 text-sm font-medium text-gray-700">Timeline</Text>
                        </TouchableOpacity>

                        {/* Edit Button - Secondary */}
                        <TouchableOpacity
                          onPress={() => handleEdit(booking)}
                          className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex-row items-center"
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <MaterialIcons name="edit" size={16} color={DesignSystem.colors.text.secondary} />
                          <Text className="ml-2 text-sm font-medium text-gray-700">Edit</Text>
                        </TouchableOpacity>

                       {/* Approve Button - Success action with solid green */}
                       <TouchableOpacity
                         onPress={() => {
                           addApproval({
                             booking_id: booking.id,
                             approval_type: 'APPROVED'
                           })
                           .then(() => {
                             Alert.alert('Success', 'Booking has been approved successfully!');
                           })
                           .catch((error) => {
                             console.error('Error approving booking:', error);
                             Alert.alert('Error', 'Failed to approve booking. Please try again.');
                           });
                         }}
                         className="rounded-lg px-4 py-2 flex-row items-center"
                         style={{
                           backgroundColor: '#10B981',
                           shadowColor: '#10B981',
                           shadowOffset: { width: 0, height: 2 },
                           shadowOpacity: 0.1,
                           shadowRadius: 4,
                           elevation: 2,
                         }}
                       >
                         <MaterialIcons name="check-circle" size={16} color="white" />
                         <Text className="ml-2 text-sm font-semibold text-white">Approve</Text>
                       </TouchableOpacity>
                        {/* Invoice Button - Primary action with solid primary color */}
                        <TouchableOpacity
                          onPress={() => handleInvoice(booking)}
                          className="rounded-lg px-4 py-2 flex-row items-center"
                          style={{
                            shadowColor: DesignSystem.colors.primary[500],
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <LinearGradient
                            colors={[DesignSystem.colors.primary[400], DesignSystem.colors.primary[500]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                              borderRadius: 8,
                            }}
                          />
                          <MaterialIcons name="receipt" size={16} color="white" />
                          <Text className="ml-2 text-sm font-semibold text-white">Invoice</Text>
                        </TouchableOpacity>

                        {/* Recall Button - Destructive action with solid red */}
                        <TouchableOpacity
                          onPress={() => handleRecall(booking)}
                          className="rounded-lg px-4 py-2 flex-row items-center"
                          style={{
                            backgroundColor: DesignSystem.colors.destructive[500],
                            shadowColor: DesignSystem.colors.destructive[500],
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <MaterialIcons name="undo" size={16} color="white" />
                          <Text className="ml-2 text-sm font-semibold text-white">Recall</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                </View>
              );
            })}
          </ScrollView>
        </PremiumCard>
      </View>
    </View>
  );
}
