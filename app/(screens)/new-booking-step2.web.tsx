import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ComplianceCharge, getComplianceCharges } from '../../services/complianceService';
import { DemurrageCharge, getDemurrageCharges } from '../../services/demurrageService';
import {
  getHaulageCompanies,
  getHaulageTariffs,
  HaulageCompany,
  HaulageTariff,
} from '../../services/haulageCompanyService';

export default function NewBookingStep2WebScreen() {
  // Mock data from Step 1 (in real implementation, this would come from navigation params or state management)
  const bookingData = {
    bookingName: 'Current Booking',
    bookingId: 'BK-2025-001234',
  };

  const [formData, setFormData] = useState({
    shipmentType: '',
    containerSize: '',
    items: ['Electronics', 'Computer Parts'],
    totalGrossWeight: '',
    totalVolume: '',
    demurrageLocation: '',
    daysExpected: '',
    selectedCompliance: [] as string[],
    haulageCompany: '',
    pickupArea: '',
    deliveryArea: '',
    selectedHaulageRate: null as HaulageTariff | null,
  });

  const [showShipmentTypePicker, setShowShipmentTypePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [showDemurrageLocationPicker, setShowDemurrageLocationPicker] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [showHaulageCompanyPicker, setShowHaulageCompanyPicker] = useState(false);
  const [showPickupAreaPicker, setShowPickupAreaPicker] = useState(false);
  const [showDeliveryAreaPicker, setShowDeliveryAreaPicker] = useState(false);
  
  // State for demurrage data from Supabase
  const [demurrageLocations, setDemurrageLocations] = useState<DemurrageCharge[]>([]);
  const [demurrageLoading, setDemurrageLoading] = useState(true);

  // State for compliance charges from Supabase
  const [complianceCharges, setComplianceCharges] = useState<ComplianceCharge[]>([]);
  const [complianceLoading, setComplianceLoading] = useState(true);

  // State for haulage data from Supabase
  const [haulageCompanies, setHaulageCompanies] = useState<HaulageCompany[]>([]);
  const [haulageTariffs, setHaulageTariffs] = useState<HaulageTariff[]>([]);
  const [haulageLoading, setHaulageLoading] = useState(true);

  // Updated shipment types to only FCL and LCL
  const shipmentTypes = ['FCL', 'LCL'];
  const containerSizes = ['20ft', '40ft', '40ft HC'];

  // Fetch both demurrage locations and compliance charges from Supabase
  useEffect(() => {
    fetchDemurrageLocations();
    fetchComplianceCharges();
    fetchHaulageData();
  }, []);

  const fetchDemurrageLocations = async () => {
    try {
      setDemurrageLoading(true);
      const data = await getDemurrageCharges();
      setDemurrageLocations(data);
    } catch (error) {
      console.error('Error fetching demurrage locations:', error);
      Alert.alert('Error', 'Failed to load demurrage locations. Please try again.');
    } finally {
      setDemurrageLoading(false);
    }
  };

  const fetchComplianceCharges = async () => {
    try {
      setComplianceLoading(true);
      const data = await getComplianceCharges();
      setComplianceCharges(data);
    } catch (error) {
      console.error('Error fetching compliance charges:', error);
      Alert.alert('Error', 'Failed to load compliance charges. Please try again.');
    } finally {
      setComplianceLoading(false);
    }
  };

  const fetchHaulageData = async () => {
    try {
      setHaulageLoading(true);
      const [companies, tariffs] = await Promise.all([
        getHaulageCompanies(),
        getHaulageTariffs()
      ]);
      setHaulageCompanies(companies);
      setHaulageTariffs(tariffs);
    } catch (error) {
      console.error('Error fetching haulage data:', error);
      Alert.alert('Error', 'Failed to load haulage data. Please try again.');
    } finally {
      setHaulageLoading(false);
    }
  };

  const handleShipmentTypeSelect = (type: string) => {
    setFormData({ ...formData, shipmentType: type });
    setShowShipmentTypePicker(false);
  };

  const handleContainerSizeSelect = (size: string) => {
    setFormData({ ...formData, containerSize: size });
    setShowContainerSizePicker(false);
  };

  const handleDemurrageLocationSelect = (location: string) => {
    setFormData({ ...formData, demurrageLocation: location });
    setShowDemurrageLocationPicker(false);
  };

  const handleComplianceToggle = (complianceId: string) => {
    const isSelected = formData.selectedCompliance.includes(complianceId);
    if (isSelected) {
      // Remove from selection
      setFormData({
        ...formData,
        selectedCompliance: formData.selectedCompliance.filter(id => id !== complianceId)
      });
    } else {
      // Add to selection
      setFormData({
        ...formData,
        selectedCompliance: [...formData.selectedCompliance, complianceId]
      });
    }
  };

  const handleHaulageCompanySelect = (companyId: string) => {
    setFormData({ ...formData, haulageCompany: companyId });
    setShowHaulageCompanyPicker(false);
  };

  const handlePickupAreaSelect = (areaName: string) => {
    const selectedTariff = haulageTariffs.find(t => t.area_name === areaName);
    setFormData({ 
      ...formData, 
      pickupArea: areaName,
      selectedHaulageRate: selectedTariff || null
    });
    setShowPickupAreaPicker(false);
  };

  const handleDeliveryAreaSelect = (areaName: string) => {
    setFormData({ ...formData, deliveryArea: areaName });
    setShowDeliveryAreaPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(null);
  };

  const handleEditItem = (index: number, newValue: string) => {
    const newItems = [...formData.items];
    newItems[index] = newValue;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddNewItem = () => {
    const newItems = [...formData.items, ''];
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(newItems.length - 1);
  };

  const handleItemBlur = () => {
    setEditingItemIndex(null);
    // Remove empty items when user finishes editing
    const filteredItems = formData.items.filter(item => item.trim() !== '');
    setFormData({ ...formData, items: filteredItems });
  };

  const calculateEstimatedTotal = () => {
    // Enhanced calculation based on shipment type and measurements
    let baseRate = 0;
    
    // Base rate depends on shipment type
    if (formData.shipmentType === 'FCL') {
      baseRate = 2500; // FCL (Less than Full Container Load) base rate
    } else if (formData.shipmentType === 'LCL') {
      baseRate = 4500; // LCL (Container Load Cargo) base rate
    }
    
    // Weight-based calculation (RM per KG)
    const weight = parseFloat(formData.totalGrossWeight) || 0;
    const weightCost = weight * 3.5;
    
    // Volume-based calculation (RM per CBM)
    const volume = parseFloat(formData.totalVolume) || 0;
    const volumeCost = volume * 85;
    
    // Item handling fee
    const itemCount = formData.items.filter(item => item.trim() !== '').length;
    const itemHandlingFee = itemCount * 150;
    
    // Container size multiplier
    let containerMultiplier = 1;
    if (formData.containerSize === '40ft') {
      containerMultiplier = 1.5;
    } else if (formData.containerSize === '40ft HC') {
      containerMultiplier = 1.8;
    }
    
    // Demurrage calculation using real Supabase data
    let demurrageCost = 0;
    if (formData.demurrageLocation && formData.daysExpected) {
      const selectedLocation = demurrageLocations.find(loc => loc.location === formData.demurrageLocation);
      const days = parseFloat(formData.daysExpected) || 0;
      if (selectedLocation && selectedLocation.daily_rate && days > 0) {
        demurrageCost = selectedLocation.daily_rate * days;
      }
    }
    
    // Compliance charges calculation using real Supabase data
    let complianceCost = 0;
    if (formData.selectedCompliance.length > 0) {
      complianceCost = formData.selectedCompliance.reduce((total, complianceId) => {
        const compliance = complianceCharges.find(c => c.id === complianceId);
        return total + (compliance?.price || 0);
      }, 0);
    }
    
    // Haulage calculation using real Supabase data
    let haulageCost = 0;
    if (formData.selectedHaulageRate) {
      haulageCost = formData.selectedHaulageRate.grand_total || 0;
    }
    
    const subtotal = (baseRate + weightCost + volumeCost + itemHandlingFee) * containerMultiplier + demurrageCost + complianceCost + haulageCost;
    
    // Add service tax (6%)
    const serviceTax = subtotal * 0.06;
    
    return Math.round(subtotal + serviceTax);
  };

  const getDemurrageRate = () => {
    if (formData.demurrageLocation) {
      const selectedLocation = demurrageLocations.find(loc => loc.location === formData.demurrageLocation);
      return selectedLocation?.daily_rate || 0;
    }
    return 0;
  };

  const handleContinue = () => {
    // Optional validation - allow empty fields for now
    // User can continue with incomplete data
    
    // Navigate to step 3
    router.push('/new-booking-step3');
  };

  const handleBack = () => {
    router.back();
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
              New Booking
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Fill in the information below for requests
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="max-w-4xl mx-auto w-full">
          <View className="flex-row items-center justify-between">
            {/* Step 1 - Completed */}
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                <MaterialIcons name="check" size={16} color="white" />
              </View>
              <View className="flex-1 h-1 bg-green-500 ml-2" />
            </View>
            
            {/* Step 2 - Active */}
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-2">
                <Text className="text-white text-sm font-bold">2</Text>
              </View>
              <View className="flex-1 h-1 bg-gray-300 ml-2" />
            </View>
            
            {/* Step 3 - Inactive */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
                <Text className="text-gray-600 text-sm font-bold">3</Text>
              </View>
            </View>
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
            {/* Form Card */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Form Content */}
              <View className="px-6 py-6 space-y-6">
                {/* Booking Summary */}
                <View className="mb-6">
                  <Text className="text-xl font-bold text-text-primary mb-2">
                    {bookingData.bookingName}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {bookingData.bookingId}
                  </Text>
                </View>

                {/* 3D Object Placeholder */}
                <TouchableOpacity 
                  className="mb-6"
onPress={() => router.push('/threejs-viewer')}
                  activeOpacity={0.8}
                >
                  <View className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                    <MaterialIcons name="view-in-ar" size={64} color="#8A8A8E" />
                    <Text className="text-blue-600 mt-4 text-lg font-semibold">
                      3D Container Packer
                    </Text>
                    <Text className="text-blue-500 mt-1 text-sm">
                      Click to visualize and arrange your cargo
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Shipment Details */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Shipment Details
                  </Text>
                  
                  <View className="flex-row space-x-4">
                    {/* Shipment Type */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Shipment Type
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowShipmentTypePicker(!showShipmentTypePicker);
                          setShowContainerSizePicker(false); // Close other picker
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.shipmentType ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {formData.shipmentType || 'Select type'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>

                    {/* Container Size */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Container Size(ft)
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowContainerSizePicker(!showContainerSizePicker);
                          setShowShipmentTypePicker(false); // Close other picker
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.containerSize ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {formData.containerSize || 'Select size'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Shipment Type Picker - Pushes content below */}
                  {showShipmentTypePicker && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Shipment Type
                      </Text>
                      {shipmentTypes.map((type, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleShipmentTypeSelect(type)}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Container Size Picker - Pushes content below */}
                  {showContainerSizePicker && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Container Size
                      </Text>
                      {containerSizes.map((size, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleContainerSizeSelect(size)}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Items List */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Items List
                  </Text>
                  
                  {/* Items */}
                  {formData.items.map((item, index) => (
                    <View key={index} className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2">
                      {editingItemIndex === index ? (
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          value={item}
                          onChangeText={(text) => handleEditItem(index, text)}
                          onBlur={handleItemBlur}
                          placeholder="Enter item name"
                          placeholderTextColor="#8A8A8E"
                          autoFocus
                          returnKeyType="done"
                          onSubmitEditing={handleItemBlur}
                        />
                      ) : (
                        <TouchableOpacity
                          className="flex-1"
                          onPress={() => setEditingItemIndex(index)}
                        >
                          <Text className="text-base text-text-primary">
                            {item || 'Tap to edit'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(index)}
                        className="ml-3 p-1 active:opacity-80"
                      >
                        <MaterialIcons name="close" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {/* Add New Button */}
                  <TouchableOpacity
                    onPress={handleAddNewItem}
                    className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex-row items-center justify-center active:opacity-80"
                  >
                    <MaterialIcons name="add" size={20} color="#0A84FF" style={{ marginRight: 8 }} />
                    <Text className="text-base font-medium text-primary">Add New</Text>
                  </TouchableOpacity>
                </View>

                {/* Measurements */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Measurements
                  </Text>
                  
                  <View className="flex-row space-x-4">
                    {/* Total Gross Weight */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Total Gross Weight(KG)
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          value={formData.totalGrossWeight}
                          onChangeText={(text: string) => setFormData({ ...formData, totalGrossWeight: text })}
                          placeholder="0.00"
                          placeholderTextColor="#8A8A8E"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Total Volume */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Total Volume(CBM)
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          value={formData.totalVolume}
                          onChangeText={(text: string) => setFormData({ ...formData, totalVolume: text })}
                          placeholder="0.00"
                          placeholderTextColor="#8A8A8E"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Demurrage */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Demurrage
                  </Text>
                  
                  <View className="flex-row space-x-4">
                    {/* Demurrage Location */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Location
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (!demurrageLoading && demurrageLocations.length > 0) {
                            setShowDemurrageLocationPicker(!showDemurrageLocationPicker);
                            setShowShipmentTypePicker(false);
                            setShowContainerSizePicker(false);
                          }
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.demurrageLocation ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {demurrageLoading 
                            ? 'Loading locations...' 
                            : demurrageLocations.length === 0
                            ? 'No locations available'
                            : formData.demurrageLocation || 'Select location'
                          }
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>

                    {/* Days Expected */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Days Expected
                      </Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          value={formData.daysExpected}
                          onChangeText={(text: string) => setFormData({ ...formData, daysExpected: text })}
                          placeholder="0"
                          placeholderTextColor="#8A8A8E"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                  
                  {/* Demurrage Location Picker - Uses real Supabase data */}
                  {showDemurrageLocationPicker && demurrageLocations.length > 0 && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Demurrage Location
                      </Text>
                      {demurrageLocations.map((item, index) => (
                        <TouchableOpacity
                          key={item.demurrage_id || index}
                          onPress={() => handleDemurrageLocationSelect(item.location || '')}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <View className="flex-row justify-between items-center">
                            <Text className="text-text-primary">{item.location}</Text>
                            <Text className="text-text-secondary text-sm">
                              RM {item.daily_rate?.toFixed(2) || '0.00'}/day
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Haulage Information */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Haulage Information
                  </Text>
                  
                  <View className="flex-row space-x-4 mb-4">
                    {/* Pickup Area */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Pickup Area
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (!haulageLoading && haulageTariffs.length > 0) {
                            setShowPickupAreaPicker(!showPickupAreaPicker);
                            setShowDeliveryAreaPicker(false);
                            setShowHaulageCompanyPicker(false);
                            setShowShipmentTypePicker(false);
                            setShowContainerSizePicker(false);
                          }
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.pickupArea ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {haulageLoading 
                            ? 'Loading areas...' 
                            : haulageTariffs.length === 0
                            ? 'No areas available'
                            : formData.pickupArea || 'Select pickup area'
                          }
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>

                    {/* Delivery Area */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">
                        Delivery Area
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (!haulageLoading && haulageTariffs.length > 0) {
                            setShowDeliveryAreaPicker(!showDeliveryAreaPicker);
                            setShowPickupAreaPicker(false);
                            setShowHaulageCompanyPicker(false);
                            setShowShipmentTypePicker(false);
                            setShowContainerSizePicker(false);
                          }
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.deliveryArea ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {haulageLoading 
                            ? 'Loading areas...' 
                            : haulageTariffs.length === 0
                            ? 'No areas available'
                            : formData.deliveryArea || 'Select delivery area'
                          }
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Pickup Area Picker - Uses real Supabase data */}
                  {showPickupAreaPicker && haulageTariffs.length > 0 && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Pickup Area
                      </Text>
                      {haulageTariffs.map((tariff, index) => (
                        <TouchableOpacity
                          key={tariff.tariff_id || index}
                          onPress={() => handlePickupAreaSelect(tariff.area_name || '')}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <Text className="text-text-primary">{tariff.area_name}</Text>
                              <Text className="text-text-secondary text-sm">{tariff.state}</Text>
                            </View>
                            <Text className="text-text-secondary text-sm">
                              RM {tariff.grand_total?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Delivery Area Picker - Uses real Supabase data */}
                  {showDeliveryAreaPicker && haulageTariffs.length > 0 && (
                    <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Delivery Area
                      </Text>
                      {haulageTariffs.map((tariff, index) => (
                        <TouchableOpacity
                          key={tariff.tariff_id || index}
                          onPress={() => handleDeliveryAreaSelect(tariff.area_name || '')}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <Text className="text-text-primary">{tariff.area_name}</Text>
                              <Text className="text-text-secondary text-sm">{tariff.state}</Text>
                            </View>
                            <Text className="text-text-secondary text-sm">
                              RM {tariff.grand_total?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Preferred Haulage Company */}
                  <View className="mt-6">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Preferred Haulage Company (Optional)
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!haulageLoading && haulageCompanies.length > 0) {
                          setShowHaulageCompanyPicker(!showHaulageCompanyPicker);
                          setShowPickupAreaPicker(false);
                          setShowDeliveryAreaPicker(false);
                          setShowShipmentTypePicker(false);
                          setShowContainerSizePicker(false);
                        }
                      }}
                      className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                    >
                      <Text className={`flex-1 text-base ${formData.haulageCompany ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {haulageLoading 
                          ? 'Loading companies...' 
                          : haulageCompanies.length === 0
                          ? 'No companies available'
                          : formData.haulageCompany 
                            ? haulageCompanies.find(c => c.company_id === formData.haulageCompany)?.company_name 
                            : 'Select haulage company'
                        }
                      </Text>
                      <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                    </TouchableOpacity>
                    
                    {/* Haulage Company Picker - Uses real Supabase data */}
                    {showHaulageCompanyPicker && haulageCompanies.length > 0 && (
                      <View className="mt-4 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                        <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                          Select Haulage Company
                        </Text>
                        {haulageCompanies.map((company, index) => (
                          <TouchableOpacity
                            key={company.company_id || index}
                            onPress={() => handleHaulageCompanySelect(company.company_id || '')}
                            className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                          >
                            <View className="flex-row justify-between items-center">
                              <View className="flex-1">
                                <Text className="text-text-primary">{company.company_name}</Text>
                                <Text className="text-text-secondary text-sm">
                                  Rank #{company.annual_rank} • {company.market_share_percentage}% market share
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Other Charges - Now using dynamic compliance charges from Supabase */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Other Charges
                  </Text>
                  
                  {complianceLoading ? (
                    <View className="bg-bg-secondary border border-gray-300 rounded-lg px-4 py-6">
                      <Text className="text-text-secondary text-center">Loading compliance charges...</Text>
                    </View>
                  ) : complianceCharges.length === 0 ? (
                    <View className="bg-bg-secondary border border-gray-300 rounded-lg px-4 py-6">
                      <Text className="text-text-secondary text-center">No compliance charges available</Text>
                    </View>
                  ) : (
                    complianceCharges
                      .filter(compliance => typeof compliance.id === 'string')
                      .map((compliance) => (
                        <TouchableOpacity
                          key={compliance.id!}
                          onPress={() => handleComplianceToggle(compliance.id!)}
                          className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2 active:opacity-80"
                        >
                          <View className="flex-row items-center flex-1">
                            <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                              formData.selectedCompliance.includes(compliance.id!) 
                                ? 'bg-primary border-primary' 
                                : 'border-gray-400'
                            }`}>
                              {formData.selectedCompliance.includes(compliance.id!) && (
                                <MaterialIcons name="check" size={14} color="white" />
                              )}
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-medium text-text-primary">
                                {compliance.name_compliance}
                              </Text>
                              <Text className="text-sm text-text-secondary">
                                RM {compliance.price.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                  )}
                </View>

                {/* Estimated Total */}
                <View className="bg-bg-secondary border border-gray-300 rounded-lg p-6 mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Cost Breakdown
                  </Text>
                  
                  {/* Breakdown Details */}
                  <View className="space-y-2 mb-4">
                    {formData.shipmentType && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Base Rate ({formData.shipmentType})
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {formData.shipmentType === 'FCL' ? '2,500' : formData.shipmentType === 'LCL' ? '4,500' : '0'}
                        </Text>
                      </View>
                    )}
                    
                    {parseFloat(formData.totalGrossWeight) > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Weight ({formData.totalGrossWeight} KG × RM 3.50)
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {(parseFloat(formData.totalGrossWeight) * 3.5).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {parseFloat(formData.totalVolume) > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Volume ({formData.totalVolume} CBM × RM 85)
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {(parseFloat(formData.totalVolume) * 85).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {formData.items.filter(item => item.trim() !== '').length > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Item Handling ({formData.items.filter(item => item.trim() !== '').length} items × RM 150)
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {(formData.items.filter(item => item.trim() !== '').length * 150).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {formData.containerSize && formData.containerSize !== '20ft' && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Container Size Adjustment ({formData.containerSize})
                        </Text>
                        <Text className="text-sm text-text-primary">
                          {formData.containerSize === '40ft' ? '+50%' : formData.containerSize === '40ft HC' ? '+80%' : '+50%'}
                        </Text>
                      </View>
                    )}
                    
                    {formData.demurrageLocation && formData.daysExpected && parseFloat(formData.daysExpected) > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Demurrage ({formData.demurrageLocation}, {formData.daysExpected} days × RM {getDemurrageRate().toFixed(2)})
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {(getDemurrageRate() * parseFloat(formData.daysExpected)).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {formData.selectedHaulageRate && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-text-secondary">
                          Haulage ({formData.pickupArea})
                        </Text>
                        <Text className="text-sm text-text-primary">
                          RM {formData.selectedHaulageRate.grand_total?.toFixed(2) || '0.00'}
                        </Text>
                      </View>
                    )}
                    
                    {formData.selectedCompliance.length > 0 && formData.selectedCompliance.map((complianceId) => {
                      const compliance = complianceCharges.find(c => c.id === complianceId);
                      return compliance ? (
                        <View key={complianceId} className="flex-row justify-between">
                          <Text className="text-sm text-text-secondary">
                            {compliance.name_compliance}
                          </Text>
                          <Text className="text-sm text-text-primary">
                            RM {compliance.price.toFixed(2)}
                          </Text>
                        </View>
                      ) : null;
                    })}
                    
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-text-secondary">
                        Service Tax (6%)
                      </Text>
                      <Text className="text-sm text-text-primary">
                        Included
                      </Text>
                    </View>
                  </View>
                  
                  {/* Total */}
                  <View className="border-t border-gray-300 pt-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-bold text-text-primary">
                        Estimated Total
                      </Text>
                      <Text className="text-2xl font-bold text-primary">
                        RM {calculateEstimatedTotal().toLocaleString()}
                      </Text>
                    </View>
                    <Text className="text-xs text-text-secondary mt-1">
                      *Final cost may vary based on actual measurements and additional services
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sticky Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4 gap-4">
                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-gray-600">Back</Text>
                  </TouchableOpacity>
                  
                  {/* Continue Button */}
                  <TouchableOpacity
                    onPress={handleContinue}
                    className="flex-1 bg-blue-500 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-white">Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}