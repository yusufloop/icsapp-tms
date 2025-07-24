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
    
    // First try to get drivers with status
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
        .order('driver_statuses.updated_at', { ascending: false }),
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
      return transformDriverData(fallbackData || []);
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No drivers found in database');
      return [];
    }

    console.log(`✅ Found ${data.length} drivers, proceeding to transform data`);
    return transformDriverData(data);
  } catch (error) {
    console.error('Error in fetchDriversWithStatus:', error);
    throw error;
  }
};

/**
 * Transform raw driver data to Driver interface
 */
const transformDriverData = async (rawData: any[]): Promise<Driver[]> => {
  try {
    console.log(`🔄 Starting data transformation for ${rawData.length} raw driver records`);

    // Transform the data to match our Driver interface
    const drivers: Driver[] = await Promise.all(
      rawData.map(async (driver) => {
        let driverName = `Driver ${driver.driver_id.substring(0, 8)}`;
        let email = '';
        let phone = '';

        // Fetch user data if user_id exists
        if (driver.user_id) {
          try {
            // Try to fetch from profiles table first (more common pattern)
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, email, phone')
              .eq('id', driver.user_id)
              .single();

            if (!profileError && profileData) {
              driverName = profileData.full_name || profileData.email || driverName;
              email = profileData.email || '';
              phone = profileData.phone || '';
            } else {
              // Fallback to auth admin call if available
              try {
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(driver.user_id);
                if (!userError && userData.user) {
                  driverName = userData.user.user_metadata?.full_name || userData.user.email || driverName;
                  email = userData.user.email || '';
                  phone = userData.user.user_metadata?.phone || '';
                }
              } catch (adminError) {
                console.warn('Admin auth call not available, using default name for driver:', driver.driver_id);
              }
            }
          } catch (userFetchError) {
            console.warn('Could not fetch user data for driver:', driver.driver_id);
          }
        }

        // Get status information - handle array structure
        const driverStatus = Array.isArray(driver.driver_statuses) 
          ? driver.driver_statuses[0] 
          : driver.driver_statuses;
        
        const statusValue = driverStatus?.statuses_master?.status_value || 'Offline';
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
          last_updated: driverStatus?.updated_at,
        };
      })
    );

    console.log(`✅ Transformed ${drivers.length} drivers from database`);
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