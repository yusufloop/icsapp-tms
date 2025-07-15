import { ICSBOLTZ_ROLE_DEFINITIONS, UserRole, getCurrentUserRole, setCurrentUserRole, subscribeToRoleChanges } from '@/constants/UserRoles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MoreScreen() {
  const [currentUserRole, setCurrentUserRoleState] = useState<UserRole>(getCurrentUserRole());
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Subscribe to role changes
  React.useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentUserRoleState(newRole);
    });

    return unsubscribe;
  }, []);

  // Get mobile-specific roles (Admin, Driver only)
  const mobileRoles: UserRole[] = ['ADMIN', 'DRIVER'];
  const roleOptions = Object.entries(ICSBOLTZ_ROLE_DEFINITIONS)
    .filter(([key]) => mobileRoles.includes(key as UserRole))
    .map(([key, config]) => ({
      value: key as UserRole,
      label: config.name,
      description: config.description,
    }));

  const handleRoleChange = (newRole: UserRole) => {
    // Update the global role state
    setCurrentUserRole(newRole);
    setShowRolePicker(false);
    
    Alert.alert(
      'Role Changed',
      `Your role has been changed to ${ICSBOLTZ_ROLE_DEFINITIONS[newRole].name}. The app will reflect the new permissions.`,
      [{ text: 'OK' }]
    );
  };

  // Navigation handlers for all available pages
  const handleNewBooking = () => {
    router.push('/new-booking');
  };

  const handleNewRequest = () => {
    router.push('/new-request');
  };

  const handleNewUser = () => {
    router.push('/new-user');
  };

  const handleEditUser = () => {
    router.push('/user');
  };

  const handleResubmitRequest = () => {
    router.push('/resubmit-request');
  };

  const handleViewRequest = () => {
    router.push('/view-request');
  };

  const handleSummary = () => {
    router.push('/summary');
  };

  const handleRecall = () => {
    router.push('/recall');
  };

  const handleDashboard = () => {
    router.push('/');
  };

  // Only define handlers for screens that exist in your routes
  const handleRequests = () => router.push('/requests');
  const handleNotifications = () => router.push('/notifications');
  const handleScan = () => router.push('/scan');
  const handleUsers = () => router.push('/user');
  const handleDemurrage = () => router.push('/demurrage');
  const handleCompliance = () => router.push('/compliance');
 
  // Remove compliance/help if those screens do not exist

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="star" size={24} color="#000" />
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* User Role Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Role</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* Current Role Display */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setShowRolePicker(!showRolePicker)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-circle-outline" size={20} color="#666" style={styles.menuIcon} />
              <View style={styles.roleInfo}>
                <Text style={styles.menuItemText}>
                  {ICSBOLTZ_ROLE_DEFINITIONS[currentUserRole].name}
                </Text>
                <Text style={styles.roleDescription}>
                  {ICSBOLTZ_ROLE_DEFINITIONS[currentUserRole].description}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={showRolePicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#999" 
            />
          </TouchableOpacity>

          {/* Role Picker Dropdown */}
          {showRolePicker && (
            <View style={styles.rolePickerContainer}>
              <View style={styles.separator} />
              {roleOptions.map((role, index) => (
                <View key={role.value}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      currentUserRole === role.value && styles.selectedRoleOption
                    ]}
                    onPress={() => handleRoleChange(role.value)}
                  >
                    <View style={styles.roleOptionContent}>
                      <Text style={[
                        styles.roleOptionText,
                        currentUserRole === role.value && styles.selectedRoleText
                      ]}>
                        {role.label}
                      </Text>
                      <Text style={[
                        styles.roleOptionDescription,
                        currentUserRole === role.value && styles.selectedRoleDescription
                      ]}>
                        {role.description}
                      </Text>
                    </View>
                    {currentUserRole === role.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                  {index < roleOptions.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Navigation Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Navigation</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* Dashboard */}
          <TouchableOpacity style={styles.menuItem} onPress={handleDashboard}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Requests */}
          <TouchableOpacity style={styles.menuItem} onPress={handleRequests}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>My Booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Notifications */}
          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Scan */}
          <TouchableOpacity style={styles.menuItem} onPress={handleScan}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="qr-code-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>QR Scan</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Users */}
          <TouchableOpacity style={styles.menuItem} onPress={handleUsers}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Users</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Create New Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Create New</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* New Booking */}
          <TouchableOpacity style={styles.menuItem} onPress={handleNewBooking}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="add-circle-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>New Booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />


          {/* New User */}
          <TouchableOpacity style={styles.menuItem} onPress={handleNewUser}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-add-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>New User</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Request Management Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Request Management</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* View Booking */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-booking')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="eye-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>View Booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />


          {/* Recall */}
          <TouchableOpacity style={styles.menuItem} onPress={handleRecall}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="return-up-back-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Recall Booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* User Management Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Management</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* Edit User */}
          <TouchableOpacity style={styles.menuItem} onPress={handleEditUser}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Edit User</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Configuration Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Configuration</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* Demurrage */}
          <TouchableOpacity style={styles.menuItem} onPress={handleDemurrage}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="boat-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Demurrage Management</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Compliance */}
          <TouchableOpacity style={styles.menuItem} onPress={handleCompliance}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Other Charges Management</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Reports Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reports</Text>
        </View>
        <View style={styles.menuContainer}>
          {/* Summary */}
          <TouchableOpacity style={styles.menuItem} onPress={handleSummary}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Summary Report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
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
    height: 200,
  },
  bottomSpacer: {
    height: 40,
  },
  roleInfo: {
    flex: 1,
  },
  roleDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rolePickerContainer: {
    backgroundColor: '#fff',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectedRoleOption: {
    backgroundColor: '#f0f8ff',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  selectedRoleText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  selectedRoleDescription: {
    color: '#007AFF',
  },
});
