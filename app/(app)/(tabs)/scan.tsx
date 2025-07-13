import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';


export default function ScanScreen() {
  const [manualCode, setManualCode] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState('');

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter a QR code or ID');
      return;
    }

    setLastScannedCode(manualCode);
    Alert.alert(
      'Code Processed',
      `Successfully processed: ${manualCode}`,
      [
        {
          text: 'Clear',
          onPress: () => {
            setManualCode('');
            setLastScannedCode('');
          },
        },
        {
          text: 'OK',
        },
      ]
    );
  };

  const simulateQRScan = () => {
    const sampleCodes = [
      'REQ-2024-001',
      'REQ-2024-002', 
      'REQ-2024-003',
      'USR-001',
      'ASSET-12345'
    ];
    
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setLastScannedCode(randomCode);
    setManualCode(randomCode);
    
    Alert.alert(
      'QR Code Scanned',
      `Scanned: ${randomCode}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">QR Code Scanner</Text>
        <Text className="text-text-secondary mt-1">
          Scan QR codes to access request information
        </Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        {/* Scanner Card */}
        <PremiumCard className="mb-6">
          <View className="items-center py-8">
            <View className="bg-primary/10 rounded-full p-6 mb-6">
              <MaterialIcons name="qr-code-scanner" size={64} color="#0A84FF" />
            </View>
            
            <Text className="text-xl font-bold text-text-primary mb-3 text-center">
              QR Code Scanner
            </Text>
            
            <Text className="text-text-secondary text-center leading-relaxed mb-8">
              Use the camera to scan QR codes or enter codes manually below.
            </Text>
            
            <PremiumButton
              title="Simulate QR Scan"
              onPress={simulateQRScan}
              variant="gradient"
              icon={<MaterialIcons name="qr-code-scanner" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />}
            />
          </View>
        </PremiumCard>

        {/* Manual Entry */}
        <PremiumCard className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Manual Entry
          </Text>
          
          <Text className="text-text-secondary mb-4">
            Enter a request ID or QR code manually:
          </Text>
          
          <PremiumInput
            placeholder="Enter QR code or Request ID"
            value={manualCode}
            onChangeText={setManualCode}
            className="mb-4"
          />
          
          <PremiumButton
            title="Process Code"
            onPress={handleManualEntry}
            variant="secondary"
            icon={<MaterialIcons name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />}
          />
        </PremiumCard>

        {/* Last Scanned */}
        {lastScannedCode ? (
          <PremiumCard>
            <Text className="text-lg font-semibold text-text-primary mb-4">
              Last Scanned
            </Text>
            
            <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm text-text-secondary mb-1">Code</Text>
                <Text className="text-base font-semibold text-text-primary">
                  {lastScannedCode}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => {
                  setLastScannedCode('');
                  setManualCode('');
                }}
                className="bg-gray-200 rounded-lg p-2"
              >
                <MaterialIcons name="clear" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </PremiumCard>
        ) : null}

        {/* Instructions */}
        <PremiumCard>
          <Text className="text-lg font-semibold text-text-primary mb-4">
            How to Use
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-primary/10 rounded-full p-2 mr-4 mt-1">
                <MaterialIcons name="qr-code-scanner" size={16} color="#0A84FF" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary mb-1">
                  Scan QR Code
                </Text>
                <Text className="text-text-secondary text-sm">
                  Use the "Simulate QR Scan" button to test scanning functionality.
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-primary/10 rounded-full p-2 mr-4 mt-1">
                <MaterialIcons name="edit" size={16} color="#0A84FF" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary mb-1">
                  Manual Entry
                </Text>
                <Text className="text-text-secondary text-sm">
                  Enter request IDs or QR codes manually if scanning is not available.
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-primary/10 rounded-full p-2 mr-4 mt-1">
                <MaterialIcons name="info" size={16} color="#0A84FF" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary mb-1">
                  View Results
                </Text>
                <Text className="text-text-secondary text-sm">
                  Processed codes will be displayed and you can take appropriate action.
                </Text>
              </View>
            </View>
          </View>
        </PremiumCard>
      </View>
    </SafeAreaView>
  );
}
