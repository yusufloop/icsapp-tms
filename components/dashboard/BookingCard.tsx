import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';

interface BookingItem {
  id: number;
  itemNumber: string;
  status: string;
  route: string;
  statusType: 'success' | 'warning' | 'info' | 'error' | 'neutral';
}

interface BookingCardProps {
  booking: BookingItem;
  onPress?: () => void;
}

export function BookingCard({ booking, onPress }: BookingCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <PremiumCard style={{ width: 120, minHeight: 100 }}>
        <Text className="font-semibold text-text-primary mb-2">
          {booking.itemNumber}
        </Text>
        <PremiumStatusBadge 
          status={booking.statusType}
          text={booking.status}
          size="sm"
        />
        <Text className="text-xs text-text-secondary mt-2">
          {booking.route}
        </Text>
      </PremiumCard>
    </TouchableOpacity>
  );
}