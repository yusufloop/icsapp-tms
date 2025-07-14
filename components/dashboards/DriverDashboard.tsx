import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PerformanceChart } from '../dashboard/PerformanceChart';
import { RouteMapView } from '../dashboard/RouteMapView';

const { width } = Dimensions.get('window');

export default function DriverDashboard() {
  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock data for driver stats
  const driverStats = [
    { label: 'Today Deliveries', value: '12', icon: 'local-shipping', color: '#0A84FF' },
    { label: 'Completed', value: '8', icon: 'check-circle', color: '#30D158' },
    { label: 'Pending', value: '4', icon: 'schedule', color: '#FF9F0A' },
    { label: 'Efficiency', value: '94%', icon: 'speed', color: '#AF52DE' },
  ];

  // Mock route data
  const currentRoute = {
    routeId: 'RT-001',
    startTime: '08:00 AM',
    estimatedCompletion: '05:30 PM',
    totalStops: 12,
    completedStops: 8,
    nextStop: {
      address: 'Bandar Bukit Puchong',
      customerName: 'Isense ASV',
      package: 'PKG-001',
      estimatedArrival: '02:30 PM'
    }
  };

  // Mock performance data
  const performanceData = [
    { month: 'Jan', onTime: 2, delay: 4 },
    { month: 'Feb', onTime: 3, delay: 2 },
    { month: 'Mar', onTime: 10, delay: 5 },
    { month: 'Apr', onTime: 7, delay: 11 },
    { month: 'May', onTime: 18, delay: 4 },
    { month: 'Jun', onTime: 19, delay: 2 },
    { month: 'Jul', onTime: 13, delay: 2 },
    { month: 'Aug', onTime: 25, delay: 1 },
  ];

  // Mock recent deliveries
  const recentDeliveries = [
    { id: '#ITEM 1', status: 'Delivered', customer: 'Tech Corp', time: '10:30 AM', statusType: 'success' as const },
    { id: '#ITEM 2', status: 'In Transit', customer: 'Blue Vision', time: '11:15 AM', statusType: 'info' as const },
    { id: '#ITEM 3', status: 'Pending', customer: 'Global Ltd', time: '02:30 PM', statusType: 'warning' as const },
  ];

  const handleStartRoute = () => {
    console.log('Starting route...');
  };

  const handleCompleteDelivery = () => {
    console.log('Completing delivery...');
  };

  const handleReportIssue = () => {
    console.log('Reporting issue...');
  };

  const handleNavigate = () => {
    console.log('Opening navigation...');
  };

  const handleContactCustomer = () => {
    console.log('Contacting customer...');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-4">
                <MaterialIcons name="local-shipping" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">
                  {getUserGreeting()}
                </Text>
                <Text className="text-2xl font-bold text-text-primary">
                  Dashboard
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-gray-100 rounded-full p-2">
              <MaterialIcons name="notifications" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Driver Role Badge */}
          <View className="flex-row items-center">
            <Text className="text-text-secondary mr-2">Role:</Text>
            <PremiumStatusBadge 
              status="info" 
              text="Driver"
              size="sm"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Today's Overview
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            {driverStats.map((stat, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <PremiumCard>
                  <View className="flex-row items-center">
                    <View 
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <MaterialIcons 
                        name={stat.icon as any} 
                        size={20} 
                        color={stat.color} 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-text-primary">
                        {stat.value}
                      </Text>
                      <Text className="text-text-secondary text-xs">
                        {stat.label}
                      </Text>
                    </View>
                  </View>
                </PremiumCard>
              </View>
            ))}
          </View>
        </View>

        {/* Route Map Section */}
        <View className="px-6 pt-6">
          <RouteMapView currentRoute={currentRoute} />
        </View>

        {/* Quick Actions */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Start Route"
                onPress={handleStartRoute}
                variant="gradient"
                size="md"
                icon={<MaterialIcons name="play-arrow" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />}
              />
            </View>
            
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Navigate"
                onPress={handleNavigate}
                variant="secondary"
                size="md"
                icon={<MaterialIcons name="navigation" size={18} color="#6B7280" style={{ marginRight: 8 }} />}
              />
            </View>
            
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Complete Delivery"
                onPress={handleCompleteDelivery}
                variant="secondary"
                size="md"
                icon={<MaterialIcons name="check-circle" size={18} color="#6B7280" style={{ marginRight: 8 }} />}
              />
            </View>
            
            <View className="w-1/2 px-2 mb-3">
              <PremiumButton
                title="Contact Customer"
                onPress={handleContactCustomer}
                variant="secondary"
                size="md"
                icon={<MaterialIcons name="phone" size={18} color="#6B7280" style={{ marginRight: 8 }} />}
              />
            </View>
          </View>
          
          <View className="mt-2">
            <PremiumButton
              title="Report Issue"
              onPress={handleReportIssue}
              variant="destructive"
              size="md"
              icon={<MaterialIcons name="report-problem" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />}
            />
          </View>
        </View>

        {/* Performance Chart */}
        <View className="px-6 pt-6">
          <PerformanceChart data={performanceData} />
        </View>

        {/* Recent Deliveries */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Recent Deliveries
            </Text>
            <TouchableOpacity>
              <Text className="text-primary font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {recentDeliveries.map((delivery) => (
              <PremiumCard key={delivery.id}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary mb-1">
                      {delivery.id}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {delivery.customer} • {delivery.time}
                    </Text>
                  </View>
                  
                  <PremiumStatusBadge 
                    status={delivery.statusType}
                    text={delivery.status}
                    size="sm"
                  />
                </View>
              </PremiumCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}