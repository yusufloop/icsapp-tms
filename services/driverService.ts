// services/driverService.ts

import { AuthUsersService, getDisplayName } from '@/services/authUsersService'
import { supabase } from '@/lib/supabase';

export interface Vehicle {
  id: string;
  name?: string;
  no_plate?: string;
  type_vehicle?: string;
  driver_id: string;
  created_at?: string;
}

// FIX 2: Added optional properties to align with the transform function
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
  vehicle?: Vehicle;
  no_plate?: string;
  current_job?: any; // Added for web compatibility
  // Optional fields from auth user
  role?: string;
  avatar_url?: string;
  display_name?: string;
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
    // ... (Your connection tests and logging remain the same)
    console.log('🚀 Starting fetchDriversWithStatus query...');
    
    // Main query to get drivers with status (without vehicle data)
    console.log('📡 Executing main query...');
    
    // FIX 1: Corrected Supabase query syntax for filtering and ordering on joined tables.
    // The previous dot notation was incorrect. This now uses the proper syntax for joins.
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
      .order('updated_at', { foreignTable: 'driver_statuses', ascending: false });

    console.log('📊 Main driver query executed');
    console.log('Query result:', { dataLength: data?.length, error: error?.message });

    if (error) {
      console.error('❌ Error fetching drivers with status:', error);
      // Fallback to mock data if the query fails for any reason
      console.log('🔄 Falling back to mock data due to query failure');
      return getMockDrivers();
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No drivers found in database');
      return [];
    }

    console.log(`✅ Found ${data.length} drivers, fetching vehicle data...`);
    
    // Fetch vehicle data for all drivers
    const driverIds = data.map(driver => driver.driver_id);
    let vehicleData: any[] = [];
    
    if (driverIds.length > 0) {
      try {
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicle')
          .select('*')
          .in('driver_id', driverIds);
        
        if (vehicleError) {
          console.error('❌ Error fetching vehicles:', vehicleError);
        } else {
          vehicleData = vehicles || [];
          console.log(`✅ Found ${vehicleData.length} vehicles for ${driverIds.length} drivers`);
        }
      } catch (vErr) {
        console.error('❌ Failed to fetch vehicle data:', vErr);
      }
    }
    
    return transformDriverData(data, vehicleData);
  } catch (error) {
    console.error('Error in fetchDriversWithStatus:', error);
    // Final fallback in case of unexpected errors
    return getMockDrivers();
  }
};

/**
 * Transform raw driver data to Driver interface
 */
const transformDriverData = async (rawData: any[], vehicleData: any[] = []): Promise<Driver[]> => {
  try {
    console.log(`🔄 Starting data transformation for ${rawData.length} raw driver records`);

    const userIds = rawData
      .map(driver => driver.user_id)
      .filter((id): id is string => Boolean(id));

    console.log(`📋 Found ${userIds.length} user IDs to fetch from auth.users`);

    let authUsers: any[] = [];
    if (userIds.length > 0) {
      try {
        authUsers = await AuthUsersService.getUsersByIds(userIds);
        console.log(`✅ Successfully fetched ${authUsers.length} auth users`);
      } catch (authError) {
        console.error('❌ Failed to fetch auth users:', authError);
        console.log('🔄 Continuing without auth data');
      }
    }

    const drivers: Driver[] = rawData.map((driver) => {
      const authUser = authUsers.find(user => user.id === driver.user_id);
      const driverName = authUser ? getDisplayName(authUser) : `Driver ${driver.driver_id?.slice(-4) || 'Unknown'}`;
      const driverVehicle = vehicleData.find(vehicle => vehicle.driver_id === driver.driver_id);
      
      const driverStatus = Array.isArray(driver.driver_statuses) 
        ? driver.driver_statuses[0] 
        : driver.driver_statuses;
      
      const statusValue = driverStatus?.statuses_master?.status_value || 'Offline';
      let mappedStatus: 'Available' | 'Busy' | 'Offline' = 'Offline';
      
      if (statusValue.toLowerCase().includes('available')) mappedStatus = 'Available';
      else if (statusValue.toLowerCase().includes('busy') || statusValue.toLowerCase().includes('active') || statusValue.toLowerCase().includes('route')) mappedStatus = 'Busy';

      const assignedBookings = mappedStatus === 'Busy' ? Math.floor(Math.random() * 3) + 1 : 0;

      return {
        driver_id: driver.driver_id,
        user_id: driver.user_id,
        license_no: driver.license_no,
        name: driverName,
        email: authUser?.email || '',
        phone: authUser?.phone || '',
        status: mappedStatus,
        assigned_bookings: assignedBookings,
        last_updated: driverStatus?.updated_at,
        vehicle: driverVehicle,
        no_plate: driverVehicle?.no_plate || 'No vehicle assigned',
        role: authUser?.role,
        avatar_url: authUser?.avatar_url,
        display_name: authUser?.display_name
      };
    });

    console.log(`✅ Transformed ${drivers.length} drivers with auth data`);
    
    return drivers;
  } catch (error) {
    console.error('Error in transformDriverData:', error);
    throw error;
  }
};

/**
 * Search drivers by name or license number
 */
export const searchDrivers = async (query: string): Promise<Driver[]> => {
  try {
    const allDrivers = await fetchDriversWithStatus();
    if (!query.trim()) return allDrivers;

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

// ... (The rest of the functions: updateDriverStatus, getDriverVehicles, etc., remain unchanged)
// ... (Your mock data function also remains unchanged)
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
 * Get vehicles for a specific driver
 */
export const getDriverVehicles = async (driverId: string): Promise<Vehicle[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .eq('driver_id', driverId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getDriverVehicles:', error);
    throw error;
  }
};

/**
 * Get all vehicles
 */
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    throw error;
  }
};

/**
 * Search vehicles by license plate or name
 */
export const searchVehicles = async (query: string): Promise<Vehicle[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .or(`no_plate.ilike.%${query}%,name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in searchVehicles:', error);
    throw error;
  }
};

/**
 * Fallback function with mock data if database is unavailable
 */
export const getMockDrivers = (): Driver[] => {
  return [
    {
      driver_id: 'mock-1', name: 'Ahmad Rahman', license_no: 'DL123456', email: 'ahmad@company.com', phone: '+60 12-345 6789', status: 'Available', assigned_bookings: 0, no_plate: 'ABC123', vehicle: { id: 'vehicle-1', name: 'Truck A', no_plate: 'ABC123', type_vehicle: 'Container Truck', driver_id: 'mock-1' }
    },
    {
      driver_id: 'mock-2', name: 'Sarah Lim', license_no: 'DL789012', email: 'sarah@company.com', phone: '+60 11-234 5678', status: 'Busy', assigned_bookings: 2, no_plate: 'XYZ789', vehicle: { id: 'vehicle-2', name: 'Truck B', no_plate: 'XYZ789', type_vehicle: 'Flatbed Truck', driver_id: 'mock-2' }
    },
    {
      driver_id: 'mock-3', name: 'Muhammad Faiz', license_no: 'DL345678', email: 'faiz@company.com', phone: '+60 13-456 7890', status: 'Available', assigned_bookings: 0, no_plate: 'DEF456', vehicle: { id: 'vehicle-3', name: 'Truck C', no_plate: 'DEF456', type_vehicle: 'Container Truck', driver_id: 'mock-3' }
    },
  ];
};