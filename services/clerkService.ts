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

    // Fetch drivers with their statuses (WITHOUT users join)
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

    // Fetch user data for drivers manually using auth admin API
    const driversWithUserData = await Promise.all(
      (drivers || []).map(async (driver) => {
        let userData = null;
        
        if (driver.user_id) {
          try {
            // Get user data from auth.users using admin API
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(driver.user_id);
            
            if (!authError && authUser?.user) {
              userData = {
                email: authUser.user.email,
                full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0]
              };
            }
          } catch (err) {
            console.warn(`Could not fetch user data for driver ${driver.driver_id}:`, err);
          }
        }

        return {
          ...driver,
          userData
        };
      })
    );

    // Process data to create tasks
    const pendingTasks: Task[] = [];
    
    // Add tasks for bookings that need processing
    bookings?.forEach(booking => {
      // Handle the case where booking_statuses might be an array or single object
      let bookingStatus = 'Unknown';
      
      if (Array.isArray(booking.booking_statuses)) {
        // If it's an array, get the latest status
        const latestStatus = booking.booking_statuses[0];
        bookingStatus = latestStatus?.statuses_master?.status_value || 'Unknown';
      } else if (booking.booking_statuses?.statuses_master) {
        // If it's a single object
        bookingStatus = booking.booking_statuses.statuses_master.status_value || 'Unknown';
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
      // Handle the case where invoice_statuses might be an array or single object
      let invoiceStatus = 'Unknown';
      
      if (Array.isArray(invoice.invoice_statuses)) {
        // If it's an array, get the latest status
        const latestStatus = invoice.invoice_statuses[0];
        invoiceStatus = latestStatus?.statuses_master?.status_value || 'Unknown';
      } else if (invoice.invoice_statuses?.statuses_master) {
        // If it's a single object
        invoiceStatus = invoice.invoice_statuses.statuses_master.status_value || 'Unknown';
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
    const availableDrivers: Driver[] = driversWithUserData.map(driver => {
      // Handle the case where driver_statuses might be an array or single object
      let driverStatus = 'Unknown';
      
      if (Array.isArray(driver.driver_statuses)) {
        // If it's an array, get the latest status
        const latestStatus = driver.driver_statuses[0];
        driverStatus = latestStatus?.statuses_master?.status_value || 'Unknown';
      } else if (driver.driver_statuses?.statuses_master) {
        // If it's a single object
        driverStatus = driver.driver_statuses.statuses_master.status_value || 'Unknown';
      }
      
      const driverName = driver.userData?.full_name || driver.userData?.email || `Driver ${driver.driver_id.substring(0, 8)}`;
      
      // Count assigned bookings (you would need a proper driver_assignments table for accurate data)
      const assignedBookings = Math.floor(Math.random() * 4); // Placeholder

      return {
        id: driver.driver_id,
        name: driverName,
        email: driver.userData?.email,
        licenseNo: driver.license_no,
        status: driverStatus === 'Available' ? 'Available' : 
                driverStatus === 'On Route' ? 'On Route' : 'Offline',
        currentLocation: driverStatus === 'On Route' ? 
                        ['Port Klang', 'Kuantan Port', 'Penang Port', 'Johor Port'][Math.floor(Math.random() * 4)] : 
                        undefined,
        assignedBookings: assignedBookings
      };
    });

    // Calculate stats
    const clerkStats: ClerkStats = {
      pendingTasks: pendingTasks.length,
      driversAvailable: availableDrivers.filter(d => d.status === 'Available').length,
      bookingsToProcess: bookings?.filter(b => {
        // Handle array or single object for booking_statuses
        if (Array.isArray(b.booking_statuses)) {
          const status = b.booking_statuses[0]?.statuses_master?.status_value;
          return status === 'Pending' || status === 'Processing';
        } else if (b.booking_statuses?.statuses_master) {
          const status = b.booking_statuses.statuses_master.status_value;
          return status === 'Pending' || status === 'Processing';
        }
        return false;
      }).length || 0,
      invoicesDraft: invoices?.filter(i => {
        // Handle array or single object for invoice_statuses
        if (Array.isArray(i.invoice_statuses)) {
          const status = i.invoice_statuses[0]?.statuses_master?.status_value;
          return status === 'Draft';
        } else if (i.invoice_statuses?.statuses_master) {
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
        drivers: driversWithUserData,
        invoices,
        statusesMaster
      }
    };
  } catch (error) {
    console.error('Error in fetchClerkDashboardData:', error);
    throw error;
  }
};

// Alternative approach: Create a simpler version without auth admin API
export const fetchClerkDashboardDataSimple = async () => {
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
          statuses_master (
            status_value
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    // Fetch drivers with their statuses (simple version)
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select(`
        driver_id,
        user_id,
        license_no,
        driver_statuses (
          status_id,
          updated_at,
          statuses_master (
            status_value
          )
        )
      `);

    if (driversError) throw driversError;

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
          statuses_master (
            status_value
          )
        )
      `)
      .order('generated_date', { ascending: false });

    if (invoicesError) throw invoicesError;

    // Process drivers without user data (simpler approach)
    const availableDrivers: Driver[] = (drivers || []).map(driver => {
      const driverStatus = Array.isArray(driver.driver_statuses) 
        ? driver.driver_statuses[0]?.statuses_master?.status_value || 'Unknown'
        : driver.driver_statuses?.statuses_master?.status_value || 'Unknown';
      
      return {
        id: driver.driver_id,
        name: `Driver ${driver.driver_id.substring(0, 8)}`, // Simplified name
        licenseNo: driver.license_no,
        status: driverStatus === 'Available' ? 'Available' : 
                driverStatus === 'On Route' ? 'On Route' : 'Offline',
        currentLocation: driverStatus === 'On Route' ? 
                        ['Port Klang', 'Kuantan Port', 'Penang Port', 'Johor Port'][Math.floor(Math.random() * 4)] : 
                        undefined,
        assignedBookings: Math.floor(Math.random() * 4)
      };
    });

    // Calculate simple stats
    const clerkStats: ClerkStats = {
      pendingTasks: 0, // Calculate based on your business logic
      driversAvailable: availableDrivers.filter(d => d.status === 'Available').length,
      bookingsToProcess: bookings?.length || 0,
      invoicesDraft: invoices?.length || 0
    };

    return {
      pendingTasks: [], // Add tasks based on your business logic
      availableDrivers,
      clerkStats
    };
  } catch (error) {
    console.error('Error in fetchClerkDashboardDataSimple:', error);
    throw error;
  }
};