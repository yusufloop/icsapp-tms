import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';

interface Invoice {
  id: string;
  route: string;
  status: string;
  statusType: 'success' | 'warning' | 'info' | 'error' | 'neutral';
  amount: string;
  date: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <PremiumCard>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-text-primary mb-1">
              {invoice.id}
            </Text>
            <Text className="text-sm text-text-secondary">
              {invoice.route} • {invoice.date}
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="font-semibold text-text-primary mb-1">
              {invoice.amount}
            </Text>
            <PremiumStatusBadge 
              status={invoice.statusType}
              text={invoice.status}
              size="sm"
            />
          </View>
          
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color="#8A8A8E" 
            style={{ marginLeft: 12 }}
          />
        </View>
      </PremiumCard>
    </TouchableOpacity>
  );
}