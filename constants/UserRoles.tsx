/**
 * ICSBOLTZ_USER_ROLES_CONFIG - Role-based access control configuration
 * 
 * This file defines the user roles and their associated permissions for the ICS Boltz application.
 * The roles are designed to be dynamic and easily configurable for future expansion.
 * 
 * SEARCH KEYWORDS: ICSBOLTZ_USER_ROLES_CONFIG, role-based-access, user-permissions
 */

// User Role Types
export type UserRole = 'ADMIN' | 'CLERK' | 'DRIVER' | 'CLIENT' | 'GENERAL_MANAGER' | 'HEAD_OF_DEPARTMENT' | 'REQUESTER';

// Button Action Types
export type ButtonAction = 'scan' | 'info' | 'resubmit' | 'view_log' | 'approve' | 'reject' | 'view' | 'warranty' | 'update_status' | 'navigate' | 'contact_customer';

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
    priority: 7,
  },
  CLERK: {
    name: 'Clerk',
    description: 'Office staff with booking and processing capabilities',
    allowedActions: ['view_log', 'approve', 'reject'],
    priority: 6,
  },

  
  CLIENT: {
    name: 'Client',
    description: 'Customer with booking request capabilities',
    allowedActions: ['scan', 'info', 'resubmit'],
    priority: 4,
  },
  DRIVER: {
    name: 'Driver',
    description: 'Driver with route management and delivery tracking capabilities',
    allowedActions: ['view', 'scan', 'update_status', 'navigate', 'contact_customer'],
    priority: 5,
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
 * ICSBOLTZ_CURRENT_USER_ROLE - Current user role state management
 * 
 * This creates a dynamic system for managing the current user's role.
 * The role can be changed at runtime through the user interface.
 */

// Internal state for current user role
let _currentUserRole: UserRole = 'ADMIN';

// Listeners for role changes
type RoleChangeListener = (newRole: UserRole) => void;
const _roleChangeListeners: RoleChangeListener[] = [];

/**
 * Get the current user role
 */
export const getCurrentUserRole = (): UserRole => {
  return _currentUserRole;
};

/**
 * Set the current user role and notify all listeners
 */
export const setCurrentUserRole = (newRole: UserRole): void => {
  const oldRole = _currentUserRole;
  _currentUserRole = newRole;
  
  // Notify all listeners of the role change
  _roleChangeListeners.forEach(listener => {
    try {
      listener(newRole);
    } catch (error) {
      console.error('Error in role change listener:', error);
    }
  });
  
  console.log(`User role changed from ${oldRole} to ${newRole}`);
};

/**
 * Subscribe to role changes
 */
export const subscribeToRoleChanges = (listener: RoleChangeListener): (() => void) => {
  _roleChangeListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = _roleChangeListeners.indexOf(listener);
    if (index > -1) {
      _roleChangeListeners.splice(index, 1);
    }
  };
};

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
  return getRoleConfig(getCurrentUserRole()).allowedActions;
};

/**
 * Utility function to get current user role info
 */
export const getCurrentUserRoleConfig = (): RoleConfig => {
  return getRoleConfig(getCurrentUserRole());
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use getCurrentUserRole() instead
 */
export const ICSBOLTZ_CURRENT_USER_ROLE: UserRole = getCurrentUserRole();
