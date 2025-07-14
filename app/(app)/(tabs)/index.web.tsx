import DriverDashboard from '@/components/dashboards/DriverDashboard';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { ICSBOLTZ_CURRENT_USER_ROLE } from '@/constants/UserRoles';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  // Render different dashboards based on user role
  if (ICSBOLTZ_CURRENT_USER_ROLE === 'DRIVER') {
    return <DriverDashboard />;
  }

  // Default dashboard for other roles (REQUESTER, HEAD_OF_DEPARTMENT, ADMIN)
  return <DefaultDashboard />;
}

function DefaultDashboard() {
  // Mock data for invoices
  const invoices = [
    {
      id: '#ITEM 1',
      route: 'PNG - KLG',
      status: 'Paid',
      statusType: 'success' as const,
      amount: 'RM 1,250.00',
      date: '15 Jan 2025'
    },
    {
      id: '#ITEM 2',
      route: 'PNG - KLG', 
      status: 'Paid',
      statusType: 'success' as const,
      amount: 'RM 850.00',
      date: '12 Jan 2025'
    },
    {
      id: '#ITEM 3',
      route: 'PNG - KLG',
      status: 'Overdue',
      statusType: 'error' as const,
      amount: 'RM 2,100.00',
      date: '08 Jan 2025'
    },
  ];

  // Mock data for booking summary
  const bookingItems = [
    { id: 1, itemNumber: '#ITEM 1', status: 'Picked Up', route: 'PNG - KLG', statusType: 'warning' as const },
    { id: 2, itemNumber: '#ITEM 2', status: 'In Transit', route: 'PNG - KLG', statusType: 'info' as const },
    { id: 3, itemNumber: '#ITEM 3', status: 'Delivered', route: 'PNG - KLG', statusType: 'success' as const },
    { id: 4, itemNumber: '#ITEM 4', status: 'Pending', route: 'PNG - KLG', statusType: 'neutral' as const },
  ];

  // Stats data
  const stats = [
    { label: 'Total Invoices', value: '12', icon: 'receipt', color: '#0A84FF' },
    { label: 'Paid', value: '8', icon: 'check-circle', color: '#30D158' },
    { label: 'Overdue', value: '2', icon: 'warning', color: '#FF453A' },
    { label: 'Pending', value: '2', icon: 'schedule', color: '#FF9F0A' },
  ];

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'GENERAL_MANAGER':
        return 'General Manager';
      case 'HEAD_OF_DEPARTMENT':
        return 'Head of Department';
      case 'REQUESTER':
        return 'Requester';
      default:
        return role;
    }
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
                <MaterialIcons name="dashboard" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">
                  {getUserGreeting()}
                </Text>
                <Text className="text-2xl font-bold text-text-primary">
                  Dashboard web
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-gray-100 rounded-full p-2">
              <MaterialIcons name="notifications" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* User Role Badge */}
          <View className="flex-row items-center">
            <Text className="text-text-secondary mr-2">Role:</Text>
            <PremiumStatusBadge 
              status="info" 
              text={getRoleDisplayName(ICSBOLTZ_CURRENT_USER_ROLE)}
              size="sm"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Overview
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            {stats.map((stat, index) => (
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

        {/* Invoices Section */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Recent Invoices
            </Text>
            <TouchableOpacity>
              <Text className="text-primary font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <PremiumCard>
            {invoices.map((invoice, index) => (
              <View key={invoice.id}>
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary mb-1">
                      {invoice.id}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {invoice.route} • {invoice.date}
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className="font-semibold text-text-primary mb-1">
                      {invoice.amount}
                    </Text>
                    <PremiumStatusBadge 
                      status={invoice.statusType}
                      text={invoice.status}
                      size="sm"
                    />
                  </View>
                </View>
                
                {index < invoices.length - 1 && (
                  <View className="h-px bg-gray-200" />
                )}
              </View>
            ))}
          </PremiumCard>
        </View>

        {/* Booking Summary Section */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Recent Bookings
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {bookingItems.map((item) => (
              <View key={item.id} className="mr-4">
                <PremiumCard style={{ width: 120 }}>
                  <Text className="font-semibold text-text-primary mb-2">
                    {item.itemNumber}
                  </Text>
                  <PremiumStatusBadge 
                    status={item.statusType}
                    text={item.status}
                    size="sm"
                  />
                  <Text className="text-xs text-text-secondary mt-2">
                    {item.route}
                  </Text>
                </PremiumCard>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity>
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mr-4">
                    <MaterialIcons name="add" size={20} color="#0A84FF" />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary">
                      Create New Request
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      Submit a new request for approval
                    </Text>
                  </View>
                  
                  <MaterialIcons name="chevron-right" size={20} color="#8A8A8E" />
                </View>
              </PremiumCard>
            </TouchableOpacity>

            <TouchableOpacity>
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-warning/20 rounded-lg items-center justify-center mr-4">
                    <MaterialIcons name="analytics" size={20} color="#FF9F0A" />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary">
                      View Reports
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      Access detailed analytics and reports
                    </Text>
                  </View>
                  
                  <MaterialIcons name="chevron-right" size={20} color="#8A8A8E" />
                </View>
              </PremiumCard>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}