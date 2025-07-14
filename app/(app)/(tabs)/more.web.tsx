import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  category: string;
}

export default function WebMoreScreen() {
  const menuItems: MenuItem[] = [
    // Navigation
    { id: 'dashboard', title: 'Dashboard', description: 'View system overview and analytics', icon: 'dashboard', route: '/', category: 'Navigation' },
    { id: 'requests', title: 'My Requests', description: 'Manage booking requests', icon: 'local-shipping', route: '/requests', category: 'Navigation' },
    { id: 'notifications', title: 'Notifications', description: 'View system notifications', icon: 'notifications', route: '/notifications', category: 'Navigation' },
    { id: 'scan', title: 'QR Scan', description: 'Scan QR codes for quick access', icon: 'qr-code-scanner', route: '/scan', category: 'Navigation' },
    { id: 'users', title: 'Users', description: 'Manage system users', icon: 'people', route: '/user', category: 'Navigation' },
    
    // Create New
    { id: 'new-booking', title: 'New Booking', description: 'Create a new booking request', icon: 'add-box', route: '/new-booking', category: 'Create New' },
    { id: 'new-request', title: 'New Request', description: 'Submit a new request for approval', icon: 'note-add', route: '/new-request', category: 'Create New' },
    { id: 'new-user', title: 'New User', description: 'Add a new user to the system', icon: 'person-add', route: '/new-user', category: 'Create New' },
    
    // Request Management
    { id: 'view-request', title: 'View Request', description: 'View detailed request information', icon: 'visibility', route: '/view-request', category: 'Request Management' },
    { id: 'resubmit-request', title: 'Resubmit Request', description: 'Resubmit a rejected request', icon: 'refresh', route: '/resubmit-request', category: 'Request Management' },
    { id: 'recall-request', title: 'Recall Request', description: 'Recall a submitted request', icon: 'undo', route: '/recall', category: 'Request Management' },
    
    // User Management
    { id: 'edit-user', title: 'Edit User', description: 'Modify user information and settings', icon: 'edit', route: '/edit-user', category: 'User Management' },
    
    // Reports
    { id: 'summary', title: 'Summary Report', description: 'View comprehensive system reports', icon: 'assessment', route: '/summary', category: 'Reports' },
    
    // Support
    { id: 'help', title: 'Help & Support', description: 'Get help and support resources', icon: 'help', route: '/help', category: 'Support' },
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation':
        return 'navigation';
      case 'Create New':
        return 'add-circle';
      case 'Request Management':
        return 'assignment';
      case 'User Management':
        return 'manage-accounts';
      case 'Reports':
        return 'analytics';
      case 'Support':
        return 'support';
      default:
        return 'folder';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Bar */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center">
          <MaterialIcons name="more-horiz" size={28} color={DesignSystem.colors.primary[500]} />
          <Text className="text-2xl font-bold text-gray-900 ml-4">More Options</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-6">
        <View className="max-w-6xl mx-auto">
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} className="mb-8">
              {/* Category Header */}
              <View className="flex-row items-center mb-4">
                <MaterialIcons 
                  name={getCategoryIcon(category) as any} 
                  size={24} 
                  color={DesignSystem.colors.primary[500]} 
                />
                <Text className="text-lg font-semibold text-gray-900 ml-3 uppercase tracking-wide">
                  {category}
                </Text>
              </View>

              {/* Category Items Grid */}
              <View className="flex-row flex-wrap -mx-3">
                {items.map((item) => (
                  <View key={item.id} className="w-1/2 lg:w-1/3 xl:w-1/4 px-3 mb-4">
                    <TouchableOpacity
                      onPress={() => handleItemPress(item.route)}
                      className="h-full"
                    >
                      <PremiumCard className="h-full p-6 hover:shadow-lg transition-all duration-200">
                        <View className="items-center text-center">
                          {/* Icon */}
                          <View 
                            className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                            style={{ backgroundColor: DesignSystem.colors.primary[50] }}
                          >
                            <MaterialIcons 
                              name={item.icon} 
                              size={32} 
                              color={DesignSystem.colors.primary[500]} 
                            />
                          </View>

                          {/* Title */}
                          <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
                            {item.title}
                          </Text>

                          {/* Description */}
                          <Text className="text-sm text-gray-600 text-center leading-relaxed">
                            {item.description}
                          </Text>
                        </View>

                        {/* Hover Arrow */}
                        <View className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MaterialIcons 
                            name="arrow-forward" 
                            size={20} 
                            color={DesignSystem.colors.text.secondary} 
                          />
                        </View>
                      </PremiumCard>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Footer Info */}
          <View className="mt-12 pt-8 border-t border-gray-200">
            <PremiumCard className="p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    ICS Boltz TMS
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Transportation Management System v1.0.0
                  </Text>
                </View>
                
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity className="flex-row items-center bg-gray-50 rounded-lg px-4 py-2">
                    <MaterialIcons name="info" size={20} color={DesignSystem.colors.text.secondary} />
                    <Text className="ml-2 text-gray-700 font-medium">About</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-row items-center bg-gray-50 rounded-lg px-4 py-2">
                    <MaterialIcons name="settings" size={20} color={DesignSystem.colors.text.secondary} />
                    <Text className="ml-2 text-gray-700 font-medium">Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </PremiumCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
