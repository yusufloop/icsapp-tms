import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';


interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'request' | 'approval' | 'system' | 'urgent';
  timestamp: string;
  isRead: boolean;
  requestId?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: 'NOT001',
    title: 'New Request Pending Approval',
    message: 'Request REQ-2024-001 for Office Supplies requires your approval.',
    type: 'request',
    timestamp: '2 minutes ago',
    isRead: false,
    requestId: 'REQ-2024-001',
  },
  {
    id: 'NOT002',
    title: 'Request Approved',
    message: 'Your approval for REQ-2024-002 has been processed successfully.',
    type: 'approval',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'NOT003',
    title: 'Urgent: High Priority Request',
    message: 'High priority request REQ-2024-003 needs immediate attention.',
    type: 'urgent',
    timestamp: '3 hours ago',
    isRead: true,
    requestId: 'REQ-2024-003',
  },
  {
    id: 'NOT004',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 11 PM to 2 AM.',
    type: 'system',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: 'NOT005',
    title: 'Request Rejected',
    message: 'Request REQ-2024-004 has been rejected. Please review feedback.',
    type: 'approval',
    timestamp: '2 days ago',
    isRead: true,
    requestId: 'REQ-2024-004',
  },
  {
    id: 'NOT006',
    title: 'New Request Submitted',
    message: 'A new request REQ-2024-005 has been submitted for your department.',
    type: 'request',
    timestamp: '3 days ago',
    isRead: true,
    requestId: 'REQ-2024-005',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'request' | 'approval' | 'system' | 'urgent'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return 'assignment';
      case 'approval':
        return 'check-circle';
      case 'system':
        return 'settings';
      case 'urgent':
        return 'priority-high';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'request':
        return '#0A84FF';
      case 'approval':
        return '#30D158';
      case 'system':
        return '#8A8A8E';
      case 'urgent':
        return '#FF453A';
      default:
        return '#0A84FF';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'request':
      case 'approval':
      case 'system':
      case 'urgent':
        return notifications.filter(n => n.type === filter);
      default:
        return notifications;
    }
  };

  const getFilterCount = (filterType: string) => {
    switch (filterType) {
      case 'unread':
        return notifications.filter(n => !n.isRead).length;
      case 'request':
      case 'approval':
      case 'system':
      case 'urgent':
        return notifications.filter(n => n.type === filterType).length;
      default:
        return notifications.length;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-text-primary">Notifications</Text>
            {unreadCount > 0 && (
              <View className="bg-red-500 rounded-full px-2 py-1 ml-3">
                <Text className="text-white text-xs font-bold">{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-primary rounded-lg px-3 py-2"
            >
              <Text className="text-white font-semibold text-sm">Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[
            { key: 'all', label: 'All', count: getFilterCount('all') },
            { key: 'unread', label: 'Unread', count: getFilterCount('unread') },
            { key: 'request', label: 'Requests', count: getFilterCount('request') },
            { key: 'approval', label: 'Approvals', count: getFilterCount('approval') },
            { key: 'urgent', label: 'Urgent', count: getFilterCount('urgent') },
            { key: 'system', label: 'System', count: getFilterCount('system') },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              onPress={() => setFilter(filterOption.key as any)}
              className={`mr-4 px-4 py-2 rounded-full border ${
                filter === filterOption.key
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  filter === filterOption.key
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}
              className="mb-4"
            >
              <PremiumCard className={`${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                <View className="flex-row items-start">
                  {/* Icon */}
                  <View 
                    className="rounded-full p-3 mr-4"
                    style={{ backgroundColor: getNotificationColor(notification.type) + '20' }}
                  >
                    <MaterialIcons 
                      name={getNotificationIcon(notification.type) as any} 
                      size={24} 
                      color={getNotificationColor(notification.type)} 
                    />
                  </View>
                  
                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className={`text-lg font-semibold ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'} flex-1 mr-2`}>
                        {notification.title}
                      </Text>
                      
                      {!notification.isRead && (
                        <View className="w-3 h-3 bg-primary rounded-full mt-1" />
                      )}
                    </View>
                    
                    <Text className="text-text-secondary leading-relaxed mb-3">
                      {notification.message}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-text-tertiary">
                        {notification.timestamp}
                      </Text>
                      
                      {notification.requestId && (
                        <PremiumStatusBadge 
                          text={notification.requestId}
                          status={notification.type === 'urgent' ? 'error' : 'info'} 
                          size="sm"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </PremiumCard>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="notifications-none" size={64} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-text-secondary mt-4">
              No notifications
            </Text>
            <Text className="text-text-tertiary text-center mt-2">
              No notifications match the selected filter
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
