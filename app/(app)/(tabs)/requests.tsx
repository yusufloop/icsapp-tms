import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RequestCard } from '@/components/ui/RequestCard';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface BookingRequest {
  id: string;
  date: string;
  status: string;
  itemRequested: string;
  priority: string;
  amount: string;
  company: string;
  items: string[];
  invoiceStatus: string;
  total: string;
}

export default function RequestsScreen() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`*,
          booking_statuses!inner(
            status_id,
            statuses_master(
              status_id,
              status_value
            )
          )`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format for the RequestCard component
      const transformedData: BookingRequest[] = data.map(booking => {
        // Get status from the joined booking_statuses and statuses_master tables
        const statusValue = booking.booking_statuses?.statuses_master?.status_value || 'Pending';
        
        // Format the date
        const formattedDate = booking.date_booking 
          ? new Date(booking.date_booking).toLocaleDateString() 
          : new Date(booking.created_at).toLocaleDateString();
        
        // Generate a priority based on status
        let priority = 'Medium';
        if (statusValue === 'New' || statusValue === 'Pending') priority = 'High';
        if (statusValue === 'Delivered') priority = 'Low';
        
        // Generate an amount based on container size
        const baseAmount = booking.container_size === '40ft' ? 5000 : 3000;
        const amount = `RM ${baseAmount}`;
        const total = `RM ${baseAmount}`;
        
        // Create a route description from pickup and delivery states
        const routeDescription = `${booking.pickup_state || 'Origin'} to ${booking.delivery_state || 'Destination'}`;
        
        // Create items array based on shipment details
        const items = [
          `${booking.shipment_type || 'FCL'} - ${booking.container_size || '20ft'}`
        ];
        
        return {
          id: booking.booking_id,
          date: formattedDate,
          status: statusValue,
          itemRequested: routeDescription,
          priority,
          amount: amount,
          company: booking.consignee || 'Client',
          items: items,
          invoiceStatus: 'Pending',
          total: total
        };
      });

      setRequests(transformedData);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCardToggle = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCreateRequest = () => {
    router.push('/new-booking');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-6 bg-bg-secondary shadow-lg">
          <MaterialIcons 
            name="local-shipping" 
            size={28} 
            color="#0A84FF" 
          />
          <Text className="text-3xl font-bold text-text-primary ml-4 leading-tight">
            Booking
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 pt-8">
          <PremiumCard className="shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons 
                name="search" 
                size={22} 
                color="#8A8A8E"
                style={{ marginRight: 14 }}
              />
              <TextInput
                placeholder="Search bookings..."
                placeholderTextColor="#AEAEB2"
                className="flex-1 text-base text-text-primary leading-relaxed"
                style={{ fontFamily: 'System' }}
              />
            </View>
          </PremiumCard>
        </View>

        {/* Filter Controls */}
        <View className="flex-row items-center justify-between px-6 pt-2 mb-4">
          <View className="flex-row items-center space-x-8">
            <TouchableOpacity className="flex-row items-center py-3 px-2 active:opacity-80 active:scale-95">
              <MaterialIcons 
                name="sort" 
                size={22} 
                color="#8A8A8E"
                style={{ marginRight: 6 }}
              />
              <Text className="text-base text-text-secondary font-medium">
                Sort
              </Text>
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={22} 
                color="#8A8A8E"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-3 px-2 active:opacity-80 active:scale-95">
              <MaterialIcons 
                name="tune" 
                size={22} 
                color="#8A8A8E"
                style={{ marginRight: 6 }}
              />
              <Text className="text-base text-text-secondary font-medium">
                Filter
              </Text>
              <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-3 shadow-sm">
                <Text className="text-white text-xs font-bold">
                  2
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="bg-gradient-to-br from-[#409CFF] to-[#0A84FF] rounded-xl w-12 h-12 items-center justify-center shadow-lg active:opacity-90 active:scale-95"
            onPress={handleCreateRequest}
          >
            <MaterialIcons 
              name="add" 
              size={36} 
              color="#0d19ffff"
            />
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <View className="px-6">
          {requests.map((request, index) => (
            <Animated.View
              key={request.id || index}
              entering={FadeInDown.delay(index * 100).duration(300)}
            >
              <RequestCard
                id={request.id}
                date={request.date}
                status={request.status}
                itemRequested={request.itemRequested}
                priority={request.priority}
                amount={request.amount}
                company={request.company}
                items={request.items}
                invoiceStatus={request.invoiceStatus}
                total={request.total}
                isExpanded={expandedCards.has(request.id)}
                onToggle={() => handleCardToggle(request.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
    
  );
}