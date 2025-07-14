import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DashboardProps } from '@/types/dashboard';
import { 
  getRecentClientBookings, 
  getClientBookingStats, 
  type Booking, 
  type BookingStats 
} from '@/services/bookingService';

export default function ClientDashboard({ user }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalBookings: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0
  });

  // Mock client ID - in real app this would come from authentication
  const clientId = user?.id || 'mock-client-id';

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client bookings and stats in parallel
        const [bookingsData, statsData] = await Promise.all([
          getRecentClientBookings(clientId, 5),
          getClientBookingStats(clientId)
        ]);

        setRecentBookings(bookingsData);
        setBookingStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Failed to load client dashboard data:', err);
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [clientId]);

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusConfig = (status?: string) => {
    const statusName = status?.toLowerCase() || '';
    if (statusName.includes('transit') || statusName.includes('shipping')) {
      return { type: 'info' as const, color: '#3B82F6' };
    } else if (statusName.includes('delivered') || statusName.includes('completed')) {
      return { type: 'success' as const, color: '#10B981' };
    } else if (statusName.includes('pending') || statusName.includes('processing')) {
      return { type: 'warning' as const, color: '#F59E0B' };
    } else {
      return { type: 'neutral' as const, color: '#6B7280' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  // Quick action handlers
  const handleTrackShipment = () => console.log('Navigate to shipment tracking');
  const handleViewInvoices = () => console.log('Navigate to invoices');
  const handleViewBooking = (bookingId: string) => console.log('View booking:', bookingId);
  const handleNewBooking = () => console.log('Navigate to new booking');

  const retryLoadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getRecentClientBookings(clientId, 5),
        getClientBookingStats(clientId)
      ]);

      setRecentBookings(bookingsData);
      setBookingStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Retry failed:', err);
      setError('Failed to load your bookings. Please try again.');
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

        {/* Booking Stats */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Your Bookings Overview
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
                      {bookingStats.totalBookings}
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
                      {bookingStats.pending}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      Pending
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
                      {bookingStats.inTransit}
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
                      {bookingStats.delivered}
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
            <View className="w-1/3 px-2 mb-3">
              <PremiumButton
                title="New Booking"
                onPress={handleNewBooking}
                variant="gradient"
                size="sm"
                icon={<MaterialIcons name="add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              />
            </View>
            
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
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.booking_id}
                  onPress={() => handleViewBooking(booking.booking_id)}
                  activeOpacity={0.7}
                >
                  <PremiumCard>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="font-semibold text-text-primary text-lg">
                        #{booking.booking_id.slice(0, 8)}
                      </Text>
                      <PremiumStatusBadge 
                        status={getStatusConfig(booking.status_name).type}
                        text={booking.status_name || 'Unknown'}
                        size="sm"
                      />
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="location-on" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary ml-2">
                        {booking.pickup_state || 'N/A'} → {booking.delivery_state || 'N/A'}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <MaterialIcons name="inventory" size={16} color="#6B7280" />
                        <Text className="text-sm text-text-secondary ml-2">
                          {booking.container_size || 'N/A'}
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

                    {booking.pickup_time && (
                      <View className="flex-row items-center mt-2">
                        <MaterialIcons name="access-time" size={16} color="#6B7280" />
                        <Text className="text-sm text-text-secondary ml-2">
                          Pickup: {formatDateTime(booking.pickup_time)}
                        </Text>
                      </View>
                    )}

                    {booking.delicery_time && (
                      <View className="flex-row items-center mt-2">
                        <MaterialIcons name="local-shipping" size={16} color="#6B7280" />
                        <Text className="text-sm text-text-secondary ml-2">
                          Delivery: {formatDateTime(booking.delicery_time)}
                        </Text>
                      </View>
                    )}
                  </PremiumCard>
                </TouchableOpacity>
              ))
            ) : (
              <PremiumCard>
                <View className="items-center py-8">
                  <MaterialIcons name="inbox" size={48} color="#6B7280" />
                  <Text className="text-text-secondary mt-2 text-center">
                    No bookings found
                  </Text>
                  <Text className="text-text-secondary text-sm mt-1 text-center">
                    Create your first booking to get started
                  </Text>
                  <TouchableOpacity
                    onPress={handleNewBooking}
                    className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Create Booking</Text>
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            )}
          </View>
        </View>

        {/* Help Section */}
        <View className="px-6 pt-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Need Help?
          </Text>
          
          <PremiumCard>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="help" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">
                  Contact Support
                </Text>
                <Text className="text-sm text-text-secondary">
                  Get assistance with your bookings and shipments
                </Text>
              </View>
              <TouchableOpacity className="bg-blue-100 rounded-lg p-2">
                <MaterialIcons name="chat" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}