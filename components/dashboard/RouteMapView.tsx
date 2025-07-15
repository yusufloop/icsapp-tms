import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
  // Coordinates for the specified address: 37A, Jln BP 7/12, Bandar Bukit Puchong, 47120 Puchong, Selangor
  const destinationCoordinates = {
    latitude: 3.0319,
    longitude: 101.6841,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Mock current location (nearby location for demonstration)
  const currentLocation = {
    latitude: 3.0289,
    longitude: 101.6801,
  };

  return (
    <View>
      <Text className="text-lg font-semibold text-text-primary mb-4">
        Your next route
      </Text>
      
      <PremiumCard className="mb-4">
        {/* Real Map using react-native-maps */}
        <View 
          className="rounded-lg mb-4 overflow-hidden"
          style={{ height: 200 }}
        >
          <MapView
            style={{ flex: 1 }}
            initialRegion={destinationCoordinates}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            <Marker
              coordinate={{
                latitude: destinationCoordinates.latitude,
                longitude: destinationCoordinates.longitude,
              }}
              title={currentRoute.nextStop.customerName}
              description={currentRoute.nextStop.address}
            />
          </MapView>
          
          
          <View className="absolute top-2 right-2 bg-white rounded-lg px-3 py-1 shadow-sm">
            <Text className="text-xs font-medium text-gray-700">2.3 km</Text>
            <Text className="text-xs text-gray-500">~8 min</Text>
          </View>
        </View>
        
        {/* Next Stop Info */}
        <View className="bg-blue-50 rounded-lg p-4 flex-row items-center">
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold text-lg">
              {currentRoute.nextStop.customerName.split(' ').map(name => name[0]).join('').substring(0, 2)}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className="font-semibold text-text-primary">
              {currentRoute.nextStop.customerName}
            </Text>
            <Text className="text-sm text-text-secondary mb-1">
              {currentRoute.nextStop.address}
            </Text>
            <View className="flex-row items-center">
              <MaterialIcons name="access-time" size={14} color="#6B7280" />
              <Text className="text-xs text-text-secondary ml-1">
                ETA: {currentRoute.nextStop.estimatedArrival}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <PremiumStatusBadge 
              status="warning" 
              text={currentRoute.nextStop.package}
              size="sm"
            />
          </View>
        </View>
      </PremiumCard>
    </View>
  );
}