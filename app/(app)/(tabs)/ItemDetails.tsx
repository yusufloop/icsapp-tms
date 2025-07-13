import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "../../../components/routes/StatusBadge";



const ItemDetails = () => {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  // Mock data - in real app this would come from API
  const booking = {
    id: bookingId,
    route: "PNG → KLG",
    status: "in-transit" as const,
    customer: "ABC Corp",
    container: "CONT123456",
    pickupAddress: "Port Moresby Industrial Area, PNG",
    deliveryAddress: "Port Klang, Selangor, Malaysia",
    estimatedDelivery: "2024-07-15 14:30",
    actualPickup: "2024-07-14 09:00",
    driver: "John Smith",
    driverPhone: "+6012-345-6789",
    weight: "15.5 tons",
    contents: "Electronics & Machinery",
    priority: "High",
    notes: "Handle with care - fragile electronics",
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 gap-3">
          <TouchableOpacity
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color="#1f2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Booking Details</Text>
            <Text className="text-sm text-gray-500">{booking.id}</Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        {/* Route Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2 flex-1">
              Route Details
            </Text>
            <View
              className={`px-2 py-1 rounded-md ${
                booking.priority === "High"
                  ? "bg-red-500"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  booking.priority === "High"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                {booking.priority} Priority
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-blue-600 mb-4">
            {booking.route}
          </Text>

          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">From:</Text>
              <Text className="text-sm text-gray-900">{booking.pickupAddress}</Text>
            </View>
            <View className="gap-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">To:</Text>
              <Text className="text-sm text-gray-900">{booking.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Container Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Ionicons name="cube" size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Container Info
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4">
            <View className="min-w-[45%] gap-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">Container ID</Text>
              <Text className="text-base font-bold text-gray-900 font-mono">
                {booking.container}
              </Text>
            </View>
            <View className="min-w-[45%] gap-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">Weight</Text>
              <Text className="text-base font-bold text-gray-900">
                {booking.weight}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">Contents</Text>
              <Text className="text-sm text-gray-900">{booking.contents}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Ionicons name="time" size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Timeline
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <View className="ml-2">
                <Text className="text-sm text-gray-900">Picked Up</Text>
                <Text className="text-xs text-gray-500">{booking.actualPickup}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-blue-600 rounded-full" />
              <View className="ml-2">
                <Text className="text-sm text-gray-900">In Transit</Text>
                <Text className="text-xs text-gray-500">Current status</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <View className="ml-2">
                <Text className="text-sm text-gray-900">Estimated Delivery</Text>
                <Text className="text-xs text-gray-500">{booking.estimatedDelivery}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer & Driver Info */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="business" size={20} color="#3b82f6" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Customer
              </Text>
            </View>
            <Text className="text-base font-bold text-gray-900">
              {booking.customer}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person" size={20} color="#3b82f6" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Driver
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">
                  {booking.driver}
                </Text>
                <Text className="text-sm text-gray-500">
                  {booking.driverPhone}
                </Text>
              </View>
              <TouchableOpacity className="w-8 h-8 bg-white border border-blue-600 rounded-lg items-center justify-center">
                <Ionicons name="call" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Special Notes</Text>
            <Text className="text-sm text-gray-500">
              {booking.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-4 mb-8">
          <TouchableOpacity className="flex-row items-center justify-center bg-blue-600 py-4 rounded-xl">
            <Ionicons name="cloud-upload" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Upload Proof of Delivery
            </Text>
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
              <Text className="text-gray-900 font-medium">Update Status</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
              <Text className="text-blue-600 font-medium">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ItemDetails;