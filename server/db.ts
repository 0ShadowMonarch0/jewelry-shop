import fs from 'fs';
import path from 'path';
import type { 
  Product, 
  Category, 
  Offer, 
  SiteSettings, 
  AdminAuditLog, 
  CustomerInquiry, 
  AdminUser,
  AdminStats,
  ProductImage 
} from '../src/types';

interface DatabaseSchema {
  users: (AdminUser & { passwordHash: string })[];
  categories: Category[];
  products: Product[];
  offers: Offer[];
  settings: SiteSettings;
  auditLogs: AdminAuditLog[];
  inquiries: CustomerInquiry[];
  mediaAssets: {
    id: string;
    publicId: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    createdAt: string;
  }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Default initial high-fashion editorial seed data
const initialCategories: Category[] = [
  {
    id: 'cat-rings',
    name: 'Rings & Solitaires',
    slug: 'rings',
    description: 'Sculptural silhouettes in 18K recycled gold, pavé diamonds, and bezel-set solitaires.',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-necklaces',
    name: 'Necklaces & Chains',
    slug: 'necklaces',
    description: 'Heirloom herringbone chains, freshwater baroque pearl pendants, and celestial medallions.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-bracelets',
    name: 'Bracelets & Cuffs',
    slug: 'bracelets',
    description: 'Chunky tennis bracelets, textured solid gold cuffs, and delicate layered chain links.',
    imageUrl: 'https://images.unsplash.com/photo-1611591475883-8a306c59b666?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-earrings',
    name: 'Earrings & Huggies',
    slug: 'earrings',
    description: 'Modern organic hoops, pearl drops, and everyday molten huggies designed for stacking.',
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-pearls',
    name: 'Pearl Atelier',
    slug: 'pearls',
    description: 'Luminous organic Keshi and South Sea baroque pearls curated for effortless modern luxury.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Solstice 18K Molten Signet Ring',
    slug: 'solstice-18k-molten-signet-ring',
    description: 'Hand-carved in our atelier with an organic molten surface texture. Cast in solid 18K yellow gold with a bezel-set flush brilliant diamond center.',
    price: 680,
    originalPrice: 750,
    categoryId: 'cat-rings',
    categoryName: 'Rings & Solitaires',
    sku: 'AUR-RNG-001',
    stock: 7,
    isActive: true,
    isHot: true,
    isNewDrop: false,
    isFeatured: true,
    restockedAt: '2026-08-10T12:00:00Z',
    material: '18K Solid Yellow Gold',
    color: 'Warm Gold',
    size: 'US 6, 7, 8 available',
    weight: '6.4g',
    tags: ['Best Seller', 'Gold', 'Signature', 'Diamond'],
    specifications: {
      'Metal': '18 Karat Solid Gold (Hallmarked)',
      'Stone': '0.08ct F-VS Natural Brilliant Diamond',
      'Band Width': '3.2mm tapering to 8.5mm face',
      'Finish': 'Satin Brushed with Polished Rim',
      'Origin': 'Handcrafted in Atelier'
    },
    images: [
      {
        id: 'img-1-1',
        productId: 'prod-1',
        cloudinaryPublicId: 'aura/products/solstice-ring-1',
        secureUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'img-1-2',
        productId: 'prod-1',
        cloudinaryPublicId: 'aura/products/solstice-ring-2',
        secureUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 2,
        isPrimary: false,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Helios Baroque Pearl Lariat Necklace',
    slug: 'helios-baroque-pearl-lariat-necklace',
    description: 'An asymmetrical masterpiece featuring a one-of-a-kind organic Japanese freshwater baroque pearl dangling from a delicate 18K solid gold paperclip chain.',
    price: 490,
    originalPrice: 520,
    categoryId: 'cat-necklaces',
    categoryName: 'Necklaces & Chains',
    sku: 'AUR-NCK-002',
    stock: 4,
    isActive: true,
    isHot: true,
    isNewDrop: true,
    isFeatured: true,
    restockedAt: null,
    material: '18K Yellow Gold & AA Baroque Pearl',
    color: 'Lustrous White / Gold',
    size: '18 inch adjustable',
    weight: '8.1g',
    tags: ['New Drop', 'Pearl', 'Editorial', 'Layering'],
    specifications: {
      'Chain': '18K Solid Gold 1.8mm Paperclip link',
      'Pearl': 'Grade AA 14-16mm Freshwater Baroque Pearl',
      'Clasp': 'Custom Atelier Lobster lock',
      'Length': '18" chain with 2" drop'
    },
    images: [
      {
        id: 'img-2-1',
        productId: 'prod-2',
        cloudinaryPublicId: 'aura/products/helios-necklace-1',
        secureUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'img-2-2',
        productId: 'prod-2',
        cloudinaryPublicId: 'aura/products/helios-necklace-2',
        secureUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 2,
        isPrimary: false,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Aethel Tennis Chain Bracelet',
    slug: 'aethel-tennis-chain-bracelet',
    description: 'Timeless luxury reimagined. Four-prong set lab-created brilliant diamonds seamlessly connected along an ultra-flexible 18K white gold track with double security safety clasp.',
    price: 1250,
    categoryId: 'cat-bracelets',
    categoryName: 'Bracelets & Cuffs',
    sku: 'AUR-BRC-003',
    stock: 2,
    isActive: true,
    isHot: true,
    isNewDrop: false,
    isFeatured: true,
    restockedAt: '2026-08-14T09:00:00Z',
    material: '18K White Gold & VVS Diamonds',
    color: 'White Gold / Clear',
    size: '6.75 inch',
    weight: '11.2g',
    tags: ['Fine Diamond', 'Heirloom', 'Restocked'],
    specifications: {
      'Carat Weight': '2.40 ctw VVS-VS Clarity, Color E-F',
      'Metal': '18K Solid White Gold',
      'Width': '2.6mm',
      'Clasp': 'Integrated Box Clasp with Dual Safety Latches'
    },
    images: [
      {
        id: 'img-3-1',
        productId: 'prod-3',
        cloudinaryPublicId: 'aura/products/aethel-bracelet-1',
        secureUrl: 'https://images.unsplash.com/photo-1611591475883-8a306c59b666?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-08-14T09:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Aurelia Organic Molten Gold Hoops',
    slug: 'aurelia-organic-molten-gold-hoops',
    description: 'Cast in lightweight hollowed 18K gold to ensure day-to-night comfort. Features soft rippled contours that catch the light from every angle.',
    price: 340,
    originalPrice: 380,
    categoryId: 'cat-earrings',
    categoryName: 'Earrings & Huggies',
    sku: 'AUR-EAR-004',
    stock: 9,
    isActive: true,
    isHot: false,
    isNewDrop: true,
    isFeatured: true,
    restockedAt: null,
    material: '18K Solid Gold',
    color: 'Yellow Gold',
    size: '22mm diameter',
    weight: '4.8g per pair',
    tags: ['Everyday', 'Statement', 'New Drop'],
    specifications: {
      'Diameter': '22mm outer diameter',
      'Thickness': '4.5mm at thickest wave',
      'Post': 'Hypoallergenic 18K Gold Post with Comfort Backs',
      'Weight': 'Featherlight comfortable feel'
    },
    images: [
      {
        id: 'img-4-1',
        productId: 'prod-4',
        cloudinaryPublicId: 'aura/products/aurelia-hoops-1',
        secureUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'img-4-2',
        productId: 'prod-4',
        cloudinaryPublicId: 'aura/products/aurelia-hoops-2',
        secureUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 2,
        isPrimary: false,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-08-05T14:00:00Z',
    updatedAt: '2026-08-17T09:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Siren Keshi Pearl Strand Choker',
    slug: 'siren-keshi-pearl-strand-choker',
    description: 'Individually hand-knotted on pure silk thread with rare petal-shaped natural Keshi pearls. Secured with an engraved 18K gold ball clasp.',
    price: 560,
    categoryId: 'cat-pearls',
    categoryName: 'Pearl Atelier',
    sku: 'AUR-PRL-005',
    stock: 0, // OUT OF STOCK test case
    isActive: true,
    isHot: true,
    isNewDrop: false,
    isFeatured: true,
    restockedAt: null,
    material: 'Natural Keshi Pearls & 18K Gold',
    color: 'Iridescent Pearl Ivory',
    size: '15.5 inch choker',
    weight: '14.5g',
    tags: ['Atelier Special', 'Pearls', 'Sold Out'],
    specifications: {
      'Pearl Grade': 'AAA Natural Iridescent Luster',
      'Thread': 'Japanese White Silk (Hand-Knotted)',
      'Clasp': '18K Solid Gold Satin Round Lock',
      'Care': 'Avoid direct perfumes and store in silk pouch'
    },
    images: [
      {
        id: 'img-5-1',
        productId: 'prod-5',
        cloudinaryPublicId: 'aura/products/siren-keshi-1',
        secureUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-05-10T12:00:00Z',
    updatedAt: '2026-08-12T16:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Celeste Sapphire Celestial Ring',
    slug: 'celeste-sapphire-celestial-ring',
    description: 'Deep royal blue Australian oval sapphire flanked by two tapered baguette diamonds in an architectural 18K yellow gold knife-edge band.',
    price: 890,
    originalPrice: 980,
    categoryId: 'cat-rings',
    categoryName: 'Rings & Solitaires',
    sku: 'AUR-RNG-006',
    stock: 5,
    isActive: true,
    isHot: false,
    isNewDrop: true,
    isFeatured: true,
    restockedAt: '2026-08-16T15:30:00Z',
    material: '18K Yellow Gold & Natural Sapphire',
    color: 'Deep Midnight Blue / Gold',
    size: 'US 5, 6, 7',
    weight: '5.2g',
    tags: ['Gemstone', 'Sapphire', 'New Drop', 'Restocked'],
    specifications: {
      'Center Stone': '1.20ct Natural Untreated Royal Blue Sapphire',
      'Side Diamonds': '0.18ctw Tapered VS Baguettes',
      'Profile': 'Low profile comfort prong setting',
      'Metal': '18K Yellow Gold'
    },
    images: [
      {
        id: 'img-6-1',
        productId: 'prod-6',
        cloudinaryPublicId: 'aura/products/celeste-sapphire-1',
        secureUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-08-08T11:00:00Z',
    updatedAt: '2026-08-16T15:30:00Z',
  },
  {
    id: 'prod-7',
    name: 'Vermeil Sculptural Chunky Cuff',
    slug: 'vermeil-sculptural-chunky-cuff',
    description: 'Architectural statement piece inspired by Brutalist bronze sculptures. Ergonomically contoured to sit flush against the wrist.',
    price: 420,
    categoryId: 'cat-bracelets',
    categoryName: 'Bracelets & Cuffs',
    sku: 'AUR-BRC-007',
    stock: 8,
    isActive: true,
    isHot: false,
    isNewDrop: false,
    isFeatured: false,
    restockedAt: '2026-08-11T10:00:00Z',
    material: 'Heavy 18K Gold Vermeil over Sterling Silver',
    color: 'Polished Gold',
    size: 'Medium (Fits wrists 6.0" - 7.0")',
    weight: '28.0g',
    tags: ['Sculptural', 'Statement', 'Cuff'],
    specifications: {
      'Plating': '5 Microns 18K Solid Gold over 925 Silver',
      'Gap Width': '1.2 inches for easy on/off wear',
      'Finish': 'Mirror Polish Exterior with Brushed Inner'
    },
    images: [
      {
        id: 'img-7-1',
        productId: 'prod-7',
        cloudinaryPublicId: 'aura/products/vermeil-cuff-1',
        secureUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-08-11T10:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Astrid Emerald Cut Pendant Chain',
    slug: 'astrid-emerald-cut-pendant-chain',
    description: 'Vintage-inspired Colombian emerald green quartz stone framed by micro-pavé accents on an Italian cable chain.',
    price: 360,
    originalPrice: 410,
    categoryId: 'cat-necklaces',
    categoryName: 'Necklaces & Chains',
    sku: 'AUR-NCK-008',
    stock: 6,
    isActive: true,
    isHot: true,
    isNewDrop: false,
    isFeatured: true,
    restockedAt: null,
    material: '18K Yellow Gold Vermeil',
    color: 'Emerald Green / Gold',
    size: '16-18 inch adjustable',
    weight: '5.5g',
    tags: ['Emerald', 'Pendant', 'Vintage'],
    specifications: {
      'Stone': '2.0ct Emerald-cut Fine Hydrothermal Quartz',
      'Chain Style': 'Diamond-cut Italian cable chain',
      'Pendant Dimensions': '12mm x 9mm'
    },
    images: [
      {
        id: 'img-8-1',
        productId: 'prod-8',
        cloudinaryPublicId: 'aura/products/astrid-emerald-1',
        secureUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=1200',
        sortOrder: 1,
        isPrimary: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-07-28T14:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z',
  }
];

const initialOffers: Offer[] = [
  {
    id: 'offer-1',
    title: 'Maison Spring Atelier Special',
    tagline: 'Complimentary 18K Polish Cloth & Silk Travel Case with every order',
    description: 'Take 15% off any curated Solid Gold and Pearl combination when you order this week.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    code: 'ATELIER15',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-09-30T23:59:59Z',
    isActive: true,
    associatedProductIds: ['prod-1', 'prod-2', 'prod-4'],
    associatedCategoryIds: ['cat-rings', 'cat-necklaces', 'cat-pearls'],
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialSettings: SiteSettings = {
  storeName: 'AURA Fine Jewelry',
  tagline: 'Handcrafted Solid Gold, Pearls & Precious Stones',
  logoUrl: '',
  instagramHandle: 'aurafinejewelry',
  customOrderMessageTemplate: "Hi AURA Atelier, I'm interested in ordering the {product_name} (SKU: {product_sku}, Price: ${product_price}). URL: {product_url}",
  currencySymbol: '$',
  contactEmail: 'concierge@aurajewelry.com',
  contactPhone: '+1 (555) 234-8900',
  announcementText: 'Complimentary insured worldwide shipping on all atelier drops | DM on Instagram for bespoke sizing',
  announcementEnabled: true,
  announcementLink: '/offers',
  heroHeadline: 'Sculptural Elegance for the Modern Collector',
  heroSubhead: 'Ethically crafted in 18K recycled solid gold and handpicked baroque pearls. Browse our curated catalogue and claim your piece directly via Instagram.',
  heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=1600',
  heroCtaText: 'Explore New Drop',
  heroCtaLink: '#catalog',
  defaultSeoTitle: 'AURA Fine Jewelry | Pinterest-Inspired Atelier',
  defaultSeoDescription: 'Browse the handcrafted luxury jewelry catalogue from AURA. Order seamlessly via Instagram messaging.',
  defaultSeoKeywords: 'fine jewelry, 18k gold, natural pearls, engagement rings, handcrafted jewelry',
  aboutText: 'AURA Atelier was founded on the philosophy that fine jewelry should be intimate, tactile, and sculpturally distinct. Each item is produced in limited micro-batches in our studio.',
  atelierAddress: 'SoHo Design District, New York & Paris',
  // Page Content (Hero / Categories / Offers / Footer copy)
  heroEyebrowText: 'Editorial 2026',
  heroCurrentDropLabel: 'Current Atelier Drop',
  heroCurrentDropText: 'Celestial 18K Solid Gold & Baroque Series',
  heroSecondaryCtaText: 'New Arrivals',
  heroInquiryCardTitle: 'Instagram Inquiry',
  heroInquiryCardSubtitle: 'Atelier Concierge',
  heroInquiryCardText: 'Select any piece from our catalogue to message us directly for bespoke ring sizing and insured global dispatch.',
  categoriesHeading: 'Curated Categories',
  categoriesShowAllText: 'Show All Curations',
  categoriesAllPillLabel: 'All Atelier',
  offersEyebrowText: 'Limited Seasonal Atelier Event',
  offersCodeLabel: 'Mention code:',
  footerPhilosophyEyebrow: 'Atelier Philosophy',
  footerCollectionsHeading: 'Collections',
  footerOrderingHeading: 'Instagram Ordering',
  footerOrderingText: 'We provide tailored bespoke sizing, custom diamond settings, and insured global delivery. Inquire directly via Instagram messaging.',
  footerBottomTagline: 'Curated in Florence & New York'
};

const initialUsers: (AdminUser & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    email: 'admin@aurajewelry.com',
    name: 'Atelier Director',
    role: 'SUPER_ADMIN',
    // Pre-hashed bcrypt for 'admin123'
    passwordHash: '$2b$10$doAiVy6Ji1ItLhbkVEOc2.XGvIInwxObYAQLS9f1gdfve2eGkosli',
    lastLogin: new Date().toISOString()
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || initialUsers,
          categories: parsed.categories || initialCategories,
          products: parsed.products || initialProducts,
          offers: parsed.offers || initialOffers,
          settings: { ...initialSettings, ...(parsed.settings || {}) },
          auditLogs: parsed.auditLogs || [],
          inquiries: parsed.inquiries || [],
          mediaAssets: parsed.mediaAssets || []
        };
      } catch (err) {
        console.error('Error reading database file, using seeds', err);
      }
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      categories: initialCategories,
      products: initialProducts,
      offers: initialOffers,
      settings: initialSettings,
      auditLogs: [
        {
          id: 'log-seed-1',
          adminEmail: 'admin@aurajewelry.com',
          action: 'SYSTEM_INITIALIZATION',
          entity: 'SYSTEM',
          details: 'Initialized AURA jewelry catalogue with editorial collections and Pinterest layouts.',
          timestamp: new Date().toISOString()
        }
      ],
      inquiries: [
        {
          id: 'inq-1',
          productId: 'prod-1',
          productName: 'Solstice 18K Molten Signet Ring',
          productSku: 'AUR-RNG-001',
          productPrice: 680,
          productSlug: 'solstice-18k-molten-signet-ring',
          productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=800',
          instagramHandle: 'aurafinejewelry',
          customerNote: 'Customer initiated Instagram inquiry for Size 7.',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          status: 'PENDING'
        }
      ],
      mediaAssets: []
    };

    this.saveData(defaultData);
    return defaultData;
  }

  public persist() {
    this.saveData(this.data);
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(filter?: {
    categoryId?: string;
    isHot?: boolean;
    isNewDrop?: boolean;
    isFeatured?: boolean;
    isRestocked?: boolean;
    search?: string;
    includeInactive?: boolean;
  }): Product[] {
    let result = this.data.products;
    if (!filter?.includeInactive) {
      result = result.filter(p => p.isActive);
    }
    if (filter?.categoryId) {
      result = result.filter(p => p.categoryId === filter.categoryId);
    }
    if (filter?.isHot) {
      result = result.filter(p => p.isHot);
    }
    if (filter?.isNewDrop) {
      result = result.filter(p => p.isNewDrop);
    }
    if (filter?.isFeatured) {
      result = result.filter(p => p.isFeatured);
    }
    if (filter?.isRestocked) {
      result = result.filter(p => !!p.restockedAt);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(product: Product): Product {
    const category = this.getCategoryById(product.categoryId);
    if (category) {
      product.categoryName = category.name;
    }
    this.data.products.unshift(product);
    this.persist();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    if (updates.categoryId) {
      const category = this.getCategoryById(updates.categoryId);
      if (category) updates.categoryName = category.name;
    }

    const updated = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.products[index] = updated;
    this.persist();
    return updated;
  }

  public updateStock(id: string, stock: number, isRestockMark?: boolean): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = this.data.products[index];
    const prevStock = current.stock;
    const safeStock = Math.max(0, Math.floor(stock));
    
    let restockedAt = current.restockedAt;
    if (isRestockMark || (prevStock === 0 && safeStock > 0)) {
      restockedAt = new Date().toISOString();
    }

    const updated: Product = {
      ...current,
      stock: safeStock,
      restockedAt,
      updatedAt: new Date().toISOString()
    };
    this.data.products[index] = updated;
    this.persist();
    return updated;
  }

  public deleteProduct(id: string, hardDelete: boolean = false): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    if (hardDelete) {
      this.data.products.splice(index, 1);
    } else {
      this.data.products[index].isActive = false;
      this.data.products[index].updatedAt = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  // --- CATEGORIES ---
  public getCategories(includeInactive: boolean = false): Category[] {
    let cats = this.data.categories;
    if (!includeInactive) {
      cats = cats.filter(c => c.isActive);
    }
    return cats.map(cat => ({
      ...cat,
      productCount: this.data.products.filter(p => p.categoryId === cat.id && p.isActive).length
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug === slug);
  }

  public createCategory(category: Category): Category {
    this.data.categories.push(category);
    this.persist();
    return category;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.categories[index] = updated;

    // Sync categoryName to products if renamed
    if (updates.name) {
      this.data.products.forEach(p => {
        if (p.categoryId === id) {
          p.categoryName = updates.name;
        }
      });
    }

    this.persist();
    return updated;
  }

  public deleteCategory(id: string, hardDelete: boolean = false): boolean {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    if (hardDelete) {
      this.data.categories.splice(index, 1);
    } else {
      this.data.categories[index].isActive = false;
      this.data.categories[index].updatedAt = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  // --- OFFERS ---
  public getOffers(includeInactive: boolean = false): Offer[] {
    const now = new Date();
    let offers = this.data.offers;
    if (!includeInactive) {
      offers = offers.filter(o => {
        if (!o.isActive) return false;
        const start = new Date(o.startDate);
        const end = new Date(o.endDate);
        return start <= now && now <= end;
      });
    }
    return offers.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public createOffer(offer: Offer): Offer {
    this.data.offers.push(offer);
    this.persist();
    return offer;
  }

  public updateOffer(id: string, updates: Partial<Offer>): Offer | null {
    const index = this.data.offers.findIndex(o => o.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.offers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.offers[index] = updated;
    this.persist();
    return updated;
  }

  public deleteOffer(id: string): boolean {
    const index = this.data.offers.findIndex(o => o.id === id);
    if (index === -1) return false;
    this.data.offers.splice(index, 1);
    this.persist();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.persist();
    return this.data.settings;
  }

  // --- AUDIT LOGS ---
  public addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    const entry: AdminAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...log,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persist();
    return entry;
  }

  public getAuditLogs(limit: number = 50): AdminAuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- INQUIRIES ---
  public createInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>): CustomerInquiry {
    const entry: CustomerInquiry = {
      id: 'inq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...inquiry,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    this.data.inquiries.unshift(entry);
    this.persist();
    return entry;
  }

  public getInquiries(limit: number = 100): CustomerInquiry[] {
    return this.data.inquiries.slice(0, limit);
  }

  public updateInquiryStatus(id: string, status: CustomerInquiry['status']): boolean {
    const inq = this.data.inquiries.find(i => i.id === id);
    if (!inq) return false;
    inq.status = status;
    this.persist();
    return true;
  }

  // --- ADMIN USERS & AUTH ---
  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUserLastLogin(id: string) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.persist();
    }
  }

  // --- STATS ---
  public getStats(): AdminStats {
    const products = this.data.products;
    const now = new Date();
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      outOfStockProducts: products.filter(p => p.isActive && p.stock === 0).length,
      lowStockProducts: products.filter(p => p.isActive && p.stock > 0 && p.stock <= 3).length,
      totalCategories: this.data.categories.length,
      activeOffers: this.data.offers.filter(o => o.isActive && new Date(o.startDate) <= now && now <= new Date(o.endDate)).length,
      totalInquiries: this.data.inquiries.length,
      recentRestocked: products.filter(p => !!p.restockedAt).length
    };
  }

  // --- MEDIA ---
  public addMediaAsset(asset: DatabaseSchema['mediaAssets'][0]) {
    this.data.mediaAssets.unshift(asset);
    this.persist();
  }

  public getMediaAssets() {
    return this.data.mediaAssets;
  }
}

export const db = new Database();
