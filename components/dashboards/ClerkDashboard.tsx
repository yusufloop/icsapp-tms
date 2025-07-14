import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { getBookingStats, getRecentBookings, type Booking, type BookingStats } from '@/services/bookingService';
import { DashboardProps } from '@/types/dashboard';

interface ClerkStats {
  pendingBookings: number;
  inTransitBookings: number;
  deliveredBookings: number;
  totalBookings: number;
}

export default function ClerkDashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [clerkStats, setClerkStats] = useState<ClerkStats>({
    pendingBookings: 0,
    inTransitBookings: 0,
    deliveredBookings: 0,
    totalBookings: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent bookings and stats in parallel
        const [bookingsData, statsData] = await Promise.all([
          getRecentBookings(10),
          getBookingStats()
        ]);

        setRecentBookings(bookingsData);
        setClerkStats({
          pendingBookings: statsData.pending,
          inTransitBookings: statsData.inTransit,
          deliveredBookings: statsData.delivered,
          totalBookings: statsData.totalBookings
        });
        
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

  const getStatusConfig = (entityType?: string, statusValue?: string) => {
    const status = statusValue?.toLowerCase() || '';
    const entity = entityType?.toLowerCase() || '';
    
    if (entity === 'booking' || entity === 'shipment') {
      if (status.includes('transit') || status.includes('shipping') || status.includes('in_transit')) {
        return { type: 'info' as const, color: '#3B82F6' };
      } else if (status.includes('delivered') || status.includes('completed')) {
        return { type: 'success' as const, color: '#10B981' };
      } else if (status.includes('pending') || status.includes('processing') || status.includes('created')) {
        return { type: 'warning' as const, color: '#F59E0B' };
      }
    }
    return { type: 'neutral' as const, color: '#6B7280' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Action handlers
  const handleUpdateBookingStatus = () => router.push('/requests');
  const handleGenerateInvoice = () => router.push('/invoice');
  const handleViewBookingDetails = (bookingId: string) => {
    console.log('View booking details:', bookingId);
    // Navigate to booking details page
  };

  const retryLoadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getRecentBookings(10),
        getBookingStats()
      ]);

      setRecentBookings(bookingsData);
      setClerkStats({
        pendingBookings: statsData.pending,
        inTransitBookings: statsData.inTransit,
        deliveredBookings: statsData.delivered,
        totalBookings: statsData.totalBookings
      });
      
      setError(null);
    } catch (err) {
      console.error('Retry failed:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            onPress={retryLoadData}
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
                  <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="inventory" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.totalBookings}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Total Bookings
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-yellow-100 items-center justify-center mr-3">
                    <MaterialIcons name="schedule" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.pendingBookings}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Pending Bookings
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="local-shipping" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.inTransitBookings}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      In Transit
                    </Text>
                  </View>
                </View>
              </PremiumCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <PremiumCard>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center mr-3">
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {clerkStats.deliveredBookings}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Delivered
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

        {/* Recent Bookings */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Recent Bookings
            </Text>
            <TouchableOpacity onPress={() => router.push('/requests')}>
              <Text className="text-blue-500 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {recentBookings.slice(0, 5).map((booking) => (
              <TouchableOpacity
                key={booking.booking_id}
                onPress={() => handleViewBookingDetails(booking.booking_id)}
                activeOpacity={0.7}
              >
                <PremiumCard>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="font-semibold text-text-primary">
                      #{booking.booking_id.slice(0, 8)}
                    </Text>
                    <PremiumStatusBadge 
                      status={getStatusConfig(booking.entity_type, booking.status_value).type}
                      text={booking.status_value || 'Unknown'}
                      size="sm"
                    />
                  </View>
                  
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="location-on" size={16} color="#6B7280" />
                    <Text className="text-sm text-text-secondary ml-2">
                      {booking.pickup_state || 'N/A'} → {booking.delivery_state || 'N/A'}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <MaterialIcons name="inventory" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {booking.container_size || 'N/A'} - {booking.shipment_type || 'N/A'}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <MaterialIcons name="schedule" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {formatDate(booking.date_booking)}
                      </Text>
                    </View>
                  </View>

                  {booking.consignee && (
                    <View className="flex-row items-center mt-2">
                      <MaterialIcons name="person" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary ml-2">
                        Consignee: {booking.consignee}
                      </Text>
                    </View>
                  )}
                </PremiumCard>
              </TouchableOpacity>
            ))}

            {recentBookings.length === 0 && (
              <PremiumCard>
                <View className="items-center py-8">
                  <MaterialIcons name="inbox" size={48} color="#6B7280" />
                  <Text className="text-text-secondary mt-2">No bookings found</Text>
                </View>
              </PremiumCard>
            )}
          </View>
        </View>

        {/* System Status */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            System Status
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