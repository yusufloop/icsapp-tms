// Dashboard Types and Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'CLERK' | 'ADMIN';
  avatar?: string;
}

export interface DashboardProps {
  user?: User;
}

// Client Dashboard Types
export interface Booking {
  id: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Processing';
  date: string;
  containerType: string;
  estimatedDelivery?: string;
}

export interface ClientStats {
  activeShipments: number;
  pendingInvoices: number;
  totalBookingsThisMonth: number;
  completedDeliveries: number;
}

export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  bookingId: string;
}

// Clerk Dashboard Types
export interface Task {
  id: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  description: string;
  assignedTo?: string;
}

export interface Driver {
  id: string;
  name: string;
  status: 'Available' | 'On Route' | 'Offline';
  currentLocation?: string;
  assignedBookings: number;
}

export interface ClerkStats {
  pendingTasks: number;
  driversAvailable: number;
  bookingsToProcess: number;
  invoicesDraft: number;
}

// Admin Dashboard Types
export interface AdminStats {
  monthlyRevenue: number;
  totalUsers: number;
  systemUptime: string;
  completionRate: string;
  revenueGrowth: string;
  totalBookings: number;
  activeDrivers: number;
  customerSatisfaction: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}