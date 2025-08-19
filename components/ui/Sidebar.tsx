import { DesignSystem } from '@/constants/DesignSystem';
import { UserRole, getCurrentUserRole, getRoleConfig, subscribeToRoleChanges } from '@/constants/UserRoles';
import { useAuth } from '@/lib/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
// Import Animated, Easing, and create an animatable version of MaterialIcons
import { Animated, Easing, Image, Text, TouchableOpacity, View } from 'react-native';

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUserRole());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();

  // --- Animation Setup ---
  // useRef to hold the animation value so it persists across re-renders
  const animation = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;

  useEffect(() => {
    // Run the animation whenever isCollapsed changes
    Animated.timing(animation, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300, // Animation duration in milliseconds
      easing: Easing.bezier(0.4, 0, 0.2, 1), // A standard easing curve for a natural feel
      useNativeDriver: false, // 'width' and 'margin' are not supported by the native driver
    }).start();
  }, [isCollapsed, animation]);

  // --- Interpolated Styles ---
  // Create animated styles by interpolating the animation value (0 to 1)
  const animatedWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 280], // Collapsed width to Expanded width
  });

  const iconMarginRight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12], // Margin when collapsed to margin when expanded
  });

  const contentOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1], // Content stays transparent until halfway through the expansion
  });

  const logoIconOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // The small icon is visible when collapsed, and fades out
  });

  // Subscribe to role changes
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentRole(newRole);
    });
    return unsubscribe;
  }, []);

  const getRoleBasedNavigation = (): NavigationItem[] => {
    const baseNavigation: NavigationItem[] = [
        { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', route: '/' },
        { id: 'booking', title: 'Booking', icon: 'local-shipping', route: '/requests' },
    ];
    const roleSpecificItems: NavigationItem[] = [];
    switch (currentRole) {
        case 'REQUESTER': roleSpecificItems.push({ id: 'scan', title: 'QR Scan', icon: 'qr-code-scanner', route: '/scan' }); break;
        case 'HEAD_OF_DEPARTMENT': case 'GENERAL_MANAGER': roleSpecificItems.push({ id: 'notifications', title: 'Notifications', icon: 'notifications', route: '/notifications' }); break;
        case 'DRIVER': roleSpecificItems.push({ id: 'routes', title: 'Routes', icon: 'route', route: '/routes' }); break;
        case 'ADMIN': roleSpecificItems.push({ id: 'users', title: 'Users', icon: 'people', route: '/user' }, { id: 'notifications', title: 'Notifications', icon: 'notifications', route: '/notifications' }); break;
        default: roleSpecificItems.push({ id: 'scan', title: 'QR Scan', icon: 'qr-code-scanner', route: '/scan' });
    }
    return [...baseNavigation, ...roleSpecificItems, { id: 'more', title: 'Settings', icon: 'more-horiz', route: '/more' }];
  };

  const mainNavigation = getRoleBasedNavigation();
  const userNavigation: NavigationItem[] = [
    { id: 'notifications-user', title: 'Notifications', icon: 'notifications', route: '/notifications' },
    { id: 'profile', title: 'Profile', icon: 'person', route: '/profile' },
    { id: 'logout', title: 'Log Out', icon: 'logout', route: '/logout' },
  ];

  const isActiveRoute = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  const handleNavigation = (route: string, id: string) => {
    if (id === 'logout') {
      signOut();
      return;
    }
    router.push(route as any);
  };

  const renderNavigationItem = (item: NavigationItem, isActive: boolean) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleNavigation(item.route, item.id)}
      className={`flex-row items-center px-4 py-3 mx-3 rounded-lg transition-all duration-200 ${
        isActive ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 active:bg-gray-100'
      }`}
      style={{
        shadowColor: isActive ? DesignSystem.colors.primary[500] : 'transparent',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isActive ? 0.1 : 0,
        shadowRadius: 2,
        elevation: isActive ? 1 : 0,
      }}
    >
      <AnimatedMaterialIcons
        name={item.icon}
        size={20}
        color={isActive ? DesignSystem.colors.primary[500] : DesignSystem.colors.text.secondary}
        style={{ marginRight: iconMarginRight }} // Use animated margin
      />
      <Animated.View style={{ opacity: contentOpacity, flex: 1, overflow: 'hidden' }}>
        <Text
          className={`text-base font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <Animated.View className={`bg-white border-r border-gray-200 ${className}`} style={{ width: animatedWidth }}>
      {/* Logo Section */}
      <View className="px-6 py-6 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setIsCollapsed(!isCollapsed)}
          className="flex-row items-center justify-center active:opacity-80"
          style={{ height: 40 }} // Fixed height prevents layout jumps during animation
        >
          <Animated.Image
            source={require('@/assets/images/Logitrax_ic.png')}
            style={{ width: 32, height: 32, opacity: logoIconOpacity, position: 'absolute' }}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('@/assets/images/Logitrax_Lg.png')}
            style={{ width: 180, height: 40, opacity: contentOpacity, position: 'absolute' }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Area - fades in and out */}
      <Animated.View style={{ opacity: contentOpacity, flex: 1 }}>
        {/* Main Navigation */}
        <View className="flex-1 py-4">
          <View className="px-3 mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Navigation
            </Text>
            {mainNavigation.map((item) => renderNavigationItem(item, isActiveRoute(item.route)))}
          </View>
        </View>

        {/* User Navigation */}
        <View className="border-t border-gray-100 py-4">
          <View className="px-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Account
            </Text>
            
            {/* Profile Section with Avatar */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 mx-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
            >
              <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="person" size={16} color={DesignSystem.colors.text.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>John Doe</Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>{getRoleConfig(currentRole).name}</Text>
              </View>
            </TouchableOpacity>

            {/* Other User Navigation */}
            {userNavigation.filter(item => item.id !== 'profile').map((item) => 
              renderNavigationItem(item, isActiveRoute(item.route))
            )}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}