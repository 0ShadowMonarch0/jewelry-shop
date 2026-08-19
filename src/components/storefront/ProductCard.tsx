import React, { useState } from 'react';
import { Instagram, Eye, AlertCircle } from 'lucide-react';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product & { isAvailable?: boolean };
  currencySymbol?: string;
  onQuickView: (product: Product) => void;
  onOrderInstagram: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol = 'NPR ',
  onQuickView,
  onOrderInstagram
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock = product.stock === 0 || product.isAvailable === false;
  const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
  const secondaryImg = product.images.length > 1 ? product.images.find(img => !img.isPrimary) : null;

  // Lock the card's aspect ratio to the primary photo so a hover cross-fade
  // to the secondary photo never changes card height and reflows the masonry grid.
  const aspectRatio = primaryImg?.width && primaryImg?.height ? primaryImg.width / primaryImg.height : 4 / 5;

  // Calculate discount percentage if original price exists
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  return (
    <div
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E5E3DB] hover:border-[#C5A059] transition-all duration-500 hover:shadow-xl break-inside-avoid mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Pinterest Aesthetic Aspect Ratios */}
      <div
        className="relative overflow-hidden bg-[#F0EFEC] cursor-pointer"
        style={{ aspectRatio }}
        onClick={() => onQuickView(product)}
      >
        <img
          src={primaryImg?.secureUrl || ''}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            isHovered && secondaryImg ? 'opacity-0' : 'opacity-100'
          } ${isHovered ? 'scale-105' : 'scale-100'} ${isOutOfStock ? 'grayscale-[40%] opacity-80' : ''}`}
          loading="lazy"
        />
        {secondaryImg && (
          <img
            src={secondaryImg.secureUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            } ${isOutOfStock ? 'grayscale-[40%] opacity-80' : ''}`}
            loading="lazy"
          />
        )}

        {/* Luxury Floating Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-[#1C1C1C]/90 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3 h-3 text-[#E5E3DB]" />
              Out of Stock
            </span>
          ) : (
            <>
              {product.isNewDrop && (
                <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                  New Drop
                </span>
              )}

              {product.isHot && (
                <span className="bg-[#C5A059] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                  Hot
                </span>
              )}

              {product.restockedAt && !product.isNewDrop && (
                <span className="bg-white text-[#1C1C1C] border border-[#E5E3DB] text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                  Restocked
                </span>
              )}

              {hasDiscount && (
                <span className="bg-[#FF4444] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                  -{discountPercent}% Offer
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick View Button on Hover / Mobile Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white/95 backdrop-blur-sm text-[#1C1C1C] px-5 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 hover:bg-[#C5A059] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Atelier View</span>
          </button>
        </div>
      </div>

      {/* Product Details Block */}
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col justify-between flex-1 space-y-3 sm:space-y-4">
        <div className="space-y-1.5 min-w-0">
          {product.categoryName && (
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#777]">
              {product.categoryName}
            </span>
          )}

          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-base sm:text-lg lg:text-xl font-normal text-[#1C1C1C] hover:text-[#C5A059] cursor-pointer transition-colors leading-snug line-clamp-2"
          >
            {product.name}
          </h3>

          {product.material && (
            <p className="text-xs text-[#777] line-clamp-1 italic font-serif">
              {product.material}
            </p>
          )}
        </div>

        {/* Price & Order CTA Row */}
        <div className="pt-3 border-t border-[#E5E3DB] flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
            <span className="text-sm sm:text-base font-semibold text-[#1C1C1C] whitespace-nowrap">
              {currencySymbol}{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-[#999] line-through whitespace-nowrap">
                {currencySymbol}{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Instagram Order CTA */}
          <button
            id={`btn-order-ig-${product.slug}`}
            onClick={(e) => {
              e.stopPropagation();
              onOrderInstagram(product);
            }}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-all whitespace-nowrap flex-shrink-0 ${
              isOutOfStock
                ? 'bg-[#F0EFEC] text-[#999] cursor-not-allowed border border-[#E5E3DB]'
                : 'bg-[#FAF9F6] hover:bg-[#C5A059] text-[#1C1C1C] hover:text-white border border-[#E5E3DB] hover:border-[#C5A059] active:scale-95 shadow-xs'
            }`}
            title={isOutOfStock ? 'Item is currently sold out' : 'Order via Instagram Direct'}
          >
            <Instagram className={`w-3.5 h-3.5 ${isOutOfStock ? 'text-[#999]' : 'text-[#C5A059] group-hover:text-white'}`} />
            <span>{isOutOfStock ? 'Sold Out' : 'Inquire'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
