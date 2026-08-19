import { getSupabase } from './supabase.js';
import type {
  Product,
  Category,
  Offer,
  SiteSettings,
  AdminAuditLog,
  CustomerInquiry,
  AdminStats,
} from '../src/types.js';

function client() {
  const c = getSupabase();
  if (!c) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY).');
  }
  return c;
}

// ==========================================
// ROW <-> APP TYPE MAPPERS
// ==========================================

function rowToProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: Number(r.price),
    originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
    categoryId: r.category_id,
    categoryName: r.category_name || undefined,
    sku: r.sku,
    stock: r.stock,
    isActive: r.is_active,
    isHot: r.is_hot,
    isNewDrop: r.is_new_drop,
    isFeatured: r.is_featured,
    restockedAt: r.restocked_at,
    material: r.material || undefined,
    color: r.color || undefined,
    size: r.size || undefined,
    weight: r.weight || undefined,
    tags: r.tags || [],
    specifications: r.specifications || {},
    images: r.images || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function productToRow(p: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.description !== undefined) row.description = p.description;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice ?? null;
  if (p.categoryId !== undefined) row.category_id = p.categoryId;
  if (p.categoryName !== undefined) row.category_name = p.categoryName;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.isActive !== undefined) row.is_active = p.isActive;
  if (p.isHot !== undefined) row.is_hot = p.isHot;
  if (p.isNewDrop !== undefined) row.is_new_drop = p.isNewDrop;
  if (p.isFeatured !== undefined) row.is_featured = p.isFeatured;
  if (p.restockedAt !== undefined) row.restocked_at = p.restockedAt;
  if (p.material !== undefined) row.material = p.material;
  if (p.color !== undefined) row.color = p.color;
  if (p.size !== undefined) row.size = p.size;
  if (p.weight !== undefined) row.weight = p.weight;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.specifications !== undefined) row.specifications = p.specifications;
  if (p.images !== undefined) row.images = p.images;
  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;
  return row;
}

function rowToCategory(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    imageUrl: r.image_url,
    isActive: r.is_active,
    sortOrder: r.sort_order,
    parentId: r.parent_id || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function categoryToRow(c: Partial<Category>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.name !== undefined) row.name = c.name;
  if (c.slug !== undefined) row.slug = c.slug;
  if (c.description !== undefined) row.description = c.description;
  if (c.imageUrl !== undefined) row.image_url = c.imageUrl;
  if (c.isActive !== undefined) row.is_active = c.isActive;
  if (c.sortOrder !== undefined) row.sort_order = c.sortOrder;
  if (c.parentId !== undefined) row.parent_id = c.parentId;
  if (c.createdAt !== undefined) row.created_at = c.createdAt;
  if (c.updatedAt !== undefined) row.updated_at = c.updatedAt;
  return row;
}

function rowToOffer(r: any): Offer {
  return {
    id: r.id,
    title: r.title,
    tagline: r.tagline || undefined,
    description: r.description,
    imageUrl: r.image_url,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    code: r.code || undefined,
    startDate: r.start_date,
    endDate: r.end_date,
    isActive: r.is_active,
    associatedProductIds: r.associated_product_ids || [],
    associatedCategoryIds: r.associated_category_ids || [],
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function offerToRow(o: Partial<Offer>): Record<string, any> {
  const row: Record<string, any> = {};
  if (o.id !== undefined) row.id = o.id;
  if (o.title !== undefined) row.title = o.title;
  if (o.tagline !== undefined) row.tagline = o.tagline;
  if (o.description !== undefined) row.description = o.description;
  if (o.imageUrl !== undefined) row.image_url = o.imageUrl;
  if (o.discountType !== undefined) row.discount_type = o.discountType;
  if (o.discountValue !== undefined) row.discount_value = o.discountValue;
  if (o.code !== undefined) row.code = o.code;
  if (o.startDate !== undefined) row.start_date = o.startDate;
  if (o.endDate !== undefined) row.end_date = o.endDate;
  if (o.isActive !== undefined) row.is_active = o.isActive;
  if (o.associatedProductIds !== undefined) row.associated_product_ids = o.associatedProductIds;
  if (o.associatedCategoryIds !== undefined) row.associated_category_ids = o.associatedCategoryIds;
  if (o.sortOrder !== undefined) row.sort_order = o.sortOrder;
  if (o.createdAt !== undefined) row.created_at = o.createdAt;
  if (o.updatedAt !== undefined) row.updated_at = o.updatedAt;
  return row;
}

function rowToSettings(r: any): SiteSettings {
  return {
    storeName: r.store_name,
    tagline: r.tagline,
    logoUrl: r.logo_url || undefined,
    instagramHandle: r.instagram_handle,
    customOrderMessageTemplate: r.custom_order_message_template,
    currencySymbol: r.currency_symbol,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone || undefined,
    announcementText: r.announcement_text || '',
    announcementEnabled: r.announcement_enabled,
    announcementLink: r.announcement_link || undefined,
    heroHeadline: r.hero_headline,
    heroSubhead: r.hero_subhead,
    heroImageUrl: r.hero_image_url,
    heroCtaText: r.hero_cta_text,
    heroCtaLink: r.hero_cta_link,
    defaultSeoTitle: r.default_seo_title,
    defaultSeoDescription: r.default_seo_description,
    defaultSeoKeywords: r.default_seo_keywords || undefined,
    aboutText: r.about_text || undefined,
    atelierAddress: r.atelier_address || undefined,
    heroEyebrowText: r.hero_eyebrow_text || undefined,
    heroCurrentDropLabel: r.hero_current_drop_label || undefined,
    heroCurrentDropText: r.hero_current_drop_text || undefined,
    heroSecondaryCtaText: r.hero_secondary_cta_text || undefined,
    heroInquiryCardTitle: r.hero_inquiry_card_title || undefined,
    heroInquiryCardSubtitle: r.hero_inquiry_card_subtitle || undefined,
    heroInquiryCardText: r.hero_inquiry_card_text || undefined,
    categoriesHeading: r.categories_heading || undefined,
    categoriesShowAllText: r.categories_show_all_text || undefined,
    categoriesAllPillLabel: r.categories_all_pill_label || undefined,
    offersEyebrowText: r.offers_eyebrow_text || undefined,
    offersCodeLabel: r.offers_code_label || undefined,
    footerPhilosophyEyebrow: r.footer_philosophy_eyebrow || undefined,
    footerCollectionsHeading: r.footer_collections_heading || undefined,
    footerOrderingHeading: r.footer_ordering_heading || undefined,
    footerOrderingText: r.footer_ordering_text || undefined,
    footerBottomTagline: r.footer_bottom_tagline || undefined,
  };
}

function settingsToRow(s: Partial<SiteSettings>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.storeName !== undefined) row.store_name = s.storeName;
  if (s.tagline !== undefined) row.tagline = s.tagline;
  if (s.logoUrl !== undefined) row.logo_url = s.logoUrl;
  if (s.instagramHandle !== undefined) row.instagram_handle = s.instagramHandle;
  if (s.customOrderMessageTemplate !== undefined) row.custom_order_message_template = s.customOrderMessageTemplate;
  if (s.currencySymbol !== undefined) row.currency_symbol = s.currencySymbol;
  if (s.contactEmail !== undefined) row.contact_email = s.contactEmail;
  if (s.contactPhone !== undefined) row.contact_phone = s.contactPhone;
  if (s.announcementText !== undefined) row.announcement_text = s.announcementText;
  if (s.announcementEnabled !== undefined) row.announcement_enabled = s.announcementEnabled;
  if (s.announcementLink !== undefined) row.announcement_link = s.announcementLink;
  if (s.heroHeadline !== undefined) row.hero_headline = s.heroHeadline;
  if (s.heroSubhead !== undefined) row.hero_subhead = s.heroSubhead;
  if (s.heroImageUrl !== undefined) row.hero_image_url = s.heroImageUrl;
  if (s.heroCtaText !== undefined) row.hero_cta_text = s.heroCtaText;
  if (s.heroCtaLink !== undefined) row.hero_cta_link = s.heroCtaLink;
  if (s.defaultSeoTitle !== undefined) row.default_seo_title = s.defaultSeoTitle;
  if (s.defaultSeoDescription !== undefined) row.default_seo_description = s.defaultSeoDescription;
  if (s.defaultSeoKeywords !== undefined) row.default_seo_keywords = s.defaultSeoKeywords;
  if (s.aboutText !== undefined) row.about_text = s.aboutText;
  if (s.atelierAddress !== undefined) row.atelier_address = s.atelierAddress;
  if (s.heroEyebrowText !== undefined) row.hero_eyebrow_text = s.heroEyebrowText;
  if (s.heroCurrentDropLabel !== undefined) row.hero_current_drop_label = s.heroCurrentDropLabel;
  if (s.heroCurrentDropText !== undefined) row.hero_current_drop_text = s.heroCurrentDropText;
  if (s.heroSecondaryCtaText !== undefined) row.hero_secondary_cta_text = s.heroSecondaryCtaText;
  if (s.heroInquiryCardTitle !== undefined) row.hero_inquiry_card_title = s.heroInquiryCardTitle;
  if (s.heroInquiryCardSubtitle !== undefined) row.hero_inquiry_card_subtitle = s.heroInquiryCardSubtitle;
  if (s.heroInquiryCardText !== undefined) row.hero_inquiry_card_text = s.heroInquiryCardText;
  if (s.categoriesHeading !== undefined) row.categories_heading = s.categoriesHeading;
  if (s.categoriesShowAllText !== undefined) row.categories_show_all_text = s.categoriesShowAllText;
  if (s.categoriesAllPillLabel !== undefined) row.categories_all_pill_label = s.categoriesAllPillLabel;
  if (s.offersEyebrowText !== undefined) row.offers_eyebrow_text = s.offersEyebrowText;
  if (s.offersCodeLabel !== undefined) row.offers_code_label = s.offersCodeLabel;
  if (s.footerPhilosophyEyebrow !== undefined) row.footer_philosophy_eyebrow = s.footerPhilosophyEyebrow;
  if (s.footerCollectionsHeading !== undefined) row.footer_collections_heading = s.footerCollectionsHeading;
  if (s.footerOrderingHeading !== undefined) row.footer_ordering_heading = s.footerOrderingHeading;
  if (s.footerOrderingText !== undefined) row.footer_ordering_text = s.footerOrderingText;
  if (s.footerBottomTagline !== undefined) row.footer_bottom_tagline = s.footerBottomTagline;
  return row;
}

function rowToInquiry(r: any): CustomerInquiry {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    productSku: r.product_sku,
    productPrice: r.product_price != null ? Number(r.product_price) : 0,
    productSlug: r.product_slug,
    productImage: r.product_image || undefined,
    instagramHandle: r.instagram_handle,
    customerNote: r.customer_note || undefined,
    createdAt: r.created_at,
    status: r.status,
  };
}

function rowToAuditLog(r: any): AdminAuditLog {
  return {
    id: r.id,
    adminEmail: r.admin_email,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id || undefined,
    details: r.details,
    ipAddress: r.ip_address || undefined,
    timestamp: r.timestamp,
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'mini2k',
  tagline: 'Handcrafted Solid Gold, Pearls & Precious Stones',
  instagramHandle: 'mini2k.np',
  customOrderMessageTemplate:
    "Hi mini2k, I'm interested in ordering the {product_name} (SKU: {product_sku}, Price: NPR {product_price}). URL: {product_url}",
  currencySymbol: 'NPR ',
  contactEmail: 'concierge@mini2k.com',
  announcementText: 'Complimentary insured worldwide shipping on all atelier drops',
  announcementEnabled: true,
  heroHeadline: 'Sculptural Elegance for the Modern Collector',
  heroSubhead: 'Ethically crafted in 18K recycled solid gold and handpicked baroque pearls.',
  heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=1600',
  heroCtaText: 'Explore New Drop',
  heroCtaLink: '#catalog',
  defaultSeoTitle: 'mini2k',
  defaultSeoDescription: 'Handcrafted luxury jewelry catalogue with direct Instagram ordering.',
};

export const db = {
  // --- PRODUCTS ---
  async getProducts(filter?: {
    categoryId?: string;
    isHot?: boolean;
    isNewDrop?: boolean;
    isFeatured?: boolean;
    isRestocked?: boolean;
    search?: string;
    includeInactive?: boolean;
  }): Promise<Product[]> {
    let q = client().from('products').select('*');
    if (!filter?.includeInactive) q = q.eq('is_active', true);
    if (filter?.categoryId) q = q.eq('category_id', filter.categoryId);
    if (filter?.isHot) q = q.eq('is_hot', true);
    if (filter?.isNewDrop) q = q.eq('is_new_drop', true);
    if (filter?.isFeatured) q = q.eq('is_featured', true);
    if (filter?.isRestocked) q = q.not('restocked_at', 'is', null);
    if (filter?.search) {
      const term = filter.search.trim().replace(/[%,]/g, '');
      if (term) {
        q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%,category_name.ilike.%${term}%`);
      }
    }
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToProduct);
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const { data, error } = await client().from('products').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : undefined;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const { data, error } = await client().from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : undefined;
  },

  async createProduct(product: Product): Promise<Product> {
    const category = await this.getCategoryById(product.categoryId);
    if (category) product.categoryName = category.name;
    const { data, error } = await client().from('products').insert(productToRow(product)).select().single();
    if (error) throw error;
    return rowToProduct(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (updates.categoryId) {
      const category = await this.getCategoryById(updates.categoryId);
      if (category) updates.categoryName = category.name;
    }
    const row = productToRow({ ...updates, updatedAt: new Date().toISOString() });
    const { data, error } = await client().from('products').update(row).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : null;
  },

  async updateStock(id: string, stock: number, isRestockMark?: boolean): Promise<Product | null> {
    const current = await this.getProductById(id);
    if (!current) return null;

    const safeStock = Math.max(0, Math.floor(stock));
    let restockedAt = current.restockedAt;
    if (isRestockMark || (current.stock === 0 && safeStock > 0)) {
      restockedAt = new Date().toISOString();
    }

    const { data, error } = await client()
      .from('products')
      .update({ stock: safeStock, restocked_at: restockedAt, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : null;
  },

  async deleteProduct(id: string, hardDelete: boolean = false): Promise<boolean> {
    if (hardDelete) {
      const { error } = await client().from('products').delete().eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await client()
        .from('products')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
    return true;
  },

  // --- CATEGORIES ---
  async getCategories(includeInactive: boolean = false): Promise<Category[]> {
    let q = client().from('categories').select('*');
    if (!includeInactive) q = q.eq('is_active', true);
    const { data, error } = await q.order('sort_order', { ascending: true });
    if (error) throw error;
    const cats = (data || []).map(rowToCategory);

    const { data: prodRows, error: prodErr } = await client().from('products').select('category_id, is_active');
    if (prodErr) throw prodErr;

    return cats.map(cat => ({
      ...cat,
      productCount: (prodRows || []).filter((p: any) => p.category_id === cat.id && p.is_active).length,
    }));
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    const { data, error } = await client().from('categories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToCategory(data) : undefined;
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const { data, error } = await client().from('categories').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? rowToCategory(data) : undefined;
  },

  async createCategory(category: Category): Promise<Category> {
    const { data, error } = await client().from('categories').insert(categoryToRow(category)).select().single();
    if (error) throw error;
    return rowToCategory(data);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const row = categoryToRow({ ...updates, updatedAt: new Date().toISOString() });
    const { data, error } = await client().from('categories').update(row).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) return null;

    if (updates.name) {
      await client().from('products').update({ category_name: updates.name }).eq('category_id', id);
    }

    return rowToCategory(data);
  },

  async deleteCategory(id: string, hardDelete: boolean = false): Promise<boolean> {
    if (hardDelete) {
      const { error } = await client().from('categories').delete().eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await client()
        .from('categories')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
    return true;
  },

  // --- OFFERS ---
  async getOffers(includeInactive: boolean = false): Promise<Offer[]> {
    const { data, error } = await client().from('offers').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    let offers = (data || []).map(rowToOffer);

    if (!includeInactive) {
      const now = new Date();
      offers = offers.filter(o => o.isActive && new Date(o.startDate) <= now && now <= new Date(o.endDate));
    }
    return offers;
  },

  async createOffer(offer: Offer): Promise<Offer> {
    const { data, error } = await client().from('offers').insert(offerToRow(offer)).select().single();
    if (error) throw error;
    return rowToOffer(data);
  },

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    const row = offerToRow({ ...updates, updatedAt: new Date().toISOString() });
    const { data, error } = await client().from('offers').update(row).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? rowToOffer(data) : null;
  },

  async deleteOffer(id: string): Promise<boolean> {
    const { error } = await client().from('offers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await client().from('site_settings').select('*').eq('id', 'default').maybeSingle();
    if (error) throw error;

    if (!data) {
      const { data: created, error: insertErr } = await client()
        .from('site_settings')
        .insert({ id: 'default', ...settingsToRow(DEFAULT_SETTINGS) })
        .select()
        .single();
      if (insertErr) throw insertErr;
      return rowToSettings(created);
    }
    return rowToSettings(data);
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const row = { ...settingsToRow(updates), id: 'default', updated_at: new Date().toISOString() };
    const { data, error } = await client().from('site_settings').upsert(row, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return rowToSettings(data);
  },

  // --- AUDIT LOGS ---
  async addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    const entry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      admin_email: log.adminEmail,
      action: log.action,
      entity: log.entity,
      entity_id: log.entityId || null,
      details: log.details,
      ip_address: log.ipAddress || null,
      timestamp: new Date().toISOString(),
    };
    const { data, error } = await client().from('admin_audit_logs').insert(entry).select().single();
    if (error) throw error;
    return rowToAuditLog(data);
  },

  async getAuditLogs(limit: number = 50): Promise<AdminAuditLog[]> {
    const { data, error } = await client()
      .from('admin_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(rowToAuditLog);
  },

  // --- INQUIRIES ---
  async createInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>): Promise<CustomerInquiry> {
    const entry = {
      id: 'inq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      product_id: inquiry.productId,
      product_name: inquiry.productName,
      product_sku: inquiry.productSku,
      product_price: inquiry.productPrice,
      product_slug: inquiry.productSlug,
      product_image: inquiry.productImage || null,
      instagram_handle: inquiry.instagramHandle,
      customer_note: inquiry.customerNote || null,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    const { data, error } = await client().from('customer_inquiries').insert(entry).select().single();
    if (error) throw error;
    return rowToInquiry(data);
  },

  async getInquiries(limit: number = 100): Promise<CustomerInquiry[]> {
    const { data, error } = await client()
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(rowToInquiry);
  },

  async updateInquiryStatus(id: string, status: CustomerInquiry['status']): Promise<boolean> {
    const { error } = await client().from('customer_inquiries').update({ status }).eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- STATS ---
  async getStats(): Promise<AdminStats> {
    const [products, categories, offers, inquiries] = await Promise.all([
      this.getProducts({ includeInactive: true }),
      this.getCategories(true),
      this.getOffers(true),
      this.getInquiries(1000),
    ]);

    const now = new Date();
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      outOfStockProducts: products.filter(p => p.isActive && p.stock === 0).length,
      lowStockProducts: products.filter(p => p.isActive && p.stock > 0 && p.stock <= 3).length,
      totalCategories: categories.length,
      activeOffers: offers.filter(o => o.isActive && new Date(o.startDate) <= now && now <= new Date(o.endDate)).length,
      totalInquiries: inquiries.length,
      recentRestocked: products.filter(p => !!p.restockedAt).length,
    };
  },

  // --- MEDIA ---
  async addMediaAsset(asset: {
    id: string;
    publicId: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    createdAt: string;
  }): Promise<void> {
    const { error } = await client().from('media_assets').insert({
      id: asset.id,
      public_id: asset.publicId,
      secure_url: asset.secureUrl,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      created_at: asset.createdAt,
    });
    if (error) throw error;
  },

  async getMediaAssets() {
    const { data, error } = await client().from('media_assets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      publicId: r.public_id,
      secureUrl: r.secure_url,
      format: r.format,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
    }));
  },
};
