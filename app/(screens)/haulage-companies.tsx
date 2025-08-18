import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createHaulageCompany,
  deleteHaulageCompany,
  getAllHaulageCompanies,
  HaulageCompany,
  updateHaulageCompany
} from '../../services/haulageCompanyService';

export default function HaulageCompaniesScreen() {
  const [haulageCompanies, setHaulageCompanies] = useState<HaulageCompany[]>([]);
  const [allCompanies, setAllCompanies] = useState<HaulageCompany[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<HaulageCompany | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    contact_phone: '',
    contact_email: '',
    total_annual_jobs: '',
    market_share_percentage: '',
    annual_rank: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchHaulageCompanies();
  }, []);

  const fetchHaulageCompanies = async () => {
    try {
      setFetchLoading(true);
      const data = await getAllHaulageCompanies();
      setAllCompanies(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      updateDisplayedCompanies(data, 1);
    } catch (error) {
      console.error('Error fetching haulage companies:', error);
      Alert.alert('Error', 'Failed to fetch haulage companies');
    } finally {
      setFetchLoading(false);
    }
  };

  const updateDisplayedCompanies = (companies: HaulageCompany[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setHaulageCompanies(companies.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  const handlePageChange = (page: number) => {
    updateDisplayedCompanies(allCompanies, page);
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      company_code: '',
      contact_phone: '',
      contact_email: '',
      total_annual_jobs: '',
      market_share_percentage: '',
      annual_rank: '',
    });
    setEditingCompany(null);
  };

  const handleAddHaulageCompany = async () => {
    if (!formData.company_name.trim() || !formData.company_code.trim()) {
      Alert.alert('Error', 'Please fill in company name and code');
      return;
    }

    const annualJobs = parseInt(formData.total_annual_jobs) || 0;
    const marketShare = parseFloat(formData.market_share_percentage) || 0;
    const rank = parseInt(formData.annual_rank) || 0;

    if (marketShare < 0 || marketShare > 100) {
      Alert.alert('Error', 'Market share percentage must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const newCompany = {
        company_name: formData.company_name.trim(),
        company_code: formData.company_code.trim().toUpperCase(),
        contact_phone: formData.contact_phone.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        total_annual_jobs: annualJobs,
        market_share_percentage: marketShare,
        annual_rank: rank,
        status: 'ACTIVE' as const,
      };

      if (editingCompany) {
        await updateHaulageCompany(editingCompany.company_id!, newCompany);
        Alert.alert('Success', 'Haulage company updated successfully');
      } else {
        await createHaulageCompany(newCompany);
        Alert.alert('Success', 'Haulage company added successfully');
      }

      await fetchHaulageCompanies();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving haulage company:', error);
      Alert.alert('Error', 'Failed to save haulage company');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = (company: HaulageCompany) => {
    setFormData({
      company_name: company.company_name,
      company_code: company.company_code,
      contact_phone: company.contact_phone || '',
      contact_email: company.contact_email || '',
      total_annual_jobs: company.total_annual_jobs?.toString() || '',
      market_share_percentage: company.market_share_percentage?.toString() || '',
      annual_rank: company.annual_rank?.toString() || '',
    });
    setEditingCompany(company);
    setShowAddForm(true);
  };

  const handleDeleteHaulageCompany = async (companyId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to deactivate this haulage company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHaulageCompany(companyId);
              await fetchHaulageCompanies();
              Alert.alert('Success', 'Haulage company deactivated successfully');
            } catch (error) {
              console.error('Error deleting haulage company:', error);
              Alert.alert('Error', 'Failed to deactivate haulage company');
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'SUSPENDED':
        return 'text-orange-600';
      case 'INACTIVE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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
              Haulage Companies
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Manage haulage company partners
            </Text>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Current Haulage Companies */}
          <View className="bg-bg-secondary rounded-lg border border-gray-300 mb-6">
            <View className="px-4 py-3 border-b border-gray-300">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-text-primary">Current Companies</Text>
                <Text className="text-sm text-text-secondary">
                  Page {currentPage} of {totalPages} ({allCompanies.length} total)
                </Text>
              </View>
            </View>
            {fetchLoading ? (
              <View className="px-4 py-8">
                <Text className="text-text-secondary text-center">Loading...</Text>
              </View>
            ) : allCompanies.length === 0 ? (
              <View className="px-4 py-8">
                <Text className="text-text-secondary text-center">No haulage companies configured</Text>
              </View>
            ) : (
              <View>
                {haulageCompanies.map((company, index) => (
                  <View
                    key={company.company_id}
                    className={`px-4 py-4 ${
                      index < haulageCompanies.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-text-primary font-semibold text-base mr-2">
                            {company.company_name}
                          </Text>
                          <Text className={`text-xs font-medium ${getStatusColor(company.status || 'ACTIVE')}`}>
                            {company.status}
                          </Text>
                        </View>
                        <Text className="text-text-secondary text-sm mb-1">
                          Code: {company.company_code}
                        </Text>
                        {company.annual_rank && (
                          <Text className="text-text-secondary text-sm">
                            Rank #{company.annual_rank} • {company.market_share_percentage}% market share
                          </Text>
                        )}
                        {company.contact_phone && (
                          <Text className="text-text-secondary text-sm">
                            Phone: {company.contact_phone}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => handleEditCompany(company)}
                          className="p-2 mr-2 active:opacity-80"
                        >
                          <MaterialIcons name="edit" size={20} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteHaulageCompany(company.company_id!)}
                          className="p-2 active:opacity-80"
                        >
                          <MaterialIcons name="delete" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View className="px-4 py-3 border-t border-gray-300 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === 1 
                      ? 'bg-gray-100 opacity-50' 
                      : 'bg-primary active:opacity-80'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-400' : 'text-white'
                  }`}>
                    Previous
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <TouchableOpacity
                        key={pageNum}
                        onPress={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg items-center justify-center ${
                          currentPage === pageNum 
                            ? 'bg-primary' 
                            : 'bg-gray-100 active:opacity-80'
                        }`}
                      >
                        <Text className={`text-sm font-medium ${
                          currentPage === pageNum ? 'text-white' : 'text-gray-600'
                        }`}>
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 opacity-50' 
                      : 'bg-primary active:opacity-80'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-400' : 'text-white'
                  }`}>
                    Next
                  </Text>
                </TouchableOpacity>
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
                <Text className="text-base font-semibold text-white">Add New Haulage Company</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <View className="bg-bg-secondary rounded-lg border border-gray-300">
              <View className="px-4 py-3 border-b border-gray-300">
                <Text className="text-lg font-bold text-text-primary">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </Text>
              </View>
              <View className="px-4 py-4 space-y-4">
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Company Name</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter company name"
                      value={formData.company_name}
                      onChangeText={(text) => setFormData({ ...formData, company_name: text })}
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Company Code</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter company code"
                      value={formData.company_code}
                      onChangeText={(text) => setFormData({ ...formData, company_code: text.toUpperCase() })}
                      placeholderTextColor="#8A8A8E"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Contact Phone</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter contact phone"
                      value={formData.contact_phone}
                      onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                      keyboardType="phone-pad"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Contact Email</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter contact email"
                      value={formData.contact_email}
                      onChangeText={(text) => setFormData({ ...formData, contact_email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary mb-2">Annual Jobs</Text>
                    <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="0"
                        value={formData.total_annual_jobs}
                        onChangeText={(text) => setFormData({ ...formData, total_annual_jobs: text })}
                        keyboardType="numeric"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary mb-2">Market Share (%)</Text>
                    <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        placeholder="0.0"
                        value={formData.market_share_percentage}
                        onChangeText={(text) => setFormData({ ...formData, market_share_percentage: text })}
                        keyboardType="numeric"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">Annual Rank</Text>
                  <View className="rounded-lg bg-bg-primary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      placeholder="Enter annual rank"
                      value={formData.annual_rank}
                      onChangeText={(text) => setFormData({ ...formData, annual_rank: text })}
                      keyboardType="numeric"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3 pt-4">
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
                    onPress={handleAddHaulageCompany}
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
                        {loading ? "Saving..." : editingCompany ? "Update" : "Add"}
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