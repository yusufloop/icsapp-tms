import DriverDashboard from '@/components/dashboards/DriverDashboard';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { getCurrentUserRole, subscribeToRoleChanges, type UserRole } from '@/constants/UserRoles';
import { Div } from '@expo/html-elements';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import N8nChatWebView from '@/components/ai/N8nChatWidget';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUserRole());

  // Subscribe to role changes
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentRole(newRole);
      console.log('Dashboard role changed to:', newRole);
    });

    return unsubscribe;
  }, []);

  // Render different dashboards based on user role
  if (currentRole === 'DRIVER') {
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
    { label: 'Paid', value: '8', icon: 'check-circle', color: '#28A745' },
    { label: 'Pending', value: '3', icon: 'schedule', color: '#FFC107' },
    { label: 'Overdue', value: '1', icon: 'error', color: '#DC3545' },
  ];


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="max-w-6xl mx-auto">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Overview of your transportation management system
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-6">
          <View className="max-w-6xl mx-auto">
            {/* Stats Grid */}
            <View className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <PremiumCard key={index} className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {stat.label}
                      </Text>
                    </View>
                    <View 
                      className="w-12 h-12 rounded-xl items-center justify-center"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <MaterialIcons 
                        name={stat.icon as any} 
                        size={24} 
                        color={stat.color} 
                      />
                    </View>
                  </View>
                </PremiumCard>
              ))}
            </View>

            <View className="grid grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <PremiumCard className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-bold text-gray-900">
                    Recent Invoices
                  </Text>
                  <TouchableOpacity className="active:opacity-80">
                    <Text className="text-sm text-blue-600 font-medium">
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {invoices.map((invoice, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {invoice.id}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {invoice.route} • {invoice.date}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {invoice.amount}
                        </Text>
                        <PremiumStatusBadge 
                          status={invoice.statusType}
                          text={invoice.status}
                          size="sm"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </PremiumCard>

              {/* Booking Summary */}
              <PremiumCard className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-bold text-gray-900">
                    Recent Bookings
                  </Text>
                  <TouchableOpacity className="active:opacity-80">
                    <Text className="text-sm text-blue-600 font-medium">
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {bookingItems.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {item.itemNumber}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {item.route}
                        </Text>
                      </View>
                      <PremiumStatusBadge 
                        status={item.statusType}
                        text={item.status}
                        size="sm"
                      />
                    </View>
                  ))}
                </View>
              </PremiumCard>
            </View>
          </View>
        </View>
      </ScrollView>

     <N8nChatWebView />
    </SafeAreaView>
  );
}