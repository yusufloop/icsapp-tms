import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { UserRole, getCurrentUserRole, subscribeToRoleChanges } from "@/constants/UserRoles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUserRole());

  // Subscribe to role changes to update navigation dynamically
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentRole(newRole);
    });

    return unsubscribe;
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Base tabs - always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="requests"
        options={{
          title: "Booking",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="local-shipping" size={24} color={color} />
          ),
        }}
      />

      {/* Role-specific tabs */}
      {currentRole === "REQUESTER" && (
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="qr-code-scanner" size={24} color={color} />
            ),
          }}
        />
      )}

      

      {currentRole === "DRIVER" && (
        <Tabs.Screen
          name="routes"
          options={{
            title: "Routes",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="route" size={24} color={color} />
            ),
          }}
        />
      )}

      {currentRole === "ADMIN" && (
        <Tabs.Screen
          name="user"
          options={{
            title: "Users",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="people" size={24} color={color} />
            ),
          }}
        />
      )}

      {/* More tab - always visible */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="more-horiz" size={24} color={color} />
          ),
        }}
      />

      {(currentRole === "DRIVER"  ) && (
        <Tabs.Screen
          name="notifications"
          options={{
            title:"notifications",
             href: null,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="notifications" size={24} color={color} />
            ),
          }}
        />
      )}
      {( currentRole === "ADMIN" || currentRole === "CLIENT" || currentRole === "CLERK") && (
        <Tabs.Screen
          name="notifications"
          options={{
            title:"notifications",
            
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="notifications" size={24} color={color} />
            ),
          }}
        />
      )}
      
      {currentRole !== "ADMIN" && (
        <Tabs.Screen
          name="user"
          options={{
            href: null, // This hides the tab from navigation
          }}
        />
      )}

      {currentRole !== "REQUESTER" && (
        <Tabs.Screen
          name="scan"
          options={{
            href: null, // This hides the tab from navigation
          }}
        />
      )}

      {currentRole !== "DRIVER" && (
        <Tabs.Screen
          name="routes"
          options={{
            href: null, // This hides the tab from navigation
          }}
        />
      )}

      <Tabs.Screen
        name="ItemDetails"
        options={{
          href: null, // This hides the tab from navigation
          headerShown: true,
        }}
      />
    </Tabs>
  );
}