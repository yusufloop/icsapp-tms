import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View, Image } from 'react-native';
import { router } from 'expo-router';
import { PremiumCard } from './PremiumCard';
import { 
  ICSBOLTZ_CURRENT_USER_ROLE, 
  getCurrentUserActions,
  type ButtonAction,
  type UserRole 
} from '../../constants/UserRoles';

interface UserCardProps {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  status: 'online' | 'active' | 'suspended' | 'terminated';
  role: UserRole;
  isExpanded: boolean;
  onToggle: () => void;
}

export function UserCard({
  id,
  name,
  phoneNumber,
  profilePicture,
  status,
  role,
  isExpanded,
  onToggle,
}: UserCardProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const toValue = isExpanded ? 1 : 0;
    
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? contentHeight : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded, contentHeight]);

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'online':
        return {
          color: '#30D158',
          bgColor: '#30D158',
          icon: 'radio-button-checked',
          textClass: 'text-green-500',
        };
      case 'active':
        return {
          color: '#0A84FF',
          bgColor: '#0A84FF',
          icon: 'check-circle',
          textClass: 'text-blue-500',
        };
      case 'suspended':
        return {
          color: '#FF9F0A',
          bgColor: '#FF9F0A',
          icon: 'pause',
          textClass: 'text-orange-500',
        };
      case 'terminated':
        return {
          color: '#FF453A',
          bgColor: '#FF453A',
          icon: 'close',
          textClass: 'text-red-500',
        };
      default:
        return {
          color: '#8A8A8E',
          bgColor: '#8A8A8E',
          icon: 'circle',
          textClass: 'text-gray-500',
        };
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'CLERK':
        return 'Clerk';
      case 'DRIVER':
        return 'Driver';
      case 'CLIENT':
        return 'Client';
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

  const statusConfig = getStatusConfig(status);

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContentHeight(height);
    }
  };

  // User action handlers
  const handleViewProfile = () => {
    console.log('View Profile action for user', id);
    // TODO: Implement view profile functionality
  };

  const handleEditUser = () => {
    // Navigate to edit user page with user data as parameters
    router.push({
      pathname: '/edit-user',
      params: {
        id,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@company.com`, // Generate email for demo
        phoneNo: phoneNumber,
        role,
        status,
        profileImage: profilePicture || '',
      },
    });
  };

  const handleSuspendUser = () => {
    console.log('Suspend User action for user', id);
    // TODO: Implement suspend user functionality
  };

  const handleActivateUser = () => {
    console.log('Activate User action for user', id);
    // TODO: Implement activate user functionality
  };

  const handleDeleteUser = () => {
    console.log('Delete User action for user', id);
    // TODO: Implement delete user functionality
  };

  return (
    <View className="mb-4">
      <PremiumCard className="overflow-hidden" padding="p-0">
        {/* Header Section - Always Visible */}
        <View className="p-5">
          {/* Top Row: Profile Picture, Name, and Status */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-4"
          >
            <View className="flex-row items-center flex-1">
              {/* Profile Picture */}
              <View className="relative mr-4">
                {profilePicture ? (
                  <Image 
                    source={{ uri: profilePicture }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                    <MaterialIcons name="person" size={24} color="#8A8A8E" />
                  </View>
                )}
                
                {/* Status Dot */}
                <View 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: statusConfig.bgColor }}
                >
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons 
                      name={statusConfig.icon as any} 
                      size={10} 
                      color="white" 
                    />
                  </View>
                </View>
              </View>
              
              {/* Name and Phone */}
              <View className="flex-1">
                <Text className="text-lg font-bold text-text-primary mb-1">
                  {name}
                </Text>
                <Text className="text-sm text-text-secondary font-medium">
                  {phoneNumber}
                </Text>
              </View>
            </View>
            
            <Animated.View 
              className="bg-gray-50 rounded-lg p-2"
              style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={22} 
                color="#8A8A8E"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Expandable Content */}
        <Animated.View 
          style={{ 
            height: animatedHeight,
            opacity: animatedOpacity,
          }}
          className="overflow-hidden"
        >
          <View
            onLayout={handleContentLayout}
            className="absolute w-full"
          >
            <View className="px-5 pb-12">
              {/* Separator */}
              <View className="h-px bg-gray-100 mb-5" />
              
              {/* Details Section */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                {/* Role */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-text-secondary font-medium">
                    Role
                  </Text>
                  <Text className="text-base font-semibold text-primary">
                    {getRoleDisplayName(role)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons - Edit & Delete - Similar to booking card layout */}
              {ICSBOLTZ_CURRENT_USER_ROLE === 'ADMIN' && (
                <View className="space-y-3">
                  {/* Edit & Delete - Side by side buttons */}
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      onPress={handleEditUser}
                      className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row mr-3"
                    >
                      <MaterialIcons name="edit" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                      <Text className="text-base font-semibold text-gray-600">Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleDeleteUser}
                      className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row"
                    >
                      <MaterialIcons name="delete" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                      <Text className="text-base font-semibold text-gray-600">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Non-admin message */}
              {ICSBOLTZ_CURRENT_USER_ROLE !== 'ADMIN' && (
                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-center text-text-secondary text-sm">
                    User management actions require administrator privileges
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </PremiumCard>
    </View>
  );
}
