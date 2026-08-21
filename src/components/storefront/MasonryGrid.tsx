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
  currencySymbol = 'NPR ',
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
          <div key={idx} className="masonry-item bg-white p-4 border border-[#DADADA] animate-pulse space-y-4">
            <div className="bg-[#ECECEC] aspect-[4/5] w-full"></div>
            <div className="h-4 bg-[#ECECEC] w-3/4"></div>
            <div className="h-3 bg-[#ECECEC] w-1/2"></div>
            <div className="h-8 bg-[#ECECEC] w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center bg-white border border-[#DADADA] my-8 max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-[#F4F4F3] border border-[#DADADA] flex items-center justify-center mx-auto mb-4 text-[#6B6B6B]">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-[#1C1C1C] mb-2">{emptyTitle}</h3>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">{emptySubtitle}</p>
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
