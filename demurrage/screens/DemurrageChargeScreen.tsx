import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  Alert,
  TouchableOpacity, 
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDemurrageCharge } from '../../services/demurrageService';

interface DemurrageChargeScreenProps {
  navigation: any;
  route: {
    params?: {
      bookingId?: string;
    }
  };
}

export default function DemurrageChargeScreen({ navigation, route }: DemurrageChargeScreenProps) {
  const [daysOverdue, setDaysOverdue] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get bookingId from route params
  const bookingId = route.params?.bookingId || '';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAdd = async () => {
    if (!daysOverdue.trim() || !dailyRate.trim()) {
      Alert.alert('Error', 'Please enter both days overdue and daily rate');
      return;
    }
    
    if (!bookingId) {
      Alert.alert('Error', 'No booking ID provided');
      return;
    }
    
    setLoading(true);
    try {
      await addDemurrageCharge({
        booking_id: bookingId,
        days_overdue: parseInt(daysOverdue),
        daily_rate: parseFloat(dailyRate),
        location: location || undefined
      });
      
      Alert.alert(
        'Success', 
        'Demurrage charge added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding demurrage charge:', error);
      Alert.alert('Error', 'Failed to add demurrage charge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Demurrage Charge</Text>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Fill in the information below</Text>
        </View>

        {/* Form Content */}
        <View style={styles.formContainer}>          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Days Overdue</Text>
            <TextInput
              style={styles.input}
              value={daysOverdue}
              onChangeText={setDaysOverdue}
              placeholder="Enter number of days"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Daily Rate</Text>
            <TextInput
              style={styles.input}
              value={dailyRate}
              onChangeText={setDailyRate}
              placeholder="Enter daily rate"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              placeholderTextColor="#999"
            />
          </View>
          
          {bookingId ? (
            <Text style={styles.bookingInfo}>
              Adding charge to booking: {bookingId.substring(0, 8)}...
            </Text>
          ) : (
            <Text style={styles.errorText}>No booking ID provided</Text>
          )}
        </View>

        {/* Add Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addButton,
              (!daysOverdue.trim() || !dailyRate.trim() || !bookingId || loading) && styles.addButtonDisabled
            ]}
            onPress={handleAdd}
            disabled={!daysOverdue.trim() || !dailyRate.trim() || !bookingId || loading}
          >
            <Text style={[
              styles.addButtonText,
              (!daysOverdue.trim() || !dailyRate.trim() || !bookingId || loading) && styles.addButtonTextDisabled
            ]}>
              {loading ? 'Adding...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  subtitleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    flex: 1
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 52,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
  bookingInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic'
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 10
  }
});