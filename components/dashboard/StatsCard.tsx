import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface StatsCardProps {
  stat: StatItem;
  onPress?: () => void;
}

export function StatsCard({ stat, onPress }: StatsCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <PremiumCard>
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: stat.color + '20' }}
          >
            <MaterialIcons 
              name={stat.icon as any} 
              size={20} 
              color={stat.color} 
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              {stat.value}
            </Text>
            <Text className="text-text-secondary text-xs">
              {stat.label}
            </Text>
          </View>
        </View>
      </PremiumCard>
    </TouchableOpacity>
  );
}