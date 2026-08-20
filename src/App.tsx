import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api, setAuthToken } from './lib/api';
import type { Product, Category, SiteSettings, AdminUser } from './types';

// Storefront Components
import { Header } from './components/storefront/Header';
import { Hero } from './components/storefront/Hero';
import { CategoryPills } from './components/storefront/CategoryPills';
import { ProductRail } from './components/storefront/ProductRail';
import { MasonryGrid } from './components/storefront/MasonryGrid';
import { ProductPage } from './components/storefront/ProductPage';
import { InstagramOrderModal } from './components/storefront/InstagramOrderModal';
import { SearchOverlay } from './components/storefront/SearchOverlay';
import { Footer } from './components/storefront/Footer';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sparkles, Flame, Tag, RotateCcw } from 'lucide-react';
import { Slider } from './components/ui/slider';

// Creates or updates a <meta> tag identified by name/property, and returns
// nothing — used to push admin-configured SEO content into the live <head>.
function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function App() {
  // App mode: 'storefront' | 'admin'
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Data states
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Sorting states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'inStock'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc' | 'newest'>('featured');
  // null = no manual price filter applied yet (defaults to the full catalogue range)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  // Interactive Overlays & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [activeInstagramOrderProduct, setActiveInstagramOrderProduct] = useState<Product | null>(null);
  const [instagramOrderQuantity, setInstagramOrderQuantity] = useState(1);
  const [instagramOrderColor, setInstagramOrderColor] = useState<string | undefined>(undefined);
  const [instagramOrderSize, setInstagramOrderSize] = useState<string | undefined>(undefined);

  const openInstagramOrder = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    setActiveInstagramOrderProduct(product);
    setInstagramOrderQuantity(quantity);
    setInstagramOrderColor(color);
    setInstagramOrderSize(size);
  };

  // Kept in sync with `products` via the effect below so the popstate
  // handler (registered once, on mount) can always resolve the latest list
  // without needing to re-subscribe every time products changes.
  const productsRef = useRef<Product[]>([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Remembers where the user was scrolled in the catalogue so "Back to
  // Catalogue" can restore it, instead of dumping them back at the top.
  const catalogScrollY = useRef(0);

  // Open a product's URL as a real path (not a hash) so social-preview
  // crawlers hitting /product/<slug> can be identified and served correct
  // per-product meta tags (see middleware.ts + server/productMeta.ts) —
  // hash fragments never reach the server at all, so that wasn't possible
  // with the old #product-<slug> links.
  const openProduct = (product: Product, pushHistory: boolean = true) => {
    if (!activeProductModal) {
      catalogScrollY.current = window.scrollY;
    }
    setActiveProductModal(product);
    if (pushHistory) {
      window.history.pushState({}, '', `/product/${product.slug}`);
    }
  };

  const closeProductModal = () => {
    setActiveProductModal(null);
    if (window.location.pathname.startsWith('/product/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Scroll to the top when a product page opens (regardless of whether it was
  // opened via a click, a direct link, or browser back/forward), and restore
  // the catalogue's scroll position when returning to it. Deferred a frame so
  // the catalogue has already re-rendered at full height before we scroll —
  // otherwise the restore can get clamped to whatever (shorter) height the
  // page happened to be at mid-transition.
  useEffect(() => {
    if (activeProductModal) {
      window.scrollTo(0, 0);
    } else {
      const targetY = catalogScrollY.current;
      requestAnimationFrame(() => window.scrollTo(0, targetY));
    }
  }, [activeProductModal]);

  // Initial load & URL routing check
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setViewMode('admin');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setViewMode('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Browser back/forward should open or close the product modal to match
    // whatever /product/<slug> (or lack thereof) it navigates to.
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/product\/([^/]+)\/?$/);
      const found = match ? productsRef.current.find(p => p.slug === match[1]) : null;
      setActiveProductModal(found || null);
    };
    window.addEventListener('popstate', handlePopState);

    // Initial check for existing admin session
    api.getMe()
      .then((res) => {
        if (res.authenticated && res.user) {
          setAdminUser(res.user);
        }
      })
      .catch(() => {
        // Guest mode
      });

    loadStorefrontData();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Once products have loaded, open the product modal if the page was
  // loaded directly on a /product/<slug> URL (e.g. a shared link).
  useEffect(() => {
    if (products.length === 0) return;
    const match = window.location.pathname.match(/^\/product\/([^/]+)\/?$/);
    if (!match) return;
    const found = products.find(p => p.slug === match[1]);
    if (found) openProduct(found, false);
  }, [products]);

  // Push admin-configured page content (title, meta description, keywords,
  // Open Graph tags) into the live document whenever settings load or change.
  useEffect(() => {
    if (!settings) return;

    const seoTitle = settings.defaultSeoTitle || settings.storeName;
    const seoDescription = settings.defaultSeoDescription || settings.tagline;

    document.title = seoTitle;
    setMetaTag('name', 'description', seoDescription);
    if (settings.defaultSeoKeywords) {
      setMetaTag('name', 'keywords', settings.defaultSeoKeywords);
    }

    setMetaTag('property', 'og:site_name', settings.storeName);
    setMetaTag('property', 'og:title', seoTitle);
    setMetaTag('property', 'og:description', seoDescription);
    setMetaTag('property', 'og:url', window.location.href);
    setMetaTag('name', 'twitter:title', seoTitle);
    setMetaTag('name', 'twitter:description', seoDescription);
    if (settings.heroImageUrl) {
      setMetaTag('property', 'og:image', settings.heroImageUrl);
      setMetaTag('property', 'og:image:alt', `${settings.storeName} — ${settings.tagline}`);
      setMetaTag('name', 'twitter:image', settings.heroImageUrl);
    }
  }, [settings]);

  const loadStorefrontData = async () => {
    setLoading(true);
    try {
      const [settRes, catRes, prodRes] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getProducts()
      ]);

      setSettings(settRes.settings);
      setCategories(catRes.categories);
      setProducts(prodRes.products);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Full catalogue price bounds, used as the slider's min/max and as the
  // "no filter applied" default range.
  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 1000];
    const prices = products.map(p => p.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return min === max ? [min, max + 1] : [min, max];
  }, [products]);

  const priceStep = Math.max(1, Math.round((priceBounds[1] - priceBounds[0]) / 100));
  const effectivePriceRange = priceRange ?? priceBounds;
  const isPriceFiltered = priceRange !== null && (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]);

  // Filter & sort products
  const displayedProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategoryId) {
      result = result.filter(p => p.categoryIds.includes(selectedCategoryId));
    }

    // Quick tab filters
    if (activeFilter === 'inStock') {
      result = result.filter(p => p.stock > 0);
    }

    // Price range filter
    if (priceRange) {
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // 'featured': Featured first, then newest
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return result;
  }, [products, selectedCategoryId, activeFilter, priceRange, sortBy]);

  // Other products sharing any of the active product's categories, for the
  // "Related Products" section on the product page.
  const relatedProducts = useMemo(() => {
    if (!activeProductModal) return [];
    return products.filter(
      p => p.id !== activeProductModal.id && p.categoryIds.some(id => activeProductModal.categoryIds.includes(id))
    );
  }, [products, activeProductModal]);

  // Curated homepage rails — active, in-stock pieces only, capped so each
  // strip stays a quick horizontal browse rather than the full catalogue.
  const newDropProducts = useMemo(
    () => products.filter(p => p.isActive && p.stock > 0 && p.isNewDrop).slice(0, 12),
    [products]
  );
  const mostSellingProducts = useMemo(
    () => products.filter(p => p.isActive && p.stock > 0 && p.isHot).slice(0, 12),
    [products]
  );
  const offerProducts = useMemo(
    () => products.filter(p => p.isActive && p.stock > 0 && p.originalPrice && p.originalPrice > p.price).slice(0, 12),
    [products]
  );
  const restockedProducts = useMemo(
    () => products.filter(p => p.isActive && p.stock > 0 && p.restockedAt).slice(0, 12),
    [products]
  );

  // If Admin view is active
  if (viewMode === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onSuccess={(user) => setAdminUser(user)}
          onBackToStore={() => {
            window.location.hash = '';
            setViewMode('storefront');
          }}
        />
      );
    }

    return (
      <AdminDashboard
        user={adminUser}
        onLogout={async () => {
          await api.logout();
          setAdminUser(null);
          setViewMode('storefront');
          window.location.hash = '';
        }}
        onViewStorefront={() => {
          setViewMode('storefront');
          window.location.hash = '';
          loadStorefrontData();
        }}
      />
    );
  }

  // STOREFRONT VIEW
  const currencySymbol = settings?.currencySymbol || 'NPR ';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#C5A059]/30">
      
      {/* 1. Header (Sticky navigation, announcement, brand logo, search trigger) */}
      <Header
        settings={settings}
        categories={categories}
        activeCategory={selectedCategoryId}
        activeFilter={activeFilter}
        onSelectCategory={(id) => {
          closeProductModal();
          setSelectedCategoryId(id);
          const el = document.getElementById('catalogue-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectFilter={(f) => {
          closeProductModal();
          setActiveFilter(f as any);
          const el = document.getElementById('catalogue-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {activeProductModal ? (
        <ProductPage
          product={activeProductModal}
          relatedProducts={relatedProducts}
          settings={settings}
          currencySymbol={currencySymbol}
          onBack={closeProductModal}
          onOrderInstagram={openInstagramOrder}
          onSelectRelated={(prod) => openProduct(prod)}
        />
      ) : (
      <>
      {/* 2. Hero Section */}
      <Hero
        settings={settings}
        onExplore={() => {
          const el = document.getElementById('catalogue-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectFilter={(f) => {
          const railId =
            f === 'newDrop' ? 'rail-new-drop' :
            f === 'hot' ? 'rail-most-selling' :
            f === 'restocked' ? 'rail-restocked' :
            'catalogue-section';
          const el = document.getElementById(railId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 w-full py-6 space-y-8">

        {/* Category Visual Stories */}
        <CategoryPills
          categories={categories}
          activeCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => setSelectedCategoryId(catId)}
          settings={settings}
        />

        {/* Curated Collection Rails — ordered by what should catch the eye
            first: fresh arrivals, then proven best-sellers, then live deals,
            then pieces that just came back into stock. */}
        <div id="rail-new-drop">
          <ProductRail
            title="New Drop"
            icon={<Sparkles className="w-5 h-5 text-[#C5A059]" />}
            products={newDropProducts}
            currencySymbol={currencySymbol}
            onQuickView={(product) => openProduct(product)}
            onOrderInstagram={(product) => openInstagramOrder(product)}
          />
        </div>

        <div id="rail-most-selling">
          <ProductRail
            title="Most Selling"
            icon={<Flame className="w-5 h-5 text-[#C5A059]" />}
            products={mostSellingProducts}
            currencySymbol={currencySymbol}
            onQuickView={(product) => openProduct(product)}
            onOrderInstagram={(product) => openInstagramOrder(product)}
          />
        </div>

        <div id="rail-offer">
          <ProductRail
            title="Offer"
            icon={<Tag className="w-5 h-5 text-[#C5A059]" />}
            products={offerProducts}
            currencySymbol={currencySymbol}
            onQuickView={(product) => openProduct(product)}
            onOrderInstagram={(product) => openInstagramOrder(product)}
          />
        </div>

        <div id="rail-restocked">
          <ProductRail
            title="Restocked"
            icon={<RotateCcw className="w-5 h-5 text-[#C5A059]" />}
            products={restockedProducts}
            currencySymbol={currencySymbol}
            onQuickView={(product) => openProduct(product)}
            onOrderInstagram={(product) => openInstagramOrder(product)}
          />
        </div>

        {/* 4. Filter & Sorting Controls Toolbar */}
        <section id="catalogue-section" className="pt-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E3DB] pb-4">
            
            {/* Quick Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#1C1C1C] text-white shadow-xs'
                    : 'bg-white text-[#1C1C1C] border border-[#E5E3DB] hover:border-[#C5A059]'
                }`}
              >
                All Pieces ({products.length})
              </button>

              <button
                onClick={() => setActiveFilter('inStock')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer ${
                  activeFilter === 'inStock'
                    ? 'bg-[#1C1C1C] text-white shadow-xs'
                    : 'bg-white text-[#1C1C1C] border border-[#E5E3DB] hover:border-[#C5A059]'
                }`}
              >
                <span>In Stock Only</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[10px] text-[#777] uppercase tracking-[0.2em] font-semibold whitespace-nowrap">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E5E3DB] text-xs font-medium text-[#1C1C1C] rounded-full px-4 py-2 focus:outline-none focus:border-[#C5A059] cursor-pointer shadow-xs"
              >
                <option value="featured">Featured Atelier</option>
                <option value="newest">Newest Additions</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Price Range Filter */}
          {priceBounds[0] < priceBounds[1] && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-white border border-[#E5E3DB] rounded-2xl px-4 sm:px-5 py-3.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1C1C1C] flex-shrink-0 sm:w-24">
                Price Range
              </span>
              <div className="flex-1 flex items-center gap-3 sm:gap-4">
                <span className="text-xs font-semibold text-[#1C1C1C] whitespace-nowrap">
                  {currencySymbol}{effectivePriceRange[0].toLocaleString()}
                </span>
                <Slider
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  step={priceStep}
                  minStepsBetweenThumbs={1}
                  value={effectivePriceRange}
                  onValueChange={(v) => setPriceRange([v[0], v[1]])}
                  className="flex-1"
                />
                <span className="text-xs font-semibold text-[#1C1C1C] whitespace-nowrap">
                  {currencySymbol}{effectivePriceRange[1].toLocaleString()}
                </span>
              </div>
              {isPriceFiltered && (
                <button
                  onClick={() => setPriceRange(null)}
                  className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059] hover:underline flex-shrink-0 self-end sm:self-auto"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Active Filter Indicators */}
          {(selectedCategoryId || activeFilter !== 'all' || isPriceFiltered) && (
            <div className="flex items-center gap-2 text-xs text-[#777] flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-semibold">Active filter:</span>
              {selectedCategoryId && (
                <span className="bg-[#F0EFEC] px-3 py-1 rounded-full text-[#1C1C1C] font-medium flex items-center gap-1.5 text-xs border border-[#E5E3DB]">
                  {categories.find(c => c.id === selectedCategoryId)?.name}
                  <button onClick={() => setSelectedCategoryId(null)} className="hover:text-[#C5A059] font-bold">×</button>
                </span>
              )}
              {activeFilter !== 'all' && (
                <span className="bg-[#F0EFEC] px-3 py-1 rounded-full text-[#1C1C1C] font-medium flex items-center gap-1.5 text-xs border border-[#E5E3DB]">
                  In Stock
                  <button onClick={() => setActiveFilter('all')} className="hover:text-[#C5A059] font-bold">×</button>
                </span>
              )}
              {isPriceFiltered && (
                <span className="bg-[#F0EFEC] px-3 py-1 rounded-full text-[#1C1C1C] font-medium flex items-center gap-1.5 text-xs border border-[#E5E3DB]">
                  {currencySymbol}{effectivePriceRange[0].toLocaleString()} – {currencySymbol}{effectivePriceRange[1].toLocaleString()}
                  <button onClick={() => setPriceRange(null)} className="hover:text-[#C5A059] font-bold">×</button>
                </span>
              )}
            </div>
          )}

          {/* 5. Pinterest Masonry Grid */}
          <MasonryGrid
            products={displayedProducts}
            loading={loading}
            currencySymbol={currencySymbol}
            onQuickView={(product) => openProduct(product)}
            onOrderInstagram={(product) => openInstagramOrder(product)}
          />

        </section>

      </main>
      </>
      )}

      {/* 6. Footer (Brand story, contact, Instagram direct, Admin link) */}
      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={(catId) => {
          closeProductModal();
          setSelectedCategoryId(catId);
          const el = document.getElementById('catalogue-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 7. Instagram Order & Direct Message Generator Modal */}
      {activeInstagramOrderProduct && (
        <InstagramOrderModal
          product={activeInstagramOrderProduct}
          settings={settings}
          currencySymbol={currencySymbol}
          quantity={instagramOrderQuantity}
          selectedColor={instagramOrderColor}
          selectedSize={instagramOrderSize}
          onClose={() => setActiveInstagramOrderProduct(null)}
        />
      )}

      {/* 9. Fullscreen Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={categories}
        products={products}
        currencySymbol={currencySymbol}
        onSelectProduct={(prod) => {
          openProduct(prod);
        }}
      />

    </div>
  );
}
