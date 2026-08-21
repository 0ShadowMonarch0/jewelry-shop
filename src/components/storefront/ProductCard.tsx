import React, { useState } from 'react';
import { Eye, AlertCircle } from 'lucide-react';
import type { Product } from '../../types';
import { InstagramGlyph } from '../icons/InstagramGlyph';

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

  // Calculate discount percentage if original price exists
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  return (
    <div
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container: fixed aspect ratio so every card in the grid is
          the same height, regardless of each photo's native dimensions.
          This is the only "box" in the card — details below sit directly
          on the page with no border/background of their own. */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[#ECECEC] border border-[#DADADA] cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={primaryImg?.secureUrl || ''}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${ isHovered && secondaryImg ? 'opacity-0' : 'opacity-100' } ${isHovered ? 'scale-105' : 'scale-100'} ${isOutOfStock ? 'grayscale-[40%] opacity-80' : ''} `}
          loading="lazy"
        />
        {secondaryImg && (
          <img
            src={secondaryImg.secureUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${ isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100' } ${isOutOfStock ? 'grayscale-[40%] opacity-80' : ''} `}
            loading="lazy"
          />
        )}

        {/* Luxury Floating Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-[#1C1C1C]/90 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3 h-3 text-[#DADADA]" />
              Out of Stock
            </span>
          ) : (
            <>
              {product.isNewDrop && (
                <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                  New Drop
                </span>
              )}

              {product.isHot && (
                <span className="bg-[#8A9099] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                  Hot
                </span>
              )}

              {product.restockedAt && !product.isNewDrop && (
                <span className="bg-white text-[#1C1C1C] border border-[#DADADA] text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                  Restocked
                </span>
              )}

              {hasDiscount && (
                <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
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
            className="bg-white/95 backdrop-blur-sm text-[#1C1C1C] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 hover:bg-[#8A9099] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Atelier View</span>
          </button>
        </div>
      </div>

      {/* Product Details: plain text sitting under the image, no card/box around it */}
      <div className="flex flex-col flex-1 pt-3 sm:pt-4 space-y-1">
        {product.categoryNames && product.categoryNames.length > 0 && (
          <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#757575]">
            {product.categoryNames.join(' · ')}
          </span>
        )}

        <h3
          onClick={() => onQuickView(product)}
          className="font-serif text-sm sm:text-base lg:text-lg font-normal text-[#1C1C1C] hover:text-[#6B7076] cursor-pointer transition-colors leading-snug line-clamp-2"
        >
          {product.name}
        </h3>

        {product.material && (
          <p className="text-xs text-[#757575] line-clamp-1 italic font-serif">
            {product.material}
          </p>
        )}

        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0 pt-0.5">
          <span className="text-sm sm:text-base font-semibold text-[#1C1C1C] whitespace-nowrap">
            {currencySymbol}{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] sm:text-xs text-[#8C8C8C] line-through whitespace-nowrap">
              {currencySymbol}{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Instagram Order CTA: a plain text link, not a bordered button */}
        <button
          id={`btn-order-ig-${product.slug}`}
          onClick={(e) => {
            e.stopPropagation();
            onOrderInstagram(product);
          }}
          disabled={isOutOfStock}
          className={`flex items-center gap-1.5 pt-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-colors whitespace-nowrap w-fit ${
            isOutOfStock
              ? 'text-[#8C8C8C] cursor-not-allowed'
              : 'text-[#1C1C1C] hover:text-[#6B7076]'
          }`}
          title={isOutOfStock ? 'Item is currently sold out' : 'Order via Instagram Direct'}
        >
          <InstagramGlyph className={`w-3.5 h-3.5 ${isOutOfStock ? 'grayscale opacity-60' : ''}`} />
          <span>{isOutOfStock ? 'Sold Out' : 'Inquire'}</span>
        </button>
      </div>
    </div>
  );
};
