import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Mock driver data
const mockDrivers = [
  {
    id: '1',
    name: 'Driver 1',
    phone: '+60 12-345 6789',
    avatar: '👨‍💼',
    status: 'busy',
    currentJob: {
      origin: 'PNG',
      destination: 'KLG',
      date: '2025-01-13',
      time: '14:30',
      totalVolume: '25.5 CBM',
      totalGrossWeight: '1,250 KG',
      shipmentType: 'LFC',
      containerSize: '40ft',
      twinning: 'Yes'
    }
  },
  {
    id: '2',
    name: 'Driver 2',
    phone: '+60 12-456 7890',
    avatar: '👨‍🚛',
    status: 'available',
    currentJob: null
  },
  {
    id: '3',
    name: 'Driver 3',
    phone: '+60 12-567 8901',
    avatar: '👩‍💼',
    status: 'busy',
    currentJob: {
      origin: 'KL',
      destination: 'JB',
      date: '2025-01-13',
      time: '16:00',
      totalVolume: '18.2 CBM',
      totalGrossWeight: '890 KG',
      shipmentType: 'CLC',
      containerSize: '20ft',
      twinning: 'No'
    }
  },
  {
    id: '4',
    name: 'Driver 4',
    phone: '+60 12-678 9012',
    avatar: '👨‍🔧',
    status: 'available',
    currentJob: null
  },
  {
    id: '5',
    name: 'Driver 5',
    phone: '+60 12-789 0123',
    avatar: '👩‍🚛',
    status: 'busy',
    currentJob: {
      origin: 'PG',
      destination: 'KT',
      date: '2025-01-13',
      time: '09:15',
      totalVolume: '32.1 CBM',
      totalGrossWeight: '1,580 KG',
      shipmentType: 'LFC',
      containerSize: '40ft HC',
      twinning: 'Yes'
    }
  }
];

export default function NewBookingStep3Screen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [modalDriver, setModalDriver] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDriver, setSuccessDriver] = useState<any>(null);

  // Filter drivers based on search query
  const filteredDrivers = mockDrivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone.includes(searchQuery)
  );

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  const handleDriverTap = (driver: any) => {
    setModalDriver(driver);
    setShowDriverModal(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Template Removed' : 'Template Saved',
      isBookmarked 
        ? 'Configuration removed from templates' 
        : 'Configuration from Steps 1 & 2 saved as template'
    );
  };

  const handleCreateBooking = () => {
    console.log('🚀 Create Booking button pressed!');
    console.log('📋 Selected driver:', selectedDriver);
    
    if (!selectedDriver) {
      console.log('❌ No driver selected, showing error alert');
      Alert.alert('Error', 'Please select a driver to continue');
      return;
    }

    const driver = mockDrivers.find(d => d.id === selectedDriver);
    console.log('👨‍💼 Found driver:', driver);
    console.log('🎉 About to show success modal');
    
    // Show custom success modal instead of Alert.alert
    setSuccessDriver(driver);
    setShowSuccessModal(true);
    console.log('✅ Success modal triggered');
  };

  const handleBackToBooking = () => {
    console.log('🔙 User selected: Back to Booking');
    setShowSuccessModal(false);
    router.push('/(app)/(tabs)/requests');
  };

  const handleViewInvoice = () => {
    console.log('📄 User selected: View Invoice');
    setShowSuccessModal(false);
    router.push('/(screens)/invoice');
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

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
          <MaterialIcons name="search" size={20} color="#8A8A8E" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 text-base text-text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search drivers..."
            placeholderTextColor="#8A8A8E"
          />
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row space-x-3">
            {/* Sort Button */}
            <TouchableOpacity className="bg-bg-primary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80">
              <MaterialIcons name="sort" size={18} color="#1C1C1E" />
              <Text className="text-sm font-medium text-text-primary ml-2">Sort</Text>
            </TouchableOpacity>

            {/* Filter Button with Badge */}
            <TouchableOpacity className="bg-bg-primary border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80 relative">
              <MaterialIcons name="filter-list" size={18} color="#1C1C1E" />
              <Text className="text-sm font-medium text-text-primary ml-2">Filter</Text>
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
          {filteredDrivers.map((driver) => (
            <TouchableOpacity
              key={driver.id}
              onPress={() => handleDriverTap(driver)}
              className={`bg-bg-secondary border rounded-lg p-4 mb-3 flex-row items-center active:opacity-80 ${
                selectedDriver === driver.id ? 'border-primary bg-blue-50' : 'border-gray-300'
              }`}
            >
              {/* Selection Radio */}
              <TouchableOpacity
                onPress={() => handleDriverSelect(driver.id)}
                className="mr-4"
              >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedDriver === driver.id ? 'border-primary bg-primary' : 'border-gray-400'
                }`}>
                  {selectedDriver === driver.id && (
                    <View className="w-3 h-3 rounded-full bg-white" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Driver Avatar */}
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
                <Text className="text-2xl">{driver.avatar}</Text>
              </View>

              {/* Driver Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-text-primary">
                    {driver.name}
                  </Text>
                  {/* Status Badge */}
                  <View className={`px-2 py-1 rounded-full ${
                    driver.status === 'available' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      driver.status === 'available' ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {driver.status === 'available' ? 'Available' : 'Busy'}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-text-secondary mt-1">
                  {driver.phone}
                </Text>
              </View>

              {/* Tap Indicator */}
              <MaterialIcons name="chevron-right" size={20} color="#8A8A8E" className="ml-2" />
            </TouchableOpacity>
          ))}

          {filteredDrivers.length === 0 && (
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
        <View className="flex-row space-x-4">
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
            className="flex-1 active:opacity-80"
          >
            <LinearGradient
              colors={['#409CFF', '#0A84FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
            >
              <Text className="text-base font-semibold text-white">Create Booking</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Driver Details Modal */}
      <Modal
        visible={showDriverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDriverModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-bg-primary rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {modalDriver?.status === 'available' ? (
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
                      <Text className="text-3xl">{modalDriver.avatar}</Text>
                    </View>
                    <Text className="text-xl font-bold text-text-primary">
                      {modalDriver.name}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {modalDriver.phone}
                    </Text>
                  </View>
                </View>

                {/* Available Content */}
                <View className="px-6 py-8 items-center">
                  <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                    <MaterialIcons name="check-circle" size={32} color="#10B981" />
                  </View>
                  <Text className="text-lg font-semibold text-text-primary text-center mb-2">
                    Driver Available
                  </Text>
                  <Text className="text-text-secondary text-center">
                    This driver is currently available and has no active booking.
                  </Text>
                </View>
              </View>
            ) : (
              modalDriver?.currentJob && (
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
                        <Text className="text-xl">{modalDriver.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-text-primary">
                          {modalDriver.name}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          {modalDriver.phone}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Route Section */}
                  <View className="px-6 py-4 border-b border-gray-200">
                    <View className="flex-row items-center justify-between">
                      <View className="items-center">
                        <Text className="text-2xl font-bold text-text-primary">
                          {modalDriver.currentJob.origin}
                        </Text>
                        <Text className="text-xs text-text-secondary mt-1">
                          {formatDate(modalDriver.currentJob.date)}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {formatTime(modalDriver.currentJob.time)}
                        </Text>
                      </View>
                      
                      <View className="flex-1 items-center mx-4">
                        <MaterialIcons name="local-shipping" size={28} color="#409CFF" />
                        <View className="flex-row items-center mt-1">
                          <View className="w-8 h-0.5 bg-gray-300" />
                          <MaterialIcons name="arrow-forward" size={16} color="#8A8A8E" />
                          <View className="w-8 h-0.5 bg-gray-300" />
                        </View>
                      </View>
                      
                      <View className="items-center">
                        <Text className="text-2xl font-bold text-text-primary">
                          {modalDriver.currentJob.destination}
                        </Text>
                        <Text className="text-xs text-text-secondary mt-1">
                          {formatDate(modalDriver.currentJob.date)}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {formatTime(modalDriver.currentJob.time)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Details Grid */}
                  <View className="px-6 py-4">
                    <View className="space-y-4">
                      {/* Row 1 */}
                      <View className="flex-row">
                        <View className="flex-1 mr-2">
                          <Text className="text-xs text-text-secondary mb-1">Total Volume (CBM)</Text>
                          <Text className="text-lg font-bold text-text-primary">
                            {modalDriver.currentJob.totalVolume.replace(' CBM', '')}
                          </Text>
                        </View>
                        <View className="flex-1 ml-2">
                          <Text className="text-xs text-text-secondary mb-1">Total Gross Weight (KG)</Text>
                          <Text className="text-lg font-bold text-text-primary">
                            {modalDriver.currentJob.totalGrossWeight.replace(' KG', '')}
                          </Text>
                        </View>
                      </View>

                      {/* Row 2 */}
                      <View className="flex-row">
                        <View className="flex-1 mr-2">
                          <Text className="text-xs text-text-secondary mb-1">Shipment Type</Text>
                          <Text className="text-lg font-bold text-text-primary">
                            {modalDriver.currentJob.shipmentType}
                          </Text>
                        </View>
                        <View className="flex-1 ml-2">
                          <Text className="text-xs text-text-secondary mb-1">Container Size (ft)</Text>
                          <Text className="text-lg font-bold text-text-primary">
                            {modalDriver.currentJob.containerSize.replace('ft', '')}
                          </Text>
                        </View>
                      </View>

                      {/* Row 3 */}
                      <View className="flex-row">
                        <View className="flex-1">
                          <Text className="text-xs text-text-secondary mb-1">Twinning</Text>
                          <Text className="text-lg font-bold text-text-primary">
                            {modalDriver.currentJob.twinning}
                          </Text>
                        </View>
                        <View className="flex-1" />
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
              <View className="space-y-3">
                {/* View Invoice Button */}
                <TouchableOpacity
                  onPress={handleViewInvoice}
                  className="active:opacity-80"
                >
                  <LinearGradient
                    colors={['#409CFF', '#0A84FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
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
                  className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
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
    </SafeAreaView>
  );
}
