import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import {
  getCurrentUserActions,
  subscribeToRoleChanges,
  type ButtonAction
} from '../../constants/UserRoles';
import { PremiumButton } from './PremiumButton';
import { PremiumCard } from './PremiumCard';
import { addApproval } from '@/services/approvalService';
import { Alert } from 'react-native';

interface RequestCardProps {
  id: string;
  date: string;
  status: string;
  itemRequested: string;
  priority: string;
  amount?: string;
  company?: string;
  items?: string[];
  invoiceStatus?: string;
  total?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function RequestCard({
  id,
  date,
  status,
  itemRequested,
  priority,
  amount,
  company,
  items,
  invoiceStatus,
  total,
  isExpanded,
  onToggle,
}: RequestCardProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const [allowedActions, setAllowedActions] = useState<ButtonAction[]>(getCurrentUserActions());
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  // Subscribe to role changes to update available actions
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges(() => {
      setAllowedActions(getCurrentUserActions());
    });

    return unsubscribe;
  }, []);

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
      case 'new':
        return {
          color: '#0A84FF',
          bgColor: '#E6F3FF',
          icon: 'fiber-new',
          textClass: 'text-blue-500',
        };
      case 'picked up':
        return {
          color: '#FF9F0A',
          bgColor: '#FFF3E0',
          icon: 'local-shipping',
          textClass: 'text-orange-500',
        };
      case 'in transit':
        return {
          color: '#5856D6',
          bgColor: '#F0F0FF',
          icon: 'directions-car',
          textClass: 'text-purple-500',
        };
      case 'delivered':
        return {
          color: '#30D158',
          bgColor: '#E6F7E6',
          icon: 'check-circle',
          textClass: 'text-green-500',
        };
      // Keep legacy statuses for backward compatibility
      case 'unsuccessfully':
        return {
          color: '#FF453A',
          bgColor: '#FFE6E6',
          icon: 'error',
          textClass: 'text-red-500',
        };
      case 'successfully':
        return {
          color: '#30D158',
          bgColor: '#E6F7E6',
          icon: 'check-circle',
          textClass: 'text-green-500',
        };
      case 'pending':
        return {
          color: '#FF9F0A',
          bgColor: '#FFF3E0',
          icon: 'schedule',
          textClass: 'text-orange-500',
        };
      default:
        return {
          color: '#0A84FF',
          bgColor: '#E6F3FF',
          icon: 'info',
          textClass: 'text-blue-500',
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'high':
        return {
          color: '#FF453A',
          bgColor: '#FF453A',
          textClass: 'text-red-500',
        };
      case 'medium':
        return {
          color: '#FF9F0A',
          bgColor: '#FF9F0A',
          textClass: 'text-orange-500',
        };
      case 'low':
        return {
          color: '#30D158',
          bgColor: '#30D158',
          textClass: 'text-green-500',
        };
      default:
        return {
          color: '#8A8A8E',
          bgColor: '#8A8A8E',
          textClass: 'text-gray-500',
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const priorityConfig = getPriorityConfig(priority);

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

  const handleScan = () => {
    console.log('Scan action for', id);
  };

  const handleInfo = () => {
    console.log('Info action for', id);
  };

  const handleResubmit = () => {
    // Navigate to resubmit page with current request data
    router.push({
      pathname: '/resubmit-request',
      params: {
        id,
        itemRequested,
        priority,
        amount,
        company,
        // Add sample data for the form fields
        quantity: '1',
        reasonForRequest: 'Original request needs updates based on feedback',
        phoneNo: '',
        chargeToDepartment: '',
        hodComments: 'Request requires additional documentation and clarification on budget allocation. Please provide detailed specifications and updated cost estimates.',
      },
    });
  };

  // ICSBOLTZ_ROLE_BASED_ACTIONS - Role-specific action handlers
  const handleViewLog = () => {
    console.log('View Log action for request', id);
    // TODO: Implement view log functionality
  };


  const handleReject = () => {
    console.log('Reject action for request', id);
    // TODO: Implement reject functionality
  };

  const handleView = () => {
    console.log('View action for request', id);
    // TODO: Implement view functionality
  };

  const handleWarranty = () => {
    console.log('Warranty action for request', id);
    // TODO: Implement warranty functionality
  };

  // TMS Booking specific action handlers
  const handleRecall = () => {
    router.push('/recall');
  };

  const handleEdit = () => {
    // Navigate to edit booking page with current booking data
    router.push({
      pathname: '/edit-booking',
      params: {
        bookingName: itemRequested,
        client: company || 'John@gmail.com',
        consignee: 'Jane Doe',
        date: new Date().toISOString(),
        pickupState: 'Selangor',
        pickupAddress: '123 Pickup Street, Petaling Jaya',
        pickupTime: new Date().toISOString(),
        deliveryState: 'Kuala Lumpur',
        deliveryAddress: '456 Delivery Avenue, KLCC',
        deliveryTime: new Date().toISOString(),
        shipmentType: 'LFC',
        containerSize: '40ft',
        items: JSON.stringify(items || ['Electronics', 'Computer Parts']),
        totalGrossWeight: '1500',
        totalVolume: '25',
      },
    });
  };

  const handleSummary = () => {
    router.push('/summary');
  };

  // Approval handler
  const handleApprove = useCallback(async () => {
    try {
      await addApproval({
        booking_id: id,
        approval_type: 'APPROVED'
      });
      
      Alert.alert(
        'Success',
        'Booking has been approved successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error approving booking:', error);
      Alert.alert(
        'Error',
        'Failed to approve booking. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [id]);

  // ICSBOLTZ_BUTTON_CONFIG - Button configuration based on actions
  const getButtonConfig = (action: ButtonAction) => {
    switch (action) {
      case 'scan':
        return {
          title: 'Scan QR',
          onPress: handleScan,
          variant: 'secondary' as const,
          icon: <MaterialIcons name="qr-code-scanner" size={18} color="#6B7280" style={{ marginRight: 8 }} />,
        };
      case 'info':
        return {
          title: 'Details',
          onPress: handleInfo,
          variant: 'secondary' as const,
          icon: <MaterialIcons name="info-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />,
        };
      case 'resubmit':
        return {
          title: 'Resubmit',
          onPress: handleResubmit,
          variant: 'gradient' as const,
          icon: <MaterialIcons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />,
        };
      case 'view_log':
        return {
          title: 'View Log',
          onPress: handleViewLog,
          variant: 'secondary' as const,
          icon: <MaterialIcons name="history" size={18} color="#6B7280" style={{ marginRight: 8 }} />,
        };
      case 'approve':
        return {
          title: 'Approve',
          onPress: handleApprove,
          variant: 'gradient' as const,
          icon: <MaterialIcons name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />,
        };
      case 'reject':
        return {
          title: 'Reject',
          onPress: handleReject,
          variant: 'secondary' as const,
          icon: <MaterialIcons name="cancel" size={18} color="#6B7280" style={{ marginRight: 8 }} />,
        };
      case 'view':
        return {
          title: 'View',
          onPress: handleView,
          variant: 'secondary' as const,
          icon: <MaterialIcons name="visibility" size={18} color="#6B7280" style={{ marginRight: 8 }} />,
        };
      case 'warranty':
        return {
          title: 'Warranty',
          onPress: handleWarranty,
          variant: 'gradient' as const,
          icon: <MaterialIcons name="verified" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />,
        };
      default:
        return null;
    }
  };

  // Filter actions based on request status for resubmit button
  const getAvailableActions = (): ButtonAction[] => {
    let actions = [...allowedActions];
    
    // Only show resubmit for unsuccessful requests
    if (actions.includes('resubmit') && status.toLowerCase() !== 'unsuccessfully') {
      actions = actions.filter(action => action !== 'resubmit');
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <View className="mb-4">
      <PremiumCard className="overflow-hidden" padding="p-0">
        {/* Header Section - Always Visible - Simplified for TMS Booking */}
        <View className="p-5">
          {/* Booking Name and Expand Arrow */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-xl font-bold text-text-primary flex-1 mr-3">
              {itemRequested}
            </Text>
            
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
          
          {/* Status Row */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            <View className="flex-row items-center flex-1">
              <View 
                className="rounded-lg p-2.5 mr-3"
                style={{ backgroundColor: statusConfig.bgColor }}
              >
                <MaterialIcons 
                  name={statusConfig.icon as any} 
                  size={20} 
                  color={statusConfig.color} 
                />
              </View>
              <Text className={`text-base font-semibold ${statusConfig.textClass}`}>
                {status}
              </Text>
            </View>
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
              
              {/* TMS Booking Details Section */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                {/* Items List */}
                {items && items.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-base text-text-secondary font-medium mb-2">
                      Items
                    </Text>
                    {items.map((item, index) => (
                      <Text key={index} className="text-sm text-text-primary mb-1">
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
                
                {/* Invoice Status */}
                {invoiceStatus && (
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base text-text-secondary font-medium">
                      Invoice Status
                    </Text>
                    <Text className="text-base font-semibold text-text-primary">
                      {invoiceStatus}
                    </Text>
                  </View>
                )}
                
                {/* Total */}
                {total && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-text-secondary font-medium">
                      Total
                    </Text>
                    <Text className="text-lg font-bold text-primary">
                      {total}
                    </Text>
                  </View>
                )}
              </View>

              {/* TMS Booking Action Buttons */}
              <View className="space-y-3">
                {/* Recall & Edit - Side by side buttons */}
                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity
                    onPress={handleRecall}
                    className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row mr-3"
                  >
                    <MaterialIcons name="undo" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-gray-600">Recall</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleEdit}
                    className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row"
                  >
                    <MaterialIcons name="edit" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-gray-600">Edit</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Approve & Recall - Side by side buttons */}
                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity
                    onPress={handleApprove}
                    className="flex-1 bg-green-500 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row mr-3"
                  >
                    <MaterialIcons name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-white">Approve</Text>
                  </TouchableOpacity>
                  
                  {/* <TouchableOpacity
                    onPress={handleRecall}
                    className="flex-1 bg-red-500 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80 flex-row"
                  >
                    <MaterialIcons name="undo" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-white">Recall</Text>
                  </TouchableOpacity> */}
                </View>

                
                {/* Summary - Full width button */}
                <TouchableOpacity
                  onPress={handleSummary}
                  className="active:opacity-80"
                >
                  <LinearGradient
                    colors={['#409CFF', '#0A84FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center flex-row"
                  >
                    <MaterialIcons name="summarize" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold text-white">Summary</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </PremiumCard>
    </View>
  );
}
