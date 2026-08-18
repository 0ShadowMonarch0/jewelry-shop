import React, { useState, useEffect, useRef } from 'react';
import { Search, Instagram, Menu, X, ChevronDown } from 'lucide-react';
import type { Category, SiteSettings } from '../../types';

interface HeaderProps {
  settings: SiteSettings | null;
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  onOpenSearch: () => void;
  onSelectFilter: (filter: string) => void;
  activeFilter: string;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onSelectFilter,
  activeFilter
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!categoryMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryMenuOpen]);

  const storeName = settings?.storeName || 'AURELIA';
  const instagramHandle = settings?.instagramHandle || 'aurelia_jewelry';
  const tagline = settings?.tagline || 'Fine Jewelry';
  const activeCategoryName = activeCategory ? categories.find(c => c.id === activeCategory)?.name : null;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Main Navigation Bar */}
      <div className={`transition-all duration-300 backdrop-blur-md border-b border-[#E5E3DB] ${
        isScrolled 
          ? 'bg-[#FAF9F6]/95 shadow-xs py-3.5' 
          : 'bg-[#FAF9F6]/90 py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4">

          {/* Left: Logo + Brand Lockup */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory(null);
              onSelectFilter('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2 sm:gap-2.5 min-w-0"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={storeName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#E5E3DB] flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1C1C1C] border border-[#C5A059]/50 group-hover:border-[#C5A059] flex items-center justify-center text-[#C5A059] font-serif italic font-bold text-sm transition-colors flex-shrink-0">
                {storeName.charAt(0)}
              </div>
            )}
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-serif text-base sm:text-lg italic font-bold text-[#1C1C1C] uppercase tracking-tight truncate group-hover:text-[#C5A059] transition-colors">
                {storeName}
              </span>
              <span className="text-[7px] tracking-[0.25em] text-[#999] uppercase font-sans hidden sm:block truncate">
                {tagline}
              </span>
            </div>
          </a>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setCategoryMenuOpen((o) => !o)}
                className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#C5A059] pb-0.5 ${
                  activeCategory || categoryMenuOpen ? 'text-[#C5A059] font-bold' : 'text-[#1C1C1C]'
                }`}
              >
                <span>{activeCategoryName || 'Collections'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white border border-[#E5E3DB] rounded-2xl shadow-lg py-2 normal-case tracking-normal max-h-80 overflow-y-auto">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      onSelectFilter('all');
                      setCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-[#F0EFEC] ${
                      !activeCategory ? 'text-[#C5A059] font-semibold' : 'text-[#1C1C1C]'
                    }`}
                  >
                    All Atelier
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        onSelectFilter('category');
                        setCategoryMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-[#F0EFEC] ${
                        activeCategory === cat.id ? 'text-[#C5A059] font-semibold' : 'text-[#1C1C1C]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectFilter('newDrop')}
              className={`whitespace-nowrap transition-colors hover:text-[#C5A059] pb-0.5 ${
                activeFilter === 'newDrop'
                  ? 'text-[#C5A059] font-bold border-b border-[#C5A059]'
                  : 'text-[#1C1C1C]'
              }`}
            >
              New Drop
            </button>

            <button
              onClick={() => onSelectFilter('hot')}
              className={`hidden lg:inline-block whitespace-nowrap transition-colors hover:text-[#C5A059] pb-0.5 ${
                activeFilter === 'hot'
                  ? 'text-[#C5A059] font-bold border-b border-[#C5A059]'
                  : 'text-[#1C1C1C]'
              }`}
            >
              Hot
            </button>
          </nav>

          {/* Right Action Menu: Search, IG Shop, Mobile Toggle */}
          <div className="flex items-center gap-1 sm:gap-4 lg:gap-6 text-[11px] uppercase tracking-[0.2em] font-medium flex-shrink-0">
            {/* Search Action Pill */}
            <button
              id="desktop-search-btn"
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 text-[#1C1C1C] hover:text-[#C5A059] transition-colors cursor-pointer"
            >
              <div className="w-3.5 h-3.5 border border-[#1C1C1C] flex items-center justify-center rounded-full flex-shrink-0">
                <div className="w-1 h-1 bg-[#1C1C1C] rounded-full"></div>
              </div>
              <span className="hidden lg:inline whitespace-nowrap">Search</span>
            </button>

            {/* IG Shop Button: icon-only on small screens, full pill from sm+ */}
            <a
              id="instagram-header-link"
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex bg-[#1C1C1C] text-white px-4 lg:px-5 py-2 rounded-full hover:bg-[#C5A059] transition-colors items-center gap-1.5 shadow-xs flex-shrink-0"
              title="Instagram Atelier Shop"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>IG Shop</span>
            </a>
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-1.5 rounded-full bg-[#1C1C1C] text-white hover:bg-[#C5A059] transition-colors flex-shrink-0"
              aria-label="Instagram Atelier Shop"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Mobile Menu & Search Icon */}
            <div className="flex items-center md:hidden">
              <button
                id="mobile-search-btn"
                onClick={onOpenSearch}
                className="p-1.5 rounded-full text-[#1C1C1C] hover:bg-[#F0EFEC] transition-colors"
                aria-label="Search catalogue"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full text-[#1C1C1C] hover:bg-[#F0EFEC] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E3DB] bg-[#FAF9F6] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059] mb-2 flex items-center gap-2">
              <div className="h-[1px] w-8 bg-[#C5A059]"></div>
              <span>Curated Collections</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  onSelectFilter('all');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2.5 px-3.5 rounded-xl font-medium uppercase tracking-wider ${
                  !activeCategory && activeFilter === 'all' ? 'bg-[#1C1C1C] text-white' : 'bg-[#F0EFEC] text-[#1C1C1C]'
                }`}
              >
                All Curations
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectFilter('category');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2.5 px-3.5 rounded-xl font-medium uppercase tracking-wider truncate ${
                    activeCategory === cat.id ? 'bg-[#1C1C1C] text-white' : 'bg-[#F0EFEC] text-[#1C1C1C]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5E3DB] flex flex-col gap-2">
              <button
                onClick={() => {
                  onSelectFilter('hot');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs py-2 px-3 text-[#1C1C1C] hover:text-[#C5A059] font-semibold flex items-center justify-between uppercase tracking-wider"
              >
                <span>🔥 Hot Atelier Pieces</span>
                <span className="text-[10px] text-[#C5A059] font-mono">Popular</span>
              </button>
              <button
                onClick={() => {
                  onSelectFilter('newDrop');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs py-2 px-3 text-[#1C1C1C] hover:text-[#C5A059] font-semibold flex items-center justify-between uppercase tracking-wider"
              >
                <span>✨ New Drop</span>
                <span className="text-[10px] text-[#777] font-mono">2026</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
