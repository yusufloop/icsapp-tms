import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface DemurrageCharge {
  id: string;
  location: string;
  daily_rate: number;
  created_at: string;
}

export default function DemurrageWebScreen() {
  const [demurrageCharges, setDemurrageCharges] = useState<DemurrageCharge[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [location, setLocation] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDemurrageCharges();
  }, []);

  const fetchDemurrageCharges = async () => {
    try {
      // Mock data for now - replace with real Supabase call when backend is ready
      const mockData: DemurrageCharge[] = [
        { id: '1', location: 'Port Klang', daily_rate: 150.00, created_at: '2024-01-15' },
        { id: '2', location: 'Johor Port', daily_rate: 120.00, created_at: '2024-01-10' },
        { id: '3', location: 'Penang Port', daily_rate: 180.00, created_at: '2024-01-05' },
      ];
      setDemurrageCharges(mockData);
    } catch (error) {
      console.error('Error fetching demurrage charges:', error);
    }
  };

  const handleAddDemurrageCharge = async () => {
    if (!location.trim() || !dailyRate.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const rate = parseFloat(dailyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Error', 'Please enter a valid daily rate');
      return;
    }

    setLoading(true);
    try {
      // Mock implementation - replace with real Supabase call when backend is ready
      const newCharge: DemurrageCharge = {
        id: Date.now().toString(),
        location: location.trim(),
        daily_rate: rate,
        created_at: new Date().toISOString(),
      };

      setDemurrageCharges([newCharge, ...demurrageCharges]);
      setLocation('');
      setDailyRate('');
      setShowAddForm(false);
      Alert.alert('Success', 'Demurrage charge added successfully');
    } catch (error) {
      console.error('Error adding demurrage charge:', error);
      Alert.alert('Error', 'Failed to add demurrage charge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDemurrageCharge = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this demurrage charge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock implementation - replace with real Supabase call when backend is ready
              setDemurrageCharges(demurrageCharges.filter(charge => charge.id !== id));
              Alert.alert('Success', 'Demurrage charge deleted successfully');
            } catch (error) {
              console.error('Error deleting demurrage charge:', error);
              Alert.alert('Error', 'Failed to delete demurrage charge');
            }
          }
        }
      ]
    );
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
              Demurrage Management
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Manage demurrage charges for different locations
            </Text>
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
          <View className="max-w-4xl mx-auto w-full space-y-6">
            {/* Current Demurrage Charges Table */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-text-primary">Current Demurrage Charges</Text>
              </View>
              
              {demurrageCharges.length === 0 ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">No demurrage charges configured</Text>
                </View>
              ) : (
                <View className="overflow-hidden">
                  {/* Table Header */}
                  <View className="bg-gray-50 flex-row py-3 px-6 border-b border-gray-200">
                    <Text className="text-text-primary font-semibold flex-1">Location</Text>
                    <Text className="text-text-primary font-semibold w-40 text-right">Daily Rate (RM)</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">Action</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {demurrageCharges.map((charge, index) => (
                    <View
                      key={charge.id}
                      className={`flex-row py-4 px-6 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <Text className="text-text-primary flex-1">{charge.location}</Text>
                      <Text className="text-text-primary w-40 text-right font-medium">
                        {charge.daily_rate.toFixed(2)}
                      </Text>
                      <View className="w-20 flex-row justify-center">
                        <TouchableOpacity
                          onPress={() => handleDeleteDemurrageCharge(charge.id)}
                          className="p-2 active:opacity-80"
                        >
                          <MaterialIcons name="delete" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Add New Button */}
            {!showAddForm && (
              <View className="flex-row justify-center">
                <TouchableOpacity
                  onPress={() => setShowAddForm(true)}
                  className="active:opacity-80"
                >
                  <LinearGradient
                    colors={['#409CFF', '#0A84FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-lg px-8 py-3 min-h-[44px] items-center justify-center"
                  >
                    <Text className="text-base font-semibold text-white">Add New Demurrage Charge</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Add New Form */}
            {showAddForm && (
              <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                <View className="px-6 py-4 border-b border-gray-200">
                  <Text className="text-xl font-bold text-text-primary">Add New Demurrage Charge</Text>
                </View>
                
                <View className="px-6 py-6 space-y-6">
                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Location</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter location"
                        value={location}
                        onChangeText={setLocation}
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Daily Rate (RM)</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter daily rate"
                        value={dailyRate}
                        onChangeText={setDailyRate}
                        keyboardType="numeric"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View className="flex-row space-x-4 pt-4">
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddForm(false);
                        setLocation('');
                        setDailyRate('');
                      }}
                      className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                    >
                      <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleAddDemurrageCharge}
                      disabled={loading}
                      className="flex-1 active:opacity-80"
                    >
                      <LinearGradient
                        colors={['#409CFF', '#0A84FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
                      >
                        <Text className="text-base font-semibold text-white">
                          {loading ? "Adding..." : "Add Charge"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
