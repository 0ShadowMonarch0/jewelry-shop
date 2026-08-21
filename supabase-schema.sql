-- ==============================================================================
-- MINI2K - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  category_name TEXT,
  category_ids TEXT[] NOT NULL DEFAULT '{}',
  category_names TEXT[] NOT NULL DEFAULT '{}',
  sku TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  is_new_drop BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_offer BOOLEAN NOT NULL DEFAULT false,
  restocked_at TIMESTAMPTZ,
  material TEXT,
  color TEXT,
  size TEXT,
  weight TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- A product can now belong to multiple categories via category_ids; the
-- original singular category_id/category_name columns are kept (unused by
-- the app going forward) rather than dropped, so this migration is
-- non-destructive. New rows never populate them, so category_id's NOT NULL
-- constraint has to go — NULL is fine there since nothing reads it anymore.
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_names TEXT[] NOT NULL DEFAULT '{}';
-- Manual "on offer" curation flag, alongside is_hot/is_new_drop/is_featured —
-- independent of whether the product actually has a discounted original_price.
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offer BOOLEAN NOT NULL DEFAULT false;
-- Backfill: carry every existing product's single category into the new
-- array columns. Safe to re-run — only touches rows that haven't been
-- migrated yet (empty category_ids).
UPDATE products
SET category_ids = ARRAY[category_id], category_names = ARRAY[category_name]
WHERE (category_ids IS NULL OR category_ids = '{}') AND category_id IS NOT NULL;

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  code TEXT,
  discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  associated_product_ids TEXT[] NOT NULL DEFAULT '{}',
  associated_category_ids TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS associated_product_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS associated_category_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 4. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'mini2k',
  tagline TEXT NOT NULL DEFAULT 'Sculptural luxury fine jewelry handcrafted for everyday elevation.',
  logo_url TEXT,
  instagram_handle TEXT NOT NULL DEFAULT 'mini2k.np',
  custom_order_message_template TEXT NOT NULL DEFAULT 'Hi, I''m interested in ordering the {product_name} (SKU: {product_sku}, Price: NPR {product_price}). URL: {product_url}',
  currency_symbol TEXT NOT NULL DEFAULT 'NPR ',
  announcement_enabled BOOLEAN NOT NULL DEFAULT false,
  announcement_text TEXT DEFAULT '',
  announcement_link TEXT,
  contact_email TEXT NOT NULL DEFAULT 'concierge@mini2k.com',
  contact_phone TEXT,
  atelier_address TEXT DEFAULT '14 Place Vendôme, 75001 Paris',
  hero_headline TEXT NOT NULL DEFAULT 'Adorn the Unseen.',
  hero_subhead TEXT NOT NULL DEFAULT 'Sculptural fine jewelry handcrafted in 18K solid gold, natural pearls, and conflict-free gemstones.',
  hero_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000',
  hero_cta_text TEXT NOT NULL DEFAULT 'Explore Catalogue',
  hero_cta_link TEXT NOT NULL DEFAULT '#catalog',
  default_seo_title TEXT NOT NULL DEFAULT 'mini2k',
  default_seo_description TEXT NOT NULL DEFAULT 'Sculptural luxury fine jewelry handcrafted for everyday elevation.',
  default_seo_keywords TEXT,
  about_text TEXT,
  hero_eyebrow_text TEXT,
  hero_current_drop_label TEXT,
  hero_current_drop_text TEXT,
  hero_secondary_cta_text TEXT,
  hero_inquiry_card_title TEXT,
  hero_inquiry_card_subtitle TEXT,
  hero_inquiry_card_text TEXT,
  categories_heading TEXT,
  categories_show_all_text TEXT,
  categories_all_pill_label TEXT,
  offers_eyebrow_text TEXT,
  offers_code_label TEXT,
  footer_philosophy_eyebrow TEXT,
  footer_collections_heading TEXT,
  footer_ordering_heading TEXT,
  footer_ordering_text TEXT,
  footer_bottom_tagline TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_order_message_template TEXT NOT NULL DEFAULT 'Hi, I''m interested in ordering the {product_name} (SKU: {product_sku}, Price: NPR {product_price}). URL: {product_url}';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_link TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_text TEXT NOT NULL DEFAULT 'Explore Catalogue';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_link TEXT NOT NULL DEFAULT '#catalog';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_seo_title TEXT NOT NULL DEFAULT 'mini2k';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_seo_description TEXT NOT NULL DEFAULT 'Sculptural luxury fine jewelry handcrafted for everyday elevation.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_seo_keywords TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_eyebrow_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_current_drop_label TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_current_drop_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_secondary_cta_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_inquiry_card_title TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_inquiry_card_subtitle TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_inquiry_card_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS categories_heading TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS categories_show_all_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS categories_all_pill_label TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS offers_eyebrow_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS offers_code_label TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_philosophy_eyebrow TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_collections_heading TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_ordering_heading TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_ordering_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_bottom_tagline TEXT;

-- 5. CUSTOMER INQUIRIES & ORDERS TABLE
CREATE TABLE IF NOT EXISTS customer_inquiries (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_price NUMERIC(10, 2),
  product_slug TEXT,
  product_image TEXT,
  instagram_handle TEXT NOT NULL,
  customer_note TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE customer_inquiries ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE customer_inquiries ADD COLUMN IF NOT EXISTS product_image TEXT;

-- 6. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 7. MEDIA ASSETS TABLE (Cloudinary / direct upload registry)
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  format TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for storefront tables
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read offers" ON offers;
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Allow Public Insert for customer inquiries (from Instagram DM clicks or storefront forms)
DROP POLICY IF EXISTS "Public insert inquiries" ON customer_inquiries;
CREATE POLICY "Public insert inquiries" ON customer_inquiries FOR INSERT WITH CHECK (true);

-- Service Role / Authenticated has full access
-- NOTE: the app talks to Supabase using the SERVICE ROLE key from the server only
-- (never exposed to the browser), so these permissive policies are safe: the
-- service role bypasses RLS anyway, and no anon/browser client is ever created.
DROP POLICY IF EXISTS "Service role categories" ON categories;
CREATE POLICY "Service role categories" ON categories USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role products" ON products;
CREATE POLICY "Service role products" ON products USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role offers" ON offers;
CREATE POLICY "Service role offers" ON offers USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role settings" ON site_settings;
CREATE POLICY "Service role settings" ON site_settings USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role inquiries" ON customer_inquiries;
CREATE POLICY "Service role inquiries" ON customer_inquiries USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role audit_logs" ON admin_audit_logs;
CREATE POLICY "Service role audit_logs" ON admin_audit_logs USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role media_assets" ON media_assets;
CREATE POLICY "Service role media_assets" ON media_assets USING (true) WITH CHECK (true);
