-- ==============================================================================
-- AURELIA JEWELRY - SUPABASE POSTGRESQL DATABASE SCHEMA
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  category_name TEXT,
  sku TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  is_new_drop BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
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

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT,
  discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'AURELIA Fine Jewelry',
  tagline TEXT NOT NULL DEFAULT 'Sculptural luxury fine jewelry handcrafted for everyday elevation.',
  instagram_handle TEXT NOT NULL DEFAULT 'aurelia_jewelry',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  announcement_enabled BOOLEAN NOT NULL DEFAULT false,
  announcement_text TEXT DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'concierge@aurelia-atelier.com',
  atelier_address TEXT DEFAULT '14 Place Vendôme, 75001 Paris',
  hero_headline TEXT NOT NULL DEFAULT 'Adorn the Unseen.',
  hero_subhead TEXT NOT NULL DEFAULT 'Sculptural fine jewelry handcrafted in 18K solid gold, natural pearls, and conflict-free gemstones.',
  hero_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CUSTOMER INQUIRIES & ORDERS TABLE
CREATE TABLE IF NOT EXISTS customer_inquiries (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_price NUMERIC(10, 2),
  instagram_handle TEXT NOT NULL,
  customer_note TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  details TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for storefront tables
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Allow Public Insert for customer inquiries (from Instagram DM clicks or storefront forms)
CREATE POLICY "Public insert inquiries" ON customer_inquiries FOR INSERT WITH CHECK (true);

-- Service Role / Authenticated has full access
CREATE POLICY "Service role categories" ON categories USING (true) WITH CHECK (true);
CREATE POLICY "Service role products" ON products USING (true) WITH CHECK (true);
CREATE POLICY "Service role offers" ON offers USING (true) WITH CHECK (true);
CREATE POLICY "Service role settings" ON site_settings USING (true) WITH CHECK (true);
CREATE POLICY "Service role inquiries" ON customer_inquiries USING (true) WITH CHECK (true);
CREATE POLICY "Service role audit_logs" ON admin_audit_logs USING (true) WITH CHECK (true);
