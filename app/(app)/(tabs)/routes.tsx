import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { PremiumButton } from '@/components/ui/PremiumButton';

interface Route {
  id: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  totalStops: number;
  completedStops: number;
  estimatedTime: string;
  status: 'active' | 'completed' | 'scheduled' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
}

export default function RoutesScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'scheduled'>('all');

  const routes: Route[] = [
    {
      id: 'RT-001',
      routeName: 'Downtown Circuit',
      startLocation: 'Warehouse A',
      endLocation: 'Distribution Center',
      totalStops: 12,
      completedStops: 8,
      estimatedTime: '6h 30m',
      status: 'active',
      priority: 'high'
    },
    {
      id: 'RT-002',
      routeName: 'Suburban Route',
      startLocation: 'Warehouse B',
      endLocation: 'Mall Complex',
      totalStops: 8,
      completedStops: 8,
      estimatedTime: '4h 15m',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'RT-003',
      routeName: 'Express Delivery',
      startLocation: 'Central Hub',
      endLocation: 'Airport',
      totalStops: 5,
      completedStops: 0,
      estimatedTime: '2h 45m',
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 'RT-004',
      routeName: 'Industrial Zone',
      startLocation: 'Warehouse C',
      endLocation: 'Factory District',
      totalStops: 15,
      completedStops: 0,
      estimatedTime: '8h 00m',
      status: 'scheduled',
      priority: 'low'
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { type: 'info' as const, color: '#0A84FF' };
      case 'completed':
        return { type: 'success' as const, color: '#30D158' };
      case 'scheduled':
        return { type: 'warning' as const, color: '#FF9F0A' };
      case 'cancelled':
        return { type: 'error' as const, color: '#FF453A' };
      default:
        return { type: 'neutral' as const, color: '#8A8A8E' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF453A';
      case 'medium': return '#FF9F0A';
      case 'low': return '#30D158';
      default: return '#8A8A8E';
    }
  };

  const getFilteredRoutes = () => {
    if (filter === 'all') return routes;
    return routes.filter(route => route.status === filter);
  };

  const getFilterCount = (filterType: string) => {
    if (filterType === 'all') return routes.length;
    return routes.filter(route => route.status === filterType).length;
  };

  const handleStartRoute = (routeId: string) => {
    console.log('Starting route:', routeId);
  };

  const handleViewDetails = (routeId: string) => {
    console.log('Viewing route details:', routeId);
  };

  const filteredRoutes = getFilteredRoutes();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-text-primary">Routes</Text>
          
          <TouchableOpacity className="bg-primary rounded-lg px-3 py-2">
            <Text className="text-white font-semibold text-sm">New Route</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[
            { key: 'all', label: 'All', count: getFilterCount('all') },
            { key: 'active', label: 'Active', count: getFilterCount('active') },
            { key: 'scheduled', label: 'Scheduled', count: getFilterCount('scheduled') },
            { key: 'completed', label: 'Completed', count: getFilterCount('completed') },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              onPress={() => setFilter(filterOption.key as any)}
              className={`mr-4 px-4 py-2 rounded-full border ${
                filter === filterOption.key
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  filter === filterOption.key
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Routes List */}
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route) => (
            <View key={route.id} className="mb-4">
              <PremiumCard>
                {/* Route Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-bold text-text-primary mr-2">
                        {route.id}
                      </Text>
                      <View 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(route.priority) }}
                      />
                    </View>
                    <Text className="text-base font-semibold text-text-primary">
                      {route.routeName}
                    </Text>
                  </View>
                  
                  <PremiumStatusBadge 
                    status={getStatusConfig(route.status).type}
                    text={route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    size="sm"
                  />
                </View>

                {/* Route Details */}
                <View className="bg-gray-50 rounded-lg p-3 mb-4">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="location-on" size={16} color="#8A8A8E" />
                    <Text className="text-sm text-text-secondary ml-2">
                      {route.startLocation} → {route.endLocation}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <MaterialIcons name="place" size={16} color="#8A8A8E" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {route.completedStops}/{route.totalStops} stops
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <MaterialIcons name="schedule" size={16} color="#8A8A8E" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {route.estimatedTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                {route.status === 'active' && (
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-text-secondary">Progress</Text>
                      <Text className="text-sm font-medium text-text-primary">
                        {Math.round((route.completedStops / route.totalStops) * 100)}%
                      </Text>
                    </View>
                    <View className="bg-gray-200 rounded-full h-2">
                      <View 
                        className="bg-primary rounded-full h-2"
                        style={{ 
                          width: `${(route.completedStops / route.totalStops) * 100}%` 
                        }}
                      />
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  {route.status === 'scheduled' && (
                    <View className="flex-1">
                      <PremiumButton
                        title="Start Route"
                        onPress={() => handleStartRoute(route.id)}
                        variant="gradient"
                        size="sm"
                        icon={<MaterialIcons name="play-arrow" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
                      />
                    </View>
                  )}
                  
                  <View className="flex-1">
                    <PremiumButton
                      title="View Details"
                      onPress={() => handleViewDetails(route.id)}
                      variant="secondary"
                      size="sm"
                      icon={<MaterialIcons name="visibility" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
                    />
                  </View>
                </View>
              </PremiumCard>
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="route" size={64} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-text-secondary mt-4">
              No routes found
            </Text>
            <Text className="text-text-tertiary text-center mt-2">
              No routes match the selected filter criteria
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}