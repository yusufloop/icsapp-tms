import { supabase } from '@/lib/supabase';

export interface Driver {
  driver_id: string;
  user_id?: string;
  license_no?: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'Available' | 'Busy' | 'Offline';
  current_location?: string;
  assigned_bookings: number;
  last_updated?: string;
}

export interface DriverStatus {
  driver_id: string;
  status_id: number;
  status_value: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * Fetch all drivers with their current status
 */
export const fetchDriversWithStatus = async (): Promise<Driver[]> => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        driver_id,
        user_id,
        license_no,
        driver_statuses!inner(
          status_id,
          updated_at,
          updated_by,
          statuses_master!inner(
            status_id,
            entity_type,
            status_value
          )
        )
      `)
      .eq('driver_statuses.statuses_master.entity_type', 'driver')
      .order('driver_statuses.updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No drivers found in database');
      return [];
    }

    // Transform the data to match our Driver interface
    const drivers: Driver[] = await Promise.all(
      data.map(async (driver) => {
        let driverName = `Driver ${driver.driver_id.substring(0, 8)}`;
        let email = '';
        let phone = '';

        // Fetch user data if user_id exists
        if (driver.user_id) {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(driver.user_id);
            if (!userError && userData.user) {
              driverName = userData.user.user_metadata?.full_name || userData.user.email || driverName;
              email = userData.user.email || '';
              phone = userData.user.user_metadata?.phone || '';
            }
          } catch (userFetchError) {
            console.warn('Could not fetch user data for driver:', driver.driver_id);
          }
        }

        // Get status information
        const statusValue = driver.driver_statuses?.statuses_master?.status_value || 'Offline';
        let mappedStatus: 'Available' | 'Busy' | 'Offline' = 'Offline';
        
        if (statusValue.toLowerCase().includes('available')) {
          mappedStatus = 'Available';
        } else if (statusValue.toLowerCase().includes('busy') || statusValue.toLowerCase().includes('active')) {
          mappedStatus = 'Busy';
        }

        // Mock assigned bookings count (in real implementation, this would be a separate query)
        const assignedBookings = mappedStatus === 'Busy' ? Math.floor(Math.random() * 3) + 1 : 0;

        return {
          driver_id: driver.driver_id,
          user_id: driver.user_id,
          license_no: driver.license_no,
          name: driverName,
          email,
          phone,
          status: mappedStatus,
          assigned_bookings: assignedBookings,
          last_updated: driver.driver_statuses?.updated_at,
        };
      })
    );

    console.log(`✅ Fetched ${drivers.length} drivers from database`);
    return drivers;
  } catch (error) {
    console.error('Error in fetchDriversWithStatus:', error);
    throw error;
  }
};

/**
 * Search drivers by name or license number
 */
export const searchDrivers = async (query: string): Promise<Driver[]> => {
  try {
    const allDrivers = await fetchDriversWithStatus();
    
    if (!query.trim()) {
      return allDrivers;
    }

    const searchTerm = query.toLowerCase();
    return allDrivers.filter(driver => 
      driver.name.toLowerCase().includes(searchTerm) ||
      (driver.license_no && driver.license_no.toLowerCase().includes(searchTerm)) ||
      (driver.email && driver.email.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching drivers:', error);
    throw error;
  }
};

/**
 * Get available drivers only
 */
export const getAvailableDrivers = async (): Promise<Driver[]> => {
  try {
    const allDrivers = await fetchDriversWithStatus();
    return allDrivers.filter(driver => driver.status === 'Available');
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    throw error;
  }
};

/**
 * Update driver status
 */
export const updateDriverStatus = async (driverId: string, statusId: number, updatedBy?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('driver_statuses')
      .upsert({
        driver_id: driverId,
        status_id: statusId,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }

    console.log(`✅ Updated driver ${driverId} status to ${statusId}`);
  } catch (error) {
    console.error('Error in updateDriverStatus:', error);
    throw error;
  }
};

/**
 * Fallback function with mock data if database is unavailable
 */
export const getMockDrivers = (): Driver[] => {
  return [
    {
      driver_id: 'mock-1',
      name: 'Ahmad Rahman',
      license_no: 'DL123456',
      email: 'ahmad@company.com',
      phone: '+60 12-345 6789',
      status: 'Available',
      assigned_bookings: 0,
    },
    {
      driver_id: 'mock-2',
      name: 'Sarah Lim',
      license_no: 'DL789012',
      email: 'sarah@company.com',
      phone: '+60 11-234 5678',
      status: 'Busy',
      assigned_bookings: 2,
    },
    {
      driver_id: 'mock-3',
      name: 'Muhammad Faiz',
      license_no: 'DL345678',
      email: 'faiz@company.com',
      phone: '+60 13-456 7890',
      status: 'Available',
      assigned_bookings: 0,
    },
  ];
};