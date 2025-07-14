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
        users (
          id,
          email,
          user_metadata
        ),
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

    // Process data to create tasks
    const pendingTasks: Task[] = [];
    
    // Add tasks for bookings that need processing
    bookings?.forEach(booking => {
      const bookingStatus = booking.booking_statuses?.statuses_master?.status_value || 'Unknown';
      
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
      const invoiceStatus = invoice.invoice_statuses?.statuses_master?.status_value || 'Unknown';
      
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
      const driverStatus = driver.driver_statuses?.statuses_master?.status_value || 'Unknown';
      const driverName = driver.users?.user_metadata?.full_name || driver.users?.email || 'Unknown Driver';
      
      // Count assigned bookings
      const assignedBookings = bookings?.filter(booking => {
        // In a real app, you would have a driver_assignments table to check
        // For now, we'll just return a random number between 0 and 3
        return Math.floor(Math.random() * 4);
      }).length || 0;

      return {
        id: driver.driver_id,
        name: driverName,
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
      bookingsToProcess: bookings?.filter(b => 
        b.booking_statuses?.statuses_master?.status_value === 'Pending' || 
        b.booking_statuses?.statuses_master?.status_value === 'Processing'
      ).length || 0,
      invoicesDraft: invoices?.filter(i => 
        i.invoice_statuses?.statuses_master?.status_value === 'Draft'
      ).length || 0
    };

    return {
      pendingTasks,
      availableDrivers,
      clerkStats
    };
  } catch (error) {
    console.error('Error in fetchClerkDashboardData:', error);
    throw error;
  }
};