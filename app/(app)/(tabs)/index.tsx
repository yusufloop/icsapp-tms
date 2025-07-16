import N8nChatWebView from '@/components/ai/N8nChatWidget';
import {
  AdminDashboard,
  ClerkDashboard,
  ClientDashboard,
  DriverDashboard
} from '@/components/dashboards';
import { getCurrentUserRole, subscribeToRoleChanges, type UserRole } from '@/constants/UserRoles';
import { testSupabaseConnection } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';

export default function DashboardScreen() {
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUserRole());

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testSupabaseConnection();
      console.log('Supabase connection test:', isConnected ? 'SUCCESS' : 'FAILED');
    };
     if (typeof document !== 'undefined') {
  // Safe to use document here
  document.getElementById('example');
}
    
    testConnection();
  }, []);

  // Subscribe to role changes
  useEffect(() => {
    const unsubscribe = subscribeToRoleChanges((newRole) => {
      setCurrentRole(newRole);
      console.log('Dashboard role changed to:', newRole);
    });

    return unsubscribe;
  }, []);
 

  // Mock user data - in real app this would come from authentication
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: currentRole as 'CLIENT' | 'CLERK' | 'ADMIN'
  };

  // Render role-specific dashboards
  switch (currentRole) {
    case 'CLIENT':
      return <>
        <ClientDashboard user={mockUser} />
    {/* <N8nChatWebView /> */}
      </>;
    case 'CLERK':
      return <>
        <ClerkDashboard user={mockUser} />
    
      </>;
    case 'ADMIN':
      return <>
        <AdminDashboard user={mockUser} />
      
      </>;
    case 'DRIVER':
      return <>
        <DriverDashboard />
       
      </>;
    default:
      // Default fallback to Client dashboard
      return <>
        <ClientDashboard user={mockUser} />
       
      </>;
  }
}