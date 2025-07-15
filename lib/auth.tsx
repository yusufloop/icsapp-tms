import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Extended user type that includes role information
interface ExtendedUser extends User {
  roles?: string[];
  roleIds?: number[];
  user_roles?: {
    role_id: number;
    role: {
      role_id: number;
      role_name: string;
    };
  }[];
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string
  ) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  getUserRoles: () => string[];
  getRoleIds: () => number[];
  hasRole: (roleName: string) => boolean;
  hasRoleId: (roleId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Keys for any custom storage you might use
const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CACHED_USER_DATA: 'cached_user_data',
  APP_SETTINGS: 'app_settings',
  // Add any other keys you use in your app
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // Function to clear all local storage
  const clearLocalStorage = useCallback(async () => {
    try {
      console.log('[Auth] Clearing local storage...');
      
      // Clear AsyncStorage items
      const asyncStorageKeys = Object.values(STORAGE_KEYS);
      await Promise.all(
        asyncStorageKeys.map(async (key) => {
          try {
            await AsyncStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to clear AsyncStorage key: ${key}`, error);
          }
        })
      );

      // Clear SecureStore items (if you use any custom ones)
      const secureStoreKeys = [
        'custom_token',
        'user_credentials',
        // Add any SecureStore keys you use
      ];
      
      await Promise.all(
        secureStoreKeys.map(async (key) => {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            console.warn(`Failed to clear SecureStore key: ${key}`, error);
          }
        })
      );

      // Clear web storage if on web platform
      if (Platform.OS === 'web') {
        try {
          // Clear only app-specific localStorage keys, not all
          const webStorageKeys = [
            'supabase.auth.token',
            'sb-',
            // Add any specific web storage keys
          ];
          
          webStorageKeys.forEach(key => {
            try {
              if (key.endsWith('-')) {
                // Clear keys that start with the prefix
                Object.keys(localStorage).forEach(storageKey => {
                  if (storageKey.startsWith(key)) {
                    localStorage.removeItem(storageKey);
                  }
                });
              } else {
                localStorage.removeItem(key);
              }
            } catch (error) {
              console.warn(`Failed to clear web storage key: ${key}`, error);
            }
          });
        } catch (error) {
          console.warn('Failed to clear web storage:', error);
        }
      }
      
      console.log('[Auth] Local storage cleared successfully');
    } catch (error) {
      console.error('[Auth] Error clearing local storage:', error);
    }
  }, []);

  // Function to fetch user with roles
  const fetchUserWithRoles = async (userId: string): Promise<ExtendedUser | null> => {
    try {
      // Get user roles with role details
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select(`
          role_id,
          role:roles (
            role_id,
            role_name
          )
        `)
        .eq("user_id", userId);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        return null;
      }

      // Get current session to get user data
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;

      // Extend user object with roles
      const extendedUser: ExtendedUser = {
        ...session.user,
        roles: userRoles?.map(ur => ur.role?.role_name).filter(Boolean) || [],
        roleIds: userRoles?.map(ur => ur.role_id).filter(Boolean) || [],
        user_roles: userRoles
      };

      return extendedUser;
    } catch (error) {
      console.error("Error in fetchUserWithRoles:", error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const userWithRoles = await fetchUserWithRoles(session.user.id);
        setUser(userWithRoles);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event);
      setSession(session);
      
      if (event === "SIGNED_IN" && session?.user) {
        const userWithRoles = await fetchUserWithRoles(session.user.id);
        setUser(userWithRoles);
      } else if (event === "SIGNED_OUT") {
        console.log('[Auth] User signed out, clearing state');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      // Redirect to app if authenticated
      router.replace("/(app)/(tabs)");
    }
  }, [user, segments, loading]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Use Supabase's built-in authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { error: error.message, success: false };
      }

      if (!data.user) {
        return { error: "Failed to sign in", success: false };
      }

      // User will be set automatically by the auth state change listener
      return { success: true };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: "An unexpected error occurred", success: false };
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    fullName: string,
    role: string = "client" // Default role
  ) => {
    try {
      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        console.error("Sign up error:", authError);
        return { error: authError.message, success: false };
      }

      if (!authData.user) {
        return { error: "Failed to create account", success: false };
      }

      // Wait a bit for the user to be created in the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assign role to user
      try {
        // First, get the role_id for the specified role
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("role_id")
          .eq("role_name", role)
          .single();

        if (roleError || !roleData) {
          console.warn(`Role '${role}' not found, user created without role`);
        } else {
          // Assign role to user
          const { error: userRoleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: authData.user.id,
              role_id: roleData.role_id,
            });

          if (userRoleError) {
            console.error("Error assigning role:", userRoleError);
          }
        }
      } catch (roleAssignError) {
        console.error("Error in role assignment:", roleAssignError);
        // Don't fail the signup if role assignment fails
      }

      return { 
        success: true, 
        message: "Registration successful! Please check your email for verification." 
      };
    } catch (err) {
      console.error("Sign up error:", err);
      return { error: "An unexpected error occurred", success: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Starting sign out process...');
      
      // Step 1: Clear local storage first
      await clearLocalStorage();
      
      // Step 2: Clear app state
      setUser(null);
      setSession(null);
      
      // Step 3: Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase sign out error:", error);
        // Even if Supabase signOut fails, we've already cleared local state
      } else {
        console.log('[Auth] Supabase sign out successful');
      }
      
      console.log('[Auth] Sign out process completed');
      
    } catch (err) {
      console.error("Sign out error:", err);
      // Even if there's an error, ensure local state is cleared
      setUser(null);
      setSession(null);
      await clearLocalStorage();
    }
  }, [clearLocalStorage]);

  const getUserRoles = useCallback((): string[] => {
    return user?.roles || [];
  }, [user]);

  const getRoleIds = useCallback((): number[] => {
    return user?.roleIds || [];
  }, [user]);

  const hasRole = useCallback((roleName: string): boolean => {
    return user?.roles?.includes(roleName) || false;
  }, [user]);

  const hasRoleId = useCallback((roleId: number): boolean => {
    return user?.roleIds?.includes(roleId) || false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        getUserRoles,
        getRoleIds,
        hasRole,
        hasRoleId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};