import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  cloudinaryPublicId: z.string().default(''),
  secureUrl: z.string().url('Must be a valid image URL'),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false)
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(120),
  slug: z.string().min(2).max(150).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().default(''),
  price: z.number().positive('Price must be greater than zero'),
  originalPrice: z.number().positive().optional().nullable(),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  sku: z.string().min(2, 'SKU is required').max(50),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  isActive: z.boolean().default(true),
  isHot: z.boolean().default(false),
  isNewDrop: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  restockedAt: z.string().optional().nullable(),
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  tags: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).optional(),
  images: z.array(productImageSchema).min(1, 'At least one product image is required')
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(80),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().default(''),
  imageUrl: z.string().url('Category image must be a valid URL'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: z.string().nullable().optional()
});

export const offerSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  tagline: z.string().max(160).optional(),
  description: z.string().min(5, 'Description is required'),
  imageUrl: z.string().url('Image must be a valid URL'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  code: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid start date required'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid end date required'),
  isActive: z.boolean().default(true),
  associatedProductIds: z.array(z.string()).default([]),
  associatedCategoryIds: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0)
});

export const stockUpdateSchema = z.object({
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  isRestockMark: z.boolean().optional()
});

export const inquirySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  productPrice: z.number().positive(),
  productSlug: z.string().min(1),
  productImage: z.string().optional(),
  instagramHandle: z.string().min(1),
  customerNote: z.string().max(500).optional()
});

export const settingsSchema = z.object({
  storeName: z.string().min(2).max(100),
  tagline: z.string().max(150),
  logoUrl: z.string().optional(),
  instagramHandle: z.string().min(1).max(50),
  customOrderMessageTemplate: z.string().min(10),
  currencySymbol: z.string().min(1).max(5),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  announcementText: z.string().max(200),
  announcementEnabled: z.boolean(),
  announcementLink: z.string().optional(),
  heroHeadline: z.string().min(3).max(120),
  heroSubhead: z.string().max(300),
  heroImageUrl: z.string().url(),
  heroCtaText: z.string().min(2).max(40),
  heroCtaLink: z.string().min(1).max(100),
  defaultSeoTitle: z.string().max(100),
  defaultSeoDescription: z.string().max(200),
  defaultSeoKeywords: z.string().max(300).optional(),
  aboutText: z.string().optional(),
  atelierAddress: z.string().optional(),
  // Page Content (Hero / Categories / Offers / Footer copy)
  heroEyebrowText: z.string().max(60).optional(),
  heroCurrentDropLabel: z.string().max(60).optional(),
  heroCurrentDropText: z.string().max(120).optional(),
  heroSecondaryCtaText: z.string().max(40).optional(),
  heroInquiryCardTitle: z.string().max(60).optional(),
  heroInquiryCardSubtitle: z.string().max(60).optional(),
  heroInquiryCardText: z.string().max(300).optional(),
  categoriesHeading: z.string().max(60).optional(),
  categoriesShowAllText: z.string().max(60).optional(),
  categoriesAllPillLabel: z.string().max(40).optional(),
  offersEyebrowText: z.string().max(80).optional(),
  offersCodeLabel: z.string().max(40).optional(),
  footerPhilosophyEyebrow: z.string().max(60).optional(),
  footerCollectionsHeading: z.string().max(60).optional(),
  footerOrderingHeading: z.string().max(60).optional(),
  footerOrderingText: z.string().max(300).optional(),
  footerBottomTagline: z.string().max(80).optional()
});
