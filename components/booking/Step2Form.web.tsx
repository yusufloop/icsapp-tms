// components/booking/Step2Form.web.tsx

import { ComplianceCharge, getComplianceCharges } from "@/services/complianceService";
import { DemurrageCharge, getDemurrageCharges } from "@/services/demurrageService";
import { getHaulageCompanies, HaulageCompany } from "@/services/haulageCompanyService";
import { getHaulageTariffs, HaulageTariff } from "@/services/haulageTariffService";
import { BookingData } from "@/types/booking";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Step2FormProps {
  data: BookingData;
  onDataChange: (field: keyof BookingData, value: any) => void;
}

export default function Step2Form({ data, onDataChange }: Step2FormProps) {
  const [showShipmentTypePicker, setShowShipmentTypePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [showDemurrageLocationPicker, setShowDemurrageLocationPicker] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [showHaulageCompanyPicker, setShowHaulageCompanyPicker] = useState(false);
  const [showPickupAreaPicker, setShowPickupAreaPicker] = useState(false);
  const [showDeliveryAreaPicker, setShowDeliveryAreaPicker] = useState(false);

  const [demurrageLocations, setDemurrageLocations] = useState<DemurrageCharge[]>([]);
  const [complianceCharges, setComplianceCharges] = useState<ComplianceCharge[]>([]);
  const [haulageCompanies, setHaulageCompanies] = useState<HaulageCompany[]>([]);
  const [haulageTariffs, setHaulageTariffs] = useState<HaulageTariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const shipmentTypes = ['FCL', 'LCL'];
  const containerSizes = ['20ft', '40ft', '40ft HC'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [demurrageData, complianceData, companies, tariffs] = await Promise.all([
          getDemurrageCharges(),
          getComplianceCharges(),
          getHaulageCompanies(),
          getHaulageTariffs()
        ]);
        setDemurrageLocations(demurrageData);
        setComplianceCharges(complianceData);
        setHaulageCompanies(companies);
        setHaulageTariffs(tariffs);
      } catch (error) {
        console.error('Error fetching step 2 data:', error);
        Alert.alert('Error', 'Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleComplianceToggle = (complianceId: string) => {
    const isSelected = data.selectedCompliance.includes(complianceId);
    const newSelection = isSelected
      ? data.selectedCompliance.filter(id => id !== complianceId)
      : [...data.selectedCompliance, complianceId];
    onDataChange('selectedCompliance', newSelection);
  };

  const handlePickupAreaSelect = (areaName: string) => {
    const selectedTariff = haulageTariffs.find(t => t.area_name === areaName);
    onDataChange('pickupArea', areaName);
    onDataChange('selectedHaulageRate', selectedTariff || null);
    setShowPickupAreaPicker(false);
  };
  
  const handleDeliveryAreaSelect = (areaName: string) => {
    onDataChange('deliveryArea', areaName);
    setShowDeliveryAreaPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onDataChange('items', newItems);
  };

  const handleEditItem = (index: number, newValue: string) => {
    const newItems = [...data.items];
    newItems[index] = newValue;
    onDataChange('items', newItems);
  };

  const handleAddNewItem = () => {
    const newItems = [...data.items, ''];
    onDataChange('items', newItems);
    setEditingItemIndex(newItems.length - 1);
  };

  const handleItemBlur = () => {
    setEditingItemIndex(null);
    const filteredItems = data.items.filter(item => item.trim() !== '');
    onDataChange('items', filteredItems);
  };

  const calculateEstimatedTotal = () => {
    let baseRate = 0;
    if (data.shipmentType === 'FCL') baseRate = 2500;
    else if (data.shipmentType === 'LCL') baseRate = 4500;
    const weightCost = (parseFloat(data.totalGrossWeight) || 0) * 3.5;
    const volumeCost = (parseFloat(data.totalVolume) || 0) * 85;
    const itemHandlingFee = data.items.filter(item => item.trim() !== '').length * 150;
    let containerMultiplier = 1;
    if (data.containerSize === '40ft') containerMultiplier = 1.5;
    else if (data.containerSize === '40ft HC') containerMultiplier = 1.8;
    const selectedLocation = demurrageLocations.find(loc => loc.location === data.demurrageLocation);
    const demurrageCost = (selectedLocation?.daily_rate || 0) * (parseFloat(data.daysExpected) || 0);
    const complianceCost = data.selectedCompliance.reduce((total, complianceId) => {
      const compliance = complianceCharges.find(c => c.id === complianceId);
      return total + (compliance?.price || 0);
    }, 0);
    const haulageCost = data.selectedHaulageRate?.grand_total || 0;
    const subtotal = (baseRate + weightCost + volumeCost + itemHandlingFee) * containerMultiplier + demurrageCost + complianceCost + haulageCost;
    const serviceTax = subtotal * 0.06;
    return Math.round(subtotal + serviceTax);
  };

  const getDemurrageRate = () => {
    const selectedLocation = demurrageLocations.find(loc => loc.location === data.demurrageLocation);
    return selectedLocation?.daily_rate || 0;
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-10 bg-white rounded-lg shadow-sm border border-gray-200">
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text className="mt-4 text-text-secondary">Loading Shipment Data...</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200">
      <View className="px-6 py-6 space-y-8">
        <Text className="text-xl font-bold text-text-primary mb-2">{data.bookingName}</Text>
        
        <TouchableOpacity onPress={() => router.push('/container-packer')} className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 items-center justify-center hover:border-blue-400 transition-colors">
          <MaterialIcons name="view-in-ar" size={48} color="#8A8A8E" />
          <Text className="text-blue-600 mt-4 text-lg font-semibold">3D Container Packer</Text>
          <Text className="text-blue-500 mt-1 text-sm">Click to visualize and arrange your cargo</Text>
        </TouchableOpacity>

        {/* Shipment Details */}
        <View className="relative">
          <Text className="text-lg font-bold text-text-primary mb-4">Shipment Details</Text>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <View className="relative z-20">
              <Text className="text-sm font-semibold text-text-primary mb-2">Shipment Type</Text>
              <TouchableOpacity onPress={() => setShowShipmentTypePicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                <Text className={`text-base ${data.shipmentType ? 'text-text-primary' : 'text-gray-500'}`}>{data.shipmentType || "Select type"}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
              </TouchableOpacity>
              {showShipmentTypePicker && (
                <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {shipmentTypes.map(type => (<TouchableOpacity key={type} onPress={() => { onDataChange('shipmentType', type); setShowShipmentTypePicker(false); }} className="px-4 py-3 hover:bg-gray-100"><Text className="text-text-primary">{type}</Text></TouchableOpacity>))}
                </View>
              )}
            </View>
            <View className="relative z-20">
              <Text className="text-sm font-semibold text-text-primary mb-2">Container Size (ft)</Text>
              <TouchableOpacity onPress={() => setShowContainerSizePicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                <Text className={`text-base ${data.containerSize ? 'text-text-primary' : 'text-gray-500'}`}>{data.containerSize || "Select size"}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
              </TouchableOpacity>
              {showContainerSizePicker && (
                <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {containerSizes.map(size => (<TouchableOpacity key={size} onPress={() => { onDataChange('containerSize', size); setShowContainerSizePicker(false); }} className="px-4 py-3 hover:bg-gray-100"><Text className="text-text-primary">{size}</Text></TouchableOpacity>))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items List */}
        <View>
          <Text className="text-lg font-bold text-text-primary mb-4">Items List</Text>
          <View className="space-y-2">
            {data.items.map((item, index) => (
              <View key={index} className="flex-row items-center bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3">
                {editingItemIndex === index ? (
                  <TextInput value={item} onChangeText={text => handleEditItem(index, text)} onBlur={handleItemBlur} placeholder="Enter item name" autoFocus returnKeyType="done" onSubmitEditing={handleItemBlur} className="flex-1 text-base text-text-primary"/>
                ) : (
                  <TouchableOpacity className="flex-1" onPress={() => setEditingItemIndex(index)}><Text className="text-base text-text-primary">{item || 'Tap to edit'}</Text></TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleRemoveItem(index)} className="ml-3 p-1"><MaterialIcons name="close" size={20} color="#8A8A8E" /></TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={handleAddNewItem} className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex-row items-center justify-center hover:bg-blue-100 transition-colors">
            <MaterialIcons name="add" size={20} color="#0A84FF" style={{ marginRight: 8 }} /><Text className="text-base font-medium text-primary">Add New</Text>
          </TouchableOpacity>
        </View>

        {/* Measurements */}
        <View>
          <Text className="text-lg font-bold text-text-primary mb-4">Measurements</Text>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">Total Gross Weight (KG)</Text>
              <TextInput value={data.totalGrossWeight} onChangeText={text => onDataChange('totalGrossWeight', text)} placeholder="0.00" keyboardType="numeric" className="w-full text-base text-text-primary bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3"/>
            </View>
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">Total Volume (CBM)</Text>
              <TextInput value={data.totalVolume} onChangeText={text => onDataChange('totalVolume', text)} placeholder="0.00" keyboardType="numeric" className="w-full text-base text-text-primary bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3"/>
            </View>
          </View>
        </View>
        
        {/* Demurrage */}
        <View className="relative">
          <Text className="text-lg font-bold text-text-primary mb-4">Demurrage</Text>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <View className="relative z-10">
              <Text className="text-sm font-semibold text-text-primary mb-2">Location</Text>
              <TouchableOpacity onPress={() => setShowDemurrageLocationPicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                <Text className={`text-base ${data.demurrageLocation ? 'text-text-primary' : 'text-gray-500'}`}>{data.demurrageLocation || "Select location"}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
              </TouchableOpacity>
              {showDemurrageLocationPicker && (
                <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {demurrageLocations.map(loc => (<TouchableOpacity key={loc.demurrage_id} onPress={() => { onDataChange('demurrageLocation', loc.location); setShowDemurrageLocationPicker(false);}} className="px-4 py-3 hover:bg-gray-100 flex-row justify-between"><Text className="text-text-primary">{loc.location}</Text><Text className="text-text-secondary">RM{loc.daily_rate?.toFixed(2)}</Text></TouchableOpacity>))}
                </View>
              )}
            </View>
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">Days Expected</Text>
              <TextInput value={data.daysExpected} onChangeText={text => onDataChange('daysExpected', text)} placeholder="0" keyboardType="numeric" className="w-full text-base text-text-primary bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3"/>
            </View>
          </View>
        </View>

        {/* Other Charges */}
        <View>
            <Text className="text-lg font-bold text-text-primary mb-4">Other Charges</Text>
            <View className="space-y-2">
                {complianceCharges.map(c => c.id && (
                    <TouchableOpacity key={c.id} onPress={() => handleComplianceToggle(c.id!)} className="flex-row items-center bg-bg-secondary border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                        <View className={`w-5 h-5 rounded border-2 mr-4 items-center justify-center ${data.selectedCompliance.includes(c.id) ? 'bg-primary border-primary' : 'border-gray-400'}`}>{data.selectedCompliance.includes(c.id) && <MaterialIcons name="check" size={14} color="white" />}</View>
                        <View className="flex-1"><Text className="font-medium text-text-primary">{c.name_compliance}</Text></View>
                        <Text className="text-text-secondary">RM {c.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Haulage Information */}
        <View className="relative">
            <Text className="text-lg font-bold text-text-primary mb-4">Haulage Information</Text>
            <View className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <View className="relative z-10">
                    <Text className="text-sm font-semibold text-text-primary mb-2">Pickup Area</Text>
                    <TouchableOpacity onPress={() => setShowPickupAreaPicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                        <Text className={`text-base ${data.pickupArea ? 'text-text-primary' : 'text-gray-500'}`}>{data.pickupArea || "Select area"}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
                    </TouchableOpacity>
                    {showPickupAreaPicker && (
                        <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {haulageTariffs.map(t => (<TouchableOpacity key={t.tariff_id} onPress={() => handlePickupAreaSelect(t.area_name)} className="px-4 py-3 hover:bg-gray-100"><Text className="text-text-primary">{t.area_name}</Text></TouchableOpacity>))}
                        </View>
                    )}
                </View>
                <View className="relative z-10">
                    <Text className="text-sm font-semibold text-text-primary mb-2">Delivery Area</Text>
                    <TouchableOpacity onPress={() => setShowDeliveryAreaPicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                        <Text className={`text-base ${data.deliveryArea ? 'text-text-primary' : 'text-gray-500'}`}>{data.deliveryArea || "Select area"}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
                    </TouchableOpacity>
                    {showDeliveryAreaPicker && (
                        <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {haulageTariffs.map(t => (<TouchableOpacity key={t.tariff_id} onPress={() => handleDeliveryAreaSelect(t.area_name)} className="px-4 py-3 hover:bg-gray-100"><Text className="text-text-primary">{t.area_name}</Text></TouchableOpacity>))}
                        </View>
                    )}
                </View>
            </View>
            <View className="relative">
                <Text className="text-sm font-semibold text-text-primary mb-2">Preferred Haulage Company (Optional)</Text>
                <TouchableOpacity onPress={() => setShowHaulageCompanyPicker(p => !p)} className="w-full bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center">
                    <Text className={`text-base ${data.haulageCompany ? 'text-text-primary' : 'text-gray-500'}`}>{haulageCompanies.find(c => c.company_id === data.haulageCompany)?.company_name || "Select company"}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E"/>
                </TouchableOpacity>
                {showHaulageCompanyPicker && (
                    <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {haulageCompanies.map(c => (<TouchableOpacity key={c.company_id} onPress={() => { onDataChange('haulageCompany', c.company_id); setShowHaulageCompanyPicker(false);}} className="px-4 py-3 hover:bg-gray-100"><Text className="text-text-primary">{c.company_name}</Text></TouchableOpacity>))}
                    </View>
                )}
            </View>
        </View>

        {/* Cost Breakdown */}
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <Text className="text-lg font-bold text-text-primary mb-4">Cost Breakdown</Text>
            <View className="space-y-2 mb-4">
              {/* Dynamically render cost items */}
            </View>
            <View className="border-t border-gray-300 pt-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-text-primary">Estimated Total</Text>
                    <Text className="text-2xl font-bold text-primary">RM {calculateEstimatedTotal().toLocaleString()}</Text>
                </View>
                <Text className="text-xs text-text-secondary mt-1">*Final cost may vary</Text>
            </View>
        </View>
      </View>
    </View>
  );
}