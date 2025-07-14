import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { RequestCard } from "@/components/ui/RequestCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface BookingRequest {
  id: string;
  date: string;
  status: string;
  itemRequested: string;
  priority: string;
  amount: string;
  company: string;
  items: string[];
  invoiceStatus: string;
  total: string;
}

export default function RequestsScreen() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          booking_id,
          client_id,
          shipment_type,
          container_size,
          pickup_state,
          delivery_state,
          pickup_address,
          delivery_address,
          consignee,
          date_booking,
          created_at,
          booking_statuses!left(
            status_id,
            updated_at,
            statuses_master!left(
              status_id,
              entity_type,
              status_value
            )
          ),
          charges!left(
            charge_id,
            haulage_fee,
            twinning_fee,
            total,
            compliance_fee
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format for the RequestCard component
      const transformedData: BookingRequest[] = data.map((booking) => {
        const statusValue =
          booking.booking_statuses?.statuses_master?.status_value || "Pending";

        // Format the date
        const formattedDate = booking.date_booking
          ? new Date(booking.date_booking).toLocaleDateString("en-MY", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : new Date(booking.created_at).toLocaleDateString("en-MY", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

        // Generate a priority based on status
        let priority = "Medium";
        const status = statusValue.toLowerCase();
        if (
          status === "created" ||
          status === "pending" ||
          status === "processing"
        ) {
          priority = "High";
        } else if (status === "delivered" || status === "completed") {
          priority = "Low";
        }

        // Get actual charges from the charges table
        const charges = booking.charges?.[0];

        // Calculate totals from charges
        let calculatedTotal = 0;
        let hasCharges = false;

        if (charges) {
          const haulage = parseFloat(charges.haulage_fee?.toString() || "0");
          const twinning = parseFloat(charges.twinning_fee?.toString() || "0");
          const compliance = parseFloat(
            charges.compliance_fee?.toString() || "0"
          );

          // Use the total from charges table if available, otherwise calculate
          if (charges.total && parseFloat(charges.total.toString()) > 0) {
            calculatedTotal = parseFloat(charges.total.toString());
          } else {
            calculatedTotal = haulage + twinning + compliance;
          }

          hasCharges = calculatedTotal > 0;
        }

        // Format amounts
        const formattedTotal = hasCharges
          ? `RM ${calculatedTotal.toLocaleString("en-MY", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "Pending Quote";

        const formattedAmount = formattedTotal; // Same as total for display

        // Create a route description from pickup and delivery states
        const routeDescription = `${booking.pickup_state || "Origin"} → ${booking.delivery_state || "Destination"}`;

        // Create items array based on shipment details and charges breakdown
        const items = [
          `${booking.shipment_type || "FCL"} Container`,
          `Size: ${booking.container_size || "20ft"}`,
        ];

        // Add charge breakdown to items if charges exist
        if (charges && hasCharges) {
          const haulage = parseFloat(charges.haulage_fee?.toString() || "0");
          const twinning = parseFloat(charges.twinning_fee?.toString() || "0");
          const compliance = parseFloat(
            charges.compliance_fee?.toString() || "0"
          );

          if (haulage > 0) {
            items.push(
              `Haulage: RM ${haulage.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`
            );
          }
          if (twinning > 0) {
            items.push(
              `Twinning: RM ${twinning.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`
            );
          }
          if (compliance > 0) {
            items.push(
              `Compliance: RM ${compliance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`
            );
          }
        } else {
          items.push("Charges: Not calculated yet");
        }

        // Determine invoice status based on booking status and charges
        let invoiceStatus = "Pending";
        if (charges && hasCharges) {
          if (status === "delivered" || status === "completed") {
            invoiceStatus = "Ready for Payment";
          } else if (status === "in_transit" || status === "processing") {
            invoiceStatus = "Generated";
          } else {
            invoiceStatus = "Draft";
          }
        }

        return {
          id: booking.booking_id,
          date: formattedDate,
          status: statusValue,
          itemRequested: routeDescription,
          priority,
          amount: formattedAmount,
          company: booking.consignee || "Client",
          items: items,
          invoiceStatus: invoiceStatus,
          total: formattedTotal,
        };
      });

      setRequests(transformedData);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCardToggle = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCreateRequest = () => {
    router.push("/new-booking");
  };

  const getFilteredRequests = () => {
    // You can add filtering logic here if needed
    return requests;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="hourglass-empty" size={48} color="#6B7280" />
          <Text className="text-lg font-semibold text-text-primary mt-4">
            Loading bookings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className="text-lg font-semibold text-text-primary mt-4 text-center">
            Error loading bookings
          </Text>
          <Text className="text-text-secondary mt-2 text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchBookings}
            className="mt-4 bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-6 bg-bg-secondary shadow-lg">
          <MaterialIcons name="local-shipping" size={28} color="#0A84FF" />
          <Text className="text-3xl font-bold text-text-primary ml-4 leading-tight">
            Booking
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 pt-8">
          <PremiumCard className="shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons
                name="search"
                size={22}
                color="#8A8A8E"
                style={{ marginRight: 14 }}
              />
              <TextInput
                placeholder="Search bookings..."
                placeholderTextColor="#AEAEB2"
                className="flex-1 text-base text-text-primary leading-relaxed"
                style={{ fontFamily: "System" }}
              />
            </View>
          </PremiumCard>
        </View>

        {/* Filter Controls */}
        <View className="flex-row items-center justify-between px-6 pt-2 mb-4">
          <View className="flex-row items-center space-x-8">
            <TouchableOpacity className="flex-row items-center py-3 px-2 active:opacity-80 active:scale-95">
              <MaterialIcons
                name="sort"
                size={22}
                color="#8A8A8E"
                style={{ marginRight: 6 }}
              />
              <Text className="text-base text-text-secondary font-medium">
                Sort
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={22}
                color="#8A8A8E"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-3 px-2 active:opacity-80 active:scale-95">
              <MaterialIcons
                name="tune"
                size={22}
                color="#8A8A8E"
                style={{ marginRight: 6 }}
              />
              <Text className="text-base text-text-secondary font-medium">
                Filter
              </Text>
              <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-3 shadow-sm">
                <Text className="text-white text-xs font-bold">
                  {getFilteredRequests().length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-gradient-to-br from-[#409CFF] to-[#0A84FF] rounded-xl w-12 h-12 items-center justify-center shadow-lg active:opacity-90 active:scale-95"
            onPress={handleCreateRequest}
          >
            <MaterialIcons name="add" size={36} color="white" />
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row space-x-4">
            <PremiumCard className="flex-1">
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">
                  {requests.length}
                </Text>
                <Text className="text-sm text-text-secondary">
                  Total Bookings
                </Text>
              </View>
            </PremiumCard>

            <PremiumCard className="flex-1">
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">
                  {requests.filter((r) => r.priority === "High").length}
                </Text>
                <Text className="text-sm text-text-secondary">
                  High Priority
                </Text>
              </View>
            </PremiumCard>

            <PremiumCard className="flex-1">
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.invoiceStatus !== "Pending").length}
                </Text>
                <Text className="text-sm text-text-secondary">
                  With Charges
                </Text>
              </View>
            </PremiumCard>
          </View>
        </View>

        {/* Requests List */}
        <View className="px-6">
          {getFilteredRequests().length > 0 ? (
            getFilteredRequests().map((request, index) => (
              <Animated.View
                key={request.id || index}
                entering={FadeInDown.delay(index * 100).duration(300)}
              >
                <RequestCard
                  id={request.id}
                  date={request.date}
                  status={request.status}
                  itemRequested={request.itemRequested}
                  priority={request.priority}
                  amount={request.amount}
                  company={request.company}
                  items={request.items}
                  invoiceStatus={request.invoiceStatus}
                  total={request.total}
                  isExpanded={expandedCards.has(request.id)}
                  onToggle={() => handleCardToggle(request.id)}
                />
              </Animated.View>
            ))
          ) : (
            <PremiumCard className="py-12">
              <View className="items-center">
                <MaterialIcons name="inbox" size={64} color="#6B7280" />
                <Text className="text-lg font-semibold text-text-primary mt-4">
                  No bookings found
                </Text>
                <Text className="text-text-secondary mt-2 text-center">
                  Create your first booking request to get started
                </Text>
                <TouchableOpacity
                  onPress={handleCreateRequest}
                  className="mt-4 bg-primary px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-medium">Create Booking</Text>
                </TouchableOpacity>
              </View>
            </PremiumCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
