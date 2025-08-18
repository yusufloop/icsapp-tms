import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  createHaulageTariff,
  deleteHaulageTariff,
  getAllHaulageTariffs,
  getHaulageStates,
  HaulageTariff
} from '../../services/haulageTariffService';

export default function HaulageTariffsWebScreen() {
  const [haulageTariffs, setHaulageTariffs] = useState<HaulageTariff[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState<HaulageTariff | null>(null);
  const [formData, setFormData] = useState({
    area_name: '',
    area_code: '',
    state: '',
    haulage_rate: '',
    toll_fee: '',
    faf_fee: '',
    dgc_fee: '',
    container_size: '20ft & 40ft',
    container_type: 'DRY',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [showContainerTypePicker, setShowContainerTypePicker] = useState(false);

  const containerSizes = ['20ft', '40ft', '20ft & 40ft'];
  const containerTypes = ['DRY', 'REEFER', 'TANK', 'FLAT RACK'];
  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan', 'Pahang',
    'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
    'Kuala Lumpur', 'Labuan', 'Putrajaya'
  ];

  useEffect(() => {
    fetchHaulageTariffs();
    fetchStates();
  }, []);

  const fetchHaulageTariffs = async () => {
    try {
      setFetchLoading(true);
      const data = await getAllHaulageTariffs();
      setHaulageTariffs(data);
    } catch (error) {
      console.error('Error fetching haulage tariffs:', error);
      Alert.alert('Error', 'Failed to fetch haulage tariffs');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const data = await getHaulageStates();
      setStates(data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      area_name: '',
      area_code: '',
      state: '',
      haulage_rate: '',
      toll_fee: '',
      faf_fee: '',
      dgc_fee: '',
      container_size: '20ft & 40ft',
      container_type: 'DRY',
      remarks: '',
    });
    setEditingTariff(null);
  };

  const calculateGrandTotal = () => {
    const haulageRate = parseFloat(formData.haulage_rate) || 0;
    const tollFee = parseFloat(formData.toll_fee) || 0;
    const fafFee = parseFloat(formData.faf_fee) || 0;
    const dgcFee = parseFloat(formData.dgc_fee) || 0;
    return haulageRate + tollFee + fafFee + dgcFee;
  };

  const handleAddHaulageTariff = async () => {
    if (!formData.area_name.trim() || !formData.state.trim() || !formData.haulage_rate.trim()) {
      Alert.alert('Error', 'Please fill in area name, state, and haulage rate');
      return;
    }

    const haulageRate = parseFloat(formData.haulage_rate);
    const tollFee = parseFloat(formData.toll_fee) || 0;
    const fafFee = parseFloat(formData.faf_fee) || 0;
    const dgcFee = parseFloat(formData.dgc_fee) || 0;

    if (isNaN(haulageRate) || haulageRate <= 0) {
      Alert.alert('Error', 'Please enter a valid haulage rate');
      return;
    }

    setLoading(true);
    try {
      const newTariff = {
        area_name: formData.area_name.trim(),
        area_code: formData.area_code.trim() || undefined,
        state: formData.state,
        haulage_rate: haulageRate,
        toll_fee: tollFee,
        faf_fee: fafFee,
        dgc_fee: dgcFee,
        container_size: formData.container_size,
        container_type: formData.container_type,
        remarks: formData.remarks.trim() || undefined,
        effective_date: new Date().toISOString().split('T')[0],
        is_active: true,
        version_number: 1,
      };

      if (editingTariff) {
        Alert.alert('Success', 'Haulage tariff updated successfully');
      } else {
        await createHaulageTariff(newTariff);
        Alert.alert('Success', 'Haulage tariff added successfully');
      }

      await fetchHaulageTariffs();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving haulage tariff:', error);
      Alert.alert('Error', 'Failed to save haulage tariff');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHaulageTariff = async (tariffId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to deactivate this haulage tariff?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHaulageTariff(tariffId);
              await fetchHaulageTariffs();
              Alert.alert('Success', 'Haulage tariff deactivated successfully');
            } catch (error) {
              console.error('Error deleting haulage tariff:', error);
              Alert.alert('Error', 'Failed to deactivate haulage tariff');
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
        <View className="flex-row items-center max-w-6xl mx-auto w-full">
          <TouchableOpacity 
            onPress={handleBack}
            className="mr-4 p-2 -ml-2 active:opacity-80"
          >
            <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              Haulage Tariffs Management
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Manage haulage rates by area and container specifications
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
          <View className="max-w-6xl mx-auto w-full space-y-6">
            {/* Current Haulage Tariffs Table */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-text-primary">Current Haulage Tariffs</Text>
              </View>
              
              {fetchLoading ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">Loading haulage tariffs...</Text>
                </View>
              ) : haulageTariffs.length === 0 ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">No haulage tariffs configured</Text>
                </View>
              ) : (
                <View className="overflow-hidden">
                  {/* Table Header */}
                  <View className="bg-gray-50 flex-row py-3 px-6 border-b border-gray-200">
                    <Text className="text-text-primary font-semibold flex-1">Area</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">State</Text>
                    <Text className="text-text-primary font-semibold w-24 text-center">Rate</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">Toll</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">FAF</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">DGC</Text>
                    <Text className="text-text-primary font-semibold w-24 text-center">Total</Text>
                    <Text className="text-text-primary font-semibold w-24 text-center">Container</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">Action</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {haulageTariffs.map((tariff, index) => (
                    <View
                      key={tariff.tariff_id}
                      className={`flex-row py-4 px-6 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <View className="flex-1">
                        <Text className="text-text-primary font-medium">{tariff.area_name}</Text>
                        {tariff.area_code && (
                          <Text className="text-text-secondary text-sm">Code: {tariff.area_code}</Text>
                        )}
                      </View>
                      <Text className="text-text-primary w-20 text-center text-sm">
                        {tariff.state}
                      </Text>
                      <Text className="text-text-primary w-24 text-center font-medium">
                        {tariff.haulage_rate.toFixed(2)}
                      </Text>
                      <Text className="text-text-primary w-20 text-center">
                        {tariff.toll_fee?.toFixed(2) || '0.00'}
                      </Text>
                      <Text className="text-text-primary w-20 text-center">
                        {tariff.faf_fee?.toFixed(2) || '0.00'}
                      </Text>
                      <Text className="text-text-primary w-20 text-center">
                        {tariff.dgc_fee?.toFixed(2) || '0.00'}
                      </Text>
                      <Text className="text-primary w-24 text-center font-semibold">
                        {tariff.grand_total?.toFixed(2) || '0.00'}
                      </Text>
                      <Text className="text-text-primary w-24 text-center text-sm">
                        {tariff.container_size}
                      </Text>
                      <View className="w-20 flex-row justify-center">
                        <TouchableOpacity
                          onPress={() => handleDeleteHaulageTariff(tariff.tariff_id!)}
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
                    <Text className="text-base font-semibold text-white">Add New Haulage Tariff</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Add New Form */}
            {showAddForm && (
              <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                <View className="px-6 py-4 border-b border-gray-200">
                  <Text className="text-xl font-bold text-text-primary">Add New Haulage Tariff</Text>
                </View>
                
                <View className="px-6 py-6 space-y-6">
                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Area Name</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="Enter area name"
                          value={formData.area_name}
                          onChangeText={(text) => setFormData({ ...formData, area_name: text })}
                          placeholderTextColor="#8A8A8E"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Area Code</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="Enter area code"
                          value={formData.area_code}
                          onChangeText={(text) => setFormData({ ...formData, area_code: text.toUpperCase() })}
                          placeholderTextColor="#8A8A8E"
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">State</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowStatePicker(!showStatePicker);
                          setShowContainerSizePicker(false);
                          setShowContainerTypePicker(false);
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className={`flex-1 text-base ${formData.state ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {formData.state || 'Select state'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* State Picker - Pushes content below */}
                  {showStatePicker && (
                    <View className="bg-bg-secondary border border-gray-300 rounded-lg shadow-lg max-h-48">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select State
                      </Text>
                      <ScrollView showsVerticalScrollIndicator={true}>
                        {malaysianStates.map((state, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setFormData({ ...formData, state });
                              setShowStatePicker(false);
                            }}
                            className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                          >
                            <Text className="text-text-primary">{state}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Haulage Rate (RM)</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="Enter haulage rate"
                          value={formData.haulage_rate}
                          onChangeText={(text) => setFormData({ ...formData, haulage_rate: text })}
                          keyboardType="numeric"
                          placeholderTextColor="#8A8A8E"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Toll Fee (RM)</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="0.00"
                          value={formData.toll_fee}
                          onChangeText={(text) => setFormData({ ...formData, toll_fee: text })}
                          keyboardType="numeric"
                          placeholderTextColor="#8A8A8E"
                        />
                      </View>
                    </View>
                  </View>

                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">FAF Fee (RM)</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="0.00"
                          value={formData.faf_fee}
                          onChangeText={(text) => setFormData({ ...formData, faf_fee: text })}
                          keyboardType="numeric"
                          placeholderTextColor="#8A8A8E"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">DGC Fee (RM)</Text>
                      <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                        <TextInput
                          className="flex-1 text-base text-text-primary"
                          placeholder="0.00"
                          value={formData.dgc_fee}
                          onChangeText={(text) => setFormData({ ...formData, dgc_fee: text })}
                          keyboardType="numeric"
                          placeholderTextColor="#8A8A8E"
                        />
                      </View>
                    </View>
                  </View>

                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Container Size</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowContainerSizePicker(!showContainerSizePicker);
                          setShowStatePicker(false);
                          setShowContainerTypePicker(false);
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className="flex-1 text-base text-text-primary">
                          {formData.container_size}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary mb-2">Container Type</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowContainerTypePicker(!showContainerTypePicker);
                          setShowStatePicker(false);
                          setShowContainerSizePicker(false);
                        }}
                        className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                      >
                        <Text className="flex-1 text-base text-text-primary">
                          {formData.container_type}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Container Size Picker - Pushes content below */}
                  {showContainerSizePicker && (
                    <View className="bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Container Size
                      </Text>
                      {containerSizes.map((size, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setFormData({ ...formData, container_size: size });
                            setShowContainerSizePicker(false);
                          }}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Container Type Picker - Pushes content below */}
                  {showContainerTypePicker && (
                    <View className="bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Container Type
                      </Text>
                      {containerTypes.map((type, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setFormData({ ...formData, container_type: type });
                            setShowContainerTypePicker(false);
                          }}
                          className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                        >
                          <Text className="text-text-primary">{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Remarks (Optional)</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter remarks"
                        value={formData.remarks}
                        onChangeText={(text) => setFormData({ ...formData, remarks: text })}
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  {/* Grand Total Display */}
                  <View className="bg-blue-50 rounded-lg p-4">
                    <Text className="text-sm font-semibold text-text-primary mb-2">Calculated Grand Total</Text>
                    <Text className="text-2xl font-bold text-primary">
                      RM {calculateGrandTotal().toFixed(2)}
                    </Text>
                    <Text className="text-xs text-text-secondary mt-1">
                      Auto-calculated from rate + fees
                    </Text>
                  </View>

                  <View className="flex-row space-x-4 pt-4">
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                    >
                      <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleAddHaulageTariff}
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
                          {loading ? "Adding..." : "Add Tariff"}
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