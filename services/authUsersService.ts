
// 🎯 SIMPLIFIED AUTH USERS SERVICE
// services/authUsersService.ts

import { supabase } from '@/lib/supabase'

// =====================================================================
// 📋 TYPE DEFINITIONS
// =====================================================================
export interface UserBasicInfo {
  id: string
  email: string
  display_name?: string
}

export interface AuthUser {
  id: string
  email: string
  display_name?: string
  role?: string
  phone?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
}

// =====================================================================
// 📋 SIMPLIFIED AUTH USERS SERVICE
// =====================================================================
export class AuthUsersService {
  
  // Get user basic info (lightweight - just id, email, display_name)
  static async getUserBasicInfo(userId: string): Promise<UserBasicInfo | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_basic_info', { user_id: userId })
        .single()
      
      if (error) throw error
      return data;
    } catch (error) {
      console.error('Error fetching user basic info:', error)
      return null;
    }
  }

  // Get single user by ID (detailed info)
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_by_id', { user_id: userId })
        .single()
      
      if (error) throw error
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null;
    }
  }

  // Get multiple users by IDs
  static async getUsersByIds(userIds: string[]): Promise<AuthUser[]> {
    try {
      if (!userIds || userIds.length === 0) return []
      
      const { data, error } = await supabase
        .rpc('get_users_by_ids', { user_ids: userIds })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users by IDs:', error)
      return []
    }
  }
}

// =====================================================================
// 📋 UTILITY FUNCTIONS
// =====================================================================

// Get display name or fallback
export const getDisplayName = (user: UserBasicInfo | AuthUser | null): string => {
  if (!user) return 'Unknown User'
  return user.display_name || user.email?.split('@')[0] || 'Anonymous'
}

// Get user initials for avatars
export const getUserInitials = (user: UserBasicInfo | AuthUser | null): string => {
  if (!user?.display_name) return user?.email?.charAt(0).toUpperCase() || '?'
  
  const names = user.display_name.split(' ')
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
  }
  return user.display_name.charAt(0).toUpperCase()
}

// Format user role for display
export const formatUserRole = (role?: string): string => {
  if (!role) return 'User'
  return role.charAt(0).toUpperCase() + role.slice(1)
}