import { supabase } from '@/lib/supabase';

export interface HaulageCompany {
  company_id?: string;
  company_name: string;
  company_code: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contact_phone?: string;
  contact_email?: string;
  total_annual_jobs?: number;
  market_share_percentage?: number;
  annual_rank?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all active haulage companies
 */
export const getHaulageCompanies = async (): Promise<HaulageCompany[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('annual_rank', { ascending: true });

    console.log('Haulage companies fetch result:', { data, error });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching haulage companies:', error);
    throw error;
  }
};

/**
 * Get all haulage companies (including inactive for admin)
 */
export const getAllHaulageCompanies = async (): Promise<HaulageCompany[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all haulage companies:', error);
    throw error;
  }
};

/**
 * Get a single haulage company by ID
 */
export const getHaulageCompanyById = async (companyId: string): Promise<HaulageCompany | null> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching haulage company:', error);
    throw error;
  }
};

/**
 * Create a new haulage company
 */
export const createHaulageCompany = async (company: Omit<HaulageCompany, 'company_id' | 'created_at' | 'updated_at'>): Promise<HaulageCompany> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .insert([{
        ...company,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating haulage company:', error);
    throw error;
  }
};

/**
 * Update an existing haulage company
 */
export const updateHaulageCompany = async (companyId: string, updates: Partial<HaulageCompany>): Promise<HaulageCompany> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating haulage company:', error);
    throw error;
  }
};

/**
 * Delete a haulage company (soft delete - set status to INACTIVE)
 */
export const deleteHaulageCompany = async (companyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('haulage_companies')
      .update({
        status: 'INACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting haulage company:', error);
    throw error;
  }
};

/**
 * Search haulage companies by name or code
 */
export const searchHaulageCompanies = async (query: string): Promise<HaulageCompany[]> => {
  try {
    const { data, error } = await supabase
      .from('haulage_companies')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`company_name.ilike.%${query}%,company_code.ilike.%${query}%`)
      .order('annual_rank', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching haulage companies:', error);
    throw error;
  }
};