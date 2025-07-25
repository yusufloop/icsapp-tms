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
    console.log('🚀 Starting fetchDriversWithStatus query...');
    console.log('🔍 Supabase client status:', supabase ? 'initialized' : 'not initialized');
    console.log('🌐 Environment check:', {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      key: process.env.EXPO_PUBLIC_SUPABASE_KEY ? 'set' : 'missing'
    });
    
    // Test basic connection first with a simple table
    console.log('🧪 Testing basic connection with roles table...');
    try {
      const { data: testData, error: testError } = await Promise.race([
        supabase.from('roles').select('*').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
      ]);
      console.log('✅ Basic connection test result:', { count: testData?.length, error: testError?.message });
      
      if (testError) {
        console.error('❌ Connection test failed, falling back to mock data');
        return getMockDrivers();
      }
    } catch (testErr) {
      console.error('❌ Basic connection test failed:', testErr);
      console.log('🔄 Falling back to mock data due to connection failure');
      return getMockDrivers();
    }
    
    // Test if drivers table exists
    console.log('🧪 Testing drivers table access...');
    try {
      const { data: testData, error: testError } = await Promise.race([
        supabase.from('drivers').select('driver_id').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Drivers table timeout')), 10000))
      ]);
      console.log('✅ Drivers table test result:', { count: testData?.length, error: testError?.message });
      
      if (testError) {
        console.error('❌ Drivers table test failed:', testError);
        console.log('🔄 Falling back to mock data - drivers table not accessible');
        return getMockDrivers();
      }
    } catch (testErr) {
      console.error('❌ Drivers table test failed:', testErr);
      console.log('🔄 Falling back to mock data due to table access failure');
      return getMockDrivers();
    }
    
    // Main query to get drivers with status (without vehicle data)
    console.log('📡 Executing main query...');
    const { data, error } = await Promise.race([
      supabase
        .from('drivers')
        .select(`
          driver_id,
          user_id,
          license_no,
          driver_statuses(
            status_id,
            updated_at,
            updated_by,
            statuses_master(
              status_id,
              entity_type,
              status_value
            )
          )
        `)
        .eq('driver_statuses.statuses_master.entity_type', 'driver')
        .order('driver_statuses(updated_at)', { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Main query timeout')), 15000))
    ]);

    console.log('📊 Main driver query executed');
    console.log('Query result:', { dataLength: data?.length, error: error?.message });

    if (error) {
      console.error('❌ Error fetching drivers with status:', error);
      console.log('🔄 Attempting fallback query without status constraint...');
      
      // Fallback: try to get drivers without status constraint
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('drivers')
        .select('driver_id, user_id, license_no');
      
      console.log('📊 Fallback query executed');
      console.log('Fallback result:', { dataLength: fallbackData?.length, error: fallbackError?.message });
      
      if (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError);
        throw fallbackError;
      }
      
      console.log('✅ Using fallback query without status');
      // For fallback, try to get vehicles too
      let fallbackVehicles: any[] = [];
      if (fallbackData && fallbackData.length > 0) {
        const fallbackDriverIds = fallbackData.map(d => d.driver_id);
        try {
          const { data: vehicles } = await supabase
            .from('vehicle')
            .select('*')
            .in('driver_id', fallbackDriverIds);
          fallbackVehicles = vehicles || [];
        } catch (err) {
          console.log('⚠️ Could not fetch vehicles for fallback query');
        }
      }
      return transformDriverData(fallbackData || [], fallbackVehicles);
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
    throw error;
  }
};

/**
 * Transform raw driver data to Driver interface
 */
const transformDriverData = async (rawData: any[], vehicleData: any[] = []): Promise<Driver[]> => {
  try {
    console.log(`🔄 Starting data transformation for ${rawData.length} raw driver records`);

    // Step 1: Extract all user IDs that need auth data
    const userIds = rawData
      .map(driver => driver.user_id)
      .filter((id): id is string => Boolean(id));

    console.log(`📋 Found ${userIds.length} user IDs to fetch from auth.users`);

    // Step 2: Fetch all auth users data in one call using our service
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

    // Step 3: Transform the data to match our Driver interface
    const drivers: Driver[] = rawData.map((driver) => {
      // Find the corresponding auth user
      const authUser = authUsers.find(user => user.id === driver.user_id);
      
      // Get driver name with fallback chain
      const driverName = authUser ? getDisplayName(authUser) : `Driver ${driver.driver_id?.slice(-4) || 'Unknown'}`;
      
      // Find vehicle for this driver
      const driverVehicle = vehicleData.find(vehicle => vehicle.driver_id === driver.driver_id);
      
      // Get status information - handle array structure
      const driverStatus = Array.isArray(driver.driver_statuses) 
        ? driver.driver_statuses[0] 
        : driver.driver_statuses;
      
      const statusValue = driverStatus?.statuses_master?.status_value || 'Offline';
      let mappedStatus: 'Available' | 'Busy' | 'Offline' = 'Offline';
      
      // Map status values to our interface
      if (statusValue.toLowerCase().includes('available')) {
        mappedStatus = 'Available';
      } else if (statusValue.toLowerCase().includes('busy') || 
                 statusValue.toLowerCase().includes('active') ||
                 statusValue.toLowerCase().includes('route')) {
        mappedStatus = 'Busy';
      }

      // Mock assigned bookings count (replace with real query if needed)
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
        // Additional fields from auth user
        role: authUser?.role,
        avatar_url: authUser?.avatar_url,
        display_name: authUser?.display_name
      };
    });

    console.log(`✅ Transformed ${drivers.length} drivers with auth data`);
    console.log('Sample transformed driver:', drivers[0] ? {
      id: drivers[0].driver_id,
      name: drivers[0].name,
      email: drivers[0].email,
      status: drivers[0].status
    } : 'No drivers found');
    
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
    console.log('🔍 Starting driver search with query:', query);
    const allDrivers = await fetchDriversWithStatus();
    console.log(`📋 Retrieved ${allDrivers.length} total drivers for search`);
    
    if (!query.trim()) {
      console.log('🔄 Empty query, returning all drivers');
      return allDrivers;
    }

    const searchTerm = query.toLowerCase();
    const filteredDrivers = allDrivers.filter(driver => 
      driver.name.toLowerCase().includes(searchTerm) ||
      (driver.license_no && driver.license_no.toLowerCase().includes(searchTerm)) ||
      (driver.email && driver.email.toLowerCase().includes(searchTerm))
    );
    
    console.log(`✅ Search completed: found ${filteredDrivers.length} drivers matching "${query}"`);
    return filteredDrivers;
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
    console.log('🟢 Fetching available drivers only...');
    const allDrivers = await fetchDriversWithStatus();
    console.log(`📋 Retrieved ${allDrivers.length} total drivers`);
    
    const availableDrivers = allDrivers.filter(driver => driver.status === 'Available');
    console.log(`✅ Found ${availableDrivers.length} available drivers`);
    
    return availableDrivers;
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
 * Get vehicles for a specific driver
 */
export const getDriverVehicles = async (driverId: string): Promise<Vehicle[]> => {
  try {
    console.log(`🚗 Fetching vehicles for driver: ${driverId}`);
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .eq('driver_id', driverId);

    if (error) {
      console.error('Error fetching driver vehicles:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} vehicles for driver ${driverId}`);
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
    console.log('🚗 Fetching all vehicles...');
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all vehicles:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} total vehicles`);
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
    console.log(`🔍 Searching vehicles with query: ${query}`);
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .or(`no_plate.ilike.%${query}%,name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} vehicles matching "${query}"`);
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
      driver_id: 'mock-1',
      name: 'Ahmad Rahman',
      license_no: 'DL123456',
      email: 'ahmad@company.com',
      phone: '+60 12-345 6789',
      status: 'Available',
      assigned_bookings: 0,
      no_plate: 'ABC123',
      vehicle: {
        id: 'vehicle-1',
        name: 'Truck A',
        no_plate: 'ABC123',
        type_vehicle: 'Container Truck',
        driver_id: 'mock-1'
      }
    },
    {
      driver_id: 'mock-2',
      name: 'Sarah Lim',
      license_no: 'DL789012',
      email: 'sarah@company.com',
      phone: '+60 11-234 5678',
      status: 'Busy',
      assigned_bookings: 2,
      no_plate: 'XYZ789',
      vehicle: {
        id: 'vehicle-2',
        name: 'Truck B',
        no_plate: 'XYZ789',
        type_vehicle: 'Flatbed Truck',
        driver_id: 'mock-2'
      }
    },
    {
      driver_id: 'mock-3',
      name: 'Muhammad Faiz',
      license_no: 'DL345678',
      email: 'faiz@company.com',
      phone: '+60 13-456 7890',
      status: 'Available',
      assigned_bookings: 0,
      no_plate: 'DEF456',
      vehicle: {
        id: 'vehicle-3',
        name: 'Truck C',
        no_plate: 'DEF456',
        type_vehicle: 'Container Truck',
        driver_id: 'mock-3'
      }
    },
  ];
};