import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewBookingWebScreen() {
  // The form starts with an empty state
  const [formData, setFormData] = useState({
    bookingName: "",
    client: "",
    consignee: "",
    date: new Date(),
    pickupState: "",
    pickupAddress: "",
    pickupTime: new Date(),
    deliveryState: "",
    deliveryAddress: "",
    deliveryTime: new Date(),
  });

  // --- 1. API endpoint for autofill data ---
  const API_ENDPOINT =
    "https://above-dinosaur-weekly.ngrok-free.app/webhook/auto1";
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. Function to fetch and populate the form with API data ---
  const handleAutofill = async () => {
    if (isLoading) return; // Prevent multiple calls

    try {
      setIsLoading(true);

      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add ngrok-skip-browser-warning header to bypass ngrok browser warning
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the first item from the array and get the output object
      if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
        const bookingData = data[0].output;

        setFormData({
          bookingName: bookingData.bookingName || "",
          client: bookingData.client || "",
          consignee: bookingData.consignee || "",
          date: bookingData.date ? new Date(bookingData.date) : new Date(),
          pickupState: bookingData.pickupState || "",
          pickupAddress: bookingData.pickupAddress || "",
          pickupTime: bookingData.pickupTime
            ? new Date(bookingData.pickupTime)
            : new Date(),
          deliveryState: bookingData.deliveryState || "",
          deliveryAddress: bookingData.deliveryAddress || "",
          deliveryTime: bookingData.deliveryTime
            ? new Date(bookingData.deliveryTime)
            : new Date(),
        });

        Alert.alert("Success", "Form has been autofilled with API data.");
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Autofill error:", error);
      Alert.alert(
        "Error",
        `Failed to fetch autofill data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const handlePickupTimeChange = (event: any, selectedTime?: Date) => {
    setShowPickupTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, pickupTime: selectedTime });
    }
  };

  const handleDeliveryTimeChange = (event: any, selectedTime?: Date) => {
    setShowDeliveryTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, deliveryTime: selectedTime });
    }
  };

  const handleContinue = () => {
    // Basic validation
    if (!formData.bookingName.trim()) {
      Alert.alert("Error", "Please enter a booking name");
      return;
    }
    if (!formData.client.trim()) {
      Alert.alert("Error", "Please select a client");
      return;
    }
    if (!formData.consignee.trim()) {
      Alert.alert("Error", "Please enter a consignee");
      return;
    }
    if (!formData.pickupState.trim() || !formData.pickupAddress.trim()) {
      Alert.alert("Error", "Please fill in pickup details");
      return;
    }
    if (!formData.deliveryState.trim() || !formData.deliveryAddress.trim()) {
      Alert.alert("Error", "Please fill in delivery details");
      return;
    }

    // Navigate to step 2
    router.push("/new-booking-step2");
  };

  const handleBack = () => {
    // Navigate to requests page instead of router.back() to avoid navigation errors
    router.push("/requests");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center max-w-4xl mx-auto w-full">
          <TouchableOpacity
            onPress={handleBack}
            className="mr-4 p-2 -ml-2 active:opacity-80"
          >
            <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              New Booking
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Fill in the information below for requests
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="max-w-4xl mx-auto w-full">
          <View className="flex-row items-center justify-between">
            {/* Step 1 - Active */}
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-sm font-bold">1</Text>
              </View>
              <View className="flex-1 h-1 bg-primary ml-2" />
            </View>

            {/* Step 2 - Inactive */}
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
                <Text className="text-gray-600 text-sm font-bold">2</Text>
              </View>
              <View className="flex-1 h-1 bg-gray-300 ml-2" />
            </View>

            {/* Step 3 - Inactive */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
                <Text className="text-gray-600 text-sm font-bold">3</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content Container */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6">
          <View className="max-w-2xl mx-auto w-full">
            {/* --- 3. Autofill button is placed here --- */}
            <TouchableOpacity
              onPress={handleAutofill}
              disabled={isLoading}
              className={`${isLoading ? "bg-gray-400" : "bg-teal-500"} rounded-lg py-3 mb-6 items-center justify-center shadow ${!isLoading && "active:opacity-80"}`}
            >
              <View className="flex-row items-center">
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text className="text-white font-bold text-base">
                  {isLoading ? "Loading..." : "Autofill Form (For Web Testing)"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Form Card */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Form Content */}
              <View className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Booking Name
                  </Text>
                  <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.bookingName}
                      onChangeText={(text: string) =>
                        setFormData({ ...formData, bookingName: text })
                      }
                      placeholder="Enter booking name"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                {/* Client */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Client
                  </Text>
                  <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.client}
                      onChangeText={(text: string) =>
                        setFormData({ ...formData, client: text })
                      }
                      placeholder="Enter client name"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Consignee (Receiver)
                  </Text>
                  <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.consignee}
                      onChangeText={(text: string) =>
                        setFormData({ ...formData, consignee: text })
                      }
                      placeholder="Enter consignee name"
                      placeholderTextColor="#8A8A8E"
                    />
                  </View>
                </View>

                {/* Date Picker */}
                <View>
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                  >
                    <MaterialIcons
                      name="event"
                      size={20}
                      color="#8A8A8E"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="flex-1 text-base text-text-primary">
                      {formatDate(formData.date)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Pickup Section */}
                <View className="mt-8">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Pickup
                  </Text>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      State
                    </Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        value={formData.pickupState}
                        onChangeText={(text: string) =>
                          setFormData({ ...formData, pickupState: text })
                        }
                        placeholder="Enter pickup state"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Address
                    </Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#8A8A8E"
                        style={{ marginRight: 12, marginTop: 2 }}
                      />
                      <TextInput
                        value={formData.pickupAddress}
                        onChangeText={(text) =>
                          setFormData({ ...formData, pickupAddress: text })
                        }
                        placeholder="Enter pickup address"
                        placeholderTextColor="#8A8A8E"
                        multiline
                        numberOfLines={3}
                        className="flex-1 text-base text-text-primary"
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  {/* Pickup Time */}
                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Time
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPickupTimePicker(true)}
                      className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                    >
                      <MaterialIcons
                        name="access-time"
                        size={20}
                        color="#8A8A8E"
                        style={{ marginRight: 12 }}
                      />
                      <Text className="flex-1 text-base text-text-primary">
                        {formatTime(formData.pickupTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Delivery Section */}
                <View className="mt-8">
                  <Text className="text-lg font-bold text-text-primary mb-4">
                    Delivery
                  </Text>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      State
                    </Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                      <TextInput
                        className="flex-1 text-base text-text-primary"
                        value={formData.deliveryState}
                        onChangeText={(text: string) =>
                          setFormData({ ...formData, deliveryState: text })
                        }
                        placeholder="Enter delivery state"
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Address
                    </Text>
                    <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row px-4 py-3 min-h-[80px]">
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#8A8A8E"
                        style={{ marginRight: 12, marginTop: 2 }}
                      />
                      <TextInput
                        value={formData.deliveryAddress}
                        onChangeText={(text) =>
                          setFormData({ ...formData, deliveryAddress: text })
                        }
                        placeholder="Enter delivery address"
                        placeholderTextColor="#8A8A8E"
                        multiline
                        numberOfLines={3}
                        className="flex-1 text-base text-text-primary"
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  {/* Delivery Time */}
                  <View>
                    <Text className="text-sm font-semibold text-text-primary mb-2">
                      Time
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDeliveryTimePicker(true)}
                      className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                    >
                      <MaterialIcons
                        name="access-time"
                        size={20}
                        color="#8A8A8E"
                        style={{ marginRight: 12 }}
                      />
                      <Text className="flex-1 text-base text-text-primary">
                        {formatTime(formData.deliveryTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Sticky Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4">
                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-gray-600">
                      Back
                    </Text>
                  </TouchableOpacity>

                  {/* Continue Button */}
                  <TouchableOpacity
                    onPress={handleContinue}
                    className="flex-1 bg-blue-500 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-white">
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      {showPickupTimePicker && (
        <DateTimePicker
          value={formData.pickupTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickupTimeChange}
        />
      )}

      {showDeliveryTimePicker && (
        <DateTimePicker
          value={formData.deliveryTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDeliveryTimeChange}
        />
      )}
    </View>
  );
}
