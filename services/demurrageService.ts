import { supabase } from '@/lib/supabase';

export interface DemurrageCharge {
  demurrage_id?: string;
  booking_id?: string;
  days_overdue?: number;
  daily_rate?: number;
  location?: string;

}

/**
 * Add a new demurrage charge to the database
 */
export const addDemurrageCharge = async (charge: Omit<DemurrageCharge, 'demurrage_id' >) => {
  try {
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
 * Get all demurrage charges
 */
export const getDemurrageCharges = async () => {
  try {
    const { data, error } = await supabase
      .from('demurrage_charges')
      .select('*');
    console.log('Demurrage charges fetch result:', { data, error });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching demurrage charges:', error);
    throw error;
  }
};

/**
 * Get demurrage charges by booking ID
 */
export const getDemurrageChargesByBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('demurrage_charges')
      .select('*')
      .eq('booking_id', bookingId)
      ;
    
    if (error) throw error;
    return data || [];
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