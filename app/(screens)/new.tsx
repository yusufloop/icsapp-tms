// app/(booking)/new.tsx

import Step1Form from '@/components/booking/Step1Form';
import Step2Form from '@/components/booking/Step2Form';
import Step3Form from '@/components/booking/Step3Form';
import { BookingData } from '@/types/booking';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewBookingProcessScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    // Step 1
    bookingName: '',
    client: '',
    consignee: '',
    date: new Date(),
    pickupState: '',
    pickupAddress: '',
    pickupTime: new Date(),
    deliveryState: '',
    deliveryAddress: '',
    deliveryTime: new Date(),
    // Step 2
    shipmentType: '',
    containerSize: '',
    items: ["Electronics", "Computer Parts"],
    totalGrossWeight: '',
    totalVolume: '',
    demurrageLocation: '',
    daysExpected: '',
    selectedCompliance: [],
    haulageCompany: '',
    pickupArea: '',
    deliveryArea: '',
    selectedHaulageRate: null,
    // Step 3
    specialInstructions: '',
    requiresInsurance: false,
    selectedDriverId: null,
  });

  const API_ENDPOINT = 'https://above-dinosaur-weekly.ngrok-free.app/webhook/auto1';
  const [isLoading, setIsLoading] = useState(false);

  const handleDataChange = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutofill = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
        const apiData = data[0].output;
        setBookingData(prev => ({
          ...prev,
          bookingName: apiData.bookingName || prev.bookingName,
          client: apiData.client || prev.client,
          consignee: apiData.consignee || prev.consignee,
          date: apiData.date ? new Date(apiData.date) : prev.date,
          pickupState: apiData.pickupState || prev.pickupState,
          pickupAddress: apiData.pickupAddress || prev.pickupAddress,
          pickupTime: apiData.pickupTime ? new Date(apiData.pickupTime) : prev.pickupTime,
          deliveryState: apiData.deliveryState || prev.deliveryState,
          deliveryAddress: apiData.deliveryAddress || prev.deliveryAddress,
          deliveryTime: apiData.deliveryTime ? new Date(apiData.deliveryTime) : prev.deliveryTime,
        }));
        Alert.alert('Success', 'Form has been autofilled with API data.');
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (error) {
      console.error('Autofill error:', error);
      Alert.alert('Error', `Failed to fetch autofill data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep1 = () => {
    const { bookingName, client, consignee, pickupState, pickupAddress, deliveryState, deliveryAddress } = bookingData;
    if (!bookingName.trim() || !client.trim() || !consignee.trim() || !pickupState.trim() || !pickupAddress.trim() || !deliveryState.trim() || !deliveryAddress.trim()) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields for Step 1.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };
  
  const handleFinalSubmit = () => {
    if (!bookingData.selectedDriverId) {
        Alert.alert('Driver Not Selected', 'Please select a driver to complete the booking.');
        return;
    }

    console.log("Final Booking Data:", bookingData);
    Alert.alert("Booking Submitted", `Your new booking has been created and assigned to driver ID: ${bookingData.selectedDriverId}.`, [
        { text: 'OK', onPress: () => router.push('/(app)/(tabs)/requests') } // Navigate to requests page on success
    ]);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Form data={bookingData} onDataChange={handleDataChange} />;
      case 2:
        return <Step2Form data={bookingData} onDataChange={handleDataChange} />;
      case 3:
        return <Step3Form data={bookingData} onDataChange={handleDataChange} />;
      default:
        return <Step1Form data={bookingData} onDataChange={handleDataChange} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-bg-secondary shadow-sm">
        <TouchableOpacity onPress={handlePreviousStep} className="mr-4 p-2 -ml-2 active:opacity-80">
          <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text-primary">New Booking</Text>
          <Text className="text-sm text-text-secondary mt-1">
            Step {currentStep} of 3 - {currentStep === 1 ? 'Booking Details' : currentStep === 2 ? 'Shipment Details' : 'Assign Driver'}
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="px-6 py-4 bg-bg-secondary">
        <View className="flex-row items-center justify-between">
          {[1, 2, 3].map((step, index, arr) => (
            <View key={step} className={`flex-row items-center ${index + 1 < arr.length ? 'flex-1' : ''}`}>
              <View className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step ? (step === 1 || step === 2 ? 'bg-green-500' : 'bg-primary') : 'bg-gray-300'}`}>
                {currentStep > step ? <MaterialIcons name="check" size={16} color="white" /> : <Text className={`${currentStep >= step ? 'text-white' : 'text-gray-600'} text-sm font-bold`}>{step}</Text>}
              </View>
              {index + 1 < arr.length && <View className={`flex-1 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'} ml-2`} />}
            </View>
          ))}
        </View>
      </View>
      
      {currentStep === 1 && (
        <View className="px-6 pt-4 pb-2 bg-bg-primary">
          <TouchableOpacity onPress={handleAutofill} disabled={isLoading} className={`${isLoading ? 'bg-gray-400' : 'bg-green-500'} rounded-lg py-3 items-center justify-center shadow ${!isLoading && 'active:opacity-80'}`}>
            <View className="flex-row items-center">
              {isLoading && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
              <Text className="text-white font-bold text-base">{isLoading ? 'Loading...' : 'Autofill Form (For Testing)'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 py-6 space-y-6">
          {renderStep()}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4 gap-4">
          <TouchableOpacity onPress={handlePreviousStep} className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80">
            <Text className="text-base font-semibold text-gray-600">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextStep} className="flex-1 bg-blue-500 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80">
            <Text className="text-base font-semibold text-white">{currentStep === 3 ? 'Create Booking' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}