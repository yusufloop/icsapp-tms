import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import { UserRole } from '@/constants/UserRoles';

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  department: string;
  status: 'online' | 'active' | 'suspended' | 'terminated';
  lastLogin: string;
  profilePicture?: string;
}

export default function WebUsersScreen() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'active' | 'suspended' | 'terminated'>('all');

  // Animation refs for each row
  const animationRefs = useRef<{ [key: string]: { height: Animated.Value; opacity: Animated.Value; rotation: Animated.Value } }>({});

  // Mock data for the users table
  const users: UserData[] = [
    {
      id: 'USR001',
      name: 'Ahmad Rahman',
      email: 'ahmad.rahman@company.com',
      phoneNumber: '+60 12-345 6789',
      role: 'ADMIN',
      department: 'IT',
      status: 'online',
      lastLogin: '2025-01-14 09:30'
    },
    {
      id: 'USR002',
      name: 'Sarah Lim',
      email: 'sarah.lim@company.com',
      phoneNumber: '+60 11-234 5678',
      role: 'GENERAL_MANAGER',
      department: 'Operations',
      status: 'active',
      lastLogin: '2025-01-14 08:45'
    },
    {
      id: 'USR003',
      name: 'Muhammad Faiz',
      email: 'muhammad.faiz@company.com',
      phoneNumber: '+60 13-456 7890',
      role: 'HEAD_OF_DEPARTMENT',
      department: 'Logistics',
      status: 'active',
      lastLogin: '2025-01-13 17:20'
    },
    {
      id: 'USR004',
      name: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      phoneNumber: '+60 14-567 8901',
      role: 'REQUESTER',
      department: 'Sales',
      status: 'suspended',
      lastLogin: '2025-01-10 14:15'
    },
    {
      id: 'USR005',
      name: 'Emily Chen',
      email: 'emily.chen@company.com',
      phoneNumber: '+60 18-901 2345',
      role: 'REQUESTER',
      department: 'Marketing',
      status: 'online',
      lastLogin: '2025-01-14 11:20'
    },
  ];

  // Initialize animation values for each user
  const getAnimationValues = (userId: string) => {
    if (!animationRefs.current[userId]) {
      animationRefs.current[userId] = {
        height: new Animated.Value(0),
        opacity: new Animated.Value(0),
        rotation: new Animated.Value(0),
      };
    }
    return animationRefs.current[userId];
  };

  const handleRowToggle = (userId: string) => {
    const newExpandedRows = new Set(expandedRows);
    const isExpanded = newExpandedRows.has(userId);
    
    if (isExpanded) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);

    // Animate the dropdown
    const animations = getAnimationValues(userId);
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(animations.height, {
        toValue: isExpanded ? 0 : 120, // Fixed height for dropdown content
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animations.opacity, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(animations.rotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filteredUserIds = getFilteredUsers().map(u => u.id);
    if (selectedRows.size === filteredUserIds.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredUserIds));
    }
  };

  const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'online':
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
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

  const getFilteredUsers = () => {
    let filtered = users;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phoneNumber.includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') {
      return users.length;
    }
    return users.filter(user => user.status === status).length;
  };

  const handleNewUser = () => {
    router.push('/new-user');
  };

  const handleEditUser = (user: UserData) => {
    router.push({
      pathname: '/edit-user',
      params: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNumber,
        role: user.role,
        status: user.status,
        profileImage: user.profilePicture || '',
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    // TODO: Implement delete functionality
  };

  const filteredUsers = getFilteredUsers();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Bar */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="max-w-6xl mx-auto w-full">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-text-primary">Users</Text>
            <TouchableOpacity 
              onPress={handleNewUser}
              className="bg-primary rounded-full p-2"
              activeOpacity={0.7}
            >
              <MaterialIcons name="person-add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search and Filter Row */}
          <View className="flex-row items-center justify-between">
            {/* Search Input */}
            <View className="flex-1 max-w-md">
              <View className="relative">
                <MaterialIcons 
                  name="search" 
                  size={20} 
                  color={DesignSystem.colors.text.secondary}
                  style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search users..."
                  placeholderTextColor={DesignSystem.colors.text.tertiary}
                  className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                  style={{ fontSize: 14 }}
                />
              </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row ml-6"
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
                  className={`mr-3 px-4 py-2 rounded-full border ${
                    filterStatus === filter.key
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold text-sm ${
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
        </View>
      </View>

      {/* Content View */}
      <ScrollView className="flex-1 p-6">
        <View className="max-w-6xl mx-auto w-full">
          <PremiumCard className="flex-1">
            {/* Title */}
            <View className="px-6 py-4 border-b border-gray-100">
              <Text className="text-xl font-semibold text-gray-900">User Management</Text>
            </View>

            {/* Data Table */}
            <View className="flex-1">
              {/* Table Header */}
              <View className="bg-gray-50 border-b border-gray-200">
                <View className="flex-row items-center px-6 py-4">
                  {/* Checkbox Column */}
                  <TouchableOpacity 
                    onPress={handleSelectAll}
                    className="w-12 items-center"
                  >
                    <View className={`w-5 h-5 border-2 rounded ${
                      selectedRows.size === filteredUsers.length && filteredUsers.length > 0
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    } items-center justify-center`}>
                      {selectedRows.size === filteredUsers.length && filteredUsers.length > 0 && (
                        <MaterialIcons name="check" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Table Headers */}
                  <View className="flex-1 flex-row items-center">
                    <Text className="flex-1 text-sm font-semibold text-gray-700">Name</Text>
                    <Text className="w-48 text-sm font-semibold text-gray-700">Email</Text>
                    <Text className="w-32 text-sm font-semibold text-gray-700">Role</Text>
                    <Text className="w-32 text-sm font-semibold text-gray-700">Department</Text>
                    <Text className="w-32 text-sm font-semibold text-gray-700">Last Login</Text>
                    <Text className="w-24 text-sm font-semibold text-gray-700">Status</Text>
                    <View className="w-12" />
                  </View>
                </View>
              </View>

              {/* Table Rows */}
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => {
                  const isExpanded = expandedRows.has(user.id);
                  const animations = getAnimationValues(user.id);
                  
                  const rotateInterpolate = animations.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  });

                  return (
                    <View key={user.id} className="border-b border-gray-100">
                      {/* Main Row */}
                      <View className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <View className="flex-row items-center px-6 py-4">
                          {/* Checkbox */}
                          <TouchableOpacity 
                            onPress={() => handleRowSelect(user.id)}
                            className="w-12 items-center"
                          >
                            <View className={`w-5 h-5 border-2 rounded ${
                              selectedRows.has(user.id) 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            } items-center justify-center`}>
                              {selectedRows.has(user.id) && (
                                <MaterialIcons name="check" size={14} color="white" />
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* Table Data */}
                          <View className="flex-1 flex-row items-center">
                            <View className="flex-1 flex-row items-center">
                              <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-3">
                                <MaterialIcons name="person" size={16} color={DesignSystem.colors.text.secondary} />
                              </View>
                              <Text className="text-sm font-medium text-gray-900">{user.name}</Text>
                            </View>
                            <Text className="w-48 text-sm text-gray-700">{user.email}</Text>
                            <Text className="w-32 text-sm text-gray-700">{getRoleDisplayName(user.role)}</Text>
                            <Text className="w-32 text-sm text-gray-700">{user.department}</Text>
                            <Text className="w-32 text-sm text-gray-700">{user.lastLogin}</Text>
                            <View className="w-24">
                              <PremiumStatusBadge 
                                status={getStatusType(user.status)}
                                text={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                size="sm"
                              />
                            </View>
                            
                            {/* Dropdown Toggle */}
                            <TouchableOpacity
                              onPress={() => handleRowToggle(user.id)}
                              className="w-12 items-center justify-center"
                              activeOpacity={0.7}
                            >
                              <Animated.View 
                                className="bg-gray-50 rounded-lg p-2"
                                style={{ transform: [{ rotate: rotateInterpolate }] }}
                              >
                                <MaterialIcons 
                                  name="keyboard-arrow-down" 
                                  size={18} 
                                  color="#8A8A8E"
                                />
                              </Animated.View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Expandable Content */}
                      <Animated.View 
                        style={{ 
                          height: animations.height,
                          opacity: animations.opacity,
                        }}
                        className="overflow-hidden bg-gray-50"
                      >
                        <View className="px-6 py-4">
                          <View className="flex-row items-center justify-between">
                            {/* User Details */}
                            <View className="flex-1">
                              <Text className="text-sm font-medium text-gray-900 mb-2">User Details</Text>
                              <View className="flex-row space-x-6">
                                <View>
                                  <Text className="text-xs text-gray-500">Phone Number</Text>
                                  <Text className="text-sm text-gray-900">{user.phoneNumber}</Text>
                                </View>
                                <View>
                                  <Text className="text-xs text-gray-500">User ID</Text>
                                  <Text className="text-sm text-gray-900">{user.id}</Text>
                                </View>
                              </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row space-x-3">
                              <TouchableOpacity
                                onPress={() => handleEditUser(user)}
                                className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80"
                              >
                                <MaterialIcons name="edit" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                                <Text className="text-sm font-medium text-gray-600">Edit</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                onPress={() => handleDeleteUser(user.id)}
                                className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex-row items-center active:opacity-80"
                              >
                                <MaterialIcons name="delete" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                                <Text className="text-sm font-medium text-gray-600">Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Animated.View>
                    </View>
                  );
                })
              ) : (
                <View className="flex-1 items-center justify-center py-20">
                  <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-text-secondary mt-4">
                    No users found
                  </Text>
                  <Text className="text-text-tertiary text-center mt-2">
                    {searchQuery.trim() ? 'No users match your search criteria' : 'No users match the selected filter criteria'}
                  </Text>
                </View>
              )}
            </View>
          </PremiumCard>
        </View>
      </ScrollView>
    </View>
  );
}
