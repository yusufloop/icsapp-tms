import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PremiumCard } from '@/components/ui/PremiumCard';

const { width } = Dimensions.get('window');

interface PerformanceData {
  month: string;
  onTime: number;
  delay: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.onTime, d.delay]));
  const chartHeight = 200;
  const chartWidth = width - 80; // Account for padding
  const barWidth = chartWidth / (data.length * 2.5);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-text-primary">
          Your Performance
        </Text>
        
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 bg-warning rounded-full mr-2" />
            <Text className="text-sm text-text-secondary">On Time</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-destructive rounded-full mr-2" />
            <Text className="text-sm text-text-secondary">Delay</Text>
          </View>
        </View>
      </View>
      
      <PremiumCard>
        <View style={{ height: chartHeight + 40 }}>
          {/* Y-axis labels */}
          <View className="absolute left-0 top-0 bottom-8 justify-between">
            <Text className="text-xs text-text-tertiary">25</Text>
            <Text className="text-xs text-text-tertiary">20</Text>
            <Text className="text-xs text-text-tertiary">15</Text>
            <Text className="text-xs text-text-tertiary">10</Text>
            <Text className="text-xs text-text-tertiary">5</Text>
            <Text className="text-xs text-text-tertiary">0</Text>
          </View>
          
          {/* Chart area */}
          <View className="ml-6 mr-2 mt-2 flex-1">
            <View className="flex-1 flex-row items-end justify-between">
              {data.map((item, index) => {
                const onTimeHeight = (item.onTime / maxValue) * (chartHeight - 40);
                const delayHeight = (item.delay / maxValue) * (chartHeight - 40);
                
                return (
                  <View key={item.month} className="items-center">
                    {/* Bars */}
                    <View className="flex-row items-end mb-2">
                      {/* On Time Bar */}
                      <View 
                        className="bg-warning rounded-t mr-1"
                        style={{ 
                          width: barWidth * 0.8, 
                          height: Math.max(onTimeHeight, 4)
                        }}
                      />
                      
                      {/* Delay Bar */}
                      <View 
                        className="bg-destructive rounded-t"
                        style={{ 
                          width: barWidth * 0.8, 
                          height: Math.max(delayHeight, 4)
                        }}
                      />
                    </View>
                    
                    {/* Data points */}
                    <View className="absolute" style={{ bottom: onTimeHeight + 8 }}>
                      <View className="w-3 h-3 bg-warning rounded-full border-2 border-white" />
                    </View>
                    <View className="absolute" style={{ bottom: delayHeight + 8, left: barWidth }}>
                      <View className="w-3 h-3 bg-destructive rounded-full border-2 border-white" />
                    </View>
                  </View>
                );
              })}
            </View>
            
            {/* Connecting lines */}
            <View className="absolute inset-0">
              {data.map((item, index) => {
                if (index === data.length - 1) return null;
                
                const currentOnTime = (item.onTime / maxValue) * (chartHeight - 40);
                const nextOnTime = (data[index + 1].onTime / maxValue) * (chartHeight - 40);
                const currentDelay = (item.delay / maxValue) * (chartHeight - 40);
                const nextDelay = (data[index + 1].delay / maxValue) * (chartHeight - 40);
                
                const xStart = (index + 0.5) * (chartWidth / data.length);
                const xEnd = (index + 1.5) * (chartWidth / data.length);
                
                return (
                  <View key={`line-${index}`}>
                    {/* On Time Line */}
                    <View 
                      className="absolute bg-warning"
                      style={{
                        left: xStart,
                        bottom: currentOnTime + 8,
                        width: Math.sqrt(Math.pow(xEnd - xStart, 2) + Math.pow(nextOnTime - currentOnTime, 2)),
                        height: 2,
                        transform: [{ 
                          rotate: `${Math.atan2(nextOnTime - currentOnTime, xEnd - xStart)}rad` 
                        }]
                      }}
                    />
                    
                    {/* Delay Line */}
                    <View 
                      className="absolute bg-destructive"
                      style={{
                        left: xStart,
                        bottom: currentDelay + 8,
                        width: Math.sqrt(Math.pow(xEnd - xStart, 2) + Math.pow(nextDelay - currentDelay, 2)),
                        height: 2,
                        transform: [{ 
                          rotate: `${Math.atan2(nextDelay - currentDelay, xEnd - xStart)}rad` 
                        }]
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
          
          {/* X-axis labels */}
          <View className="flex-row justify-between mt-2 ml-6 mr-2">
            {data.map((item) => (
              <Text key={item.month} className="text-xs text-text-tertiary">
                {item.month}
              </Text>
            ))}
          </View>
        </View>
      </PremiumCard>
    </View>
  );
}