import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { DashboardProps } from '@/types/dashboard';
import { mockClientData } from '@/data/mockData';

export default function ClientDashboard({ user }: DashboardProps) {
  const { recentBookings, clientStats, pendingInvoices } = mockClientData;

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'In Transit':
        return { type: 'info' as const, color: '#3B82F6' };
      case 'Delivered':
        return { type: 'success' as const, color: '#10B981' };
      case 'Processing':
        return { type: 'warning' as const, color: '#F59E0B' };
      case 'Pending':
        return { type: 'neutral' as const, color: '#6B7280' };
      default:
        return { type: 'neutral' as const, color: '#6B7280' };
    }
  };

  const getInvoiceStatusConfig = (status: string) => {
    switch (status) {
      case 'Paid':
        return { type: 'success' as const };
      case 'Pending':
        return { type: 'warning' as const };
      case 'Overdue':
        return { type: 'error' as const };
      default:
        return { type: 'neutral' as const };
    }
  };

  // Quick action handlers

  const handleTrackShipment = () => console.log('Navigate to shipment tracking');
  const handleViewInvoices = () => console.log('Navigate to invoices');
  const handleViewBooking = (bookingId: string) => console.log('View booking:', bookingId);
  const handlePayInvoice = (invoiceId: string) => console.log('Pay invoice:', invoiceId);

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
              <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                <MaterialIcons name="business" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">
                  {getUserGreeting()}
                </Text>
                <Text className="text-2xl font-bold text-text-primary">
                  {user?.name || 'Client Dashboard'}
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
              status="info" 
              text="Client"
              size="sm"
            />
          </View>
        </View>

        

        {/* Quick Actions */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
           
            
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="Track"
                onPress={handleTrackShipment}
                variant="secondary"
                size="sm"
                icon={<MaterialIcons name="track-changes" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
              />
            </View>
            
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="Invoices"
                onPress={handleViewInvoices}
                variant="secondary"
                size="sm"
                icon={<MaterialIcons name="receipt" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
              />
            </View>
          </View>
        </View>

        {/* Recent Bookings */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Recent Bookings
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-500 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {recentBookings.slice(0, 3).map((booking) => (
              <TouchableOpacity
                key={booking.id}
                onPress={() => handleViewBooking(booking.id)}
                activeOpacity={0.7}
              >
                <PremiumCard>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="font-semibold text-text-primary text-lg">
                      {booking.id}
                    </Text>
                    <PremiumStatusBadge 
                      status={getStatusConfig(booking.status).type}
                      text={booking.status}
                      size="sm"
                    />
                  </View>
                  
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="location-on" size={16} color="#6B7280" />
                    <Text className="text-sm text-text-secondary ml-2">
                      {booking.origin} → {booking.destination}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <MaterialIcons name="inventory" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {booking.containerType}
                      </Text>
                    </View>
                    
                    {booking.estimatedDelivery && (
                      <View className="flex-row items-center">
                        <MaterialIcons name="schedule" size={16} color="#6B7280" />
                        <Text className="text-sm text-text-secondary ml-2">
                          ETA: {booking.estimatedDelivery}
                        </Text>
                      </View>
                    )}
                  </View>
                </PremiumCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Invoices */}
        {pendingInvoices.length > 0 && (
          <View className="px-6 pt-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">
              Pending Invoices
            </Text>
            
            <View className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <PremiumCard key={invoice.id}>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="font-semibold text-text-primary">
                      {invoice.id}
                    </Text>
                    <PremiumStatusBadge 
                      status={getInvoiceStatusConfig(invoice.status).type}
                      text={invoice.status}
                      size="sm"
                    />
                  </View>
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-2xl font-bold text-text-primary">
                      RM {invoice.amount.toLocaleString()}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      Due: {invoice.dueDate}
                    </Text>
                  </View>
                  
                  <PremiumButton
                    title="Pay Now"
                    onPress={() => handlePayInvoice(invoice.id)}
                    variant="gradient"
                    size="sm"
                    icon={<MaterialIcons name="payment" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
                  />
                </PremiumCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}