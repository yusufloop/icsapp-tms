import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

export default function EditUserWebScreen() {
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
            onPress: () => router.push('/user'),
          },
        ]
      );
    }
  };

  const handleAdvanced = () => {
    // Navigate to advanced settings screen (placeholder)
    Alert.alert('Advanced Settings', 'Advanced settings screen would open here.');
  };

  const handleBack = () => {
    // Navigate to users page instead of router.back() to avoid navigation errors
    router.push('/user');
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center max-w-4xl mx-auto w-full">
          <TouchableOpacity 
            onPress={handleBack}
            className="mr-4 p-2 -ml-2 active:opacity-80"
          >
            <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              Edit User
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Update user account information
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content Container */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 py-6">
          <View className="max-w-2xl mx-auto w-full">
            {/* Form Card */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Form Content */}
              <View className="px-6 py-6 space-y-6">
                {/* Image Upload Section */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-text-primary mb-4">
                    Profile Picture
                  </Text>
                  <TouchableOpacity
                    onPress={handleImagePicker}
                    className="flex-row items-center active:opacity-80"
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

                {/* Name Field */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Name
                  </Text>
                  <View className={`rounded-lg bg-bg-secondary border flex-row items-center px-4 py-3 min-h-[44px] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, name: text }));
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                      placeholder="Enter full name"
                      placeholderTextColor="#8A8A8E"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.name && (
                    <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
                  )}
                </View>

                {/* Email Field */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Email
                  </Text>
                  <View className={`rounded-lg bg-bg-secondary border flex-row items-center px-4 py-3 min-h-[44px] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.email}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, email: text }));
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      placeholder="Enter email address"
                      placeholderTextColor="#8A8A8E"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email && (
                    <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
                  )}
                </View>

                {/* Phone Number Field */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Phone No
                  </Text>
                  <View className={`rounded-lg bg-bg-secondary border flex-row items-center px-4 py-3 min-h-[44px] ${
                    errors.phoneNo ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <TextInput
                      className="flex-1 text-base text-text-primary"
                      value={formData.phoneNo}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, phoneNo: text }));
                        if (errors.phoneNo) {
                          setErrors(prev => ({ ...prev, phoneNo: undefined }));
                        }
                      }}
                      placeholder="Enter phone number"
                      placeholderTextColor="#8A8A8E"
                      keyboardType="phone-pad"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.phoneNo && (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneNo}</Text>
                  )}
                </View>

                {/* Role Field */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Role
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowRolePicker(!showRolePicker);
                      setShowStatusPicker(false); // Close other picker
                    }}
                    className={`rounded-lg bg-bg-secondary border flex-row items-center justify-between px-4 py-3 min-h-[44px] active:opacity-80 ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-base ${formData.role ? 'text-text-primary' : 'text-gray-400'}`}>
                      {formData.role ? ICSBOLTZ_ROLE_DEFINITIONS[formData.role].name : 'Select role'}
                    </Text>
                    <MaterialIcons 
                      name={showRolePicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={20} 
                      color="#8A8A8E"
                    />
                  </TouchableOpacity>
                  {errors.role && (
                    <Text className="text-red-500 text-sm mt-1">{errors.role}</Text>
                  )}

                  {/* Role Picker Dropdown - Pushes content below */}
                  {showRolePicker && (
                    <View className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Role
                      </Text>
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
                          } ${formData.role === option.value ? 'bg-blue-50' : ''} active:opacity-80`}
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
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    Status
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowStatusPicker(!showStatusPicker);
                      setShowRolePicker(false); // Close other picker
                    }}
                    className={`rounded-lg bg-bg-secondary border flex-row items-center justify-between px-4 py-3 min-h-[44px] active:opacity-80 ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-base ${formData.status ? 'text-text-primary' : 'text-gray-400'}`}>
                      {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Select status'}
                    </Text>
                    <MaterialIcons 
                      name={showStatusPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={20} 
                      color="#8A8A8E"
                    />
                  </TouchableOpacity>
                  {errors.status && (
                    <Text className="text-red-500 text-sm mt-1">{errors.status}</Text>
                  )}

                  {/* Status Picker Dropdown - Pushes content below */}
                  {showStatusPicker && (
                    <View className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <Text className="text-sm font-semibold text-text-primary px-4 py-2 border-b border-gray-200">
                        Select Status
                      </Text>
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
                          } ${formData.status === option.value ? 'bg-blue-50' : ''} active:opacity-80`}
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

                {/* Advanced Link */}
                <TouchableOpacity
                  onPress={handleAdvanced}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 flex-row items-center justify-between mt-4 active:opacity-80"
                >
                  <Text className="text-base text-gray-900">Advanced</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Sticky Footer with Action Buttons */}
              <View className="border-t border-gray-200 px-6 py-4 bg-white">
                <View className="flex-row space-x-4">
                  {/* Cancel Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] items-center justify-center active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  
                  {/* Update Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={['#409CFF', '#0A84FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-lg px-4 py-3 min-h-[44px] items-center justify-center"
                    >
                      <Text className="text-base font-semibold text-white">Update</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
