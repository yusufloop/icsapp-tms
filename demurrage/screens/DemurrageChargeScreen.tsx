import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DemurrageChargeScreenProps {
  navigation: any;
}

export default function DemurrageChargeScreen({ navigation }: DemurrageChargeScreenProps) {
  const [demurrageCharge, setDemurrageCharge] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAdd = () => {
    console.log('Demurrage Charge:', demurrageCharge);
    // Handle add functionality here
    navigation.goBack();
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
          <Text style={styles.inputLabel}>Demurrage Charge</Text>
          
          <TextInput
            style={styles.input}
            value={demurrageCharge}
            onChangeText={setDemurrageCharge}
            placeholder=""
            placeholderTextColor="#999"
          />
        </View>

        {/* Add Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addButton,
              !demurrageCharge.trim() && styles.addButtonDisabled
            ]}
            onPress={handleAdd}
            disabled={!demurrageCharge.trim()}
          >
            <Text style={[
              styles.addButtonText,
              !demurrageCharge.trim() && styles.addButtonTextDisabled
            ]}>
              Add
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
    flex: 1,
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
});