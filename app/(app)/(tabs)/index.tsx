import React from 'react';
import { ICSBOLTZ_CURRENT_USER_ROLE } from '@/constants/UserRoles';
import { 
  ClientDashboard, 
  ClerkDashboard, 
  AdminDashboard, 
  DriverDashboard 
} from '@/components/dashboards';

export default function DashboardScreen() {
  // Mock user data - in real app this would come from authentication
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: ICSBOLTZ_CURRENT_USER_ROLE as 'CLIENT' | 'CLERK' | 'ADMIN'
  };

  // Render role-specific dashboards
  if (ICSBOLTZ_CURRENT_USER_ROLE === 'CLIENT') {
    return <ClientDashboard user={mockUser} />;
  }
  
  if (ICSBOLTZ_CURRENT_USER_ROLE === 'CLERK' ) {
    return <ClerkDashboard user={mockUser} />;
  }
  
  if (ICSBOLTZ_CURRENT_USER_ROLE === 'ADMIN') {
    return <AdminDashboard user={mockUser} />;
  }
  
  if (ICSBOLTZ_CURRENT_USER_ROLE === 'DRIVER') {
    return <DriverDashboard />;
  }

  // Default fallback to Client dashboard
  return <ClientDashboard user={mockUser} />;
}