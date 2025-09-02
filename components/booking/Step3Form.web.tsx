// components/booking/Step3Form.web.tsx

import { BookingData } from '@/types/booking';
import { fetchDriversWithStatus, searchDrivers, type Driver } from '@/services/driverService';
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";

interface Step3FormProps {
  data: BookingData;
  onDataChange: (field: keyof BookingData, value: any) => void;
}

// Driver avatars for UI (kept for consistency)
const driverAvatars = ["👨‍💼", "👨‍🚛", "👩‍💼", "👨‍🔧", "👩‍🚛", "👨‍💻", "👩‍🔬"];

export default function Step3Form({ data, onDataChange }: Step3FormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(data.selectedDriverId);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [modalDriver, setModalDriver] = useState<Driver | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load drivers on component mount
  useEffect(() => {
    loadDrivers();
  }, []);
  
  const loadDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedDrivers = await fetchDriversWithStatus();
        setDrivers(fetchedDrivers);
      } catch (err) {
        setError('Failed to load drivers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  // Handle search with debouncing
  useEffect(() => {
    const searchDriversAsync = async () => {
      if (!searchQuery.trim()) {
        loadDrivers();
        return;
      }
      try {
        const searchResults = await searchDrivers(searchQuery);
        setDrivers(searchResults);
      } catch (err) {
        setError('Failed to search drivers. Please try again.');
      }
    };
    const timeoutId = setTimeout(searchDriversAsync, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Transform drivers for UI
  const transformedDrivers = drivers.map((driver, index) => ({
    id: driver.driver_id,
    name: driver.name,
    no_plate: driver.no_plate || 'No vehicle assigned',
    avatar: driverAvatars[index % driverAvatars.length],
    status: driver.status.toLowerCase(),
    originalDriver: driver,
  }));

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriverId(driverId);
    onDataChange('selectedDriverId', driverId);
  };

  const handleDriverTap = (driver: Driver) => {
    setModalDriver(driver);
    setShowDriverModal(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Template Removed" : "Template Saved",
      isBookmarked ? "Configuration removed from templates" : "Configuration saved as template"
    );
  };
  
  const getDriverAvatar = (name: string) => driverAvatars[name.length % driverAvatars.length];

  return (
    <View>
      {/* Controls Card */}
      <View className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <View className="px-6 py-4">
          <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 mb-4">
            <MaterialIcons name="search" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search drivers..."
              placeholderTextColor="#8A8A8E"
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-bg-secondary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80">
                <MaterialIcons name="sort" size={18} color="#1C1C1E" />
                <Text className="text-sm font-medium text-text-primary ml-2">Sort</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-bg-secondary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80 relative">
                <MaterialIcons name="filter-list" size={18} color="#1C1C1E" />
                <Text className="text-sm font-medium text-text-primary ml-2">Filter</Text>
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"><Text className="text-xs font-bold text-white">2</Text></View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleBookmark} className="p-2 active:opacity-80">
              <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={24} color={isBookmarked ? "#0A84FF" : "#8A8A8E"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Driver List Card */}
      <View className="bg-white rounded-lg shadow-sm border border-gray-200">
        <View className="px-6 py-6">
          {loading ? (
             <View className="items-center py-12"><ActivityIndicator size="large" color="#0A84FF" /><Text className="text-text-secondary mt-4">Loading drivers...</Text></View>
          ) : error ? (
            <View className="items-center py-12">
              <MaterialIcons name="error-outline" size={48} color="#FF453A" />
              <Text className="text-red-600 mt-4 text-center">{error}</Text>
              <TouchableOpacity onPress={loadDrivers} className="mt-4 bg-primary px-4 py-2 rounded-lg"><Text className="text-white font-medium">Retry</Text></TouchableOpacity>
            </View>
          ) : transformedDrivers.length > 0 ? (
            <View className="space-y-3">
              {transformedDrivers.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  onPress={() => handleDriverTap(driver.originalDriver)}
                  className={`border rounded-lg p-4 flex-row items-center transition-all ${selectedDriverId === driver.id ? "border-primary bg-blue-50" : "border-gray-300 bg-bg-secondary hover:border-gray-400"}`}
                >
                  <TouchableOpacity onPress={() => handleDriverSelect(driver.id)} className="mr-4">
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedDriverId === driver.id ? "border-primary bg-primary" : "border-gray-400"}`}>
                      {selectedDriverId === driver.id && <View className="w-3 h-3 rounded-full bg-white" />}
                    </View>
                  </TouchableOpacity>
                  <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4"><Text className="text-2xl">{driver.avatar}</Text></View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-semibold text-text-primary">{driver.name}</Text>
                      <View className={`px-2 py-1 rounded-full ${driver.status === "available" ? "bg-green-100" : "bg-orange-100"}`}>
                        <Text className={`text-xs font-medium ${driver.status === "available" ? "text-green-700" : "text-orange-700"}`}>{driver.status === "available" ? "Available" : "Busy"}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-text-secondary mt-1">{driver.no_plate}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#8A8A8E" className="ml-2" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-12">
              <MaterialIcons name="search-off" size={48} color="#8A8A8E" />
              <Text className="text-text-secondary mt-4 text-center">No drivers found matching your search</Text>
            </View>
          )}
        </View>
      </View>

      {/* Driver Details Modal */}
      <Modal visible={showDriverModal} transparent={true} animationType="fade" onRequestClose={() => setShowDriverModal(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {modalDriver && (
              <View>
                <View className="px-6 py-6 border-b border-gray-200 relative">
                  <TouchableOpacity onPress={() => setShowDriverModal(false)} className="absolute top-4 right-4 z-10 active:opacity-80"><MaterialIcons name="close" size={24} color="#1C1C1E" /></TouchableOpacity>
                  <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-3"><Text className="text-3xl">{getDriverAvatar(modalDriver.name)}</Text></View>
                    <Text className="text-xl font-bold text-text-primary">{modalDriver.name}</Text>
                    <Text className="text-text-secondary text-sm">{modalDriver.no_plate}</Text>
                  </View>
                </View>
                {modalDriver.status.toLowerCase() === 'available' ? (
                  <View className="px-6 py-8 items-center">
                    <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4"><MaterialIcons name="check-circle" size={32} color="#10B981" /></View>
                    <Text className="text-lg font-semibold text-text-primary text-center mb-2">Driver Available</Text>
                    <Text className="text-text-secondary text-center">This driver is currently available and has no active booking.</Text>
                  </View>
                ) : (
                  <View className="px-6 py-4">
                    <View className="bg-orange-50 rounded-lg p-4">
                        <View className="flex-row items-center mb-3"><MaterialIcons name="work" size={20} color="#F59E0B" /><Text className="text-orange-700 font-semibold ml-2">Currently Busy</Text></View>
                        <View className="space-y-2">
                            <Text className="text-orange-800">Assigned Bookings: {modalDriver.assigned_bookings}</Text>
                            {modalDriver.license_no && <Text className="text-orange-800">License: {modalDriver.license_no}</Text>}
                            {modalDriver.last_updated && <Text className="text-orange-600 text-sm">Last Updated: {new Date(modalDriver.last_updated).toLocaleString()}</Text>}
                        </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}