import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';

const { width } = Dimensions.get('window');

interface RouteMapViewProps {
  currentRoute: {
    routeId: string;
    startTime: string;
    estimatedCompletion: string;
    totalStops: number;
    completedStops: number;
    nextStop: {
      address: string;
      customerName: string;
      package: string;
      estimatedArrival: string;
    };
  };
}

export function RouteMapView({ currentRoute }: RouteMapViewProps) {
  return (
    <View>
      <Text className="text-lg font-semibold text-text-primary mb-4">
        Your next route
      </Text>
      
      <PremiumCard className="mb-4">
        {/* Map Placeholder - In production, replace with react-native-maps */}
        <View 
          className="bg-gray-100 rounded-lg mb-4 items-center justify-center relative"
          style={{ height: 200 }}
        >
          {/* Map Background */}
          <View className="absolute inset-0 bg-gray-200 rounded-lg">
            {/* Street Grid Pattern */}
            <View className="absolute top-4 left-4 right-4 bottom-4">
              {/* Horizontal lines */}
              <View className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
              <View className="absolute top-1/3 left-0 right-0 h-px bg-gray-300" />
              <View className="absolute top-2/3 left-0 right-0 h-px bg-gray-300" />
              <View className="absolute bottom-0 left-0 right-0 h-px bg-gray-300" />
              
              {/* Vertical lines */}
              <View className="absolute top-0 bottom-0 left-0 w-px bg-gray-300" />
              <View className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-300" />
              <View className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-300" />
              <View className="absolute top-0 bottom-0 right-0 w-px bg-gray-300" />
            </View>
            
            {/* Route Path */}
            <View className="absolute top-8 left-8 right-16 bottom-16">
              <View 
                className="absolute bg-warning rounded-full"
                style={{ 
                  width: 4, 
                  height: 60,
                  top: 20,
                  left: 40,
                  transform: [{ rotate: '45deg' }]
                }}
              />
              <View 
                className="absolute bg-warning rounded-full"
                style={{ 
                  width: 4, 
                  height: 40,
                  top: 60,
                  left: 80,
                }}
              />
              <View 
                className="absolute bg-warning rounded-full"
                style={{ 
                  width: 4, 
                  height: 30,
                  top: 80,
                  left: 120,
                  transform: [{ rotate: '90deg' }]
                }}
              />
            </View>
            
            {/* Current Location Marker */}
            <View 
              className="absolute w-6 h-6 bg-primary rounded-full items-center justify-center"
              style={{ top: 40, left: 60 }}
            >
              <View className="w-3 h-3 bg-white rounded-full" />
            </View>
            
            {/* Destination Marker */}
            <View 
              className="absolute w-8 h-8 bg-warning rounded-full items-center justify-center"
              style={{ top: 100, right: 40 }}
            >
              <MaterialIcons name="place" size={16} color="white" />
            </View>
          </View>
          
          {/* Map Labels */}
          <View className="absolute top-2 right-2">
            <Text className="text-xs text-gray-500">Maiden Ln</Text>
          </View>
          <View className="absolute bottom-2 left-2">
            <Text className="text-xs text-gray-500">Real Ch</Text>
          </View>
          <View className="absolute top-1/2 left-2">
            <Text className="text-xs text-gray-500">Tacos & Tequilas</Text>
            <Text className="text-xs text-gray-500">Mexican Grill</Text>
          </View>
        </View>
        
        {/* Next Stop Info */}
        <View className="bg-blue-50 rounded-lg p-4 flex-row items-center">
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold text-lg">BV</Text>
          </View>
          
          <View className="flex-1">
            <Text className="font-semibold text-text-primary">
              {currentRoute.nextStop.customerName}
            </Text>
            <Text className="text-sm text-text-secondary">
              {currentRoute.nextStop.address}
            </Text>
          </View>
        </View>
      </PremiumCard>
    </View>
  );
}