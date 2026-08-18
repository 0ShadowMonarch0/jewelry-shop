import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Tag,
  Settings as SettingsIcon,
  History,
  MessageSquare,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Sparkles,
  Flame,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  X,
  Camera,
  Image as ImageIcon,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { api } from '../../lib/api';
import type { 
  AdminUser, 
  AdminStats, 
  Product, 
  Category, 
  Offer, 
  SiteSettings, 
  AdminAuditLog, 
  CustomerInquiry, 
  ProductImage 
} from '../../types';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onViewStorefront: () => void;
}

type TabType = 'overview' | 'products' | 'inventory' | 'categories' | 'offers' | 'inquiries' | 'settings' | 'content' | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onViewStorefront
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Filter in products tab
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  const flashMessage = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, offRes, inqRes, setRes, logRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminCategories(),
        api.getAdminOffers(),
        api.getInquiries(),
        api.getAdminSettings(),
        api.getAuditLogs(30)
      ]);

      setStats(statsRes.stats);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setOffers(offRes.offers);
      setInquiries(inqRes.inquiries);
      setSettings(setRes.settings);
      setAuditLogs(logRes.auditLogs);
    } catch (err: any) {
      flashMessage(err.message || 'Failed to load atelier records', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Stock Adjuster
  const handleStockUpdate = async (productId: string, newStock: number, isRestock = false) => {
    try {
      const res = await api.updateStock(productId, newStock, isRestock);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === productId ? res.product : p));
        flashMessage(`Stock updated to ${res.product.stock} units for ${res.product.name}`);
        // reload stats in background
        api.getAdminStats().then(s => setStats(s.stats));
      }
    } catch (err: any) {
      flashMessage(err.message || 'Stock adjustment failed', true);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive product "${name}"?`)) return;
    try {
      await api.deleteProduct(id, false);
      flashMessage(`Product "${name}" archived`);
      loadData();
    } catch (err: any) {
      flashMessage(err.message || 'Delete failed', true);
    }
  };

  // Inquiry Status Handler
  const handleInquiryStatusChange = async (id: string, status: CustomerInquiry['status']) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      flashMessage(`Inquiry marked as ${status}`);
    } catch (err: any) {
      flashMessage(err.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#181816] flex flex-col">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-[#181816] text-[#FAF8F5] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md border-b border-[#2C2A26]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C5A880] text-[#181816] flex items-center justify-center font-serif font-bold text-base">
            A
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold tracking-wider">
              AURA Atelier Manager
            </h1>
            <span className="text-[10px] text-[#C5A880] uppercase tracking-widest block -mt-1 font-mono">
              Admin Suite • {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onViewStorefront}
            className="flex items-center gap-1.5 bg-[#2C2A26] hover:bg-[#3E3A34] text-xs px-3.5 py-1.5 rounded-full font-medium transition-all text-[#FAF8F5] border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="hidden sm:inline">Live Storefront</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-xs text-[#9E988D] hover:text-red-400 p-2 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 text-xs text-center font-medium shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-red-800 text-white px-4 py-2.5 text-xs text-center font-medium shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Navigation Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-white rounded-3xl p-4 border border-[#E5DFD7] shadow-xs space-y-1 self-start sticky top-20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'overview' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'products' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'inventory' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory Fast-Edit</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'categories' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'offers' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'inquiries' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Inquiries</span>
            </div>
            {inquiries.length > 0 && (
              <span className="bg-[#C5A880] text-[#181816] text-[10px] px-2 py-0.5 rounded-full font-bold">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'settings' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Store Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'content' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Page Content</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'audit' ? 'bg-[#181816] text-white shadow-xs' : 'text-[#615C52] hover:bg-[#FAF8F5]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Log</span>
          </button>
        </aside>

        {/* Mobile Horizontal Pill Navigation Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {(['overview', 'products', 'inventory', 'categories', 'offers', 'inquiries', 'settings', 'content', 'audit'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-[#181816] text-white shadow-xs' : 'bg-white text-[#615C52] border border-[#E5DFD7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181816]">
                  Atelier Dashboard
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#181816] text-white px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#33302B] transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5DFD7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A756B]">Total Catalogue</span>
                  <div className="font-serif text-3xl font-semibold text-[#181816]">{stats.totalProducts}</div>
                  <span className="text-xs text-emerald-700 font-medium">{stats.activeProducts} active online</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5DFD7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A756B]">Stock Alerts</span>
                  <div className="font-serif text-3xl font-semibold text-amber-700">{stats.lowStockProducts}</div>
                  <span className="text-xs text-red-600 font-medium">{stats.outOfStockProducts} out of stock</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5DFD7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A756B]">IG Inquiries</span>
                  <div className="font-serif text-3xl font-semibold text-[#181816]">{stats.totalInquiries}</div>
                  <span className="text-xs text-[#7A756B]">Customer leads</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5DFD7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A756B]">Active Offers</span>
                  <div className="font-serif text-3xl font-semibold text-[#937438]">{stats.activeOffers}</div>
                  <span className="text-xs text-[#7A756B]">Promotions live</span>
                </div>
              </div>

              {/* Recent Inquiries List */}
              <div className="bg-white rounded-3xl p-6 border border-[#E5DFD7] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-medium text-[#181816]">
                    Recent Instagram Order Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs uppercase font-bold tracking-wider text-[#937438] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-[#7A756B] py-4">No customer inquiries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.slice(0, 4).map((inq) => (
                      <div key={inq.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD7]">
                        <div>
                          <div className="font-serif text-sm font-semibold text-[#181816]">
                            {inq.productName} (${inq.productPrice})
                          </div>
                          <div className="text-xs text-[#7A756B]">
                            IG: @{inq.instagramHandle} • {new Date(inq.createdAt).toLocaleDateString()}
                            {inq.customerNote && ` • "${inq.customerNote}"`}
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full self-start sm:self-center ${
                          inq.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          inq.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181816]">
                    Product Catalogue
                  </h2>
                  <p className="text-xs text-[#7A756B]">Manage high-fashion pieces, photography, and badges.</p>
                </div>

                <button
                  id="admin-add-product-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-[#181816] text-white px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#33302B] transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Piece</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-[#E5DFD7]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#7A756B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, SKU, or tags..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl focus:outline-none focus:border-[#181816]"
                  />
                </div>

                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="text-xs bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-3 py-2 font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Product Cards / Table View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(p => {
                    if (selectedCatFilter !== 'all' && p.categoryId !== selectedCatFilter) return false;
                    if (productSearch) {
                      const q = productSearch.toLowerCase();
                      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((product) => {
                    const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-[#E5DFD7] overflow-hidden shadow-xs flex flex-col justify-between p-4 space-y-4">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F5] flex-shrink-0 border border-[#E5DFD7]">
                            {primaryImg && (
                              <img src={primaryImg.secureUrl} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#7A756B] block">
                              {product.sku}
                            </span>
                            <h4 className="font-serif text-base font-semibold text-[#181816] truncate">
                              {product.name}
                            </h4>
                            <div className="text-sm font-bold text-[#181816]">
                              ${product.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-[#7A756B] flex items-center gap-2 mt-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              <span>Stock: <strong>{product.stock}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap gap-1.5">
                          {product.isHot && <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">HOT</span>}
                          {product.isNewDrop && <span className="text-[9px] bg-neutral-900 text-white font-bold px-2 py-0.5 rounded">NEW DROP</span>}
                          {product.restockedAt && <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">RESTOCKED</span>}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#E5DFD7]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Piece</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                            title="Archive piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY QUICK-EDIT */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E5DFD7] shadow-xs space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-light text-[#181816]">
                  Mobile Inventory Fast-Adjuster
                </h2>
                <p className="text-xs text-[#7A756B]">
                  Update live stock with one tap. When stock drops to 0, storefront automatically displays OUT OF STOCK and disables ordering.
                </p>
              </div>

              <div className="space-y-3">
                {products.map((p) => {
                  const img = p.images.find(i => i.isPrimary) || p.images[0];
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-[#E5DFD7]">
                          {img && <img src={img.secureUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-serif text-sm font-semibold text-[#181816]">{p.name}</div>
                          <div className="text-[11px] text-[#7A756B] font-mono">SKU: {p.sku} • ${p.price}</div>
                        </div>
                      </div>

                      {/* Increment / Decrement Quick Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStockUpdate(p.id, Math.max(0, p.stock - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-[#DCD6CC] text-base font-bold flex items-center justify-center hover:bg-[#EFECE6] active:scale-95 transition-all"
                        >
                          -
                        </button>

                        <span className={`w-14 text-center font-mono text-base font-bold ${p.stock === 0 ? 'text-red-600' : 'text-[#181816]'}`}>
                          {p.stock}
                        </span>

                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock + 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-[#DCD6CC] text-base font-bold flex items-center justify-center hover:bg-[#EFECE6] active:scale-95 transition-all"
                        >
                          +
                        </button>

                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock + 5, true)}
                          className="px-3 py-2 rounded-xl bg-[#181816] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#33302B] transition-all shadow-xs"
                          title="Add 5 units & mark restocked badge"
                        >
                          Restock +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181816]">
                  Atelier Categories
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#181816] text-white px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#33302B] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-[#E5DFD7] overflow-hidden p-4 space-y-3 shadow-xs">
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#FAF8F5]">
                      <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-[#181816]">{cat.name}</h4>
                      <p className="text-xs text-[#7A756B] line-clamp-2">{cat.description}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between text-xs">
                      <span className="text-[#7A756B]">{cat.productCount || 0} active pieces</span>
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="text-xs font-semibold text-[#937438] hover:underline"
                      >
                        Edit Category
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181816]">
                  Offers & Promotions
                </h2>
                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#181816] text-white px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#33302B] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Promotion</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-3xl border border-[#E5DFD7] p-5 space-y-4 shadow-xs">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#FAF8F5]">
                      <img src={offer.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#C5A880]/20 text-[#937438] font-bold text-xs px-2.5 py-0.5 rounded-full">
                          {offer.discountValue}{offer.discountType === 'PERCENTAGE' ? '%' : '$'} OFF
                        </span>
                        <span className="text-xs text-[#7A756B] font-mono">Code: {offer.code || 'N/A'}</span>
                      </div>
                      <h4 className="font-serif text-lg font-semibold text-[#181816]">{offer.title}</h4>
                      <p className="text-xs text-[#615C52]">{offer.description}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between text-xs text-[#7A756B]">
                      <span>Valid until {new Date(offer.endDate).toLocaleDateString()}</span>
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsOfferModalOpen(true);
                        }}
                        className="font-semibold text-[#937438] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E5DFD7] shadow-xs space-y-6">
              <h2 className="font-serif text-2xl font-light text-[#181816]">
                Instagram Inquiries & Leads
              </h2>

              {inquiries.length === 0 ? (
                <p className="text-xs text-[#7A756B] py-6 text-center">No inquiries logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-serif text-base font-semibold text-[#181816]">
                          {inq.productName} • ${inq.productPrice}
                        </div>
                        <div className="text-xs text-[#7A756B]">
                          SKU: <strong>{inq.productSku}</strong> • Customer IG Handle: <strong>@{inq.instagramHandle}</strong>
                        </div>
                        {inq.customerNote && (
                          <div className="text-xs text-[#181816] italic bg-white p-2 rounded-lg border border-[#E5DFD7]">
                            "{inq.customerNote}"
                          </div>
                        )}
                        <div className="text-[10px] text-[#9E988D]">
                          Logged on {new Date(inq.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as any)}
                        className="text-xs bg-white border border-[#DCD6CC] rounded-xl px-3 py-2 font-semibold self-start sm:self-center"
                      >
                        <option value="PENDING">Pending (Need to Reply)</option>
                        <option value="CONTACTED">Contacted on IG</option>
                        <option value="COMPLETED">Order Completed</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <AdminSettingsForm
              settings={settings}
              onSave={async (newSettings) => {
                try {
                  const res = await api.updateAdminSettings(newSettings);
                  setSettings(res.settings);
                  flashMessage('Store settings updated successfully!');
                } catch (err: any) {
                  flashMessage(err.message, true);
                }
              }}
            />
          )}

          {/* TAB: PAGE CONTENT */}
          {activeTab === 'content' && settings && (
            <PageContentForm
              settings={settings}
              onSave={async (newSettings) => {
                try {
                  const res = await api.updateAdminSettings(newSettings);
                  setSettings(res.settings);
                  flashMessage('Page content updated successfully!');
                } catch (err: any) {
                  flashMessage(err.message, true);
                }
              }}
            />
          )}

          {/* TAB 8: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl p-6 border border-[#E5DFD7] shadow-xs space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#181816]">
                Security & Administrative Audit Log
              </h2>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD7] text-xs space-y-1">
                    <div className="flex justify-between items-center text-[#7A756B]">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#937438]">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[#181816] font-medium">{log.details}</div>
                    <div className="text-[10px] text-[#9E988D]">Admin: {log.adminEmail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSave={async (prodData) => {
            try {
              if (editingProduct) {
                await api.updateProduct(editingProduct.id, prodData);
                flashMessage(`Product "${prodData.name}" updated`);
              } else {
                await api.createProduct(prodData);
                flashMessage(`Product "${prodData.name}" added to atelier`);
              }
              setIsProductModalOpen(false);
              loadData();
            } catch (err: any) {
              flashMessage(err.message, true);
            }
          }}
        />
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {isCategoryModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={async (catData) => {
            try {
              if (editingCategory) {
                await api.updateCategory(editingCategory.id, catData);
                flashMessage(`Category "${catData.name}" updated`);
              } else {
                await api.createCategory(catData);
                flashMessage(`Category "${catData.name}" created`);
              }
              setIsCategoryModalOpen(false);
              loadData();
            } catch (err: any) {
              flashMessage(err.message, true);
            }
          }}
        />
      )}

      {/* OFFER ADD/EDIT MODAL */}
      {isOfferModalOpen && (
        <OfferFormModal
          offer={editingOffer}
          products={products}
          categories={categories}
          onClose={() => setIsOfferModalOpen(false)}
          onSave={async (offerData) => {
            try {
              if (editingOffer) {
                await api.updateOffer(editingOffer.id, offerData);
                flashMessage(`Offer "${offerData.title}" updated`);
              } else {
                await api.createOffer(offerData);
                flashMessage(`Offer "${offerData.title}" created`);
              }
              setIsOfferModalOpen(false);
              loadData();
            } catch (err: any) {
              flashMessage(err.message, true);
            }
          }}
        />
      )}

    </div>
  );
};

// ==========================================
// SUB-COMPONENT: PRODUCT FORM MODAL (Mobile-First)
// ==========================================
interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState<number>(product?.price || 450);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(product?.originalPrice || undefined);
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [sku, setSku] = useState(product?.sku || `AUR-${Math.floor(100 + Math.random() * 900)}`);
  const [stock, setStock] = useState<number>(product?.stock !== undefined ? product.stock : 5);
  const [material, setMaterial] = useState(product?.material || '18K Solid Yellow Gold');
  const [color, setColor] = useState(product?.color || 'Yellow Gold');
  const [size, setSize] = useState(product?.size || 'Standard');
  const [isHot, setIsHot] = useState(product?.isHot || false);
  const [isNewDrop, setIsNewDrop] = useState(product?.isNewDrop || false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || true);
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!product) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  // Image upload handler (supports file upload or camera photo on mobile)
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const uploadRes = await api.uploadMedia(base64, file.name, 'jewelry');
        if (uploadRes.success) {
          const newImg: ProductImage = {
            id: 'img-' + Date.now(),
            productId: product?.id || '',
            cloudinaryPublicId: uploadRes.asset.cloudinaryPublicId,
            secureUrl: uploadRes.asset.secureUrl,
            sortOrder: images.length + 1,
            isPrimary: images.length === 0,
            createdAt: new Date().toISOString()
          };
          setImages(prev => [...prev, newImg]);
        }
      } catch (err: any) {
        alert(err.message || 'Image upload failed');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSampleImage = (url: string) => {
    const newImg: ProductImage = {
      id: 'img-' + Date.now(),
      productId: product?.id || '',
      cloudinaryPublicId: `aura/sample/${Date.now()}`,
      secureUrl: url,
      sortOrder: images.length + 1,
      isPrimary: images.length === 0,
      createdAt: new Date().toISOString()
    };
    setImages(prev => [...prev, newImg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please upload or select at least one product photo.');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        name,
        slug,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId,
        sku,
        stock: Number(stock),
        material,
        color,
        size,
        isHot,
        isNewDrop,
        isFeatured,
        images
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5DFD7] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD7] bg-[#FAF8F5] flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#181816]">
            {product ? 'Edit Atelier Piece' : 'Add New Jewelry Piece'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#7A756B] hover:bg-[#EFECE6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {/* Section: Photos (Cloudinary / Direct) */}
          <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD7]">
            <div className="flex items-center justify-between">
              <label className="font-semibold uppercase tracking-wider text-[#181816] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                <span>Product Photos ({images.length})</span>
              </label>
              <span className="text-[10px] text-[#7A756B]">Tap photo to set as primary</span>
            </div>

            {/* Existing Images Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <div key={img.id || idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 group">
                  <img src={img.secureUrl} alt="" className="w-full h-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-[#181816] text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                      MAIN
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.map((im, i) => ({ ...im, isPrimary: i === idx })))}
                      className="p-1 bg-white text-[#181816] rounded"
                      title="Set Primary"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 bg-red-600 text-white rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Button */}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#C5A880] hover:border-[#181816] bg-white flex flex-col items-center justify-center cursor-pointer flex-shrink-0 text-center transition-colors">
                <Camera className="w-5 h-5 text-[#C5A880] mb-1" />
                <span className="text-[9px] font-semibold text-[#7A756B]">
                  {uploadingImage ? 'Uploading...' : 'Add Photo'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2 border-t border-[#E5DFD7] flex items-center gap-2 text-[10px] text-[#7A756B]">
              <span>Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200')}
                className="underline hover:text-[#181816]"
              >
                + Gold Ring
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=85&w=1200')}
                className="underline hover:text-[#181816]"
              >
                + Pearl Necklace
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1611591475883-8a306c59b666?auto=format&fit=crop&q=85&w=1200')}
                className="underline hover:text-[#181816]"
              >
                + Diamond Bracelet
              </button>
            </div>
          </div>

          {/* Section: Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Piece Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Solstice 18K Signet Ring"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">SEO Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="solstice-18k-signet-ring"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">SKU Number *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Price ($ USD) *</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#7A756B]">Original Price (Optional)</label>
              <input
                type="number"
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 520"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Current Stock Units *</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-[#181816]">Atelier Craftsmanship Notes *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe metal weight, gemstone clarity, cut, and setting details..."
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-sans"
            />
          </div>

          {/* Material & Sizing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Primary Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="18K Solid Gold"
                className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Color Finish</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Yellow Gold"
                className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#181816]">Available Sizes</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="US 6, 7, 8"
                className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>
          </div>

          {/* Badge Toggles */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD7]">
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>🔥 Hot Piece</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isNewDrop}
                onChange={(e) => setIsNewDrop(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>✨ New Drop</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>✦ Featured</span>
            </label>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#181816] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#33302B] transition-all shadow-md"
            >
              {loading ? 'Saving Piece...' : 'Save & Publish to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: CATEGORY FORM MODAL
// ==========================================
interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ name, slug, description, imageUrl, isActive: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E5DFD7] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
          <h3 className="font-serif text-lg font-semibold">{category ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!category) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#181816] text-white rounded-full font-semibold uppercase tracking-wider"
          >
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: OFFER FORM MODAL
// ==========================================
interface OfferFormModalProps {
  offer: Offer | null;
  products: Product[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Offer>) => Promise<void>;
}

const OfferFormModal: React.FC<OfferFormModalProps> = ({
  offer,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(offer?.title || '');
  const [description, setDescription] = useState(offer?.description || '');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>(offer?.discountType || 'PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(offer?.discountValue || 15);
  const [code, setCode] = useState(offer?.code || 'ATELIER15');
  const [imageUrl, setImageUrl] = useState(offer?.imageUrl || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200');
  const [startDate, setStartDate] = useState(offer?.startDate ? offer.startDate.substring(0, 10) : '2026-08-01');
  const [endDate, setEndDate] = useState(offer?.endDate ? offer.endDate.substring(0, 10) : '2026-10-31');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        description,
        discountType,
        discountValue: Number(discountValue),
        code,
        imageUrl,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: true,
        associatedProductIds: [],
        associatedCategoryIds: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E5DFD7] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
          <h3 className="font-serif text-lg font-semibold">{offer ? 'Edit Offer' : 'New Offer'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Value</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-bold"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Promo Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Banner Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#181816] text-white rounded-full font-semibold uppercase tracking-wider"
          >
            {loading ? 'Saving...' : 'Save Promotion'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: SETTINGS FORM
// ==========================================
const AdminSettingsForm: React.FC<{ settings: SiteSettings; onSave: (s: Partial<SiteSettings>) => Promise<void> }> = ({
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD7] shadow-xs space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-light text-[#181816]">
          Atelier & Storefront Settings
        </h2>
        <p className="text-xs text-[#7A756B]">
          Configure your Instagram destination, announcement bar, hero section, and branding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-serif text-sm font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Instagram Handle (@)</label>
            <input
              type="text"
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value.replace('@', '') })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Tagline (Subtitle)</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Shown under the logo in the header"
            className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">About Text (Description)</label>
          <textarea
            rows={3}
            value={formData.aboutText || ''}
            onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
            placeholder="Shown in the footer's brand narrative"
            className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
          />
        </div>

        {/* Page Content & SEO */}
        <div className="pt-4 border-t border-[#E5DFD7] space-y-4">
          <div>
            <h3 className="font-serif text-lg font-light text-[#181816]">Page Content &amp; SEO</h3>
            <p className="text-[10px] text-[#7A756B]">
              Drives the browser tab title, search-engine listing, and social share preview. Fetched live from the API and applied to every page load.
            </p>
          </div>

          <div>
            <label className="font-semibold block mb-1">Page Title</label>
            <input
              type="text"
              value={formData.defaultSeoTitle}
              onChange={(e) => setFormData({ ...formData, defaultSeoTitle: e.target.value })}
              placeholder="e.g. AURA Fine Jewelry | Editorial Atelier"
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={formData.defaultSeoDescription}
              onChange={(e) => setFormData({ ...formData, defaultSeoDescription: e.target.value })}
              placeholder="One or two sentences summarizing the store for search results"
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Tags / Keywords</label>
            <input
              type="text"
              value={formData.defaultSeoKeywords || ''}
              onChange={(e) => setFormData({ ...formData, defaultSeoKeywords: e.target.value })}
              placeholder="comma, separated, keywords"
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Announcement Bar Text</label>
          <input
            type="text"
            value={formData.announcementText}
            onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
            className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Hero Headline</label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Hero Image URL</label>
            <input
              type="url"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Hero Subtitle</label>
          <textarea
            rows={2}
            value={formData.heroSubhead}
            onChange={(e) => setFormData({ ...formData, heroSubhead: e.target.value })}
            className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Concierge Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Atelier Studio Address</label>
            <input
              type="text"
              value={formData.atelierAddress || ''}
              onChange={(e) => setFormData({ ...formData, atelierAddress: e.target.value })}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-[#181816] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#33302B] transition-all shadow-md"
        >
          {saving ? 'Saving Settings...' : 'Save Configuration'}
        </button>
      </form>

      {/* SUPABASE POSTGRESQL CLOUD DATABASE INTEGRATION */}
      <SupabaseIntegrationCard />
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: PAGE CONTENT FORM (Hero / Categories / Offers / Footer copy)
// ==========================================
const PageContentForm: React.FC<{ settings: SiteSettings; onSave: (s: Partial<SiteSettings>) => Promise<void> }> = ({
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  const field = (key: keyof SiteSettings) => (formData[key] as string) || '';
  const update = (key: keyof SiteSettings, value: string) => setFormData({ ...formData, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD7] shadow-xs space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-light text-[#181816]">
          Page Content
        </h2>
        <p className="text-xs text-[#7A756B]">
          Every headline, label, and blurb across the storefront &mdash; from the Hero section down to the footer &mdash; fetched live from the API on every page load. Nothing here is hardcoded.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">

        {/* Hero Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-light text-[#181816] border-b border-[#E5DFD7] pb-2">Hero Section</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Eyebrow Badge</label>
              <input type="text" value={field('heroEyebrowText')} onChange={(e) => update('heroEyebrowText', e.target.value)}
                placeholder="e.g. Editorial 2026" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Headline</label>
              <input type="text" value={field('heroHeadline')} onChange={(e) => update('heroHeadline', e.target.value)}
                placeholder="e.g. Adorn the Unseen" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Subhead</label>
            <textarea rows={2} value={field('heroSubhead')} onChange={(e) => update('heroSubhead', e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Current Drop Label</label>
              <input type="text" value={field('heroCurrentDropLabel')} onChange={(e) => update('heroCurrentDropLabel', e.target.value)}
                placeholder="e.g. Current Atelier Drop" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Current Drop Text</label>
              <input type="text" value={field('heroCurrentDropText')} onChange={(e) => update('heroCurrentDropText', e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Primary CTA Text</label>
              <input type="text" value={field('heroCtaText')} onChange={(e) => update('heroCtaText', e.target.value)}
                placeholder="e.g. Explore Drop" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Secondary CTA Text</label>
              <input type="text" value={field('heroSecondaryCtaText')} onChange={(e) => update('heroSecondaryCtaText', e.target.value)}
                placeholder="e.g. New Arrivals" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Inquiry Card Title</label>
              <input type="text" value={field('heroInquiryCardTitle')} onChange={(e) => update('heroInquiryCardTitle', e.target.value)}
                placeholder="e.g. Instagram Inquiry" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Inquiry Card Subtitle</label>
              <input type="text" value={field('heroInquiryCardSubtitle')} onChange={(e) => update('heroInquiryCardSubtitle', e.target.value)}
                placeholder="e.g. Atelier Concierge" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Inquiry Card Text</label>
            <textarea rows={2} value={field('heroInquiryCardText')} onChange={(e) => update('heroInquiryCardText', e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-light text-[#181816] border-b border-[#E5DFD7] pb-2">Categories Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-1">Section Heading</label>
              <input type="text" value={field('categoriesHeading')} onChange={(e) => update('categoriesHeading', e.target.value)}
                placeholder="e.g. Curated Categories" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">"Show All" Link Text</label>
              <input type="text" value={field('categoriesShowAllText')} onChange={(e) => update('categoriesShowAllText', e.target.value)}
                placeholder="e.g. Show All Curations" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">"All" Pill Label</label>
              <input type="text" value={field('categoriesAllPillLabel')} onChange={(e) => update('categoriesAllPillLabel', e.target.value)}
                placeholder="e.g. All Atelier" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-light text-[#181816] border-b border-[#E5DFD7] pb-2">Offers Banner</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Eyebrow Text</label>
              <input type="text" value={field('offersEyebrowText')} onChange={(e) => update('offersEyebrowText', e.target.value)}
                placeholder="e.g. Limited Seasonal Atelier Event" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Discount Code Label</label>
              <input type="text" value={field('offersCodeLabel')} onChange={(e) => update('offersCodeLabel', e.target.value)}
                placeholder="e.g. Mention code:" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-light text-[#181816] border-b border-[#E5DFD7] pb-2">Footer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Philosophy Eyebrow</label>
              <input type="text" value={field('footerPhilosophyEyebrow')} onChange={(e) => update('footerPhilosophyEyebrow', e.target.value)}
                placeholder="e.g. Atelier Philosophy" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Collections Heading</label>
              <input type="text" value={field('footerCollectionsHeading')} onChange={(e) => update('footerCollectionsHeading', e.target.value)}
                placeholder="e.g. Collections" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Ordering Heading</label>
            <input type="text" value={field('footerOrderingHeading')} onChange={(e) => update('footerOrderingHeading', e.target.value)}
              placeholder="e.g. Instagram Ordering" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
          </div>

          <div>
            <label className="font-semibold block mb-1">Ordering Text</label>
            <textarea rows={2} value={field('footerOrderingText')} onChange={(e) => update('footerOrderingText', e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
          </div>

          <div>
            <label className="font-semibold block mb-1">Bottom Bar Tagline</label>
            <input type="text" value={field('footerBottomTagline')} onChange={(e) => update('footerBottomTagline', e.target.value)}
              placeholder="e.g. Curated in Florence & New York" className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6CC] rounded-xl" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-[#181816] text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#33302B] transition-all shadow-md"
        >
          {saving ? 'Saving Page Content...' : 'Save Page Content'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: SUPABASE INTEGRATION CARD
// ==========================================
const SupabaseIntegrationCard: React.FC = () => {
  const [status, setStatus] = useState<{ configured: boolean; supabaseUrl: string | null; instructions: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    api.getSupabaseStatus()
      .then(res => setStatus(res))
      .catch(() => {});
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testSupabase();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.syncToSupabase();
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({ success: false, message: err.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const copySqlToClipboard = () => {
    const sqlText = `-- AURELIA JEWELRY - SUPABASE SCHEMA
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

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  story TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_drop BOOLEAN NOT NULL DEFAULT false,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  is_restocked BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  materials TEXT[] NOT NULL DEFAULT '{}',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock INTEGER NOT NULL DEFAULT 10,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT,
  discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_inquiries (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  customer_name TEXT,
  customer_handle TEXT,
  customer_contact TEXT,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'INSTAGRAM_DM',
  status TEXT NOT NULL DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="mt-8 pt-8 border-t border-[#E5DFD7] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-serif text-lg font-semibold text-[#181816]">
              Supabase Cloud Database
            </h3>
          </div>
          <p className="text-xs text-[#7A756B] mt-0.5">
            Connect your own Supabase project for persistent cloud storage and PostgreSQL tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-[#DCD6CC] text-xs font-semibold text-[#181816] hover:bg-[#FAF8F5] transition-all"
          >
            View SQL Schema
          </button>
        </div>
      </div>

      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DFD7] space-y-4 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#181816]">Status:</span>
            {status?.configured ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                Connected ({status.supabaseUrl})
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full text-[11px]">
                Using Built-in Local Storage (store.json)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing}
              onClick={handleTest}
              className="px-3 py-1.5 bg-white border border-[#DCD6CC] rounded-xl font-semibold text-[#181816] hover:bg-[#F0ECE1] transition-all"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {status?.configured && (
              <button
                type="button"
                disabled={syncing}
                onClick={handleSync}
                className="px-3 py-1.5 bg-[#181816] text-white rounded-xl font-semibold hover:bg-[#33302B] transition-all"
              >
                {syncing ? 'Syncing...' : 'Sync Local Data to Supabase'}
              </button>
            )}
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-xl border ${testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
            <p className="font-medium">{testResult.message}</p>
          </div>
        )}

        {syncResult && (
          <div className={`p-3 rounded-xl border ${syncResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
            <p className="font-medium">{syncResult.message}</p>
            {syncResult.counts && (
              <p className="text-[11px] mt-1 opacity-80">
                Uploaded: {syncResult.counts.products} pieces, {syncResult.counts.categories} categories, {syncResult.counts.offers} offers.
              </p>
            )}
          </div>
        )}

        <div className="text-[11px] text-[#7A756B] bg-white p-3.5 rounded-xl border border-[#E5DFD7] space-y-1.5">
          <p className="font-semibold text-[#181816]">How to link your Supabase account:</p>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>Create a free project at <span className="font-mono text-emerald-700">supabase.com</span></li>
            <li>Run the provided <strong className="text-[#181816]">supabase-schema.sql</strong> in your Supabase SQL Editor</li>
            <li>Add <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded">SUPABASE_URL</span> and <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded">SUPABASE_KEY</span> to project environment variables</li>
          </ol>
        </div>
      </div>

      {/* SQL SCHEMA MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5DFD7] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold">Supabase PostgreSQL Schema</h3>
                <p className="text-xs text-[#7A756B]">Execute this in Supabase SQL Editor to initialize all tables.</p>
              </div>
              <button onClick={() => setShowSqlModal(false)} className="p-1 hover:bg-[#FAF8F5] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <pre className="bg-[#181816] text-[#FAF8F5] font-mono text-[11px] p-4 rounded-2xl max-h-80 overflow-y-auto leading-relaxed selection:bg-[#C5A880]/40">
{`-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  story TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_drop BOOLEAN NOT NULL DEFAULT false,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 10,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`}
              </pre>

              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all"
              >
                {copiedSql ? '✓ Copied SQL' : 'Copy SQL'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 bg-[#181816] text-white rounded-full text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
