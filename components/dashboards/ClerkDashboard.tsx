import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { DashboardProps } from '@/types/dashboard';
import { fetchClerkDashboardData, Task, Driver, ClerkStats } from '@/services/clerkService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ClerkDashboard({ user }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [clerkStats, setClerkStats] = useState<ClerkStats>({
    pendingTasks: 0,
    driversAvailable: 0,
    bookingsToProcess: 0,
    invoicesDraft: 0
  });
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchClerkDashboardData();
        setPendingTasks(data.pendingTasks);
        setAvailableDrivers(data.availableDrivers);
        setClerkStats(data.clerkStats);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High':
        return { type: 'error' as const, color: '#EF4444', bgColor: '#FEE2E2' };
      case 'Medium':
        return { type: 'warning' as const, color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'Low':
        return { type: 'success' as const, color: '#10B981', bgColor: '#D1FAE5' };
      default:
        return { type: 'neutral' as const, color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const getDriverStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return { type: 'success' as const, color: '#10B981' };
      case 'On Route':
        return { type: 'warning' as const, color: '#F59E0B' };
      case 'Offline':
        return { type: 'neutral' as const, color: '#6B7280' };
      default:
        return { type: 'neutral' as const, color: '#6B7280' };
    }
  };

  const getFilteredTasks = () => {
    if (selectedTaskFilter === 'all') return pendingTasks;
    return pendingTasks.filter(task => task.priority.toLowerCase() === selectedTaskFilter);
  };

  // Action handlers
  const handleCompleteTask = (taskId: string) => console.log('Complete task:', taskId);
  const handleAssignDriver = (driverId: string) => console.log('Assign driver:', driverId);
  const handleUpdateBookingStatus = () => console.log('Navigate to booking status update');
  const handleGenerateInvoice = () => console.log('Navigate to invoice generation');
  const handleViewDriverDetails = (driverId: string) => console.log('View driver details:', driverId);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={48} color="#FF453A" />
          <Text className="text-lg font-semibold text-text-primary mt-4 text-center">
            {error}
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-primary px-4 py-2 rounded-lg"
            onPress={() => {
              setLoading(true);
              fetchClerkDashboardData()
                .then(data => {
                  setPendingTasks(data.pendingTasks);
                  setAvailableDrivers(data.availableDrivers);
                  setClerkStats(data.clerkStats);
                  setError(null);
                })
                .catch(err => {
                  console.error('Retry failed:', err);
                  setError('Failed to load dashboard data. Please try again.');
                })
                .finally(() => setLoading(false));
            }}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                <MaterialIcons name="work" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">
                  {getUserGreeting()}
                </Text>
                <Text className="text-2xl font-bold text-text-primary">
                  Operations Center
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-gray-100 rounded-full p-2">
              <MaterialIcons name="notifications" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Text className="text-text-secondary mr-2">Role:</Text>
            <PremiumStatusBadge 
              status="success" 
              text="Operations Clerk"
              size="sm"
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Today's Overview
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-red-100 items-center justify-center mr-3">
                    <MaterialIcons name="assignment" size={20} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.pendingTasks}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Pending Tasks
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center mr-3">
                    <MaterialIcons name="local-shipping" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.driversAvailable}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Drivers Available
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="inventory" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.bookingsToProcess}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Bookings to Process
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-orange-100 items-center justify-center mr-3">
                    <MaterialIcons name="receipt" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.invoicesDraft}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Draft Invoices
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Update Status"
                onPress={handleUpdateBookingStatus}
                variant="gradient"
                size="sm"
                icon={<MaterialIcons name="update" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              />
            </View>
            
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Generate Invoice"
                onPress={handleGenerateInvoice}
                variant="secondary"
                size="sm"
                icon={<MaterialIcons name="receipt" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
              />
            </View>
          </View>
        </View>

        {/* Pending Tasks */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Today's Tasks
            </Text>
            
            {/* Task Filter */}
            <View className="flex-row">
              {['all', 'high', 'medium', 'low'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedTaskFilter(filter as any)}
                  className={`px-3 py-1 rounded-full mr-2 ${
                    selectedTaskFilter === filter 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    selectedTaskFilter === filter 
                      ? 'text-white' 
                      : 'text-gray-600'
                  }`}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View className="space-y-3">
            {getFilteredTasks().slice(0, 4).map((task) => (
              <PremiumCard key={task.id}>
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-2">
                      <Text className="font-semibold text-text-primary mr-2">
                        {task.type}
                      </Text>
                      <PremiumStatusBadge 
                        status={getPriorityConfig(task.priority).type}
                        text={task.priority}
                        size="sm"
                      />
                    </View>
                    
                    <Text className="text-sm text-text-secondary mb-2">
                      {task.description}
                    </Text>
                    
                    <View className="flex-row items-center">
                      <MaterialIcons name="schedule" size={14} color="#6B7280" />
                      <Text className="text-xs text-text-secondary ml-1">
                        Due: {task.dueDate}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleCompleteTask(task.id)}
                    className="bg-green-100 rounded-lg p-2"
                  >
                    <MaterialIcons name="check" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        </View>

        {/* Driver Management */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Driver Status
          </Text>
          
          <View className="space-y-3">
            {availableDrivers.map((driver) => (
              <TouchableOpacity
                key={driver.id}
                onPress={() => handleViewDriverDetails(driver.id)}
                activeOpacity={0.7}
              >
                <PremiumCard>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                        <MaterialIcons name="person" size={20} color="#6B7280" />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="font-semibold text-text-primary">
                          {driver.name}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                          {driver.currentLocation}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {driver.assignedBookings} active bookings
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <PremiumStatusBadge 
                        status={getDriverStatusConfig(driver.status).type}
                        text={driver.status}
                        size="sm"
                      />
                      
                      {driver.status === 'Available' && (
                        <TouchableOpacity
                          onPress={() => handleAssignDriver(driver.id)}
                          className="mt-2"
                        >
                          <Text className="text-green-500 text-xs font-medium">
                            Assign
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </PremiumCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* System Alerts */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            System Alerts
          </Text>
          
          <PremiumCard>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">
                  All Systems Operational
                </Text>
                <Text className="text-sm text-text-secondary">
                  No critical alerts at this time
                </Text>
              </View>
            </View>
          </PremiumCard>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}