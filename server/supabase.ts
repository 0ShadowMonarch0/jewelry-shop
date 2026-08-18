import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Category, Product, Offer, SiteSettings } from '../src/types';

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

/**
 * Sync local store records to Supabase tables.
 */
export async function syncLocalStoreToSupabase(data: {
  categories: Category[];
  products: Product[];
  offers: Offer[];
  settings: SiteSettings;
}): Promise<{ success: boolean; message: string; counts?: { categories: number; products: number; offers: number } }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase is not configured in environment variables.' };
  }

  try {
    // 1. Sync Categories
    if (data.categories.length > 0) {
      const catRows = data.categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image_url: c.imageUrl,
        is_active: c.isActive,
        sort_order: c.sortOrder,
        created_at: c.createdAt,
        updated_at: c.updatedAt
      }));
      await client.from('categories').upsert(catRows, { onConflict: 'id' });
    }

    // 2. Sync Products
    if (data.products.length > 0) {
      const prodRows = data.products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        original_price: p.originalPrice || null,
        category_id: p.categoryId,
        category_name: p.categoryName || null,
        sku: p.sku,
        stock: p.stock,
        is_active: p.isActive,
        is_hot: p.isHot,
        is_new_drop: p.isNewDrop,
        is_featured: p.isFeatured,
        restocked_at: p.restockedAt || null,
        material: p.material || null,
        color: p.color || null,
        size: p.size || null,
        weight: p.weight || null,
        tags: p.tags || [],
        specifications: p.specifications || {},
        images: p.images || [],
        created_at: p.createdAt,
        updated_at: p.updatedAt
      }));
      await client.from('products').upsert(prodRows, { onConflict: 'id' });
    }

    // 3. Sync Offers
    if (data.offers.length > 0) {
      const offerRows = data.offers.map(o => ({
        id: o.id,
        title: o.title,
        description: o.description,
        code: o.code || null,
        discount_type: o.discountType,
        discount_value: o.discountValue,
        image_url: o.imageUrl,
        is_active: o.isActive,
        start_date: o.startDate,
        end_date: o.endDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await client.from('offers').upsert(offerRows, { onConflict: 'id' });
    }

    return {
      success: true,
      message: 'Local catalogue successfully synced to Supabase.',
      counts: {
        categories: data.categories.length,
        products: data.products.length,
        offers: data.offers.length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to sync records to Supabase: ${err.message}`
    };
  }
}
