import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { UserRole, ICSBOLTZ_ROLE_DEFINITIONS } from '@/constants/UserRoles';

type UserStatus = 'online' | 'active' | 'suspended' | 'terminated';

interface FormData {
  name: string;
  email: string;
  phoneNo: string;
  role: UserRole | '';
  status: UserStatus | '';
  profileImage: string | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNo?: string;
  role?: string;
  status?: string;
}

export default function EditUserScreen() {
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNo: '',
    role: '',
    status: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Pre-populate form with user data
  useEffect(() => {
    if (params && params.name) {
      setFormData({
        name: (params.name as string) || '',
        email: (params.email as string) || '',
        phoneNo: (params.phoneNo as string) || '',
        role: (params.role as UserRole) || '',
        status: (params.status as UserStatus) || '',
        profileImage: (params.profileImage as string) || null,
      });
    }
  }, [params.name, params.email, params.phoneNo, params.role, params.status, params.profileImage]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNo) || formData.phoneNo.length < 8) {
      newErrors.phoneNo = 'Please enter a valid phone number';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically send the updated data to your backend
      Alert.alert(
        'Success',
        'User has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const handleAdvanced = () => {
    // Navigate to advanced settings screen (placeholder)
    Alert.alert('Advanced Settings', 'Advanced settings screen would open here.');
  };

  const roleOptions = Object.entries(ICSBOLTZ_ROLE_DEFINITIONS).map(([key, config]) => ({
    value: key as UserRole,
    label: config.name,
  }));

  const statusOptions = [
    { value: 'active' as UserStatus, label: 'Active' },
    { value: 'suspended' as UserStatus, label: 'Suspended' },
    { value: 'terminated' as UserStatus, label: 'Terminated' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Edit User</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Upload Section */}
        <View className="mt-6 mb-8">
          <TouchableOpacity
            onPress={handleImagePicker}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 items-center justify-center mr-4">
              {formData.profileImage ? (
                <View className="w-full h-full rounded-full bg-gray-200 items-center justify-center">
                  <MaterialIcons name="person" size={24} color="#9CA3AF" />
                </View>
              ) : (
                <MaterialIcons name="person" size={24} color="#9CA3AF" />
              )}
            </View>
            <Text className="text-gray-500 text-base">Upload image here</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
          {/* Name Field */}
          <View>
            <Text className="text-gray-500 text-sm mb-2">Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Enter full name"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
            )}
          </View>

          {/* Email Field */}
          <View>
            <Text className="text-gray-500 text-sm mb-2">Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, email: text }));
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="Enter email address"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Phone Number Field */}
          <View>
            <Text className="text-gray-500 text-sm mb-2">Phone No</Text>
            <TextInput
              value={formData.phoneNo}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, phoneNo: text }));
                if (errors.phoneNo) {
                  setErrors(prev => ({ ...prev, phoneNo: undefined }));
                }
              }}
              placeholder="Enter phone number"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.phoneNo ? 'border-red-500' : 'border-gray-200'
              }`}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
            {errors.phoneNo && (
              <Text className="text-red-500 text-sm mt-1">{errors.phoneNo}</Text>
            )}
          </View>

          {/* Role Field */}
          <View>
            <Text className="text-gray-500 text-sm mb-2">Role</Text>
            <TouchableOpacity
              onPress={() => setShowRolePicker(!showRolePicker)}
              className={`bg-white border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                errors.role ? 'border-red-500' : 'border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text className={`text-base ${formData.role ? 'text-gray-900' : 'text-gray-400'}`}>
                {formData.role ? ICSBOLTZ_ROLE_DEFINITIONS[formData.role].name : 'Select role'}
              </Text>
              <Ionicons 
                name={showRolePicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
            {errors.role && (
              <Text className="text-red-500 text-sm mt-1">{errors.role}</Text>
            )}

            {/* Role Picker Dropdown */}
            {showRolePicker && (
              <View className="bg-white border border-gray-200 rounded-lg mt-2 overflow-hidden">
                {roleOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, role: option.value }));
                      setShowRolePicker(false);
                      if (errors.role) {
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }
                    }}
                    className={`px-4 py-3 ${
                      index < roleOptions.length - 1 ? 'border-b border-gray-100' : ''
                    } ${formData.role === option.value ? 'bg-blue-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-base ${
                      formData.role === option.value ? 'text-blue-600 font-medium' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Status Field */}
          <View>
            <Text className="text-gray-500 text-sm mb-2">Status</Text>
            <TouchableOpacity
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              className={`bg-white border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                errors.status ? 'border-red-500' : 'border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text className={`text-base ${formData.status ? 'text-gray-900' : 'text-gray-400'}`}>
                {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Select status'}
              </Text>
              <Ionicons 
                name={showStatusPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
            {errors.status && (
              <Text className="text-red-500 text-sm mt-1">{errors.status}</Text>
            )}

            {/* Status Picker Dropdown */}
            {showStatusPicker && (
              <View className="bg-white border border-gray-200 rounded-lg mt-2 overflow-hidden">
                {statusOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, status: option.value }));
                      setShowStatusPicker(false);
                      if (errors.status) {
                        setErrors(prev => ({ ...prev, status: undefined }));
                      }
                    }}
                    className={`px-4 py-3 ${
                      index < statusOptions.length - 1 ? 'border-b border-gray-100' : ''
                    } ${formData.status === option.value ? 'bg-blue-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-base ${
                      formData.status === option.value ? 'text-blue-600 font-medium' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Advanced Link */}
        <TouchableOpacity
          onPress={handleAdvanced}
          className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex-row items-center justify-between mt-8"
          activeOpacity={0.7}
        >
          <Text className="text-base text-gray-900">Advanced</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Bottom spacing for sticky button */}
        <View className="h-32" />
      </ScrollView>

      {/* Sticky Update Button */}
      <View className="px-6 pb-6 bg-gray-50">
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          className="overflow-hidden rounded-xl"
        >
          <LinearGradient
            colors={['#409CFF', '#0A84FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center"
          >
            <Text className="text-white text-lg font-semibold">Update</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
