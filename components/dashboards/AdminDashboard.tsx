import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { DashboardProps } from '@/types/dashboard';
import { mockAdminData } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ user }: DashboardProps) {
  const { adminStats, revenueData, systemAlerts } = mockAdminData;

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAlertTypeConfig = (type: string) => {
    switch (type) {
      case 'error':
        return { type: 'error' as const, icon: 'error', color: '#EF4444' };
      case 'warning':
        return { type: 'warning' as const, icon: 'warning', color: '#F59E0B' };
      case 'info':
        return { type: 'info' as const, icon: 'info', color: '#3B82F6' };
      default:
        return { type: 'neutral' as const, icon: 'info', color: '#6B7280' };
    }
  };

  // Action handlers
  const handleGenerateReports = () => console.log('Navigate to reports generation');
  const handleManageUsers = () => console.log('Navigate to user management');
  const handleSystemSettings = () => console.log('Navigate to system settings');
  const handleViewAnalytics = () => console.log('Navigate to detailed analytics');
  const handleResolveAlert = (alertId: string) => console.log('Resolve alert:', alertId);

  // Revenue chart calculation
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  const chartHeight = 150;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center mr-4">
                <MaterialIcons name="admin-panel-settings" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">
                  {getUserGreeting()}
                </Text>
                <Text className="text-2xl font-bold text-text-primary">
                  Admin Dashboard
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-gray-100 rounded-full p-2">
              <MaterialIcons name="settings" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Text className="text-text-secondary mr-2">Role:</Text>
            <PremiumStatusBadge 
              status="error" 
              text="Administrator"
              size="sm"
            />
          </View>
        </View>

        {/* Key Metrics */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Business Overview
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center mr-3">
                    <MaterialIcons name="attach-money" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-text-primary">
                      RM {(adminStats.monthlyRevenue / 1000).toFixed(0)}K
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Monthly Revenue
                    </Text>
                    <Text className="text-green-500 text-xs font-medium">
                      {adminStats.revenueGrowth}
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
                    <Text className="text-xl font-bold text-text-primary">
                      {adminStats.totalBookings}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Total Bookings
                    </Text>
                    <Text className="text-blue-500 text-xs font-medium">
                      {adminStats.completionRate} completed
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-purple-100 items-center justify-center mr-3">
                    <MaterialIcons name="people" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-text-primary">
                      {adminStats.totalUsers}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Total Users
                    </Text>
                    <Text className="text-purple-500 text-xs font-medium">
                      {adminStats.activeDrivers} drivers
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-orange-100 items-center justify-center mr-3">
                    <MaterialIcons name="speed" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-text-primary">
                      {adminStats.systemUptime}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      System Uptime
                    </Text>
                    <Text className="text-orange-500 text-xs font-medium">
                      {adminStats.customerSatisfaction} rating
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Revenue Trend
            </Text>
            <TouchableOpacity onPress={handleViewAnalytics}>
              <Text className="text-purple-500 font-medium">View Details</Text>
            </TouchableOpacity>
          </View>
          
          <PremiumCard>
            <View style={{ height: chartHeight + 40 }}>
              {/* Chart area */}
              <View className="flex-1 flex-row items-end justify-between px-2">
                {revenueData.map((item, index) => {
                  const barHeight = (item.revenue / maxRevenue) * chartHeight;
                  
                  return (
                    <View key={item.month} className="items-center flex-1">
                      {/* Revenue amount */}
                      <Text className="text-xs text-text-secondary mb-2">
                        {(item.revenue / 1000).toFixed(0)}K
                      </Text>
                      
                      {/* Bar */}
                      <View 
                        className="bg-purple-500 rounded-t w-8 mb-2"
                        style={{ height: Math.max(barHeight, 4) }}
                      />
                      
                      {/* Month label */}
                      <Text className="text-xs text-text-tertiary">
                        {item.month}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Admin Actions
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="Reports"
                onPress={handleGenerateReports}
                variant="gradient"
                size="sm"
                icon={<MaterialIcons name="assessment" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              />
            </View>
            
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="Users"
                onPress={handleManageUsers}
                variant="secondary"
                size="sm"
                icon={<MaterialIcons name="people" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
              />
            </View>
            
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="Settings"
                onPress={handleSystemSettings}
                variant="secondary"
                size="sm"
                icon={<MaterialIcons name="settings" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
              />
            </View>
          </View>
        </View>

        {/* System Alerts */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            System Alerts
          </Text>
          
          <View className="space-y-3">
            {systemAlerts.filter(alert => !alert.resolved).slice(0, 3).map((alert) => (
              <PremiumCard key={alert.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1 mr-3">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-1"
                      style={{ backgroundColor: getAlertTypeConfig(alert.type).color + '20' }}
                    >
                      <MaterialIcons 
                        name={getAlertTypeConfig(alert.type).icon as any} 
                        size={16} 
                        color={getAlertTypeConfig(alert.type).color} 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="font-semibold text-text-primary mb-1">
                        {alert.message}
                      </Text>
                      <Text className="text-xs text-text-secondary">
                        {alert.timestamp}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleResolveAlert(alert.id)}
                    className="bg-purple-100 rounded-lg px-3 py-1"
                  >
                    <Text className="text-purple-600 text-xs font-medium">
                      Resolve
                    </Text>
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        </View>

        {/* System Health */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            System Health
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="items-center">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  </View>
                  <Text className="font-semibold text-text-primary">Database</Text>
                  <Text className="text-sm text-green-500">Healthy</Text>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="items-center">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                    <MaterialIcons name="cloud-done" size={24} color="#10B981" />
                  </View>
                  <Text className="font-semibold text-text-primary">API</Text>
                  <Text className="text-sm text-green-500">Operational</Text>
                </View>
              </PremiumCard>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}