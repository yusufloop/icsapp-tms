import { UserCard } from '@/components/ui/UserCard';
import { UserRole } from '@/constants/UserRoles';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';


// Sample user data
const sampleUsers = [
  {
    id: 'USR001',
    name: 'Ahmad Rahman',
    phoneNumber: '+60 12-345 6789',
    profilePicture: undefined,
    status: 'online' as const,
    role: 'ADMIN' as UserRole,
  },
  {
    id: 'USR002',
    name: 'Sarah Lim',
    phoneNumber: '+60 11-234 5678',
    profilePicture: undefined,
    status: 'active' as const,
    role: 'CLERK' as UserRole,
  },
  {
    id: 'USR003',
    name: 'Muhammad Faiz',
    phoneNumber: '+60 13-456 7890',
    profilePicture: undefined,
    status: 'suspended' as const,
    role: 'DRIVER' as UserRole,
  },
  {
    id: 'USR004',
    name: 'Priya Sharma',
    phoneNumber: '+60 14-567 8901',
    profilePicture: undefined,
    status: 'online' as const,
    role: 'CLIENT' as UserRole,
  },
  
  
  
  {
    id: 'USR008',
    name: 'Emily Chen',
    phoneNumber: '+60 18-901 2345',
    profilePicture: undefined,
    status: 'suspended' as const,
    role: 'DRIVER' as UserRole,
  },
  {
    id: 'USR009',
    name: 'Michael Johnson',
    phoneNumber: '+60 19-012 3456',
    profilePicture: undefined,
    status: 'active' as const,
    role: 'CLERK' as UserRole,
  },
  {
    id: 'USR010',
    name: 'Anna Lee',
    phoneNumber: '+60 20-123 4567',
    profilePicture: undefined,
    status: 'online' as const,
    role: 'CLIENT' as UserRole,
  },
];

export default function UserScreen() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'active' | 'suspended' | 'terminated'>('all');

  const handleCardToggle = (userId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(userId)) {
      newExpandedCards.delete(userId);
    } else {
      newExpandedCards.add(userId);
    }
    setExpandedCards(newExpandedCards);
  };

  const getFilteredUsers = () => {
    if (filterStatus === 'all') {
      return sampleUsers;
    }
    return sampleUsers.filter(user => user.status === filterStatus);
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') {
      return sampleUsers.length;
    }
    return sampleUsers.filter(user => user.status === status).length;
  };

  const filteredUsers = getFilteredUsers();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-text-primary">Users</Text>
          <TouchableOpacity 
            className="bg-primary rounded-full p-2"
            onPress={() => router.push('/new-user')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person-add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[
            { key: 'all', label: 'All', count: getStatusCount('all') },
            { key: 'online', label: 'Online', count: getStatusCount('online') },
            { key: 'active', label: 'Active', count: getStatusCount('active') },
            { key: 'suspended', label: 'Suspended', count: getStatusCount('suspended') },
            { key: 'terminated', label: 'Terminated', count: getStatusCount('terminated') },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setFilterStatus(filter.key as any)}
              className={`mr-4 px-4 py-2 rounded-full border ${
                filterStatus === filter.key
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  filterStatus === filter.key
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* User List */}
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              name={user.name}
              phoneNumber={user.phoneNumber}
              profilePicture={user.profilePicture}
              status={user.status}
              role={user.role}
              isExpanded={expandedCards.has(user.id)}
              onToggle={() => handleCardToggle(user.id)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-text-secondary mt-4">
              No users found
            </Text>
            <Text className="text-text-tertiary text-center mt-2">
              No users match the selected filter criteria
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
