import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getDemurrageCharges, 
  addDemurrageCharge, 
  deleteDemurrageCharge,
  DemurrageCharge 
} from '../../services/demurrageService';

export default function DemurrageWebScreen() {
  const [demurrageCharges, setDemurrageCharges] = useState<DemurrageCharge[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [location, setLocation] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [daysOverdue, setDaysOverdue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchDemurrageCharges();
  }, []);

  const fetchDemurrageCharges = async () => {
    try {
      setFetchLoading(true);
      const data = await getDemurrageCharges();
      setDemurrageCharges(data);
    } catch (error) {
      console.error('Error fetching demurrage charges:', error);
      Alert.alert('Error', 'Failed to fetch demurrage charges');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddDemurrageCharge = async () => {
    if (!location.trim() || !dailyRate.trim() || !daysOverdue.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const rate = parseFloat(dailyRate);
    const days = parseInt(daysOverdue);
    
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Error', 'Please enter a valid daily rate');
      return;
    }

    if (isNaN(days) || days <= 0) {
      Alert.alert('Error', 'Please enter valid days overdue');
      return;
    }

    setLoading(true);
    try {
      const newCharge = {
        location: location.trim(),
        daily_rate: rate,
        days_overdue: days,
        // You can add booking_id here if you have context of which booking this relates to
        // booking_id: bookingId
      };

      await addDemurrageCharge(newCharge);
      
      // Refresh the list
      await fetchDemurrageCharges();
      
      // Reset form
      setLocation('');
      setDailyRate('');
      setDaysOverdue('');
      setShowAddForm(false);
      
      Alert.alert('Success', 'Demurrage charge added successfully');
    } catch (error) {
      console.error('Error adding demurrage charge:', error);
      Alert.alert('Error', 'Failed to add demurrage charge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDemurrageCharge = async (demurrageId: string) => {
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
              await deleteDemurrageCharge(demurrageId);
              await fetchDemurrageCharges(); // Refresh the list
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

  const calculateTotal = (dailyRate: number, daysOverdue: number) => {
    return dailyRate * daysOverdue;
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
              
              {fetchLoading ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">Loading...</Text>
                </View>
              ) : demurrageCharges.length === 0 ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">No demurrage charges configured</Text>
                </View>
              ) : (
                <View className="overflow-hidden">
                  {/* Table Header */}
                  <View className="bg-gray-50 flex-row py-3 px-6 border-b border-gray-200">
                    <Text className="text-text-primary font-semibold flex-1">Location</Text>
                    <Text className="text-text-primary font-semibold w-32 text-center">Daily Rate</Text>
                    <Text className="text-text-primary font-semibold w-24 text-center">Days</Text>
                    <Text className="text-text-primary font-semibold w-32 text-center">Total</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">Action</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {demurrageCharges.map((charge, index) => (
                    <View
                      key={charge.demurrage_id}
                      className={`flex-row py-4 px-6 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <Text className="text-text-primary flex-1">{charge.location}</Text>
                      <Text className="text-text-primary w-32 text-center font-medium">
                        RM {charge.daily_rate?.toFixed(2)}
                      </Text>
                      <Text className="text-text-primary w-24 text-center">
                        {charge.days_overdue}
                      </Text>
                      <Text className="text-primary w-32 text-center font-semibold">
                        RM {calculateTotal(charge.daily_rate || 0, charge.days_overdue || 0).toFixed(2)}
                      </Text>
                      <View className="w-20 flex-row justify-center">
                        <TouchableOpacity
                          onPress={() => handleDeleteDemurrageCharge(charge.demurrage_id!)}
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

                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Days Overdue</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter days overdue"
                        value={daysOverdue}
                        onChangeText={setDaysOverdue}
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
                        setDaysOverdue('');
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