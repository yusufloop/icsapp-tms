import { PremiumCard } from '@/components/ui/PremiumCard';
import MapView, { LoadScript, Marker } from '@preflower/react-native-web-maps';
import React from 'react';
import { Text, View } from 'react-native';

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

// Use Google Maps API key from .env
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ;


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
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
          <MapView
            style={{ 
              width: '100%', 
              height: 350, 
              borderRadius: 12 
            }}
            initialRegion={destinationCoordinates}
          >
            <Marker
              coordinate={{
                latitude: destinationCoordinates.latitude,
                longitude: destinationCoordinates.longitude,
              }}
              title={currentRoute.nextStop.customerName}
            />
          </MapView>
        </LoadScript>
      </PremiumCard>
    </View>
  );
}