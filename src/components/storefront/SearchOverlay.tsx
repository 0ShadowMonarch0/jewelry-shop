import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { Product, Category } from '../../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  currencySymbol?: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  onSelectProduct,
  currencySymbol = 'NPR '
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && !p.categoryIds.includes(selectedCategory)) return false;
    if (inStockOnly && p.stock === 0) return false;
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex flex-col items-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#FAF9F6] rounded-3xl shadow-2xl border border-[#E5E3DB] overflow-hidden my-auto flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-6 border-b border-[#E5E3DB] flex items-center gap-3 bg-white">
          <div className="w-5 h-5 border border-[#1C1C1C] flex items-center justify-center rounded-full flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rings, 18K gold chains, baroque pearls, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-base sm:text-lg bg-transparent border-0 focus:outline-none font-light text-[#1C1C1C] placeholder-[#999]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-[#777] hover:text-[#1C1C1C] hover:bg-[#F0EFEC]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#777] hover:text-[#1C1C1C] hover:bg-[#F0EFEC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Row */}
        <div className="px-6 py-3 bg-[#FAF9F6] border-b border-[#E5E3DB] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#1C1C1C] text-white'
                  : 'bg-white text-[#777] border border-[#E5E3DB] hover:border-[#C5A059]'
              }`}
            >
              All Pieces
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1C1C1C] text-white'
                    : 'bg-white text-[#777] border border-[#E5E3DB] hover:border-[#C5A059]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[#777] font-medium text-xs">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#1C1C1C] focus:ring-0 w-4 h-4"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#777] space-y-2">
              <p className="font-serif text-lg text-[#1C1C1C]">No atelier pieces match your search.</p>
              <p className="text-xs">Try searching for keywords like "pearl", "signet", "diamond", or "18K".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const img = p.images.find(i => i.isPrimary) || p.images[0];
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#E5E3DB] hover:border-[#C5A059] cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F0EFEC] flex-shrink-0">
                      {img && <img src={img.secureUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#777]">
                        {p.categoryNames && p.categoryNames.length > 0 ? p.categoryNames.join(' · ') : 'Atelier'}
                      </span>
                      <h5 className="font-serif text-sm font-normal text-[#1C1C1C] truncate group-hover:text-[#C5A059]">
                        {p.name}
                      </h5>
                      <div className="text-xs font-semibold text-[#1C1C1C]">
                        {currencySymbol}{p.price.toLocaleString()}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#777] group-hover:text-[#1C1C1C] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-[#FAF9F6] border-t border-[#E5E3DB] text-center text-[10px] uppercase tracking-widest text-[#777]">
          Showing {filteredProducts.length} pieces • Press ESC to close
        </div>
      </div>
    </div>
  );
};
