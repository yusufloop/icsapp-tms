import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ComplianceCharge,
  getComplianceCharges,
} from "../../services/complianceService";
import {
  DemurrageCharge,
  getDemurrageCharges,
} from "../../services/demurrageService";

export default function NewBookingStep2Screen() {
  // Mock data from Step 1 (in real implementation, this would come from navigation params or state management)
  const bookingData = {
    bookingName: "Current Booking",
    bookingId: "BK-2025-001234",
  };

  const [formData, setFormData] = useState({
    shipmentType: "",
    containerSize: "",
    items: ["Electronics", "Computer Parts"],
    totalGrossWeight: "",
    totalVolume: "",
    demurrageLocation: "",
    daysExpected: "",
    selectedCompliance: [] as string[],
  });

  const [showShipmentTypePicker, setShowShipmentTypePicker] = useState(false);
  const [showContainerSizePicker, setShowContainerSizePicker] = useState(false);
  const [showDemurrageLocationPicker, setShowDemurrageLocationPicker] =
    useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Updated shipment types to only FCL and LCL
  const shipmentTypes = ["FCL", "LCL"];
  const containerSizes = ["20ft", "40ft", "40ft HC"];

  // Demurrage locations from Supabase
  const [demurrageLocations, setDemurrageLocations] = useState<
    DemurrageCharge[]
  >([]);
  const [demurrageLoading, setDemurrageLoading] = useState(true);

  useEffect(() => {
    fetchDemurrageLocations();
  }, []);

  const fetchDemurrageLocations = async () => {
    try {
      setDemurrageLoading(true);
      const data = await getDemurrageCharges();
      setDemurrageLocations(data);
    } catch (error) {
      console.error("Error fetching demurrage locations:", error);
    } finally {
      setDemurrageLoading(false);
    }
  };

  const [complianceCharges, setComplianceCharges] = useState<
    ComplianceCharge[]
  >([]);
  const [complianceLoading, setComplianceLoading] = useState(true);

  useEffect(() => {
    fetchDemurrageLocations();
    fetchComplianceCharges();
  }, []);

  const fetchComplianceCharges = async () => {
    try {
      setComplianceLoading(true);
      const data = await getComplianceCharges();
      setComplianceCharges(data);
    } catch (error) {
      console.error("Error fetching compliance charges:", error);
    } finally {
      setComplianceLoading(false);
    }
  };



  const handleShipmentTypeSelect = (type: string) => {
    setFormData({ ...formData, shipmentType: type });
    setShowShipmentTypePicker(false);
  };

  const handleContainerSizeSelect = (size: string) => {
    setFormData({ ...formData, containerSize: size });
    setShowContainerSizePicker(false);
  };

  const handleDemurrageLocationSelect = (location: string) => {
    setFormData({ ...formData, demurrageLocation: location });
    setShowDemurrageLocationPicker(false);
  };

  const handleComplianceToggle = (complianceId: string) => {
    const isSelected = formData.selectedCompliance.includes(complianceId);
    if (isSelected) {
      // Remove from selection
      setFormData({
        ...formData,
        selectedCompliance: formData.selectedCompliance.filter(
          (id) => id !== complianceId
        ),
      });
    } else {
      // Add to selection
      setFormData({
        ...formData,
        selectedCompliance: [...formData.selectedCompliance, complianceId],
      });
    }
  };
  let complianceCost = 0;
  if (formData.selectedCompliance.length > 0) {
    complianceCost = formData.selectedCompliance.reduce(
      (total, complianceId) => {
        const compliance = complianceCharges.find(
          (c) => c.id === complianceId
        );
        return total + (compliance?.price || 0);
      },
      0
    );
  }

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(null);
  };

  const handleEditItem = (index: number, newValue: string) => {
    const newItems = [...formData.items];
    newItems[index] = newValue;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddNewItem = () => {
    const newItems = [...formData.items, ""];
    setFormData({ ...formData, items: newItems });
    setEditingItemIndex(newItems.length - 1);
  };

  const handleItemBlur = () => {
    setEditingItemIndex(null);
    // Remove empty items when user finishes editing
    const filteredItems = formData.items.filter((item) => item.trim() !== "");
    setFormData({ ...formData, items: filteredItems });
  };

  const calculateEstimatedTotal = () => {
    // Enhanced calculation based on shipment type and measurements
    let baseRate = 0;

    // Base rate depends on shipment type
    if (formData.shipmentType === "FCL") {
      baseRate = 2500; // FCL (Less than Full Container Load) base rate
    } else if (formData.shipmentType === "LCL") {
      baseRate = 4500; // LCL (Container Load Cargo) base rate
    }

    // Weight-based calculation (RM per KG)
    const weight = parseFloat(formData.totalGrossWeight) || 0;
    const weightCost = weight * 3.5;

    // Volume-based calculation (RM per CBM)
    const volume = parseFloat(formData.totalVolume) || 0;
    const volumeCost = volume * 85;

    // Item handling fee
    const itemCount = formData.items.filter(
      (item) => item.trim() !== ""
    ).length;
    const itemHandlingFee = itemCount * 150;

    // Container size multiplier
    let containerMultiplier = 1;
    if (
      formData.containerSize === "40ft"
    ) {
      containerMultiplier = 1.5;
    } else if (formData.containerSize === "40ft HC") {
      containerMultiplier = 1.8;
    }

    // Demurrage calculation
    let demurrageCost = 0;
    if (formData.demurrageLocation && formData.daysExpected) {
      const selectedLocation = demurrageLocations.find(
        (loc) => loc.location === formData.demurrageLocation
      );
      const days = parseFloat(formData.daysExpected) || 0;
      if (selectedLocation && selectedLocation.daily_rate && days > 0) {
        demurrageCost = selectedLocation.daily_rate * days;
      }
    }

    // Compliance charges calculation
    let complianceCost = 0;
    if (formData.selectedCompliance.length > 0) {
      complianceCost = formData.selectedCompliance.reduce(
        (total, complianceId) => {
          const compliance = complianceCharges.find(
            (c) => c.id === complianceId
          );
          return total + (compliance?.price || 0);
        },
        0
      );
    }

    const subtotal =
      (baseRate + weightCost + volumeCost + itemHandlingFee) *
        containerMultiplier +
      demurrageCost +
      complianceCost;

    // Add service tax (6%)
    const serviceTax = subtotal * 0.06;

    return Math.round(subtotal + serviceTax);
  };

  const getDemurrageRate = () => {
    if (formData.demurrageLocation) {
      const selectedLocation = demurrageLocations.find(
        (loc) => loc.location === formData.demurrageLocation
      );
      return selectedLocation?.daily_rate || 0;
    }
    return 0;
  };

  const handleContinue = () => {
    // Optional validation - allow empty fields for now
    // User can continue with incomplete data

    // Navigate to step 3
    router.push("/new-booking-step3");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-bg-secondary shadow-sm">
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

      {/* Progress Indicator */}
      <View className="px-6 py-4 bg-bg-secondary">
        <View className="flex-row items-center justify-between">
          {/* Step 1 - Completed */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
              <MaterialIcons name="check" size={16} color="white" />
            </View>
            <View className="flex-1 h-1 bg-green-500 ml-2" />
          </View>

          {/* Step 2 - Active */}
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-2">
              <Text className="text-white text-sm font-bold">2</Text>
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

      {/* Form Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6 space-y-6">
          {/* Booking Summary */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-2">
              {bookingData.bookingName}
            </Text>
            <Text className="text-sm text-text-secondary">
              {bookingData.bookingId}
            </Text>
          </View>

          {/* 3D Object Placeholder */}
          <TouchableOpacity 
            className="mb-6"
            onPress={() => router.push('/container-packer')}
            activeOpacity={0.8}
          >
            <View className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 items-center justify-center shadow-lg">
              <MaterialIcons name="view-in-ar" size={64} color="#8A8A8E" />
              <Text className="text-blue-600 mt-4 text-lg font-semibold">
                3D Container Packer
              </Text>
              <Text className="text-blue-500 mt-1 text-sm">
                Tap to visualize and arrange your cargo
              </Text>
            </View>
          </TouchableOpacity>

          {/* Shipment Details */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Shipment Details
            </Text>

            <View className="flex-row space-x-4 gap-4">
              {/* Shipment Type */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Shipment Type
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowShipmentTypePicker(!showShipmentTypePicker)
                  }
                  className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                >
                  <Text
                    className={`flex-1 text-base ${formData.shipmentType ? "text-text-primary" : "text-text-secondary"}`}
                  >
                    {formData.shipmentType || "Select type"}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="#8A8A8E"
                  />
                </TouchableOpacity>

                {/* Shipment Type Picker */}
                {showShipmentTypePicker && (
                  <View className="mt-1 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                    {shipmentTypes.map((type, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleShipmentTypeSelect(type)}
                        className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                      >
                        <Text className="text-text-primary">{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Container Size */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Container Size(ft)
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowContainerSizePicker(!showContainerSizePicker)
                  }
                  className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
                >
                  <Text
                    className={`flex-1 text-base ${formData.containerSize ? "text-text-primary" : "text-text-secondary"}`}
                  >
                    {formData.containerSize || "Select size"}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="#8A8A8E"
                  />
                </TouchableOpacity>

                {/* Container Size Picker */}
                {showContainerSizePicker && (
                  <View className="mt-1 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                    {containerSizes.map((size, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleContainerSizeSelect(size)}
                        className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                      >
                        <Text className="text-text-primary">{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Items List */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Items List
            </Text>

            {/* Items */}
            {formData.items.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2"
              >
                {editingItemIndex === index ? (
                  <TextInput
                    className="flex-1 text-base text-text-primary"
                    value={item}
                    onChangeText={(text) => handleEditItem(index, text)}
                    onBlur={handleItemBlur}
                    placeholder="Enter item name"
                    placeholderTextColor="#8A8A8E"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleItemBlur}
                  />
                ) : (
                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => setEditingItemIndex(index)}
                  >
                    <Text className="text-base text-text-primary">
                      {item || "Tap to edit"}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleRemoveItem(index)}
                  className="ml-3 p-1 active:opacity-80"
                >
                  <MaterialIcons name="close" size={20} color="#8A8A8E" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add New Button */}
            <TouchableOpacity
              onPress={handleAddNewItem}
              className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex-row items-center justify-center active:opacity-80"
            >
              <MaterialIcons
                name="add"
                size={20}
                color="#0A84FF"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-medium text-primary">
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {/* Measurements */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Measurements
            </Text>

            <View className="flex-row space-x-4 gap-4">
              {/* Total Gross Weight */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Total Gross Weight(KG)
                </Text>
                <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                  <TextInput
                    className="flex-1 text-base text-text-primary"
                    value={formData.totalGrossWeight}
                    onChangeText={(text: string) =>
                      setFormData({ ...formData, totalGrossWeight: text })
                    }
                    placeholder="0.00"
                    placeholderTextColor="#8A8A8E"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Total Volume */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Total Volume(CBM)
                </Text>
                <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                  <TextInput
                    className="flex-1 text-base text-text-primary"
                    value={formData.totalVolume}
                    onChangeText={(text: string) =>
                      setFormData({ ...formData, totalVolume: text })
                    }
                    placeholder="0.00"
                    placeholderTextColor="#8A8A8E"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Demurrage */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Demurrage
            </Text>

            {/* Demurrage Location */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-text-primary mb-2">
                Location
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setShowDemurrageLocationPicker(!showDemurrageLocationPicker)
                }
                className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px] active:opacity-80"
              >
                <Text
                  className={`flex-1 text-base ${formData.demurrageLocation ? "text-text-primary" : "text-text-secondary"}`}
                >
                  {formData.demurrageLocation || "Select location"}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color="#8A8A8E"
                />
              </TouchableOpacity>

              {/* Demurrage Location Picker */}
              {showDemurrageLocationPicker && demurrageLocations.length > 0 && (
                <View className="mt-1 bg-bg-secondary border border-gray-300 rounded-lg shadow-lg">
                  {demurrageLocations.map((item, index) => (
                    <TouchableOpacity
                      key={item.demurrage_id || index}
                      onPress={() =>
                        handleDemurrageLocationSelect(item.location || "")
                      }
                      className="px-4 py-3 border-b border-gray-200 last:border-b-0 active:bg-gray-100"
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-text-primary">
                          {item.location}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          RM {item.daily_rate?.toFixed(2)}/day
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Days Expected */}
            <View>
              <Text className="text-sm font-semibold text-text-primary mb-2">
                Days Expected
              </Text>
              <View className="rounded-lg bg-bg-secondary border border-gray-300 flex-row items-center px-4 py-3 min-h-[44px]">
                <TextInput
                  className="flex-1 text-base text-text-primary"
                  value={formData.daysExpected}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, daysExpected: text })
                  }
                  placeholder="0"
                  placeholderTextColor="#8A8A8E"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Other Charges 
            </Text>
            {complianceCharges
              .filter(compliance => typeof compliance.id === 'string')
              .map((compliance) => (
                <TouchableOpacity
                  key={compliance.id!}
                  onPress={() => handleComplianceToggle(compliance.id!)}
                  className="flex-row items-center justify-between bg-bg-secondary border border-gray-300 rounded-lg px-4 py-3 mb-2 active:opacity-80"
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      formData.selectedCompliance.includes(compliance.id!)
                        ? 'bg-primary border-primary'
                        : 'border-gray-400'
                    }`}>
                      {formData.selectedCompliance.includes(compliance.id!) && (
                        <MaterialIcons name="check" size={14} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-text-primary">
                        {compliance.name_compliance}
                      </Text>
                      <Text className="text-sm text-text-secondary">
                        RM {compliance.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>


          {/* Estimated Total */}
          <View className="bg-bg-secondary border border-gray-300 rounded-lg p-6 mb-6">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Cost Breakdown
            </Text>

            {/* Breakdown Details */}
            <View className="space-y-2 mb-4">
              {formData.shipmentType && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-text-secondary">
                    Base Rate ({formData.shipmentType})
                  </Text>
                  <Text className="text-sm text-text-primary">
                    RM{" "}
                    {formData.shipmentType === "FCL"
                      ? "2,500"
                      : formData.shipmentType === "LCL"
                        ? "4,500"
                        : "0"}
                  </Text>
                </View>
              )}

              {parseFloat(formData.totalGrossWeight) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-text-secondary">
                    Weight ({formData.totalGrossWeight} KG × RM 3.50)
                  </Text>
                  <Text className="text-sm text-text-primary">
                    RM{" "}
                    {(
                      parseFloat(formData.totalGrossWeight) * 3.5
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {parseFloat(formData.totalVolume) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-text-secondary">
                    Volume ({formData.totalVolume} CBM × RM 85)
                  </Text>
                  <Text className="text-sm text-text-primary">
                    RM{" "}
                    {(parseFloat(formData.totalVolume) * 85).toLocaleString()}
                  </Text>
                </View>
              )}

              {formData.items.filter((item) => item.trim() !== "").length >
                0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-text-secondary">
                    Item Handling (
                    {formData.items.filter((item) => item.trim() !== "").length}{" "}
                    items × RM 150)
                  </Text>
                  <Text className="text-sm text-text-primary">
                    RM{" "}
                    {(
                      formData.items.filter((item) => item.trim() !== "")
                        .length * 150
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {formData.containerSize && formData.containerSize !== "20ft" && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-text-secondary">
                    Container Size Adjustment ({formData.containerSize})
                  </Text>
                  <Text className="text-sm text-text-primary">
                    {formData.containerSize === "40ft" ||
                    formData.containerSize === "40ft HC"
                      ? "+50%"
                      : "+80%"}
                  </Text>
                </View>
              )}

              {formData.demurrageLocation &&
                formData.daysExpected &&
                parseFloat(formData.daysExpected) > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text-secondary">
                      Demurrage ({formData.demurrageLocation},{" "}
                      {formData.daysExpected} days × RM{" "}
                      {getDemurrageRate().toFixed(2)})
                    </Text>
                    <Text className="text-sm text-text-primary">
                      RM{" "}
                      {(
                        getDemurrageRate() * parseFloat(formData.daysExpected)
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}

              {formData.selectedCompliance.length > 0 && formData.selectedCompliance.map((complianceId) => {
  const compliance = complianceCharges.find(c => c.id === complianceId);
  return compliance ? (
    <View key={complianceId} className="flex-row justify-between">
      <Text className="text-sm text-text-secondary">
        {compliance.name_compliance}
      </Text>
      <Text className="text-sm text-text-primary">
        RM {compliance.price.toFixed(2)}
      </Text>
    </View>
  ) : null;
})}
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">
                  Service Tax (6%)
                </Text>
                <Text className="text-sm text-text-primary">Included</Text>
              </View>
            </View>

            {/* Total */}
            <View className="border-t border-gray-300 pt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-text-primary">
                  Estimated Total
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  RM {calculateEstimatedTotal().toLocaleString()}
                </Text>
              </View>
              <Text className="text-xs text-text-secondary mt-1">
                *Final cost may vary based on actual measurements and additional
                services
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer with Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4 gap-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-gray-600">Back</Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
                      onPress={handleContinue}
                      className="flex-1 bg-blue-500 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                    >
                      
                        <Text className="text-base font-semibold text-white">Continue</Text>
                      
                    </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
