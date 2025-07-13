import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function QrScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (cameraActive) {
      // Start scanning animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnimation.setValue(0);
    }
  }, [cameraActive]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScannedData(data);
    setManualCode(data);
    setCameraActive(false);
    
    // Haptic feedback would go here
    Alert.alert(
      "✅ QR Code Scanned!",
      `Successfully scanned: ${data}`,
      [
        {
          text: "Scan Another",
          style: "default",
          onPress: () => {
            setScanned(false);
            startScanning();
          },
        },
        {
          text: "View Details",
          style: "default",
          onPress: () => processScannedData(data),
        },
      ]
    );
  };

  const processScannedData = (data: string) => {
    Alert.alert("🚀 Processing", `Processing booking data: ${data}`);
  };

  const startScanning = () => {
    if (hasPermission) {
      setCameraActive(true);
      setScanned(false);
    } else {
      Alert.alert(
        "📷 Camera Permission",
        "Camera permission is required to scan QR codes"
      );
    }
  };

  const stopScanning = () => {
    setCameraActive(false);
  };

  const simulateQRScan = () => {
    const sampleCodes = [
      "BK001-CONT123456-PNG-KLG",
      "BK002-CONT789012-KLG-PNG", 
      "BK003-CONT345678-PNG-SIN",
      "BK004-CONT901234-SIN-KLG"
    ];
    
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setScannedData(randomCode);
    setManualCode(randomCode);
    setScanned(true);
    
    Alert.alert(
      "🎯 Demo Scan Complete",
      `Scanned: ${randomCode}`,
      [{ text: "Great!" }]
    );
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      Alert.alert("⚠️ Error", "Please enter a QR code or booking ID");
      return;
    }

    setScannedData(manualCode);
    setScanned(true);
    Alert.alert(
      "✅ Code Processed",
      `Successfully processed: ${manualCode}`,
      [
        {
          text: "Clear",
          onPress: () => {
            setManualCode("");
            setScannedData("");
            setScanned(false);
          },
        },
        {
          text: "Continue",
        },
      ]
    );
  };

  const clearLastScanned = () => {
    setScannedData("");
    setManualCode("");
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <View className="bg-blue-100 w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-4">
              <MaterialIcons name="camera-alt" size={32} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
              Setting up camera...
            </Text>
            <Text className="text-gray-600 text-center">
              Please wait while we prepare the scanner
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      
      <SafeAreaView className="flex-1 bg-gradient-to-b from-red-50 to-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-sm">
            <View className="bg-red-100 w-20 h-20 rounded-3xl items-center justify-center mx-auto mb-6">
              <MaterialIcons name="camera-front" size={40} color="#EF4444" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
              Camera Access
            </Text>
            <Text className="text-gray-600 text-center mb-8 leading-relaxed">
              We need camera permission to scan QR codes and help you access booking information.
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-blue-600 to-blue-700 py-4 px-8 rounded-2xl shadow-lg"
              onPress={() => Camera.requestCameraPermissionsAsync()}
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white font-bold text-lg text-center">
                Enable Camera
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              QR Scanner
            </Text>
            <Text className="text-gray-600">
              Scan booking codes instantly
            </Text>
          </View>
          <View className="bg-blue-100 w-12 h-12 rounded-2xl items-center justify-center">
            <MaterialIcons name="qr-code-scanner" size={24} color="#3B82F6" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-8">
        {/* Main Scanner Card */}
        <View className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          {cameraActive ? (
            <View className="p-6">
              <View className="items-center mb-6">
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  🎯 Scanning Active
                </Text>
                <Text className="text-gray-600 text-center">
                  Position QR code within the frame
                </Text>
              </View>
              
              {/* Enhanced Camera View */}
              <View className="items-center">
                <View
                  className="rounded-3xl overflow-hidden bg-black shadow-2xl"
                  style={{ 
                    width: width * 0.8, 
                    height: width * 0.8,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 16,
                  }}
                >
                  <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    flash={flashOn ? "on" : "off"}
                  >
                    <View className="flex-1 justify-center items-center">
                      {/* Animated Scan Frame */}
                      <View className="w-56 h-56 relative">
                        {/* Corner indicators with glow effect */}
                        <View className="absolute top-0 left-0 w-8 h-8">
                          <View className="w-6 h-6 border-t-4 border-l-4 border-white shadow-lg" 
                                style={{ shadowColor: '#FFFFFF', shadowOpacity: 0.8, shadowRadius: 4 }} />
                        </View>
                        <View className="absolute top-0 right-0 w-8 h-8">
                          <View className="w-6 h-6 border-t-4 border-r-4 border-white shadow-lg" 
                                style={{ shadowColor: '#FFFFFF', shadowOpacity: 0.8, shadowRadius: 4 }} />
                        </View>
                        <View className="absolute bottom-0 left-0 w-8 h-8">
                          <View className="w-6 h-6 border-b-4 border-l-4 border-white shadow-lg" 
                                style={{ shadowColor: '#FFFFFF', shadowOpacity: 0.8, shadowRadius: 4 }} />
                        </View>
                        <View className="absolute bottom-0 right-0 w-8 h-8">
                          <View className="w-6 h-6 border-b-4 border-r-4 border-white shadow-lg" 
                                style={{ shadowColor: '#FFFFFF', shadowOpacity: 0.8, shadowRadius: 4 }} />
                        </View>
                        
                        {/* Animated scanning line */}
                        <Animated.View
                          className="absolute left-0 right-0 h-0.5 bg-white shadow-lg"
                          style={{
                            top: scanAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 224 - 2], // 56*4 - height of line
                            }),
                            shadowColor: '#FFFFFF',
                            shadowOpacity: 1,
                            shadowRadius: 8,
                          }}
                        />
                      </View>
                    </View>
                  </CameraView>
                </View>

                {/* Enhanced Camera Controls */}
                <View className="flex-row items-center justify-center gap-4 mt-8">
                  <TouchableOpacity
                    className={`w-14 h-14 rounded-2xl items-center justify-center shadow-lg ${
                      flashOn 
                        ? "bg-yellow-400 border-2 border-yellow-500" 
                        : "bg-white border-2 border-gray-200"
                    }`}
                    onPress={() => setFlashOn(!flashOn)}
                    style={{
                      shadowColor: flashOn ? '#FDE047' : '#000000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: flashOn ? 0.4 : 0.1,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Ionicons
                      name={flashOn ? "flashlight" : "flashlight-outline"}
                      size={24}
                      color={flashOn ? "#FFFFFF" : "#374151"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 rounded-2xl flex-row items-center shadow-lg"
                    onPress={stopScanning}
                    style={{
                      shadowColor: '#EF4444',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <MaterialIcons name="stop" size={24} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg ml-2">Stop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl items-center justify-center shadow-lg"
                    onPress={clearLastScanned}
                    style={{
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name="refresh" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View className="p-8">
              {/* Beautiful Start Screen */}
              <View className="items-center">
                <View className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-lg">
                  <MaterialIcons name="qr-code-scanner" size={48} color="#3B82F6" />
                </View>
                
                <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  Ready to Scan
                </Text>
                
                <Text className="text-gray-600 text-center leading-relaxed mb-8 max-w-sm">
                  Point your camera at any QR code to instantly access booking information and container details.
                </Text>
                
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 rounded-2xl flex-row items-center shadow-lg"
                    onPress={startScanning}
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 12,
                    }}
                  >
                    <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg ml-2">Start Scan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-100 border-2 border-gray-200 px-6 py-4 rounded-2xl flex-row items-center shadow-sm"
                    onPress={simulateQRScan}
                  >
                    <MaterialIcons name="play-circle-outline" size={24} color="#6B7280" />
                    <Text className="text-gray-700 font-semibold text-lg ml-2">Demo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Manual Entry Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-4 flex-row items-center">
            ✏️ Manual Entry
          </Text>
          
          <Text className="text-gray-600 mb-4 leading-relaxed">
            Enter a booking ID or container code manually:
          </Text>
          
          <TextInput
            className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 mb-4 text-lg"
            placeholder="Enter booking ID (e.g., BK001-CONT123456)"
            value={manualCode}
            onChangeText={setManualCode}
            placeholderTextColor="#9CA3AF"
            style={{
              fontFamily: 'monospace',
            }}
          />
          
          <TouchableOpacity
            className="bg-gradient-to-r from-gray-600 to-gray-700 py-4 rounded-xl flex-row items-center justify-center shadow-lg"
            onPress={handleManualEntry}
            style={{
              shadowColor: '#374151',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-lg ml-2">Process Code</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Last Scanned */}
        {scannedData && (
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              ✅ Scan Result
            </Text>
            
            <View className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <Text className="text-sm text-green-600 mb-2 font-semibold uppercase tracking-wide">
                Booking Code
              </Text>
              <Text className="text-lg font-bold text-gray-900 font-mono mb-4">
                {scannedData}
              </Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => processScannedData(scannedData)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 py-3 rounded-xl shadow-lg"
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text className="text-white font-bold text-center">View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={clearLastScanned}
                  className="bg-gray-200 w-12 h-12 rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="clear" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}