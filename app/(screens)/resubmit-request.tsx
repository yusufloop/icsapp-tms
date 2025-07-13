import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- INTERFACES AND CONSTANTS ---
interface RequestFormData {
  itemRequested: string;
  quantity: string;
  reasonForRequest: string;
  phoneNo: string;
  dateNeededBy: Date | null;
  priority: 'Low' | 'Medium' | 'High' | null;
  chargeToDepartment: string;
  attachments: any[];
  hodComments: string; // New field for Head of Department comments
}

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'Low', color: '#30D158' },
  { label: 'Medium', value: 'Medium', color: '#FF9F0A' },
  { label: 'High', value: 'High', color: '#FF453A' },
];

const DEPARTMENT_OPTIONS = [
  'Design Department',
  'Engineering Department',
  'Marketing Department',
  'Sales Department',
  'HR Department',
  'Finance Department',
  'Operations Department',
];

// --- MAIN COMPONENT ---
export default function ResubmitRequestScreen() {
  const params = useLocalSearchParams();
  
  // Initialize form data with existing request data if available
  const [formData, setFormData] = useState<RequestFormData>({
    itemRequested: (params.itemRequested as string) || '',
    quantity: (params.quantity as string) || '',
    reasonForRequest: (params.reasonForRequest as string) || '',
    phoneNo: (params.phoneNo as string) || '',
    dateNeededBy: params.dateNeededBy ? new Date(params.dateNeededBy as string) : null,
    priority: (params.priority as 'Low' | 'Medium' | 'High') || 'High',
    chargeToDepartment: (params.chargeToDepartment as string) || '',
    attachments: [],
    hodComments: (params.hodComments as string) || 'Request requires additional documentation and clarification on budget allocation. Please provide detailed specifications and updated cost estimates.',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  // --- HANDLER FUNCTIONS ---
  const updateField = (field: keyof RequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('dateNeededBy', selectedDate);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets[0]) {
        updateField('attachments', [...formData.attachments, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = () => {
    if (!formData.itemRequested.trim()) {
      Alert.alert('Error', 'Please enter the item requested');
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Request resubmitted:', formData);
    
    // Show success message and navigate back
    Alert.alert(
      'Success', 
      'Your request has been resubmitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };
  
  // --- HELPER FUNCTIONS ---
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getPriorityInfo = (priority: string | null) => {
    const defaultOption = { color: '#FF453A', bgColor: '#FF453A20' }; // High
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    if (!option) return defaultOption;

    switch (option.value) {
      case 'High': return { color: '#FF453A', bgColor: '#FF453A20' };
      case 'Medium': return { color: '#FF9F0A', bgColor: '#FF9F0A20' };
      case 'Low': return { color: '#30D158', bgColor: '#30D15820' };
      default: return defaultOption;
    }
  };

  // --- RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(300)}
          className="flex-row items-center px-4 py-3"
        >
          <TouchableOpacity 
            onPress={handleBack}
            className="p-2 -ml-2 mr-2 active:opacity-70"
          >
            <MaterialIcons name="arrow-back" size={28} color="#1C1C1E" />
          </TouchableOpacity>
          
          <View>
            <Text className="text-xl font-bold text-text-primary">
              Resubmit Request
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Update your request based on the feedback below
            </Text>
          </View>
        </Animated.View>

        {/* Form Content */}
        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Animated.View 
            entering={SlideInUp.delay(200).duration(400)}
            className="pt-4 space-y-6"
          >
            {/* Head of Department Comments - New Field */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2">Comments from Head of Department</Text>
              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <View className="flex-row items-start mb-2">
                  <MaterialIcons name="info-outline" size={20} color="#FF453A" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text className="text-sm font-medium text-red-700 flex-1">
                    Please address the following feedback:
                  </Text>
                </View>
                <Text className="text-base text-red-800 leading-relaxed">
                  {formData.hodComments}
                </Text>
              </View>
            </View>

            {/* Item Requested */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2">Item Requested</Text>
              <TextInput
                value={formData.itemRequested}
                onChangeText={(text) => updateField('itemRequested', text)}
                className="bg-bg-secondary rounded-lg text-base text-text-primary font-system shadow-sm border border-gray-200 px-4 py-3"
              />
            </View>

            {/* Quantity */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Quantity</Text>
              <View className="w-28">
                <TextInput
                  value={formData.quantity}
                  onChangeText={(text) => updateField('quantity', text)}
                  keyboardType="numeric"
                  className="bg-bg-secondary rounded-lg text-base text-text-primary font-system shadow-sm border border-gray-200 px-4 py-3"
                />
              </View>
            </View>

            {/* Reason for Request */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Reason for Request</Text>
              <TextInput
                value={formData.reasonForRequest}
                onChangeText={(text) => updateField('reasonForRequest', text)}
                multiline
                textAlignVertical="top"
                className="bg-bg-secondary rounded-lg text-base text-text-primary font-system shadow-sm border border-gray-200 min-h-[100px] px-4 py-3"
              />
            </View>

            {/* Phone No */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Phone No</Text>
              <TextInput
                value={formData.phoneNo}
                onChangeText={(text) => updateField('phoneNo', text)}
                keyboardType="phone-pad"
                className="bg-bg-secondary rounded-lg text-base text-text-primary font-system shadow-sm border border-gray-200 px-4 py-3"
              />
            </View>

            {/* Date and Priority Row */}
            <View className="flex-row space-x-4">
              <View className="flex-1 mr-10">
                <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Date Needed By</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <PremiumCard padding="">
                    <View className="flex-row items-center justify-between px-4 py-3">
                      <Text className={`text-base font-system ${formData.dateNeededBy ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {formData.dateNeededBy ? formatDate(formData.dateNeededBy) : 'Select date'}
                      </Text>
                      <MaterialIcons name="chevron-right" size={24} color="#8A8A8E" />
                    </View>
                  </PremiumCard>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Priority</Text>
                <TouchableOpacity onPress={() => setShowPriorityPicker(true)}>
                  <View 
                    className="rounded-lg flex-row items-center justify-between px-4 py-3"
                    style={{ backgroundColor: getPriorityInfo(formData.priority).bgColor }}
                  >
                    <Text className="text-base font-medium font-system" style={{ color: getPriorityInfo(formData.priority).color }}>
                      {formData.priority}
                    </Text>
                    <MaterialIcons name="chevron-right" size={24} color={getPriorityInfo(formData.priority).color} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Charge To Department */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Charge To Department</Text>
              <TouchableOpacity onPress={() => setShowDepartmentPicker(true)}>
                <PremiumCard padding="">
                  <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className={`text-base font-system ${formData.chargeToDepartment ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {formData.chargeToDepartment || 'Select department'}
                    </Text>
                    <MaterialIcons name="unfold-more" size={24} color="#8A8A8E" />
                  </View>
                </PremiumCard>
              </TouchableOpacity>
            </View>

            {/* Attachments / Link */}
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2 pt-4">Attachments / Link</Text>
              <TouchableOpacity onPress={handleFileUpload}>
                <View className="border border-gray-300 border-dashed rounded-lg p-4 items-center justify-center min-h-[80px]">
                  <Text className="text-base text-text-secondary font-system">Upload file</Text>
                </View>
              </TouchableOpacity>
              
              {formData.attachments.length > 0 && (
                <View className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <View key={index} className="flex-row items-center bg-gray-100 p-3 rounded-lg">
                      <MaterialIcons name="attach-file" size={20} color="#8A8A8E" />
                      <Text className="text-sm text-text-primary ml-2 flex-1" numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => updateField('attachments', formData.attachments.filter((_, i) => i !== index))}>
                        <MaterialIcons name="close" size={20} color="#8A8A8E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Sticky Resubmit Button */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(300)}
          className="absolute bottom-0 left-0 right-0 bg-bg-primary pt-3 pb-6 px-6 border-t border-gray-200"
        >
          <PremiumButton title="Resubmit" onPress={handleSubmit} variant="gradient" size="lg" />
        </Animated.View>

        {/* PICKER MODALS */}
        {showDatePicker && (
          <DateTimePicker 
            value={formData.dateNeededBy || new Date()} 
            mode="date" 
            display="spinner" 
            onChange={handleDateChange} 
            minimumDate={new Date()} 
          />
        )}

        <Modal visible={showPriorityPicker} transparent animationType="fade" onRequestClose={() => setShowPriorityPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <PremiumCard style={{ width: '100%', maxWidth: 300 }}>
              <Text className="text-lg font-semibold text-text-primary mb-4 text-center">Select Priority</Text>
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity 
                  key={option.value} 
                  onPress={() => { 
                    updateField('priority', option.value); 
                    setShowPriorityPicker(false); 
                  }} 
                  className="py-3 border-b border-gray-200 last:border-b-0"
                >
                  <Text className="text-base font-medium text-center" style={{ color: option.color }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowPriorityPicker(false)} className="mt-4">
                <Text className="text-base text-text-secondary text-center">Cancel</Text>
              </TouchableOpacity>
            </PremiumCard>
          </View>
        </Modal>

        <Modal visible={showDepartmentPicker} transparent animationType="fade" onRequestClose={() => setShowDepartmentPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <PremiumCard style={{ width: '100%', maxWidth: 300, maxHeight: 400 }}>
              <Text className="text-lg font-semibold text-text-primary mb-4 text-center">Select Department</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {DEPARTMENT_OPTIONS.map((department) => (
                  <TouchableOpacity 
                    key={department} 
                    onPress={() => { 
                      updateField('chargeToDepartment', department); 
                      setShowDepartmentPicker(false); 
                    }} 
                    className="py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <Text className="text-base text-text-primary text-center">{department}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowDepartmentPicker(false)} className="mt-4">
                <Text className="text-base text-text-secondary text-center">Cancel</Text>
              </TouchableOpacity>
            </PremiumCard>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
