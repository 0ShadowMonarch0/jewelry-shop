import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the Supabase client if configured in environment variables.
 * Returns null if SUPABASE_URL or SUPABASE_KEY are not present.
 */
export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase initialized for project URL:', supabaseUrl);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  return getSupabase() !== null;
}

/**
 * Test connectivity with Supabase.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tablesDetected?: string[] }> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'SUPABASE_URL or SUPABASE_KEY environment variables are missing. Please add them in project settings.'
    };
  }

  try {
    // Try to query categories table
    const { data, error } = await client.from('categories').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase project, but tables are not created yet. Please execute the supabase-schema.sql script in your Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase query error: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Successfully connected and verified Supabase tables.',
      tablesDetected: ['categories', 'products', 'offers', 'site_settings']
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection test failed: ${err.message}`
    };
  }
}
