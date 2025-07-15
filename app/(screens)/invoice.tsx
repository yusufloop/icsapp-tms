import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InvoiceScreen() {
  // Mock data representing a booking invoice
  const invoiceData = {
    invoiceNumber: 'INV-2025-001234',
    invoiceDate: '2025-04-06',
    dueDate: '2025-04-20',
    bookingName: 'PNG to KL',
    bookingId: 'xxxxxPNGxKLGxxxx',
    client: {
      name: 'Johan',
      company: 'Johan Industries Sdn Bhd',
      address: 'No. 123, Jalan Industri 4/5\nTaman Perindustrian Bukit Angkat\n43000 Kajang, Selangor',
      phone: '+60 3-8736 5432',
      email: 'johan@johanindustries.com'
    },
    consignee: 'Johani',
    pickup: {
      date: '2025-04-06',
      time: '1030',
      address: 'Jalan................'
    },
    delivery: {
      date: '2025-04-06', 
      time: '1030',
      address: 'Jalan................'
    },
    shipmentType: 'FLC',
    items: [
      { name: 'Nvidia 10180', quantity: 2, unitPrice: 1500.00, total: 3000.00 },
      { name: 'Nvidia 10180x', quantity: 1, unitPrice: 2000.00, total: 2000.00 },
      { name: 'Nvidia 10180x mini', quantity: 3, unitPrice: 1200.00, total: 3600.00 }
    ],
    services: [
      { description: 'Transportation Service', amount: 850.00 },
      { description: 'Handling Fee', amount: 150.00 },
      { description: 'Insurance Coverage', amount: 200.00 }
    ],
    subtotal: 9800.00,
    tax: 588.00, // 6% SST
    total: 10388.00
  };

  const handleBack = () => {
    router.back();
  };

  const handlePrintInvoice = () => {
    // Handle print invoice functionality
    console.log('Print Invoice');
  };

  const handlePay = () => {
    // Handle payment functionality
    console.log('Process Payment');
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`;
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
            Invoice
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            Booking invoice details
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6">
          {/* Invoice Header */}
          <View className="mb-8">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-text-primary mb-2">
                  INVOICE
                </Text>
                <Text className="text-sm text-text-secondary">
                  ICS Boltz Transportation Services
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-text-primary">
                  {invoiceData.invoiceNumber}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-sm text-text-secondary mb-1">
                  Invoice Date
                </Text>
                <Text className="text-base text-text-primary">
                  {formatDate(invoiceData.invoiceDate)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-text-secondary mb-1">
                  Due Date
                </Text>
                <Text className="text-base text-text-primary">
                  {formatDate(invoiceData.dueDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Client Information */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Bill To
            </Text>
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-base font-semibold text-text-primary mb-1">
                {invoiceData.client.name}
              </Text>
              <Text className="text-sm text-text-secondary mb-1">
                {invoiceData.client.company}
              </Text>
              <Text className="text-sm text-text-secondary mb-2">
                {invoiceData.client.address}
              </Text>
              <Text className="text-sm text-text-secondary mb-1">
                Phone: {invoiceData.client.phone}
              </Text>
              <Text className="text-sm text-text-secondary">
                Email: {invoiceData.client.email}
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Booking Details
            </Text>
            
            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Booking Name
              </Text>
              <Text className="text-base text-text-primary">
                {invoiceData.bookingName}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Booking ID
              </Text>
              <Text className="text-base text-text-primary">
                {invoiceData.bookingId}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Consignee (Receiver)
              </Text>
              <Text className="text-base text-text-primary">
                {invoiceData.consignee}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-1">
                Shipment Type
              </Text>
              <Text className="text-base text-text-primary">
                {invoiceData.shipmentType}
              </Text>
            </View>
          </View>

          {/* Pick up & Delivery */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Service Details
            </Text>
            
            <View className="mb-4">
              <Text className="text-base font-semibold text-text-primary mb-2">
                Pick up
              </Text>
              <Text className="text-sm text-text-secondary mb-1">
                Date: {formatDate(invoiceData.pickup.date)} at {formatTime(invoiceData.pickup.time)}
              </Text>
              <Text className="text-sm text-text-secondary">
                Address: {invoiceData.pickup.address}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-text-primary mb-2">
                Delivery
              </Text>
              <Text className="text-sm text-text-secondary mb-1">
                Date: {formatDate(invoiceData.delivery.date)} at {formatTime(invoiceData.delivery.time)}
              </Text>
              <Text className="text-sm text-text-secondary">
                Address: {invoiceData.delivery.address}
              </Text>
            </View>
          </View>

          {/* Items */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Items
            </Text>
            
            {invoiceData.items.map((item, index) => (
              <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <View className="flex-1">
                  <Text className="text-base text-text-primary font-medium">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-text-primary">
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </View>

          {/* Services */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Services
            </Text>
            
            {invoiceData.services.map((service, index) => (
              <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-base text-text-primary">
                  {service.description}
                </Text>
                <Text className="text-base font-semibold text-text-primary">
                  {formatCurrency(service.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View className="mb-8">
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base text-text-primary">
                  Subtotal
                </Text>
                <Text className="text-base text-text-primary">
                  {formatCurrency(invoiceData.subtotal)}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base text-text-primary">
                  SST (6%)
                </Text>
                <Text className="text-base text-text-primary">
                  {formatCurrency(invoiceData.tax)}
                </Text>
              </View>
              
              <View className="h-px bg-gray-300 my-2" />
              
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-lg font-bold text-text-primary">
                  Total Amount
                </Text>
                <Text className="text-lg font-bold text-primary">
                  {formatCurrency(invoiceData.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Terms */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Payment Terms
            </Text>
            <Text className="text-sm text-text-secondary mb-2">
              • Payment is due within 14 days of invoice date
            </Text>
            <Text className="text-sm text-text-secondary mb-2">
              • Late payments may incur additional charges
            </Text>
            <Text className="text-sm text-text-secondary">
              • Please reference invoice number when making payment
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer with Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-4 gap-4">
          {/* Print Invoice Button */}
          <TouchableOpacity
            onPress={handlePrintInvoice}
            className="flex-1 bg-bg-primary border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="print" size={18} color="#1C1C1E" style={{ marginRight: 8 }} />
              <Text className="text-base font-semibold text-text-primary">Print Invoice</Text>
            </View>
          </TouchableOpacity>
          
          {/* Pay Button */}
          <TouchableOpacity
            onPress={handlePay}
            className="flex-1 bg-primary rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="payment" size={18} color="white" style={{ marginRight: 8 }} />
              <Text className="text-base font-semibold text-white">Pay</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
