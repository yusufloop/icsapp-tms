import { supabase } from '@/lib/supabase';

export interface Approval {
  id?: string;
  approval_type: string;
  booking_id: string;
  created_at?: string;
}

/**
 * Add a new approval record to the database
 */
export const addApproval = async (approval: Omit<Approval, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('approval')
      .insert([approval])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding approval:', error);
    throw error;
  }
};

/**
 * Get all approvals for a booking
 */
export const getApprovalsByBookingId = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('approval')
      .select('*')
      .eq('booking_id', bookingId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching approvals:', error);
    throw error;
  }
};

/**
 * Check if a booking has been approved
 */
export const isBookingApproved = async (bookingId: string) => {
  try {
    const { data, error, count } = await supabase
      .from('approval')
      .select('*', { count: 'exact' })
      .eq('booking_id', bookingId)
      .eq('approval_type', 'APPROVED');
    
    if (error) throw error;
    return count && count > 0;
  } catch (error) {
    console.error('Error checking booking approval:', error);
    return false;
  }
};