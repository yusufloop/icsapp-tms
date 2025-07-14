import { supabase } from '@/lib/supabase';

export interface DemurrageCharge {
  demurrage_id?: string;
  booking_id: string;
  days_overdue: number;
  daily_rate: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  total_fee?: number;
}

/**
 * Add a new demurrage charge to the database
 */
export const addDemurrageCharge = async (charge: DemurrageCharge) => {
  try {
    // Calculate total fee if not provided
    if (!charge.total_fee && charge.days_overdue && charge.daily_rate) {
      charge.total_fee = charge.days_overdue * charge.daily_rate;
    }
    
    const { data, error } = await supabase
      .from('demurrage_charges')
      .insert([charge])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding demurrage charge:', error);
    throw error;
  }
};

/**
 * Get demurrage charges, optionally filtered by booking ID
 */
export const getDemurrageCharges = async (bookingId?: string) => {
  try {
    let query = supabase
      .from('demurrage_charges')
      .select('*');
    
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching demurrage charges:', error);
    throw error;
  }
};

/**
 * Get a single demurrage charge by ID
 */
export const getDemurrageChargeById = async (demurrageId: string) => {
  try {
    const { data, error } = await supabase
      .from('demurrage_charges')
      .select('*')
      .eq('demurrage_id', demurrageId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching demurrage charge:', error);
    throw error;
  }
};

/**
 * Update an existing demurrage charge
 */
export const updateDemurrageCharge = async (demurrageId: string, updates: Partial<DemurrageCharge>) => {
  try {
    // Recalculate total fee if days or rate changed
    if ((updates.days_overdue || updates.daily_rate) && !updates.total_fee) {
      const current = await getDemurrageChargeById(demurrageId);
      const days = updates.days_overdue ?? current.days_overdue;
      const rate = updates.daily_rate ?? current.daily_rate;
      updates.total_fee = days * rate;
    }
    
    const { data, error } = await supabase
      .from('demurrage_charges')
      .update(updates)
      .eq('demurrage_id', demurrageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating demurrage charge:', error);
    throw error;
  }
};

/**
 * Delete a demurrage charge
 */
export const deleteDemurrageCharge = async (demurrageId: string) => {
  try {
    const { error } = await supabase
      .from('demurrage_charges')
      .delete()
      .eq('demurrage_id', demurrageId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting demurrage charge:', error);
    throw error;
  }
};