// Mock Data for Dashboards
import { Booking, ClientStats, Invoice, Task, Driver, ClerkStats, AdminStats, RevenueData, SystemAlert } from '@/types/dashboard';

// Client Dashboard Mock Data
export const mockClientData = {
  recentBookings: [
    {
      id: 'BK001',
      origin: 'Port Klang',
      destination: 'Kuantan Port',
      status: 'In Transit' as const,
      date: '2025-01-10',
      containerType: '40ft FCL',
      estimatedDelivery: '2025-01-15'
    },
    {
      id: 'BK002',
      origin: 'Penang Port',
      destination: 'Johor Port',
      status: 'Processing' as const,
      date: '2025-01-12',
      containerType: '20ft LCL',
      estimatedDelivery: '2025-01-18'
    },
    {
      id: 'BK003',
      origin: 'Kuantan Port',
      destination: 'Port Klang',
      status: 'Delivered' as const,
      date: '2025-01-08',
      containerType: '40ft FCL',
      estimatedDelivery: '2025-01-12'
    },
    {
      id: 'BK004',
      origin: 'Johor Port',
      destination: 'Penang Port',
      status: 'Pending' as const,
      date: '2025-01-14',
      containerType: '20ft FCL',
      estimatedDelivery: '2025-01-20'
    }
  ] as Booking[],

  clientStats: {
    activeShipments: 5,
    pendingInvoices: 2,
    totalBookingsThisMonth: 12,
    completedDeliveries: 8
  } as ClientStats,

  pendingInvoices: [
    {
      id: 'INV001',
      amount: 2500.00,
      dueDate: '2025-01-20',
      status: 'Pending' as const,
      bookingId: 'BK001'
    },
    {
      id: 'INV002',
      amount: 1800.00,
      dueDate: '2025-01-15',
      status: 'Overdue' as const,
      bookingId: 'BK002'
    }
  ] as Invoice[]
};

// Clerk Dashboard Mock Data
export const mockClerkData = {
  pendingTasks: [
    {
      id: 'T001',
      type: 'Booking Confirmation',
      priority: 'High' as const,
      dueDate: '2025-01-15',
      description: 'Confirm container availability for BK005',
      assignedTo: 'Current User'
    },
    {
      id: 'T002',
      type: 'Driver Assignment',
      priority: 'Medium' as const,
      dueDate: '2025-01-16',
      description: 'Assign driver for Port Klang pickup',
      assignedTo: 'Current User'
    },
    {
      id: 'T003',
      type: 'Invoice Generation',
      priority: 'Low' as const,
      dueDate: '2025-01-18',
      description: 'Generate invoice for completed delivery BK003',
      assignedTo: 'Current User'
    },
    {
      id: 'T004',
      type: 'Status Update',
      priority: 'High' as const,
      dueDate: '2025-01-15',
      description: 'Update delivery status for BK001',
      assignedTo: 'Current User'
    }
  ] as Task[],

  availableDrivers: [
    {
      id: 'D001',
      name: 'Ahmad Rahman',
      status: 'Available' as const,
      currentLocation: 'Port Klang',
      assignedBookings: 0
    },
    {
      id: 'D002',
      name: 'Lim Wei Ming',
      status: 'On Route' as const,
      currentLocation: 'En route to Kuantan',
      assignedBookings: 2
    },
    {
      id: 'D003',
      name: 'Raj Kumar',
      status: 'Available' as const,
      currentLocation: 'Penang Port',
      assignedBookings: 1
    }
  ] as Driver[],

  clerkStats: {
    pendingTasks: 8,
    driversAvailable: 3,
    bookingsToProcess: 6,
    invoicesDraft: 4
  } as ClerkStats
};

// Admin Dashboard Mock Data
export const mockAdminData = {
  adminStats: {
    monthlyRevenue: 125000,
    totalUsers: 45,
    systemUptime: '99.9%',
    completionRate: '94%',
    revenueGrowth: '+12%',
    totalBookings: 156,
    activeDrivers: 12,
    customerSatisfaction: '4.8/5'
  } as AdminStats,

  revenueData: [
    { month: 'Jan', revenue: 98000, bookings: 45 },
    { month: 'Feb', revenue: 112000, bookings: 52 },
    { month: 'Mar', revenue: 125000, bookings: 58 },
    { month: 'Apr', revenue: 118000, bookings: 55 },
    { month: 'May', revenue: 135000, bookings: 62 },
    { month: 'Jun', revenue: 142000, bookings: 68 }
  ] as RevenueData[],

  systemAlerts: [
    {
      id: 'A001',
      type: 'warning' as const,
      message: 'Server response time increased by 15%',
      timestamp: '2025-01-14 10:30',
      resolved: false
    },
    {
      id: 'A002',
      type: 'info' as const,
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2025-01-14 08:00',
      resolved: true
    },
    {
      id: 'A003',
      type: 'error' as const,
      message: 'Payment gateway timeout for 3 transactions',
      timestamp: '2025-01-14 14:15',
      resolved: false
    }
  ] as SystemAlert[]
};