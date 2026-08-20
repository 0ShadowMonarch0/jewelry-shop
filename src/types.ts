export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface ProductImage {
  id: string;
  productId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryIds: string[];
  categoryNames?: string[];
  sku: string;
  stock: number;
  isActive: boolean;
  isHot: boolean;
  isNewDrop: boolean;
  isFeatured: boolean;
  restockedAt?: string | null;
  material?: string;
  color?: string;
  size?: string;
  weight?: string;
  tags?: string[];
  specifications?: Record<string, string>;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  discountType: DiscountType;
  discountValue: number;
  code?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  associatedProductIds: string[];
  associatedCategoryIds: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  instagramHandle: string;
  customOrderMessageTemplate: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone?: string;
  announcementText: string;
  announcementEnabled: boolean;
  announcementLink?: string;
  heroHeadline: string;
  heroSubhead: string;
  heroImageUrl: string;
  heroCtaText: string;
  heroCtaLink: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultSeoKeywords?: string;
  aboutText?: string;
  atelierAddress?: string;
  // Page Content (Hero / Categories / Offers / Footer copy)
  heroEyebrowText?: string;
  heroCurrentDropLabel?: string;
  heroCurrentDropText?: string;
  heroSecondaryCtaText?: string;
  heroInquiryCardTitle?: string;
  heroInquiryCardSubtitle?: string;
  heroInquiryCardText?: string;
  categoriesHeading?: string;
  categoriesShowAllText?: string;
  categoriesAllPillLabel?: string;
  offersEyebrowText?: string;
  offersCodeLabel?: string;
  footerPhilosophyEyebrow?: string;
  footerCollectionsHeading?: string;
  footerOrderingHeading?: string;
  footerOrderingText?: string;
  footerBottomTagline?: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface CustomerInquiry {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productPrice: number;
  productSlug: string;
  productImage?: string;
  instagramHandle: string;
  customerNote?: string;
  createdAt: string;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'ARCHIVED';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  lastLogin?: string;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  activeOffers: number;
  totalInquiries: number;
  recentRestocked: number;
}
