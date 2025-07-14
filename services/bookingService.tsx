import { supabase } from '@/lib/supabase';

export interface Booking {
  booking_id: string;
  client_id?: string;
  shipment_type?: string;
  container_size?: string;
  pickup_state?: string;
  delivery_state?: string;
  pickup_address?: string;
  pickup_time?: string;
  delivery_address?: string;
  delicery_time?: string;
  consignee?: string;
  date_booking?: string;
  created_at?: string;
  // From booking_statuses join
  status_id?: number;
  status_updated_at?: string;
  status_updated_by?: string;
  // From statuses_master join
  entity_type?: string;
  status_value?: string;
  // From charges join
  charge_id?: string;
  haulage_fee?: number;
  twinning_fee?: number;
  total?: number;
  compliance_fee?: number;
}

export interface BookingStats {
  totalBookings: number;
  inTransit: number;
  delivered: number;
  pending: number;
}

/**
 * Get all bookings with their current status
 */
export const getBookingsWithStatus = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        client_id,
        shipment_type,
        container_size,
        pickup_state,
        delivery_state,
        pickup_address,
        pickup_time,
        delivery_address,
        delicery_time,
        consignee,
        date_booking,
        created_at,
        booking_statuses!booking_statuses_booking_id_fkey (
          status_id,
          updated_at,
          updated_by,
          statuses_master!booking_statuses_status_id_fkey (
            entity_type,
            status_value
          )
        ),
        charges!charges_booking_id_fkey (
          charge_id,
          haulage_fee,
          twinning_fee,
          total,
          compliance_fee
        ),
        charges!charges_booking_id_fkey (
          charge_id,
          haulage_fee,
          twinning_fee,
          total,
          compliance_fee
        ),
        charges!charges_booking_id_fkey (
          charge_id,
          haulage_fee,
          twinning_fee,
          total,
          compliance_fee
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to flatten the nested structure
    const transformedData = data?.map(booking => ({
      ...booking,
      status_id: booking.booking_statuses?.[0]?.status_id,
      status_updated_at: booking.booking_statuses?.[0]?.updated_at,
      status_updated_by: booking.booking_statuses?.[0]?.updated_by,
      entity_type: booking.booking_statuses?.[0]?.statuses_master?.entity_type,
      status_value: booking.booking_statuses?.[0]?.statuses_master?.status_value,
      // Charges data
      charge_id: booking.charges?.[0]?.charge_id,
      haulage_fee: booking.charges?.[0]?.haulage_fee,
      twinning_fee: booking.charges?.[0]?.twinning_fee,
      total: booking.charges?.[0]?.total,
      compliance_fee: booking.charges?.[0]?.compliance_fee,
      booking_statuses: undefined, // Remove nested structure
      charges: undefined // Remove nested structure
    })) || [];

    return transformedData;
  } catch (error) {
    console.error('Error fetching bookings with status:', error);
    throw error;
  }
};

/**
 * Get bookings for a specific client
 */
export const getClientBookings = async (clientId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        client_id,
        shipment_type,
        container_size,
        pickup_state,
        delivery_state,
        pickup_address,
        pickup_time,
        delivery_address,
        delicery_time,
        consignee,
        date_booking,
        created_at,
        booking_statuses!booking_statuses_booking_id_fkey (
          status_id,
          updated_at,
          updated_by,
          statuses_master!booking_statuses_status_id_fkey (
            entity_type,
            status_value
          )
        ),
        charges!charges_booking_id_fkey (
          charge_id,
          haulage_fee,
          twinning_fee,
          total,
          compliance_fee
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to flatten the nested structure
    const transformedData = data?.map(booking => ({
      ...booking,
      status_id: booking.booking_statuses?.[0]?.status_id,
      status_updated_at: booking.booking_statuses?.[0]?.updated_at,
      status_updated_by: booking.booking_statuses?.[0]?.updated_by,
      entity_type: booking.booking_statuses?.[0]?.statuses_master?.entity_type,
      status_value: booking.booking_statuses?.[0]?.statuses_master?.status_value,
      // Charges data
      charge_id: booking.charges?.[0]?.charge_id,
      haulage_fee: booking.charges?.[0]?.haulage_fee,
      twinning_fee: booking.charges?.[0]?.twinning_fee,
      total: booking.charges?.[0]?.total,
      compliance_fee: booking.charges?.[0]?.compliance_fee,
      booking_statuses: undefined, // Remove nested structure
      charges: undefined // Remove nested structure
    })) || [];

    return transformedData;
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    throw error;
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (): Promise<BookingStats> => {
  try {
    // Get all bookings with status
    const bookings = await getBookingsWithStatus();
    
    const stats: BookingStats = {
      totalBookings: bookings.length,
      inTransit: 0,
      delivered: 0,
      pending: 0
    };

    // Count by status (adjust these status names based on your statuses_master table)
    bookings.forEach(booking => {
      const statusName = booking.status_name?.toLowerCase();
      if (statusName?.includes('transit') || statusName?.includes('shipping')) {
        stats.inTransit++;
      } else if (statusName?.includes('delivered') || statusName?.includes('completed')) {
        stats.delivered++;
      } else if (statusName?.includes('pending') || statusName?.includes('processing')) {
        stats.pending++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
};

/**
 * Get client booking statistics
 */
export const getClientBookingStats = async (clientId: string): Promise<BookingStats> => {
  try {
    const bookings = await getClientBookings(clientId);
    
    const stats: BookingStats = {
      totalBookings: bookings.length,
      inTransit: 0,
      delivered: 0,
      pending: 0
    };

    // Count by status
    bookings.forEach(booking => {
      const statusName = booking.status_name?.toLowerCase();
      if (statusName?.includes('transit') || statusName?.includes('shipping')) {
        stats.inTransit++;
      } else if (statusName?.includes('delivered') || statusName?.includes('completed')) {
        stats.delivered++;
      } else if (statusName?.includes('pending') || statusName?.includes('processing')) {
        stats.pending++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching client booking stats:', error);
    throw error;
  }
};

/**
 * Get recent bookings (last 10)
 */
export const getRecentBookings = async (limit: number = 10): Promise<Booking[]> => {
  try {
    const bookings = await getBookingsWithStatus();
    return bookings.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    throw error;
  }
};

/**
 * Get recent bookings for a specific client
 */
export const getRecentClientBookings = async (clientId: string, limit: number = 10): Promise<Booking[]> => {
  try {
    const bookings = await getClientBookings(clientId);
    return bookings.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent client bookings:', error);
    throw error;
  }
};

/**
 * Get a single booking by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        client_id,
        shipment_type,
        container_size,
        pickup_state,
        delivery_state,
        pickup_address,
        pickup_time,
        delivery_address,
        delicery_time,
        consignee,
        date_booking,
        created_at,
        booking_statuses!booking_statuses_booking_id_fkey (
          status_id,
          updated_at,
          updated_by,
          statuses_master!booking_statuses_status_id_fkey (
            entity_type,
            status_value
          )
        ),
        charges!charges_booking_id_fkey (
          charge_id,
          haulage_fee,
          twinning_fee,
          total,
          compliance_fee
        )
      `)
      .eq('booking_id', bookingId)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Transform the data to flatten the nested structure
    const transformedData = {
      ...data,
      status_id: data.booking_statuses?.[0]?.status_id,
      status_updated_at: data.booking_statuses?.[0]?.updated_at,
      status_updated_by: data.booking_statuses?.[0]?.updated_by,
      entity_type: data.booking_statuses?.[0]?.statuses_master?.entity_type,
      status_value: data.booking_statuses?.[0]?.statuses_master?.status_value,
      // Charges data
      charge_id: data.charges?.[0]?.charge_id,
      haulage_fee: data.charges?.[0]?.haulage_fee,
      twinning_fee: data.charges?.[0]?.twinning_fee,
      total: data.charges?.[0]?.total,
      compliance_fee: data.charges?.[0]?.compliance_fee,
      booking_statuses: undefined, // Remove nested structure
      charges: undefined // Remove nested structure
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    throw error;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (booking: Omit<Booking, 'booking_id' | 'created_at'>): Promise<Booking> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId: string, statusId: number, updatedBy?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('booking_statuses')
      .upsert({
        booking_id: bookingId,
        status_id: statusId,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};