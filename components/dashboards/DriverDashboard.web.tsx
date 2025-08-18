import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteMapView } from '../dashboard/RouteMapView.web';

interface DriverDashboardProps {
  userRole?: string;
}

export function DriverDashboard({ userRole }: DriverDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingRoutes = [
    { id: 'TMS-5678', route: 'PNG - JHR' },
    { id: 'TMS-5679', route: 'PNG - KLG' },
    { id: 'TMS-5680', route: 'KLG - JHR' },
    { id: 'TMS-5681', route: 'JHR - PNG' },
  ];

  const bookingTools = [
    { id: 'scan', title: 'Scan QR', icon: 'qr-code', bgColor: 'bg-blue-100' },
    { id: 'upload', title: 'Upload POD', icon: 'cloud-upload', bgColor: 'bg-green-100' },
    { id: 'manifest', title: 'View Manifest', icon: 'document-text', bgColor: 'bg-yellow-100' },
    { id: 'schedule', title: 'My Schedule', icon: 'time', bgColor: 'bg-purple-100' },
    { id: 'support', title: 'Contact Support', icon: 'call', bgColor: 'bg-orange-100' },
  ];

  const currentRoute = {
    routeId: 'TMS-5678',
    startTime: '2025-04-8 0800',
    estimatedCompletion: '2025-04-8 1600',
    totalStops: 5,
    completedStops: 2,
    nextStop: {
      address: '37A, Jln BP 7/12, Bandar Bukit Puchong, 47120 Puchong, Selangor',
      customerName: 'Ali Bin Abu',
      package: 'Box',
      estimatedArrival: '09:30',
    },
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Main Content Panel */}
      <View className="flex-1">
        {/* Header Bar */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row items-center justify-between">
          {/* Search Input */}
          <View className="flex-1 max-w-md">
            <View className="relative">
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search product, supplier, order"
                className="bg-gray-50 rounded-lg pl-10 pr-4 py-3 text-gray-900 border border-gray-200"
              />
            </View>
          </View>

          {/* Filters Button */}
          <TouchableOpacity className="ml-4 bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <Ionicons name="filter" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 font-medium">Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Top Section - Two Columns */}
          <View className="flex-row gap-6 mb-8">
            {/* Left Column - RouteMapView as background with glassmorphism route info overlay */}
            <View className="w-3/4">
              <View className="relative rounded-xl overflow-hidden h-80">
                {/* RouteMapView as background */}
                <RouteMapView currentRoute={currentRoute} />
                {/* Glassmorphism Route Info Overlay */}
                <View className="absolute bottom-4 self-center bg-white/80 backdrop-blur-lg rounded-xl px-8 py-4">
                  <Text className="text-blue-600 font-semibold mb-8">Your Current Route</Text>
                  <View className="flex-row items-center ">
                    {/* Origin */}
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-gray-900 mx-8">PNG</Text>
                      <Text className="text-sm text-gray-600">2025-04-8 </Text>
                      <Text className="text-sm text-gray-600">0800</Text>
                    </View>
                    {/* Truck Icon */}
                    <View className="flex-1 relative mx-2">
                      <View className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <FontAwesome5 name="truck" size={28} color="#3B82F6" />
                      </View>
                      {/* Custom Long Arrow */}
                      <View className="flex-row items-center">
                        {/* Line of the arrow */}
                        <View className="h-px w-24 bg-black " />
                        {/* Head of the arrow */}
                        <Ionicons name="caret-forward" size={12} color="black" />
                      </View>
                    </View>
                    {/* Destination */}
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-gray-900 mx-8">KLG</Text>
                      <Text className="text-sm text-gray-600">2025-04-8 </Text>
                      <Text className="text-sm text-gray-600">1600</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column - Upcoming Routes - Using simple View instead of PremiumCard */}
            <View className="w-1/4">
              <View className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-64">
                <Text className="text-lg font-bold text-gray-900 mb-4">Upcoming Routes</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="space-y-3">
                    {upcomingRoutes.map((route, index) => (
                      <View key={index} className="flex-row items-center py-2">
                        {/* Left Icon */}
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="location" size={16} color="#3B82F6" />
                        </View>

                        {/* Middle Content */}
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-900">{route.id}</Text>
                          <Text className="text-sm text-gray-500">{route.route}</Text>
                        </View>

                        {/* Right Ghost Truck */}
                        <View className="opacity-20">
                          <Ionicons name="car" size={20} color="#6B7280" />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Bottom Section - Bookings */}
          <View>
            <Text className="text-lg font-bold text-gray-900 uppercase mb-6">BOOKINGS</Text>

            {/* Horizontal Grid of Tool Cards */}
            <View className="flex-row gap-4">
              {bookingTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  className={`${tool.bgColor} rounded-2xl p-6 items-center justify-center flex-1 min-h-[120px]`}
                >
                  <Ionicons name={tool.icon as any} size={32} color="#374151" />
                  <Text className="font-semibold text-gray-900 mt-3 text-center">{tool.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default DriverDashboard;