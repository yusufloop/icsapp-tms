import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DemurrageCharge, getDemurrageCharges } from '../../services/demurrageService';

export default function NewBookingStep2WebScreen() {
  // Mock data from Step 1 (in real implementation, this would come from navigation params or state management)
  const bookingData = {
    bookingName: 'Nvidia 1999 to KL',
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
  });

  const [showShipmentTypePicker, setShowShipmentTypePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [showDemurrageLocationPicker, setShowDemurrageLocationPicker] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  // State for demurrage data from Supabase
  const [demurrageLocations, setDemurrageLocations] = useState<DemurrageCharge[]>([]);
  const [demurrageLoading, setDemurrageLoading] = useState(true);

  // Updated shipment types to only LFC and CLC
  const shipmentTypes = ['LFC', 'CLC'];
  const containerSizes = ['20ft', '40ft', '40ft HC', '45ft'];
  
  // Mock compliance charges - in real implementation, this would come from the compliance management system
  const complianceCharges = [
    { id: '1',  name_compliance: 'Environmental Compliance', price: 250.00 },
    { id: '2',  name_compliance: 'Safety Inspection', price: 180.00 },
    { id: '3',  name_compliance: 'Documentation Fee', price: 120.00 },
  ];

  // Fetch demurrage locations from Supabase
  useEffect(() => {
    fetchDemurrageLocations();
  }, []);

  const fetchDemurrageLocations = async () => {
    try {
      setDemurrageLoading(true);
      const data = await getDemurrageCharges();
      setDemurrageLocations(data);
    } catch (error) {
      console.error('Error fetching demurrage locations:', error);
      // Show user-friendly error message
      Alert.alert('Error', 'Failed to load demurrage locations. Please try again.');
    } finally {
      setDemurrageLoading(false);
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
    if (formData.shipmentType === 'LFC') {
      baseRate = 2500; // LFC (Less than Full Container Load) base rate
    } else if (formData.shipmentType === 'CLC') {
      baseRate = 4500; // CLC (Container Load Cargo) base rate
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
    if (formData.containerSize === '40ft' || formData.containerSize === '40ft HC') {
      containerMultiplier = 1.5;
    } else if (formData.containerSize === '45ft') {
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
    
    // Compliance charges calculation
    let complianceCost = 0;
    if (formData.selectedCompliance.length > 0) {
      complianceCost = formData.selectedCompliance.reduce((total, complianceId) => {
        const compliance = complianceCharges.find(c => c.id === complianceId);
        return total + (compliance?.price || 0);
      }, 0);
    }
    
    const subtotal = (baseRate + weightCost + volumeCost + itemHandlingFee) * containerMultiplier + demurrageCost + complianceCost;
    
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
                <View className="mb-6">
                  <View className="h-48 bg-bg-secondary rounded-lg border border-gray-300 items-center justify-center">
                    <MaterialIcons name="view-in-ar" size={64} color="#8A8A8E" />
                    <Text className="text-text-secondary mt-2 text-sm">
                      3D Object Preview
                    </Text>
                  </View>
                </View>

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

                {/* Compliance */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Other Charges
                  </Text>
                  
                  {complianceCharges.map((compliance) => (
                    <TouchableOpacity
                      key={compliance.id}
                      onPress={() => handleComplianceToggle(compliance.id)}
                      className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2 active:opacity-80"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                          formData.selectedCompliance.includes(compliance.id) 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-400'
                        }`}>
                          {formData.selectedCompliance.includes(compliance.id) && (
                            <MaterialIcons name="check" size={14} color="white" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-medium text-text-primary">
                            {compliance. name_compliance}
                          </Text>
                          <Text className="text-sm text-text-secondary">
                            RM {compliance.price.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
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
                          RM {formData.shipmentType === 'LFC' ? '2,500' : formData.shipmentType === 'CLC' ? '4,500' : '0'}
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
                          {formData.containerSize === '40ft' || formData.containerSize === '40ft HC' ? '+50%' : '+80%'}
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
                    
                    {formData.selectedCompliance.length > 0 && formData.selectedCompliance.map((complianceId) => {
                      const compliance = complianceCharges.find(c => c.id === complianceId);
                      return compliance ? (
                        <View key={complianceId} className="flex-row justify-between">
                          <Text className="text-sm text-text-secondary">
                            {compliance. name_compliance}
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
                <View className="flex-row space-x-4">
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
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={['#409CFF', '#0A84FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
                    >
                      <Text className="text-base font-semibold text-white">Continue</Text>
                    </LinearGradient>
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