import DriverDashboard from '@/components/dashboards/DriverDashboard';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumStatusBadge } from '@/components/ui/PremiumStatusBadge';
import { getCurrentUserRole, subscribeToRoleChanges, type UserRole } from '@/constants/UserRoles';
import { Div } from '@expo/html-elements';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUserRole());

  // Subscribe to role changes
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentRole(newRole);
      console.log('Dashboard role changed to:', newRole);
    });

    return unsubscribe;
  }, []);

  // Render different dashboards based on user role
  if (currentRole === 'DRIVER') {
    return <DriverDashboard />;
  }

  // Default dashboard for other roles (REQUESTER, HEAD_OF_DEPARTMENT, ADMIN)
  return <DefaultDashboard />;
}

function DefaultDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Initialize n8n chat for web
  useEffect(() => {
    if (Platform.OS === 'web' && isChatOpen && !chatInitialized) {
      // Load CSS
      const linkElement = document.createElement('link');
      linkElement.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
      linkElement.rel = 'stylesheet';
      document.head.appendChild(linkElement);

      // Load and initialize chat using script tag
      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.innerHTML = `
        import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
        window.n8nChat = createChat({
          webhookUrl: 'https://above-dinosaur-weekly.ngrok-free.app/webhook/b4eb85b7-8b54-4465-a206-a44ac666fd4c/chat',
          target: '#n8n-chat-container'
        });
      `;
      document.body.appendChild(scriptElement);
      setChatInitialized(true);

      // Cleanup function
      return () => {
        const existingLink = document.querySelector('link[href*="@n8n/chat"]');
        if (existingLink) {
          existingLink.remove();
        }
        if (scriptElement) {
          scriptElement.remove();
        }
      };
    }
  }, [isChatOpen, chatInitialized]);

  // Mock data for invoices
  const invoices = [
    {
      id: '#ITEM 1',
      route: 'PNG - KLG',
      status: 'Paid',
      statusType: 'success' as const,
      amount: 'RM 1,250.00',
      date: '15 Jan 2025'
    },
    {
      id: '#ITEM 2',
      route: 'PNG - KLG', 
      status: 'Paid',
      statusType: 'success' as const,
      amount: 'RM 850.00',
      date: '12 Jan 2025'
    },
    {
      id: '#ITEM 3',
      route: 'PNG - KLG',
      status: 'Overdue',
      statusType: 'error' as const,
      amount: 'RM 2,100.00',
      date: '08 Jan 2025'
    },
  ];

  // Mock data for booking summary
  const bookingItems = [
    { id: 1, itemNumber: '#ITEM 1', status: 'Picked Up', route: 'PNG - KLG', statusType: 'warning' as const },
    { id: 2, itemNumber: '#ITEM 2', status: 'In Transit', route: 'PNG - KLG', statusType: 'info' as const },
    { id: 3, itemNumber: '#ITEM 3', status: 'Delivered', route: 'PNG - KLG', statusType: 'success' as const },
    { id: 4, itemNumber: '#ITEM 4', status: 'Pending', route: 'PNG - KLG', statusType: 'neutral' as const },
  ];

  // Stats data
  const stats = [
    { label: 'Total Invoices', value: '12', icon: 'receipt', color: '#0A84FF' },
    { label: 'Paid', value: '8', icon: 'check-circle', color: '#28A745' },
    { label: 'Pending', value: '3', icon: 'schedule', color: '#FFC107' },
    { label: 'Overdue', value: '1', icon: 'error', color: '#DC3545' },
  ];

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="max-w-6xl mx-auto">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Overview of your transportation management system
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-6">
          <View className="max-w-6xl mx-auto">
            {/* Stats Grid */}
            <View className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <PremiumCard key={index} className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {stat.label}
                      </Text>
                    </View>
                    <View 
                      className="w-12 h-12 rounded-xl items-center justify-center"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <MaterialIcons 
                        name={stat.icon as any} 
                        size={24} 
                        color={stat.color} 
                      />
                    </View>
                  </View>
                </PremiumCard>
              ))}
            </View>

            <View className="grid grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <PremiumCard className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-bold text-gray-900">
                    Recent Invoices
                  </Text>
                  <TouchableOpacity className="active:opacity-80">
                    <Text className="text-sm text-blue-600 font-medium">
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {invoices.map((invoice, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {invoice.id}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {invoice.route} • {invoice.date}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {invoice.amount}
                        </Text>
                        <PremiumStatusBadge 
                          status={invoice.statusType}
                          text={invoice.status}
                          size="sm"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </PremiumCard>

              {/* Booking Summary */}
              <PremiumCard className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-bold text-gray-900">
                    Recent Bookings
                  </Text>
                  <TouchableOpacity className="active:opacity-80">
                    <Text className="text-sm text-blue-600 font-medium">
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {bookingItems.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 mb-1">
                          {item.itemNumber}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {item.route}
                        </Text>
                      </View>
                      <PremiumStatusBadge 
                        status={item.statusType}
                        text={item.status}
                        size="sm"
                      />
                    </View>
                  ))}
                </View>
              </PremiumCard>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Chat Button - Fixed Position */}
      {Platform.OS === 'web' && (
        <TouchableOpacity
          onPress={openChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 rounded-full p-4 shadow-lg z-50"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <MaterialIcons name="chat" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Chat Button - Enhanced with Animation */}
{Platform.OS === 'web' && (
  <TouchableOpacity
    onPress={openChat}
    className="group"
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
    }}
  >
    <Div
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      style={{
        // background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        borderRadius: '50%',
        padding: 16,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      <MaterialIcons name="chat" size={28} color="white" />
      {/* Notification Badge */}
      <Div
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          // border: '2px solid white',
        }}
      >
        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>•</Text>
      </Div>
    </Div>
  </TouchableOpacity>
)}

  {/* Enhanced Chat Modal */}
  {Platform.OS === 'web' && isChatOpen && (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-6"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1001,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={(e: any) => {
        if (e.target === e.currentTarget) {
          closeChat();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out"
        style={{
          width: 420,
          height: 640,
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          transform: 'translateY(0) scale(1)',
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Modern Chat Header */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          />
          {/* Header Content */}
          <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <div
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"
              style={{
                width: 40,
                height: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialIcons name="support-agent" size={20} color="white" />
            </div>
            <div>
              <Text className="font-bold text-white text-lg">Support Assistant</Text>
              <Text className="text-white text-sm opacity-90">We're here to help</Text>
            </div>
          </div>
          {/* Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
            <button
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              style={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="minimize" size={16} color="white" />
            </button>
            <button
              onClick={closeChat}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              style={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="close" size={16} color="white" />
            </button>
          </div>
        </div>
        {/* Chat Content Area with Enhanced Design */}
        <div
          className="relative flex-1"
          style={{
            height: 'calc(100% - 84px)',
            backgroundColor: '#fafbfc',
            position: 'relative',
            overflow: 'hidden',
          }}
          id="n8n-chat-container"
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Loading State */}
          {!chatInitialized && (
            <div
              className="flex-1 flex items-center justify-center"
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Loading Spinner */}
              <div
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
                style={{
                  width: 48,
                  height: 48,
                  border: '4px solid #dbeafe',
                  borderTop: '4px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span className="text-gray-600 font-medium">Connecting to support...</span>
              <span className="text-gray-500 text-sm">Please wait a moment</span>
            </div>
          )}
        </div>
        {/* Status Bar */}
        <div
          className="px-4 py-2 bg-gray-50 border-t border-gray-100"
          style={{
            padding: '8px 16px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              style={{
                width: 8,
                height: 8,
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
              }}
            />
            <span className="text-xs text-gray-600">Online</span>
          </div>
          <span className="text-xs text-gray-500">Powered by AI Assistant</span>
        </div>
      </div>
    </div>
  )}

{/* Add CSS animations */}
<style jsx>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`}</style>
    </SafeAreaView>
  );
}