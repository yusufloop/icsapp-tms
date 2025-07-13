import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  onPress?: () => void;
}

export function QuickActionCard({ action, onPress }: QuickActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <PremiumCard>
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-lg items-center justify-center mr-4"
            style={{ backgroundColor: action.color + '20' }}
          >
            <MaterialIcons 
              name={action.icon as any} 
              size={20} 
              color={action.color} 
            />
          </View>
          
          <View className="flex-1">
            <Text className="font-semibold text-text-primary">
              {action.title}
            </Text>
            <Text className="text-sm text-text-secondary">
              {action.description}
            </Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={20} color="#8A8A8E" />
        </View>
      </PremiumCard>
    </TouchableOpacity>
  );
}