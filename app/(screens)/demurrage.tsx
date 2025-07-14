import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addDemurrageCharge,
  deleteDemurrageCharge,
  DemurrageCharge,
  getDemurrageCharges
} from '../../services/demurrageService';

export default function DemurrageScreen() {
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
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
              Demurrage
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Manage demurrage charges
            </Text>
          </View>
        </View>
        <View className="px-6 py-6">
          {/* Current Demurrage Charges */}
          <View className="bg-bg-secondary rounded-lg border border-gray-300 mb-6">
            <View className="px-4 py-3 border-b border-gray-300">
              <Text className="text-lg font-bold text-text-primary">Current Charges</Text>
            </View>
            {fetchLoading ? (
              <View className="px-4 py-8">
                <Text className="text-text-secondary text-center">Loading...</Text>
              </View>
            ) : demurrageCharges.length === 0 ? (
              <View className="px-4 py-8">
                <Text className="text-text-secondary text-center">No demurrage charges configured</Text>
              </View>
            ) : (
              <View>
                {demurrageCharges.map((charge, index) => (
                  <View
                    key={charge.demurrage_id}
                    className={`px-4 py-4 ${
                      index < demurrageCharges.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-text-primary font-semibold text-base">{charge.location}</Text>
                        <Text className="text-text-secondary text-sm">
                          RM {charge.daily_rate?.toFixed(2)}/day × {charge.days_overdue} days
                        </Text>
                        <Text className="text-primary font-semibold text-sm mt-1">
                          Total: RM {calculateTotal(charge.daily_rate || 0, charge.days_overdue || 0).toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteDemurrageCharge(charge.demurrage_id!)}
                        className="p-2 active:opacity-80"
                      >
                        <MaterialIcons name="delete" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* Add New Button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              className="mb-6 active:opacity-80"
            >
              <LinearGradient
                colors={['#409CFF', '#0A84FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
              >
                <Text className="text-base font-semibold text-white">Add New Demurrage Charge</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {/* Add New Form */}
          {showAddForm && (
            <View className="bg-bg-secondary rounded-lg border border-gray-300">
              <View className="px-4 py-3 border-b border-gray-300">
                <Text className="text-lg font-bold text-text-primary">Add New Charge</Text>
              </View>
              <View className="px-4 py-4 space-y-4">
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Location</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter location"
                      value={location}
                      onChangeText={setLocation}
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Daily Rate (RM)</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
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
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Days Overdue</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
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
                <View className="flex-row space-x-3 pt-4">
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
                        {loading ? "Adding..." : "Add"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}