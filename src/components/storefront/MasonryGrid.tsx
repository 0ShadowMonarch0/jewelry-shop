import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';
import { PackageOpen, Sparkles, Filter } from 'lucide-react';

interface MasonryGridProps {
  products: (Product & { isAvailable?: boolean })[];
  currencySymbol?: string;
  onQuickView: (product: Product) => void;
  onOrderInstagram: (product: Product) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  products,
  currencySymbol = '$',
  onQuickView,
  onOrderInstagram,
  loading = false,
  emptyTitle = 'No Atelier Pieces Found',
  emptySubtitle = 'Try adjusting your filters or search keywords to discover more fine jewelry.'
}) => {
  if (loading) {
    return (
      <div className="masonry-grid py-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="masonry-item bg-white rounded-2xl p-4 border border-[#E5DFD7] animate-pulse space-y-4">
            <div className="bg-[#EFECE6] rounded-xl aspect-[4/5] w-full"></div>
            <div className="h-4 bg-[#EFECE6] rounded-md w-3/4"></div>
            <div className="h-3 bg-[#EFECE6] rounded-md w-1/2"></div>
            <div className="h-8 bg-[#EFECE6] rounded-full w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center bg-white rounded-3xl border border-[#E5DFD7] my-8 max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-center mx-auto mb-4 text-[#7A756B]">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-[#181816] mb-2">{emptyTitle}</h3>
        <p className="text-sm text-[#615C52] max-w-md mx-auto leading-relaxed">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Pinterest-inspired Masonry Layout */}
      <div className="masonry-grid">
        {products.map((product) => (
          <div key={product.id} className="masonry-item">
            <ProductCard
              product={product}
              currencySymbol={currencySymbol}
              onQuickView={onQuickView}
              onOrderInstagram={onOrderInstagram}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
