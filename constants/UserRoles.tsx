/**
 * ICSBOLTZ_USER_ROLES_CONFIG - Role-based access control configuration
 * 
 * This file defines the user roles and their associated permissions for the ICS Boltz application.
 * The roles are designed to be dynamic and easily configurable for future expansion.
 * 
 * SEARCH KEYWORDS: ICSBOLTZ_USER_ROLES_CONFIG, role-based-access, user-permissions
 */

// User Role Types
export type UserRole = 'ADMIN' | 'GENERAL_MANAGER' | 'HEAD_OF_DEPARTMENT' | 'REQUESTER';

// Button Action Types
export type ButtonAction = 'scan' | 'info' | 'resubmit' | 'view_log' | 'approve' | 'reject' | 'view' | 'warranty';

// Role Configuration Interface
interface RoleConfig {
  name: string;
  description: string;
  allowedActions: ButtonAction[];
  priority: number; // Higher number = higher priority
}

/**
 * ICSBOLTZ_ROLE_DEFINITIONS - Main role configuration object
 * 
 * This constant defines all available roles and their permissions.
 * To modify role permissions, update the allowedActions array for the specific role.
 */
export const ICSBOLTZ_ROLE_DEFINITIONS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full system access with administrative privileges',
    allowedActions: ['view', 'approve', 'warranty'],
    priority: 4,
  },
  GENERAL_MANAGER: {
    name: 'General Manager',
    description: 'Management level access with approval capabilities',
    allowedActions: ['view_log', 'approve', 'reject'],
    priority: 3,
  },
  HEAD_OF_DEPARTMENT: {
    name: 'Head of Department',
    description: 'Department level management with approval capabilities',
    allowedActions: ['view_log', 'approve', 'reject'],
    priority: 2,
  },
  REQUESTER: {
    name: 'Requester',
    description: 'Standard user with request submission capabilities',
    allowedActions: ['scan', 'info', 'resubmit'],
    priority: 1,
  },
};

/**
 * ICSBOLTZ_CURRENT_USER_ROLE - Current user role configuration
 * 
 * This constant defines the current user's role. 
 * In the future, this should be replaced with dynamic role fetching from user authentication.
 * 
 * TO CHANGE USER ROLE: Modify the value below to test different role permissions
 * Available roles: 'ADMIN', 'GENERAL_MANAGER', 'HEAD_OF_DEPARTMENT', 'REQUESTER'
 */
export const ICSBOLTZ_CURRENT_USER_ROLE: UserRole = 'REQUESTER';

/**
 * Utility function to get role configuration
 */
export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ICSBOLTZ_ROLE_DEFINITIONS[role];
};

/**
 * Utility function to check if a role has permission for a specific action
 */
export const hasPermission = (role: UserRole, action: ButtonAction): boolean => {
  const roleConfig = getRoleConfig(role);
  return roleConfig.allowedActions.includes(action);
};

/**
 * Utility function to get allowed actions for current user
 */
export const getCurrentUserActions = (): ButtonAction[] => {
  return getRoleConfig(ICSBOLTZ_CURRENT_USER_ROLE).allowedActions;
};

/**
 * Utility function to get current user role info
 */
export const getCurrentUserRole = (): RoleConfig => {
  return getRoleConfig(ICSBOLTZ_CURRENT_USER_ROLE);
};
