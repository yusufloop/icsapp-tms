import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import {
  getCurrentUserActions,
  type ButtonAction
} from '../../constants/UserRoles';
import { PremiumButton } from './PremiumButton';
import { PremiumCard } from './PremiumCard';

interface RequestCardProps {
  id: string;
  date: string;
  status: string;
  itemRequested: string;
  priority: string;
  amount?: string;
  company?: string;
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
  isExpanded,
  onToggle,
}: RequestCardProps) {
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

  const handleApprove = () => {
    console.log('Approve action for request', id);
    // TODO: Implement approve functionality
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

  // Get current user's allowed actions
  const allowedActions = getCurrentUserActions();
  
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
        {/* Header Section - Always Visible */}
        <View className="p-5">
          {/* Top Row: ID and Date */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-xl font-bold text-text-primary">
              {id}
            </Text>
            <Text className="text-sm text-text-tertiary font-medium">
              {date}
            </Text>
          </TouchableOpacity>
          
          {/* Status Row */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-4"
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
          
          {/* Item Requested with Amount */}
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-text-secondary font-medium mb-2">
              Item Requested
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-primary leading-relaxed flex-1 mr-3">
                {itemRequested}
              </Text>
              {amount && (
                <Text className="text-base font-bold text-text-primary">
                  {amount}
                </Text>
              )}
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
              
              {/* Details Section */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                {/* Priority */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base text-text-secondary font-medium">
                    Priority
                  </Text>
                  <View className="flex-row items-center">
                    <View 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: priorityConfig.bgColor }}
                    />
                    <Text className={`text-base font-semibold ${priorityConfig.textClass}`}>
                      {priority}
                    </Text>
                  </View>
                </View>
                
                {/* Amount - Removed from dropdown since it's now shown in header */}
                {/* Company information removed as requested */}
              </View>

              {/* ICSBOLTZ_ROLE_BASED_BUTTONS - Dynamic role-based action buttons */}
              {/* CUSTOMIZATION: Button spacing and layout can be modified here */}
              <View className="space-y-3">
                {availableActions.length > 0 && (
                  <>
                    {/* CUSTOMIZATION: Side-by-side buttons with spacing */}
                    {/* Render buttons in pairs for better layout */}
                    {availableActions.length >= 2 && (
                      <View className="flex-row justify-between mb-2">
                        {availableActions.slice(0, 2).map((action, index) => {
                          const buttonConfig = getButtonConfig(action);
                          if (!buttonConfig) return null;
                          
                          return (
                            <View key={action} className="flex-1" style={{ marginRight: index === 0 ? 12 : 0 }}>
                              {action === 'resubmit' ? (
                                // Custom button for resubmit action to bypass PremiumButton gradient issue
                                <TouchableOpacity
                                  onPress={buttonConfig.onPress}
                                  activeOpacity={0.8}
                                >
                                  <LinearGradient
                                    colors={['#409CFF', '#0A84FF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-lg items-center justify-center flex-row px-3 py-2 min-h-[36px]"
                                    style={{ borderRadius: 8 }}
                                  >
                                    {buttonConfig.icon}
                                    <Text className="font-semibold text-sm text-white">
                                      {buttonConfig.title}
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              ) : (
                                <PremiumButton
                                  title={buttonConfig.title}
                                  onPress={buttonConfig.onPress}
                                  variant={buttonConfig.variant}
                                  size="sm"
                                  icon={buttonConfig.icon}
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                    
                    {/* CUSTOMIZATION: Full-width buttons with spacing from above buttons */}
                    {/* Render remaining buttons as full-width */}
                    {availableActions.slice(2).map((action, index) => {
                      const buttonConfig = getButtonConfig(action);
                      if (!buttonConfig) return null;
                      
                      return (
                        <View key={action} style={{ marginTop: index === 0 && availableActions.length >= 2 ? 8 : 0 }}>
                          {action === 'resubmit' ? (
                            // Custom button for resubmit action to bypass PremiumButton gradient issue
                            <TouchableOpacity
                              onPress={buttonConfig.onPress}
                              activeOpacity={0.8}
                            >
                              <LinearGradient
                                colors={['#409CFF', '#0A84FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-lg items-center justify-center flex-row px-3 py-2 min-h-[36px]"
                                style={{ borderRadius: 8 }}
                              >
                                {buttonConfig.icon}
                                <Text className="font-semibold text-sm text-white">
                                  {buttonConfig.title}
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          ) : (
                            <PremiumButton
                              title={buttonConfig.title}
                              onPress={buttonConfig.onPress}
                              variant={buttonConfig.variant}
                              size="sm"
                              icon={buttonConfig.icon}
                            />
                          )}
                        </View>
                      );
                    })}
                    
                    {/* Handle single button case */}
                    {availableActions.length === 1 && (
                      (() => {
                        const action = availableActions[0];
                        const buttonConfig = getButtonConfig(action);
                        if (!buttonConfig) return null;
                        
                        return action === 'resubmit' ? (
                          // Custom button for resubmit action to bypass PremiumButton gradient issue
                          <TouchableOpacity
                            onPress={buttonConfig.onPress}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={['#409CFF', '#0A84FF']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              className="rounded-lg items-center justify-center flex-row px-3 py-2 min-h-[36px]"
                              style={{ borderRadius: 8 }}
                            >
                              {buttonConfig.icon}
                              <Text className="font-semibold text-sm text-white">
                                {buttonConfig.title}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        ) : (
                          <PremiumButton
                            title={buttonConfig.title}
                            onPress={buttonConfig.onPress}
                            variant={buttonConfig.variant}
                            size="sm"
                            icon={buttonConfig.icon}
                          />
                        );
                      })()
                    )}
                  </>
                )}
                
                {/* Fallback message if no actions available */}
                {availableActions.length === 0 && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-center text-text-secondary text-sm">
                      No actions available for your role
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </PremiumCard>
    </View>
  );
}
