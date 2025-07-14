import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { DesignSystem } from '@/constants/DesignSystem';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  sender?: string;
}

export default function WebNotificationsScreen() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Mock data for notifications
  const notifications: NotificationData[] = [
    {
      id: '1',
      title: 'New Booking Request',
      message: 'A new booking request #BOOKING123 has been submitted and requires approval.',
      type: 'info',
      timestamp: '2025-01-14 09:30',
      isRead: false,
      sender: 'John Doe'
    },
    {
      id: '2',
      title: 'Booking Approved',
      message: 'Booking request #BOOKING122 has been approved and is ready for processing.',
      type: 'success',
      timestamp: '2025-01-14 08:45',
      isRead: true,
      sender: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Urgent: Delivery Delay',
      message: 'Shipment #SHIP456 is experiencing delays due to weather conditions.',
      type: 'warning',
      timestamp: '2025-01-13 17:20',
      isRead: false,
      sender: 'System'
    },
    {
      id: '4',
      title: 'Booking Rejected',
      message: 'Booking request #BOOKING121 has been rejected. Please review and resubmit.',
      type: 'error',
      timestamp: '2025-01-13 14:15',
      isRead: true,
      sender: 'Mike Johnson'
    },
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'read' && notification.isRead) ||
                         (filter === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesFilter;
  });

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
    if (selectedRows.size === filteredNotifications.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      default:
        return 'notifications';
    }
  };

  const getStatusType = (type: string): 'info' | 'warning' | 'success' | 'error' => {
    return type as 'info' | 'warning' | 'success' | 'error';
  };

  const handleMarkAsRead = () => {
    // Handle mark selected as read
    console.log('Mark as read:', Array.from(selectedRows));
  };

  const handleDelete = () => {
    // Handle delete selected
    console.log('Delete:', Array.from(selectedRows));
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Bar */}
      <View className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
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
                placeholder="Search notifications..."
                placeholderTextColor={DesignSystem.colors.text.tertiary}
                className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                style={{ fontSize: 14 }}
              />
            </View>
          </View>

          {/* Right Side Controls */}
          <View className="flex-row items-center space-x-4 ml-6">
            {/* Filter Buttons */}
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              {['all', 'unread', 'read'].map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  onPress={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-md ${
                    filter === filterType ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Text className={`text-sm font-medium capitalize ${
                    filter === filterType ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {filterType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            {selectedRows.size > 0 && (
              <>
                <TouchableOpacity 
                  onPress={handleMarkAsRead}
                  className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
                >
                  <MaterialIcons name="mark-email-read" size={20} color={DesignSystem.colors.primary[500]} />
                  <Text className="ml-2 text-blue-700 font-medium">Mark Read</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleDelete}
                  className="flex-row items-center bg-red-50 border border-red-200 rounded-lg px-4 py-3"
                >
                  <MaterialIcons name="delete" size={20} color={DesignSystem.colors.destructive[500]} />
                  <Text className="ml-2 text-red-700 font-medium">Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Content View */}
      <View className="flex-1 p-6">
        <PremiumCard className="flex-1">
          {/* Title */}
          <View className="px-6 py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-900">Notifications</Text>
              <View className="flex-row items-center space-x-4">
                <Text className="text-sm text-gray-500">
                  {filteredNotifications.filter(n => !n.isRead).length} unread
                </Text>
                <PremiumStatusBadge 
                  status="info" 
                  text={`${filteredNotifications.length} total`}
                  size="sm"
                />
              </View>
            </View>
          </View>

          {/* Data Table */}
          <ScrollView className="flex-1">
            {/* Table Header */}
            <View className="bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center px-6 py-4">
                {/* Checkbox Column */}
                <TouchableOpacity 
                  onPress={handleSelectAll}
                  className="w-12 items-center"
                >
                  <View className={`w-5 h-5 border-2 rounded ${
                    selectedRows.size === filteredNotifications.length && filteredNotifications.length > 0
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  } items-center justify-center`}>
                    {selectedRows.size === filteredNotifications.length && filteredNotifications.length > 0 && (
                      <MaterialIcons name="check" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Table Headers */}
                <View className="flex-1 flex-row">
                  <Text className="w-12 text-sm font-semibold text-gray-700">Type</Text>
                  <Text className="flex-1 text-sm font-semibold text-gray-700">Title</Text>
                  <Text className="w-64 text-sm font-semibold text-gray-700">Message</Text>
                  <Text className="w-32 text-sm font-semibold text-gray-700">Sender</Text>
                  <Text className="w-32 text-sm font-semibold text-gray-700">Time</Text>
                  <Text className="w-20 text-sm font-semibold text-gray-700">Status</Text>
                </View>
              </View>
            </View>

            {/* Table Rows */}
            {filteredNotifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <View className="flex-row items-center px-6 py-4">
                  {/* Checkbox */}
                  <TouchableOpacity 
                    onPress={() => handleRowSelect(notification.id)}
                    className="w-12 items-center"
                  >
                    <View className={`w-5 h-5 border-2 rounded ${
                      selectedRows.has(notification.id) 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    } items-center justify-center`}>
                      {selectedRows.has(notification.id) && (
                        <MaterialIcons name="check" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Table Data */}
                  <View className="flex-1 flex-row items-center">
                    <View className="w-12 items-center">
                      <MaterialIcons 
                        name={getTypeIcon(notification.type) as any} 
                        size={20} 
                        color={
                          notification.type === 'info' ? DesignSystem.colors.primary[500] :
                          notification.type === 'warning' ? DesignSystem.colors.status.warning :
                          notification.type === 'success' ? DesignSystem.colors.status.success :
                          DesignSystem.colors.destructive[500]
                        }
                      />
                    </View>
                    <Text className={`flex-1 text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </Text>
                    <Text className="w-64 text-sm text-gray-600 truncate">
                      {notification.message}
                    </Text>
                    <Text className="w-32 text-sm text-gray-700">
                      {notification.sender}
                    </Text>
                    <Text className="w-32 text-sm text-gray-700">
                      {notification.timestamp}
                    </Text>
                    <View className="w-20">
                      <View className={`w-3 h-3 rounded-full ${
                        notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {filteredNotifications.length === 0 && (
              <View className="flex-1 items-center justify-center py-12">
                <MaterialIcons name="notifications-none" size={48} color={DesignSystem.colors.text.tertiary} />
                <Text className="text-gray-500 mt-4">No notifications found</Text>
              </View>
            )}
          </ScrollView>
        </PremiumCard>
      </View>
    </View>
  );
}
