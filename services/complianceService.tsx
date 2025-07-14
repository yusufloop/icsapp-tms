import { supabase } from '@/lib/supabase';

export interface ComplianceCharge {
  id?: string;
  name_compliance: string;
  price: number;
  created_at?: string;
 
}

/**
 * Add a new compliance charge to the database
 */
export const addComplianceCharge = async (charge: Omit<ComplianceCharge, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('compliance_charges')
      .insert([charge])
      .select()
      .single();
      
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding compliance charge:', error);
    throw error;
  }
};

/**
 * Get all compliance charges
 */
export const getComplianceCharges = async () => {
  try {
    const { data, error } = await supabase
      .from('compliance_charges')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Compliance charges fetch result:', { data, error });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching compliance charges:', error);
    throw error;
  }
};

/**
 * Get a single compliance charge by ID
 */
export const getComplianceChargeById = async (complianceId: string) => {
  try {
    const { data, error } = await supabase
      .from('compliance_charges')
      .select('*')
      .eq('id', complianceId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching compliance charge:', error);
    throw error;
  }
};

/**
 * Update an existing compliance charge
 */
export const updateComplianceCharge = async (complianceId: string, updates: Partial<ComplianceCharge>) => {
  try {
    const { data, error } = await supabase
      .from('compliance_charges')
      .update({
        ...updates
      })
      .eq('id', complianceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating compliance charge:', error);
    throw error;
  }
};

/**
 * Delete a compliance charge
 */
export const deleteComplianceCharge = async (complianceId: string) => {
  try {
    const { error } = await supabase
      .from('compliance_charges')
      .delete()
      .eq('id', complianceId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting compliance charge:', error);
    throw error;
  }
};