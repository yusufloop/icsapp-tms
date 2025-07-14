import { supabase } from '@/lib/supabase';

// Types for clerk dashboard data
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
  email?: string;
  licenseNo?: string;
}

export interface ClerkStats {
  pendingTasks: number;
  driversAvailable: number;
  bookingsToProcess: number;
  invoicesDraft: number;
}

// Fetch clerk dashboard data from Supabase
export const fetchClerkDashboardData = async () => {
  try {
    // Fetch bookings with their statuses
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        client_id,
        shipment_type,
        container_size,
        origin,
        destination,
        created_at,
        booking_statuses (
          status_id,
          updated_at,
          updated_by,
          statuses_master (
            status_value
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Fetch drivers with their statuses
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select(`
        driver_id,
        user_id,
        license_no,
        driver_statuses (
          status_id,
          updated_at,
          updated_by,
          statuses_master (
            status_value
          )
        )
      `);

    if (driversError) {
      console.error('Error fetching drivers:', driversError);
      throw driversError;
    }

    // Fetch invoices with their statuses
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        invoice_id,
        booking_id,
        amount,
        generated_date,
        invoice_statuses (
          status_id,
          updated_at,
          updated_by,
          statuses_master (
            status_value
          )
        )
      `)
      .order('generated_date', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    // Fetch status master data for reference
    const { data: statusesMaster, error: statusesError } = await supabase
      .from('statuses_master')
      .select('*');

    if (statusesError) {
      console.error('Error fetching statuses:', statusesError);
      throw statusesError;
    }

    // Fetch user data for drivers
    const driverUserIds = drivers
      ?.filter(driver => driver.user_id)
      .map(driver => driver.user_id);

    let userData = {};
    
    if (driverUserIds && driverUserIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, user_metadata')
        .in('id', driverUserIds);
        
      if (!usersError && users) {
        // Create a map of user_id to user data
        userData = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }
    }

    // Process data to create tasks
    const pendingTasks: Task[] = [];
    
    // Add tasks for bookings that need processing
    bookings?.forEach(booking => {
      // Get the booking status
      let bookingStatus = 'Unknown';
      
      if (booking.booking_statuses && booking.booking_statuses.statuses_master) {
        bookingStatus = booking.booking_statuses.statuses_master.status_value;
      }
      
      if (bookingStatus === 'Pending' || bookingStatus === 'Processing') {
        pendingTasks.push({
          id: `BK-${booking.booking_id.substring(0, 8)}`,
          type: 'Booking Confirmation',
          priority: 'High',
          dueDate: new Date(new Date(booking.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Confirm booking from ${booking.origin} to ${booking.destination}`,
          assignedTo: 'Current User'
        });
      }
    });

    // Add tasks for invoices that need generation
    invoices?.forEach(invoice => {
      // Get the invoice status
      let invoiceStatus = 'Unknown';
      
      if (invoice.invoice_statuses && invoice.invoice_statuses.statuses_master) {
        invoiceStatus = invoice.invoice_statuses.statuses_master.status_value;
      }
      
      if (invoiceStatus === 'Draft') {
        pendingTasks.push({
          id: `INV-${invoice.invoice_id.substring(0, 8)}`,
          type: 'Invoice Generation',
          priority: 'Medium',
          dueDate: new Date().toISOString().split('T')[0],
          description: `Generate invoice for booking ${invoice.booking_id.substring(0, 8)}`,
          assignedTo: 'Current User'
        });
      }
    });

    // Process driver data
    const availableDrivers: Driver[] = drivers?.map(driver => {
      // Get the driver status
      let driverStatus = 'Unknown';
      
      if (driver.driver_statuses && driver.driver_statuses.statuses_master) {
        driverStatus = driver.driver_statuses.statuses_master.status_value;
      }
      
      // Get user data if available
      const user = driver.user_id ? userData[driver.user_id] : null;
      const driverName = user ? (user.user_metadata?.full_name || user.email) : `Driver ${driver.driver_id.substring(0, 8)}`;
      
      // Count assigned bookings (placeholder - would need a proper join in real implementation)
      const assignedBookings = Math.floor(Math.random() * 4); // Placeholder
      
      return {
        id: driver.driver_id,
        name: driverName,
        email: user?.email,
        licenseNo: driver.license_no,
        status: driverStatus === 'Available' ? 'Available' : 
                driverStatus === 'On Route' ? 'On Route' : 'Offline',
        currentLocation: driverStatus === 'On Route' ? 
                        ['Port Klang', 'Kuantan Port', 'Penang Port', 'Johor Port'][Math.floor(Math.random() * 4)] : 
                        undefined,
        assignedBookings: assignedBookings
      };
    }) || [];

    // Calculate stats
    const clerkStats: ClerkStats = {
      pendingTasks: pendingTasks.length,
      driversAvailable: availableDrivers.filter(d => d.status === 'Available').length,
      bookingsToProcess: bookings?.filter(b => {
        if (b.booking_statuses && b.booking_statuses.statuses_master) {
          const status = b.booking_statuses.statuses_master.status_value;
          return status === 'Pending' || status === 'Processing';
        }
        return false;
      }).length || 0,
      invoicesDraft: invoices?.filter(i => {
        if (i.invoice_statuses && i.invoice_statuses.statuses_master) {
          const status = i.invoice_statuses.statuses_master.status_value;
          return status === 'Draft';
        }
        return false;
      }).length || 0
    };

    console.log('✅ Dashboard data fetched successfully:', {
      bookingsCount: bookings?.length || 0,
      driversCount: availableDrivers.length,
      invoicesCount: invoices?.length || 0,
      pendingTasksCount: pendingTasks.length
    });

    return {
      pendingTasks,
      availableDrivers,
      clerkStats,
      // Raw data for additional processing if needed
      rawData: {
        bookings,
        drivers,
        invoices,
        statusesMaster
      }
    };
  } catch (error) {
    console.error('Error in fetchClerkDashboardData:', error);
    throw error;
  }
};

// Fallback function that uses mock data if Supabase connection fails
export const fetchClerkDashboardMockData = async () => {
  // Mock data for clerk dashboard
  const pendingTasks = [
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
  ];

  const availableDrivers = [
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
  ];

  const clerkStats = {
    pendingTasks: 8,
    driversAvailable: 3,
    bookingsToProcess: 6,
    invoicesDraft: 4
  };

  return {
    pendingTasks,
    availableDrivers,
    clerkStats
  };
};