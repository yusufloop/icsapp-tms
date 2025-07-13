import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ICSBOLTZ_CURRENT_USER_ROLE } from '@/constants/UserRoles';

export default function MoreScreen() {
  // Check if current user is a requester - hide View Request for requesters
  const isRequester = ICSBOLTZ_CURRENT_USER_ROLE === 'REQUESTER';

  const handleNewRequest = () => {
    router.push('/new-request');
  };

  const handleResubmitRequest = () => {
    router.push('/resubmit-request');
  };

  const handleViewRequest = () => {
    router.push('/view-request');
  };

  const handleHelpSupport = () => {
    console.log('Navigate to Help & Support');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="star" size={24} color="#000" />
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Menu Items Container */}
        <View style={styles.menuContainer}>
          {/* New Request */}
          <TouchableOpacity style={styles.menuItem} onPress={handleNewRequest}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="add-circle-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>New Request</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Separator Line */}
          <View style={styles.separator} />

          {/* Resubmit Request */}
          <TouchableOpacity style={styles.menuItem} onPress={handleResubmitRequest}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="refresh-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Resubmit Request</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Conditional separator and View Request - only show for non-requesters */}
          {!isRequester && (
            <>
              {/* Separator Line */}
              <View style={styles.separator} />

              {/* View Request */}
              <TouchableOpacity style={styles.menuItem} onPress={handleViewRequest}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="eye-outline" size={20} color="#666" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>View Request</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Large spacing between sections */}
        <View style={styles.largeSpacer} />

        {/* Help & Support Section */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleHelpSupport}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 12,
    color: '#000',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginLeft: 20,
  },
  largeSpacer: {
    height: 200, // Large spacing to match the image layout
  },
});
