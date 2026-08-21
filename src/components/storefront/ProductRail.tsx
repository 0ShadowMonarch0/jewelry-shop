import React, { useRef } from 'react';
import type { Product } from '../../types';
import { InstagramGlyph } from '../icons/InstagramGlyph';

interface ProductRailProps {
  title: string;
  icon?: React.ReactNode;
  products: (Product & { isAvailable?: boolean })[];
  currencySymbol?: string;
  onQuickView: (product: Product) => void;
  onOrderInstagram: (product: Product) => void;
}

// A horizontally scrolling collection strip (e.g. "New Drop", "Most Selling")
// shown above the main catalogue. Supports native touch swiping plus
// click-and-drag scrolling with the mouse on desktop.
export const ProductRail: React.FC<ProductRailProps> = ({
  title,
  icon,
  products,
  currencySymbol = 'NPR ',
  onQuickView,
  onOrderInstagram,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragMoved = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // Deliberately avoid setPointerCapture here: capturing the pointer on the
  // scroller retargets the eventual click event to the scroller itself,
  // which stops it from ever reaching a card's onClick. Tracking the drag
  // with plain window listeners keeps click targeting untouched, so a card
  // still opens on a real (non-dragging) click.
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el || e.button !== 0) return;
    dragMoved.current = false;
    dragStartX.current = e.clientX;
    scrollStartX.current = el.scrollLeft;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartX.current;
      if (Math.abs(dx) > 5) dragMoved.current = true;
      el.scrollLeft = scrollStartX.current - dx;
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-[1px] w-8 bg-[#8A9099]"></div>
        <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1C1C] tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>

      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onClickCapture={(e) => {
          if (dragMoved.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2 cursor-grab active:cursor-grabbing select-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {products.map((product) => {
          const isOutOfStock = product.stock === 0 || product.isAvailable === false;
          const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
          const hasDiscount = product.originalPrice && product.originalPrice > product.price;

          return (
            <div
              key={product.id}
              className="group flex-shrink-0 snap-start w-[42vw] sm:w-[220px] lg:w-[240px]"
            >
              {/* Only the image sits in a bordered box — details below are plain text, matching the main grid's cards */}
              <div
                className="relative aspect-[4/5] bg-[#ECECEC] border border-[#DADADA] overflow-hidden cursor-pointer"
                onClick={() => onQuickView(product)}
              >
                {primaryImg && (
                  <img
                    src={primaryImg.secureUrl}
                    alt={product.name}
                    draggable={false}
                    className={`w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105 ${ isOutOfStock ? 'grayscale-[40%] opacity-80' : '' } `}
                    loading="lazy"
                  />
                )}
                {isOutOfStock && (
                  <span className="absolute top-2.5 left-2.5 bg-[#1C1C1C]/90 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                    Out of Stock
                  </span>
                )}
                {hasDiscount && !isOutOfStock && (
                  <span className="absolute top-2.5 left-2.5 bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                    Offer
                  </span>
                )}
              </div>

              <div className="pt-3 space-y-1">
                <h3
                  onClick={() => onQuickView(product)}
                  className="font-serif text-sm sm:text-base text-[#1C1C1C] hover:text-[#6B7076] cursor-pointer transition-colors leading-snug line-clamp-1"
                >
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-[#1C1C1C] whitespace-nowrap">
                    {currencySymbol}{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-[#8C8C8C] line-through whitespace-nowrap">
                      {currencySymbol}{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderInstagram(product);
                  }}
                  disabled={isOutOfStock}
                  className={`flex items-center gap-1.5 pt-0.5 text-[10px] font-semibold tracking-wider uppercase transition-colors ${ isOutOfStock ? 'text-[#8C8C8C] cursor-not-allowed' : 'text-[#1C1C1C] hover:text-[#6B7076]' } `}
                  title={isOutOfStock ? 'Item is currently sold out' : 'Order via Instagram Direct'}
                >
                  <InstagramGlyph className={`w-3.5 h-3.5 ${isOutOfStock ? 'grayscale opacity-60' : ''}`} />
                  <span>{isOutOfStock ? 'Sold Out' : 'Inquire'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
