import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RequestCard } from '@/components/ui/RequestCard';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RequestsScreen() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const requests = [
    { 
      id: '#BOOKING 1', 
      date: '30/10/2019',
      status: 'New', 
      itemRequested: 'Electronics Shipment',
      priority: 'High',
      amount: 'RM 200',
      company: 'Capi Telecom',
      items: ['Laptop x2', 'Monitor x1', 'Cables x5'],
      invoiceStatus: 'Pending',
      total: 'RM 200'
    },
    { 
      id: '#BOOKING 2', 
      date: '30/10/2019',
      status: 'Delivered', 
      itemRequested: 'Office Supplies Transport',
      priority: 'Medium',
      amount: '$50',
      company: 'Capi Telecom',
      items: ['Paper x10', 'Pens x20', 'Folders x5'],
      invoiceStatus: 'Paid',
      total: '$50'
    },
    { 
      id: '#BOOKING 3', 
      date: '29/10/2019',
      status: 'In Transit', 
      itemRequested: 'Software Equipment',
      priority: 'Low',
      amount: '$150',
      company: 'Tech Solutions',
      items: ['Server x1', 'Router x2'],
      invoiceStatus: 'Invoiced',
      total: '$150'
    },
    { 
      id: '#BOOKING 4', 
      date: '28/10/2019',
      status: 'Picked up', 
      itemRequested: 'Maintenance Equipment',
      priority: 'High',
      amount: '$300',
      company: 'Service Pro',
      items: ['Tools x1 set', 'Parts x various'],
      invoiceStatus: 'Pending',
      total: '$300'
    },
    { 
      id: '#BOOKING 5', 
      date: '27/10/2019',
      status: 'Delivered', 
      itemRequested: 'Training Materials',
      priority: 'Low',
      amount: '$75',
      company: 'EduTech',
      items: ['Books x5', 'DVDs x3', 'Manuals x2'],
      invoiceStatus: 'Paid',
      total: '$75'
    },
  ];

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
              key={request.id}
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
