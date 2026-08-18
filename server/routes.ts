import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from './db.js';
import {
  requireAdminAuth,
  generateSessionToken,
  verifySessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  SESSION_COOKIE_NAME,
  type AuthenticatedRequest
} from './auth.js';
import {
  loginSchema,
  productSchema,
  categorySchema,
  offerSchema,
  stockUpdateSchema,
  inquirySchema,
  settingsSchema
} from './validation.js';
import { generateCloudinarySignature, getOptimizedImageUrl, uploadToCloudinary } from './cloudinary.js';
import { testSupabaseConnection, isSupabaseConnected } from './supabase.js';
import type { Product, Category, Offer } from '../src/types.js';

export const apiRouter = Router();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@aurajewelry.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

// ==========================================
// 1. PUBLIC STOREFRONT ROUTES
// ==========================================

// Helper: Sanitize product for public customer view (hide exact stock number)
function sanitizeProductForCustomer(p: Product) {
  const isAvailable = p.stock > 0;
  return {
    ...p,
    stock: isAvailable ? 1 : 0, // Never reveal exact stock to customer
    isAvailable,
    images: p.images.map(img => ({
      ...img,
      optimizedUrl: getOptimizedImageUrl(img.secureUrl, { width: 1200, quality: 'auto', format: 'auto' }),
      thumbUrl: getOptimizedImageUrl(img.secureUrl, { width: 600, quality: 'auto', format: 'auto' })
    }))
  };
}

// GET /api/products - public list with filter & search
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const {
      category,
      isHot,
      isNewDrop,
      isFeatured,
      isRestocked,
      search,
      sort,
      maxPrice,
      inStockOnly
    } = req.query;

    let products = await db.getProducts({
      categoryId: category ? String(category) : undefined,
      isHot: isHot === 'true',
      isNewDrop: isNewDrop === 'true',
      isFeatured: isFeatured === 'true',
      isRestocked: isRestocked === 'true',
      search: search ? String(search) : undefined,
      includeInactive: false
    });

    if (maxPrice) {
      const numPrice = Number(maxPrice);
      if (!isNaN(numPrice)) {
        products = products.filter(p => p.price <= numPrice);
      }
    }

    if (inStockOnly === 'true') {
      products = products.filter(p => p.stock > 0);
    }

    // Sorting
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'restocked') {
      products.sort((a, b) => {
        const timeA = a.restockedAt ? new Date(a.restockedAt).getTime() : 0;
        const timeB = b.restockedAt ? new Date(b.restockedAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    const sanitized = products.map(sanitizeProductForCustomer);
    res.json({ products: sanitized, total: sanitized.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// GET /api/products/:slug - product detail by slug
apiRouter.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await db.getProductBySlug(slug);

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find related products in the same category
    const relatedRaw = await db.getProducts({ categoryId: product.categoryId, includeInactive: false });
    const related = relatedRaw
      .filter(p => p.id !== product.id)
      .slice(0, 4)
      .map(sanitizeProductForCustomer);

    res.json({
      product: sanitizeProductForCustomer(product),
      related
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

// GET /api/categories - public categories
apiRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.getCategories(false);
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/offers/active - public active offers
apiRouter.get('/offers/active', async (req: Request, res: Response) => {
  try {
    const offers = await db.getOffers(false);
    res.json({ offers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// GET /api/settings/public - public site settings
apiRouter.get('/settings/public', async (req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// POST /api/inquiries - record Instagram customer inquiry
apiRouter.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid inquiry data', details: parsed.error.format() });
    }

    const inquiry = await db.createInquiry(parsed.data);
    res.status(201).json({ success: true, inquiry });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to register inquiry' });
  }
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkLoginRateLimit(ip);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateLimit.remainingSec} seconds before trying again.`
    });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    recordFailedLogin(ip);
    return res.status(400).json({ error: 'Please enter valid email and password credentials.' });
  }

  const { email, password } = parsed.data;

  if (email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Success
  resetLoginAttempts(ip);

  const user = {
    id: 'admin',
    email: ADMIN_EMAIL,
    name: 'Atelier Director',
    role: 'SUPER_ADMIN' as const
  };

  const token = generateSessionToken(user);

  // Set secure cookie
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  try {
    await db.addAuditLog({
      adminEmail: user.email,
      action: 'ADMIN_LOGIN_SUCCESS',
      entity: 'AUTH',
      details: `Admin ${user.email} successfully logged in from ${ip}`
    });
  } catch {
    // Audit logging failure should never block a successful login
  }

  res.json({ success: true, user, token });
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  let token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, user });
});

// ==========================================
// 3. PROTECTED ADMIN ROUTES
// ==========================================

// GET /api/admin/stats
apiRouter.get('/admin/stats', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/products - full list with exact stock & inactive items
apiRouter.get('/admin/products', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await db.getProducts({ includeInactive: true });
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
});

// POST /api/admin/products - create product
apiRouter.post('/admin/products', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    // Check slug uniqueness
    const existing = await db.getProductBySlug(parsed.data.slug);
    if (existing) {
      return res.status(409).json({ error: 'A product with this slug already exists. Please choose a unique slug.' });
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      ...(parsed.data as any),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await db.createProduct(newProduct);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'PRODUCT_CREATED',
      entity: 'PRODUCT',
      entityId: created.id,
      details: `Created product "${created.name}" (SKU: ${created.sku}, Stock: ${created.stock}, Price: $${created.price})`
    });

    res.status(201).json({ success: true, product: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// PUT /api/admin/products/:id - update product
apiRouter.put('/admin/products/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    // Check if slug is taken by another product
    const existingSlug = await db.getProductBySlug(parsed.data.slug);
    if (existingSlug && existingSlug.id !== id) {
      return res.status(409).json({ error: 'A product with this slug already exists.' });
    }

    const updated = await db.updateProduct(id, parsed.data as any);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'PRODUCT_UPDATED',
      entity: 'PRODUCT',
      entityId: id,
      details: `Updated product "${updated.name}" (Price: $${updated.price}, Stock: ${updated.stock})`
    });

    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// PATCH /api/admin/products/:id/stock - quick stock updater
apiRouter.patch('/admin/products/:id/stock', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = stockUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid stock data', details: parsed.error.format() });
    }

    const { stock, isRestockMark } = parsed.data;
    const updated = await db.updateStock(id, stock, isRestockMark);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'STOCK_ADJUSTED',
      entity: 'PRODUCT',
      entityId: id,
      details: `Adjusted stock for "${updated.name}" to ${stock} units${isRestockMark ? ' (Marked as Restocked)' : ''}`
    });

    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE /api/admin/products/:id
apiRouter.delete('/admin/products/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;
    const target = await db.getProductById(id);

    if (!target) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isHardDelete = hard === 'true';
    await db.deleteProduct(id, isHardDelete);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: isHardDelete ? 'PRODUCT_HARD_DELETED' : 'PRODUCT_ARCHIVED',
      entity: 'PRODUCT',
      entityId: id,
      details: `${isHardDelete ? 'Permanently deleted' : 'Archived'} product "${target.name}"`
    });

    res.json({ success: true, message: `Product ${isHardDelete ? 'deleted' : 'archived'} successfully` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// CATEGORY MANAGEMENT
apiRouter.get('/admin/categories', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ categories: await db.getCategories(true) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

apiRouter.post('/admin/categories', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const existing = await db.getCategoryBySlug(parsed.data.slug);
    if (existing) {
      return res.status(409).json({ error: 'Category with this slug already exists.' });
    }

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await db.createCategory(newCategory);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'CATEGORY_CREATED',
      entity: 'CATEGORY',
      entityId: created.id,
      details: `Created category "${created.name}"`
    });

    res.status(201).json({ success: true, category: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

apiRouter.put('/admin/categories/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const updated = await db.updateCategory(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'CATEGORY_UPDATED',
      entity: 'CATEGORY',
      entityId: id,
      details: `Updated category "${updated.name}"`
    });

    res.json({ success: true, category: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

apiRouter.delete('/admin/categories/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.deleteCategory(id, false);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'CATEGORY_ARCHIVED',
      entity: 'CATEGORY',
      entityId: id,
      details: `Archived category "${category.name}"`
    });

    res.json({ success: true, message: 'Category archived successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to archive category' });
  }
});

// OFFERS MANAGEMENT
apiRouter.get('/admin/offers', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ offers: await db.getOffers(true) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

apiRouter.post('/admin/offers', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = offerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const newOffer: Offer = {
      id: 'offer-' + Date.now(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await db.createOffer(newOffer);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'OFFER_CREATED',
      entity: 'OFFER',
      entityId: created.id,
      details: `Created offer "${created.title}" (${created.discountValue}${created.discountType === 'PERCENTAGE' ? '%' : '$'} off)`
    });

    res.status(201).json({ success: true, offer: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

apiRouter.put('/admin/offers/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = offerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const updated = await db.updateOffer(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'OFFER_UPDATED',
      entity: 'OFFER',
      entityId: id,
      details: `Updated offer "${updated.title}"`
    });

    res.json({ success: true, offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

apiRouter.delete('/admin/offers/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.deleteOffer(id);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'OFFER_DELETED',
      entity: 'OFFER',
      entityId: id,
      details: `Deleted offer ID ${id}`
    });

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// SETTINGS MANAGEMENT
apiRouter.get('/admin/settings', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ settings: await db.getSettings() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

apiRouter.put('/admin/settings', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const updated = await db.updateSettings(parsed.data);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'SETTINGS_UPDATED',
      entity: 'SETTINGS',
      details: `Updated store configuration (Store: ${updated.storeName}, IG: @${updated.instagramHandle})`
    });

    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// AUDIT LOGS
apiRouter.get('/admin/audit-logs', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    res.json({ auditLogs: await db.getAuditLogs(limit) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// INQUIRIES
apiRouter.get('/admin/inquiries', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ inquiries: await db.getInquiries() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

apiRouter.patch('/admin/inquiries/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ok = await db.updateInquiryStatus(id, status);
    if (!ok) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// MEDIA & CLOUDINARY UPLOAD HANDLER
apiRouter.post('/admin/cloudinary/sign', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const signData = generateCloudinarySignature(req.body || {});
    if (!signData) {
      return res.json({
        enabled: false,
        message: 'Cloudinary API credentials not configured; using direct media pipeline.'
      });
    }
    res.json({ enabled: true, ...signData });
  } catch (err: any) {
    res.status(500).json({ error: 'Signature generation error', details: err.message });
  }
});

// Direct Image Upload for Mobile & Admin
apiRouter.post('/admin/media/upload', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, filename, folder } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const uploaded = await uploadToCloudinary(imageBase64, { folder: folder || 'jewelry' });

    // Fall back to storing the raw data URI locally when Cloudinary isn't configured
    const asset = uploaded
      ? {
          id: 'media-' + Date.now(),
          publicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          format: uploaded.format,
          width: uploaded.width,
          height: uploaded.height,
          createdAt: new Date().toISOString()
        }
      : {
          id: 'media-' + Date.now(),
          publicId: `jewelry/${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          secureUrl: imageBase64.startsWith('data:')
            ? imageBase64
            : `https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200`,
          format: 'webp',
          width: 1200,
          height: 1200,
          createdAt: new Date().toISOString()
        };

    await db.addMediaAsset(asset);

    await db.addAuditLog({
      adminEmail: req.admin?.email || 'admin',
      action: 'MEDIA_UPLOADED',
      entity: 'MEDIA',
      details: `Uploaded media asset "${filename || asset.publicId}"`
    });

    res.status(201).json({
      success: true,
      asset: {
        cloudinaryPublicId: asset.publicId,
        secureUrl: asset.secureUrl,
        width: asset.width,
        height: asset.height,
        format: asset.format
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Media upload failed', details: err.message });
  }
});

apiRouter.get('/admin/media', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ media: await db.getMediaAssets() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// ==========================================
// 8. SUPABASE CONNECTION STATUS
// Data is always read from and written to Supabase directly in this
// deployment, so there is no "local store" left to sync — these endpoints
// exist only to power the admin panel's connection status card.
// ==========================================

apiRouter.get('/admin/supabase/status', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const isConfigured = isSupabaseConnected();
  const supabaseUrl = process.env.SUPABASE_URL || null;

  res.json({
    configured: isConfigured,
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '...' : null,
    schemaFile: 'supabase-schema.sql',
    instructions: isConfigured
      ? 'Connected. All catalogue and order data reads and writes directly through this Supabase project.'
      : 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment variables — this app requires Supabase to store data.'
  });
});

apiRouter.post('/admin/supabase/test', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const result = await testSupabaseConnection();
  res.json(result);
});

apiRouter.post('/admin/supabase/sync', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: 'No sync needed — this deployment reads and writes Supabase directly, there is no separate local store.'
  });
});
