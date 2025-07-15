import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TimelineWebScreen() {
  // Mock data representing a booking timeline
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

  // Timeline events data
  const timelineEvents = [
    {
      id: 1,
      title: 'Booking Created',
      description: 'Booking request has been submitted',
      timestamp: '2025-04-05 09:30',
      status: 'completed',
      icon: 'check-circle'
    },
    {
      id: 2,
      title: 'Driver Assigned',
      description: 'Driver John Doe has been assigned to this booking',
      timestamp: '2025-04-05 10:15',
      status: 'completed',
      icon: 'check-circle'
    },
    {
      id: 3,
      title: 'En Route to Pickup',
      description: 'Driver is heading to pickup location',
      timestamp: '2025-04-06 09:00',
      status: 'current',
      icon: 'radio-button-checked'
    },
    {
      id: 4,
      title: 'Pickup Complete',
      description: 'Items collected from pickup location',
      timestamp: 'Pending',
      status: 'pending',
      icon: 'radio-button-unchecked'
    },
    {
      id: 5,
      title: 'In Transit',
      description: 'Items are being transported to destination',
      timestamp: 'Pending',
      status: 'pending',
      icon: 'radio-button-unchecked'
    },
    {
      id: 6,
      title: 'Delivered',
      description: 'Items successfully delivered to consignee',
      timestamp: 'Pending',
      status: 'pending',
      icon: 'radio-button-unchecked'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleOkay = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34D399'; // Green
      case 'current':
        return '#3B82F6'; // Blue
      case 'pending':
        return '#9CA3AF'; // Gray
      default:
        return '#9CA3AF';
    }
  };

  const getIconName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'current':
        return 'radio-button-checked';
      case 'pending':
        return 'radio-button-unchecked';
      default:
        return 'radio-button-unchecked';
    }
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
              Timeline
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Track your booking progress
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
                <View className="mb-6">
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
                <View className="mb-6">
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
                <View className="h-px bg-gray-300 mb-6" />

                {/* Timeline Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-6">
                    Booking Progress
                  </Text>
                  
                  {timelineEvents.map((event, index) => (
                    <View key={event.id} className="flex-row mb-6">
                      {/* Timeline Icon and Line */}
                      <View className="items-center mr-4">
                        <View 
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: getStatusColor(event.status) }}
                        >
                          <MaterialIcons 
                            name={getIconName(event.status)} 
                            size={20} 
                            color="white" 
                          />
                        </View>
                        {/* Connecting Line */}
                        {index < timelineEvents.length - 1 && (
                          <View 
                            className="w-0.5 h-12 mt-2"
                            style={{ backgroundColor: '#E5E7EB' }}
                          />
                        )}
                      </View>

                      {/* Event Content */}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-text-primary mb-1">
                          {event.title}
                        </Text>
                        <Text className="text-sm text-text-secondary mb-2">
                          {event.description}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {event.timestamp}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Shipment Section */}
                <View className="mb-6">
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

              {/* Footer with Action Button */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <TouchableOpacity
                  onPress={handleOkay}
                  className="bg-primary rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                >
                  <Text className="text-base font-semibold text-white">Okay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
