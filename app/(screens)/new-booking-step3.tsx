import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchDriversWithStatus,
  getMockDrivers,
  searchDrivers,
  type Driver
} from '../../services/driverService';


export default function NewBookingStep3Screen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [modalDriver, setModalDriver] = useState<Driver | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDriver, setSuccessDriver] = useState<Driver | null>(null);
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

      // Try to fetch real drivers from database
      const realDrivers = await fetchDriversWithStatus();

      if (realDrivers.length > 0) {
        setDrivers(realDrivers);
        console.log('✅ Loaded real drivers from database:', realDrivers.length);
      } else {
        // Fallback to mock data if no real drivers found
        const mockDrivers = getMockDrivers();
        setDrivers(mockDrivers);
        console.log('⚠️ Using mock drivers as fallback');
      }
    } catch (err) {
      console.error('❌ Error loading drivers:', err);
      setError('Failed to load drivers');

      // Use mock data as fallback
      const mockDrivers = getMockDrivers();
      setDrivers(mockDrivers);
    } finally {
      setLoading(false);
    }
  };

  // Search drivers
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      loadDrivers();
      return;
    }

    try {
      const searchResults = await searchDrivers(query);
      setDrivers(searchResults);
    } catch (err) {
      console.error('Error searching drivers:', err);
      // Filter current drivers locally as fallback
      const filtered = drivers.filter(driver =>
        driver.name.toLowerCase().includes(query.toLowerCase()) ||
        (driver.license_no && driver.license_no.toLowerCase().includes(query.toLowerCase())) ||
        (driver.phone && driver.phone.includes(query))
      );
      setDrivers(filtered);
    }
  };

  // Get avatar based on driver name
  const getDriverAvatar = (name: string) => {
    const avatars = ['👨‍💼', '👩‍💼', '👨‍🚛', '👩‍🚛', '👨‍🔧', '👩‍🔧'];
    const index = name.length % avatars.length;
    return avatars[index];
  };

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  const handleDriverTap = (driver: Driver) => {
    setModalDriver(driver);
    setShowDriverModal(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Template Removed" : "Template Saved",
      isBookmarked
        ? "Configuration removed from templates"
        : "Configuration from Steps 1 & 2 saved as template"
    );
  };

  const handleCreateBooking = () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver to continue');
      return;
    }

    const driver = drivers.find(d => d.driver_id === selectedDriver);
    if (!driver) {
      Alert.alert('Error', 'Selected driver not found');
      return;
    }

    setSuccessDriver(driver);
    setShowSuccessModal(true);
  };

  const handleBackToBooking = () => {
    setShowSuccessModal(false);
    router.push('/(app)/(tabs)/requests');
  };

  const handleViewInvoice = () => {
    setShowSuccessModal(false);
    router.push('/(screens)/invoice');
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="hourglass-empty" size={48} color="#6B7280" />
          <Text className="text-lg font-semibold text-text-primary mt-4">
            Loading drivers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
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
            Select a driver for your booking
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="px-6 py-4 bg-bg-secondary">
        <View className="flex-row items-center justify-between">
          {/* Step 1 - Completed */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
              <MaterialIcons name="check" size={16} color="white" />
            </View>
            <View className="flex-1 h-1 bg-green-500 ml-2" />
          </View>

          {/* Step 2 - Completed */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center ml-2">
              <MaterialIcons name="check" size={16} color="white" />
            </View>
            <View className="flex-1 h-1 bg-green-500 ml-2" />
          </View>

          {/* Step 3 - Active */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-2">
              <Text className="text-white text-sm font-bold">3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="px-6 py-4 bg-bg-secondary border-b border-gray-200">
        {/* Search Input */}
        <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 mb-4">
          <MaterialIcons
            name="search"
            size={20}
            color="#8A8A8E"
            style={{ marginRight: 12 }}
          />
          <TextInput
            className="flex-1 text-base text-text-primary"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search drivers..."
            placeholderTextColor="#8A8A8E"
          />
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row space-x-3 gap-4">
            {/* Sort Button */}
            <TouchableOpacity className="bg-bg-primary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80">
              <MaterialIcons name="sort" size={18} color="#1C1C1E" />
              <Text className="text-sm font-medium text-text-primary ml-2">
                Sort
              </Text>
            </TouchableOpacity>

            {/* Filter Button with Badge */}
            <TouchableOpacity className="bg-bg-primary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80 relative">
              <MaterialIcons name="filter-list" size={18} color="#1C1C1E" />
              <Text className="text-sm font-medium text-text-primary ml-2">
                Filter
              </Text>
              {/* Notification Badge */}
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-white">2</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={handleBookmark}
            className="p-2 active:opacity-80"
          >
            <MaterialIcons
              name={isBookmarked ? "bookmark" : "bookmark-border"}
              size={24}
              color={isBookmarked ? "#0A84FF" : "#8A8A8E"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Driver List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-4">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-700 text-center">{error}</Text>
              <TouchableOpacity
                onPress={loadDrivers}
                className="mt-2 bg-red-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {drivers.map((driver) => (
            <TouchableOpacity
              key={driver.driver_id}
              onPress={() => handleDriverTap(driver)}
              className={`bg-bg-secondary border rounded-lg p-4 mb-3 flex-row items-center active:opacity-80 ${selectedDriver === driver.driver_id
                ? "border-primary bg-blue-50"
                : "border-gray-300"
                }`}
            >
              {/* Selection Radio */}
              <TouchableOpacity
                onPress={() => handleDriverSelect(driver.driver_id)}
                className="mr-4"
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedDriver === driver.driver_id
                    ? "border-primary bg-primary"
                    : "border-gray-400"
                    }`}
                >
                  {selectedDriver === driver.driver_id && (
                    <View className="w-3 h-3 rounded-full bg-white" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Driver Avatar */}
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
                <Text className="text-2xl">{getDriverAvatar(driver.name)}</Text>
              </View>

              {/* Driver Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-text-primary">
                    {driver.name}
                  </Text>
                  {/* Status Badge */}
                  <View
                    className={`px-2 py-1 rounded-full ${
                      // FIX: Using .toLowerCase() for consistency
                      driver.status.toLowerCase() === "available"
                        ? "bg-green-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        // FIX: Using .toLowerCase() for consistency
                        driver.status.toLowerCase() === "available"
                          ? "text-green-700"
                          : "text-orange-700"
                      }`}
                    >
                      {driver.status.toLowerCase() === "available" ? "Available" : "Busy"}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-text-secondary mt-1">
                  {driver.phone}
                </Text>
              </View>

              {/* Tap Indicator */}
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="#8A8A8E"
                className="ml-2"
              />
            </TouchableOpacity>
          ))}

          {drivers.length === 0 && !loading && (
            <View className="items-center py-12">
              <MaterialIcons name="search-off" size={48} color="#8A8A8E" />
              <Text className="text-text-secondary mt-4 text-center">
                No drivers found matching your search
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer with Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4 gap-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-gray-600">Back</Text>
          </TouchableOpacity>

          {/* Create Booking Button */}
          <TouchableOpacity
            onPress={handleCreateBooking}
            className="flex-1 bg-blue-500 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            {/* FIX: Changed label for better UX */}
            <Text className="text-base font-semibold text-white">Create Booking</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 
        ====================================================
        == DRIVER DETAILS MODAL - ALL FIXES APPLIED BELOW ==
        ====================================================
      */}
      <Modal
        visible={showDriverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDriverModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-bg-primary rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {modalDriver && modalDriver.status.toLowerCase() === 'available' ? (
              // AVAILABLE DRIVER VIEW
              <View>
                {/* Available Driver Header */}
                <View className="px-6 py-6 border-b border-gray-200 relative">
                  <TouchableOpacity
                    onPress={() => setShowDriverModal(false)}
                    className="absolute top-4 right-4 z-10 active:opacity-80"
                  >
                    <MaterialIcons name="close" size={24} color="#1C1C1E" />
                  </TouchableOpacity>
                  <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-3">
                      <Text className="text-3xl">{getDriverAvatar(modalDriver.name)}</Text>
                    </View>
                    <Text className="text-xl font-bold text-text-primary">
                      {modalDriver.name}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {modalDriver.phone || modalDriver.email || `License: ${modalDriver.license_no || 'N/A'}`}
                    </Text>
                  </View>
                </View>

                {/* Available Content */}
                <View className="px-6 py-8 items-center">
                  <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                    {/* FIX 1: Invalid prop replaced with 'name' prop */}
                    <MaterialIcons
                      name="check-circle"
                      size={32}
                      color="#10B981"
                    />
                  </View>
                  {/* FIX 2: Stray text nodes wrapped in <Text> components */}
                  <Text className="text-xl font-bold text-green-700">
                    Driver Available
                  </Text>
                  <Text className="text-text-secondary text-center mt-1">
                    This driver is currently available and has no active bookings.
                  </Text>
                </View>
              </View> // <-- FIX 3: Extraneous </View> removed.
            ) : (
              // BUSY DRIVER VIEW
              modalDriver && (
                <View>
                  {/* Busy Driver Header */}
                  <View className="px-6 py-4 border-b border-gray-200 relative">
                    <TouchableOpacity
                      onPress={() => setShowDriverModal(false)}
                      className="absolute top-4 right-4 z-10 active:opacity-80"
                    >
                      <MaterialIcons name="close" size={24} color="#1C1C1E" />
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
                        <Text className="text-xl">{getDriverAvatar(modalDriver.name)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-text-primary">
                          {modalDriver.name}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          {modalDriver.phone || modalDriver.email || `License: ${modalDriver.license_no || 'N/A'}`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Driver Details */}
                  <View className="px-6 py-4">
                    <View className="bg-orange-50 rounded-lg p-4">
                      <View className="flex-row items-center mb-3">
                        <MaterialIcons name="work" size={20} color="#F59E0B" />
                        <Text className="text-orange-700 font-semibold ml-2">Currently Busy</Text>
                      </View>
                      <View className="space-y-2">
                        <Text className="text-orange-800">
                          Assigned Bookings: {modalDriver.assigned_bookings}
                        </Text>
                        {modalDriver.license_no && (
                          <Text className="text-orange-800">
                            License: {modalDriver.license_no}
                          </Text>
                        )}
                        {modalDriver.last_updated && (
                          <Text className="text-orange-600 text-sm">
                            Last Updated: {new Date(modalDriver.last_updated).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-bg-primary rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Success Header */}
            <View className="px-6 py-6 border-b border-gray-200">
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                  <MaterialIcons name="check-circle" size={32} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-text-primary text-center mb-2">
                  Booking Created Successfully!
                </Text>
                <Text className="text-text-secondary text-center">
                  Your booking has been created with {successDriver?.name}. What would you like to do next?
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="px-6 py-6">
              <View className="gap-3 ">
                {/* View Invoice Button */}
                <TouchableOpacity
                  onPress={handleViewInvoice}
                  className="active:opacity-80  rounded-xl"
                >
                  <LinearGradient
                    colors={['#409CFF', '#0A84FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl px-4 py-3 min-h-[44px] items-center justify-center"
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons name="receipt" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text className="text-base font-semibold text-white">View Invoice</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back to Booking Button */}
                <TouchableOpacity
                  onPress={handleBackToBooking}
                  className="bg-gray-100 border border-gray-300 rounded-2xl px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="arrow-back" size={18} color="#1C1C1E" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-gray-600">Back to Booking</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}