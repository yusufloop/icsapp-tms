import { supabase } from '@/lib/supabase';

export interface HaulageTariff {
  tariff_id?: string;
  area_name: string;
  area_code?: string;
  state: string;
  haulage_rate: number;
  toll_fee?: number;
  faf_fee?: number;
  dgc_fee?: number;
  grand_total?: number;
  container_size?: string;
  container_type?: string;
  effective_date?: string;
  expiry_date?: string;
  is_active?: boolean;
  version_number?: number;
  additional_charges?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  remarks?: string;
  conditions?: string;
}

/**
 * Get all active haulage tariffs
 */
export const getHaulageTariffs = async (): Promise<HaulageTariff[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('is_active', true)
      .order('area_name', { ascending: true });

    console.log('Haulage tariffs fetch result:', { data, error });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching haulage tariffs:', error);
    throw error;
  }
};

/**
 * Get all haulage tariffs (including inactive for admin)
 */
export const getAllHaulageTariffs = async (): Promise<HaulageTariff[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all haulage tariffs:', error);
    throw error;
  }
};

/**
 * Get haulage tariffs by state
 */
export const getHaulageTariffsByState = async (state: string): Promise<HaulageTariff[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('state', state)
      .eq('is_active', true)
      .order('area_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching haulage tariffs by state:', error);
    throw error;
  }
};

/**
 * Get a single haulage tariff by ID
 */
export const getHaulageTariffById = async (tariffId: string): Promise<HaulageTariff | null> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('tariff_id', tariffId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching haulage tariff:', error);
    throw error;
  }
};

/**
 * Calculate haulage rate for specific route
 */
export const calculateHaulageRate = async (
  pickupArea: string,
  deliveryArea: string,
  containerSize: string = '20ft',
  containerType: string = 'DRY'
): Promise<{ pickupRate: HaulageTariff | null; deliveryRate: HaulageTariff | null; totalHaulage: number }> => {
  try {
    // Find tariffs for pickup and delivery areas
    const { data: pickupTariff, error: pickupError } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('area_name', pickupArea)
      .eq('container_size', containerSize)
      .eq('container_type', containerType)
      .eq('is_active', true)
      .single();

    const { data: deliveryTariff, error: deliveryError } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('area_name', deliveryArea)
      .eq('container_size', containerSize)
      .eq('container_type', containerType)
      .eq('is_active', true)
      .single();

    const pickupRate = pickupError ? null : pickupTariff;
    const deliveryRate = deliveryError ? null : deliveryTariff;

    const totalHaulage = (pickupRate?.grand_total || 0) + (deliveryRate?.grand_total || 0);

    return {
      pickupRate,
      deliveryRate,
      totalHaulage
    };
  } catch (error) {
    console.error('Error calculating haulage rate:', error);
    throw error;
  }
};

/**
 * Create a new haulage tariff
 */
export const createHaulageTariff = async (tariff: Omit<HaulageTariff, 'tariff_id' | 'created_at' | 'updated_at'>): Promise<HaulageTariff> => {
  try {
    // Calculate grand total if not provided
    const grandTotal = tariff.grand_total || 
      (tariff.haulage_rate + (tariff.toll_fee || 0) + (tariff.faf_fee || 0) + (tariff.dgc_fee || 0));

    const { data, error } = await supabase
      .from('haulage_tariff')
      .insert([{
        ...tariff,
        grand_total: grandTotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating haulage tariff:', error);
    throw error;
  }
};

/**
 * Update an existing haulage tariff
 */
export const updateHaulageTariff = async (tariffId: string, updates: Partial<HaulageTariff>): Promise<HaulageTariff> => {
  try {
    // Recalculate grand total if rate components are updated
    let grandTotal = updates.grand_total;
    if (updates.haulage_rate !== undefined || updates.toll_fee !== undefined || 
        updates.faf_fee !== undefined || updates.dgc_fee !== undefined) {
      
      // Get current tariff to merge with updates
      const currentTariff = await getHaulageTariffById(tariffId);
      if (currentTariff) {
        const haulageRate = updates.haulage_rate ?? currentTariff.haulage_rate;
        const tollFee = updates.toll_fee ?? currentTariff.toll_fee ?? 0;
        const fafFee = updates.faf_fee ?? currentTariff.faf_fee ?? 0;
        const dgcFee = updates.dgc_fee ?? currentTariff.dgc_fee ?? 0;
        
        grandTotal = haulageRate + tollFee + fafFee + dgcFee;
      }
    }

    const { data, error } = await supabase
      .from('haulage_tariff')
      .update({
        ...updates,
        grand_total: grandTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('tariff_id', tariffId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating haulage tariff:', error);
    throw error;
  }
};

/**
 * Delete a haulage tariff (soft delete - set is_active to false)
 */
export const deleteHaulageTariff = async (tariffId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('haulage_tariff')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('tariff_id', tariffId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting haulage tariff:', error);
    throw error;
  }
};

/**
 * Search haulage tariffs by area name or state
 */
export const searchHaulageTariffs = async (query: string): Promise<HaulageTariff[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('*')
      .eq('is_active', true)
      .or(`area_name.ilike.%${query}%,state.ilike.%${query}%,area_code.ilike.%${query}%`)
      .order('area_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching haulage tariffs:', error);
    throw error;
  }
};

/**
 * Get unique states from haulage tariffs
 */
export const getHaulageStates = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_tariff')
      .select('state')
      .eq('is_active', true)
      .order('state', { ascending: true });

    if (error) throw error;
    
    // Extract unique states
    const uniqueStates = [...new Set(data?.map(item => item.state) || [])];
    return uniqueStates;
  } catch (error) {
    console.error('Error fetching haulage states:', error);
    throw error;
  }
};