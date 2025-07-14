import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  addComplianceCharge,
  ComplianceCharge,
  deleteComplianceCharge,
  getComplianceCharges
} from '../../services/complianceService';

export default function ComplianceWebScreen() {
  const [complianceCharges, setComplianceCharges] = useState<ComplianceCharge[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [complianceName, setComplianceName] = useState('');
  const [flatCharge, setFlatCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchComplianceCharges();
  }, []);

  const fetchComplianceCharges = async () => {
    try {
      setFetchLoading(true);
      const data = await getComplianceCharges();
      setComplianceCharges(data);
    } catch (error) {
      console.error('Error fetching compliance charges:', error);
      Alert.alert('Error', 'Failed to load compliance charges. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddComplianceCharge = async () => {
    if (!complianceName.trim() || !flatCharge.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const charge = parseFloat(flatCharge);
    if (isNaN(charge) || charge <= 0) {
      Alert.alert('Error', 'Please enter a valid flat charge');
      return;
    }

    setLoading(true);
    try {
      const newCharge = await addComplianceCharge({
         name_compliance: complianceName.trim(),
        price: charge,
      });

      setComplianceCharges([newCharge, ...complianceCharges]);
      setComplianceName('');
      setFlatCharge('');
      setShowAddForm(false);
      Alert.alert('Success', 'Compliance charge added successfully');
    } catch (error) {
      console.error('Error adding compliance charge:', error);
      Alert.alert('Error', 'Failed to add compliance charge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplianceCharge = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this compliance charge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComplianceCharge(id);
              setComplianceCharges(complianceCharges.filter(charge => charge.id !== id));
              Alert.alert('Success', 'Compliance charge deleted successfully');
            } catch (error) {
              console.error('Error deleting compliance charge:', error);
              Alert.alert('Error', 'Failed to delete compliance charge');
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
              Compliance Management
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Manage compliance charges and requirements
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
            {/* Current Compliance Charges Table */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-text-primary">Current Compliance Charges</Text>
              </View>
              
              {fetchLoading ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">Loading compliance charges...</Text>
                </View>
              ) : complianceCharges.length === 0 ? (
                <View className="px-6 py-12 text-center">
                  <Text className="text-text-secondary text-center">No compliance charges configured</Text>
                </View>
              ) : (
                <View className="overflow-hidden">
                  {/* Table Header */}
                  <View className="bg-gray-50 flex-row py-3 px-6 border-b border-gray-200">
                    <Text className="text-text-primary font-semibold flex-1">Compliance Name</Text>
                    <Text className="text-text-primary font-semibold w-40 text-right">Flat Charge (RM)</Text>
                    <Text className="text-text-primary font-semibold w-20 text-center">Action</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {complianceCharges.map((charge, index) => (
                    <View
                      key={charge.id}
                      className={`flex-row py-4 px-6 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <Text className="text-text-primary flex-1">{charge. name_compliance}</Text>
                      <Text className="text-text-primary w-40 text-right font-medium">
                        {charge.price.toFixed(2)}
                      </Text>
                      <View className="w-20 flex-row justify-center">
                        <TouchableOpacity
                          onPress={() => handleDeleteComplianceCharge(charge.id!)}
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
                    <Text className="text-base font-semibold text-white">Add New Compliance Charge</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Add New Form */}
            {showAddForm && (
              <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                <View className="px-6 py-4 border-b border-gray-200">
                  <Text className="text-xl font-bold text-text-primary">Add New Compliance Charge</Text>
                </View>
                
                <View className="px-6 py-6 space-y-6">
                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Compliance Name</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter compliance name"
                        value={complianceName}
                        onChangeText={setComplianceName}
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">Flat Charge (RM)</Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="Enter flat charge"
                        value={flatCharge}
                        onChangeText={setFlatCharge}
                        keyboardType="numeric"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View className="flex-row space-x-4 pt-4">
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddForm(false);
                        setComplianceName('');
                        setFlatCharge('');
                      }}
                      className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                    >
                      <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleAddComplianceCharge}
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