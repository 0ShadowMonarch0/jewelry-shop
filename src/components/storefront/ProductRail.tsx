import React, { useRef } from 'react';
import { Instagram } from 'lucide-react';
import type { Product } from '../../types';

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
        <div className="h-[1px] w-8 bg-[#C5A059]"></div>
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
              className="group flex-shrink-0 snap-start w-[42vw] sm:w-[220px] lg:w-[240px] bg-white rounded-2xl overflow-hidden border border-[#E5E3DB] hover:border-[#C5A059] transition-all"
            >
              <div
                className="relative aspect-[4/5] bg-[#F0EFEC] overflow-hidden cursor-pointer"
                onClick={() => onQuickView(product)}
              >
                {primaryImg && (
                  <img
                    src={primaryImg.secureUrl}
                    alt={product.name}
                    draggable={false}
                    className={`w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? 'grayscale-[40%] opacity-80' : ''
                    }`}
                    loading="lazy"
                  />
                )}
                {isOutOfStock && (
                  <span className="absolute top-2.5 left-2.5 bg-[#1C1C1C]/90 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                    Out of Stock
                  </span>
                )}
                {hasDiscount && !isOutOfStock && (
                  <span className="absolute top-2.5 left-2.5 bg-[#FF4444] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                    Offer
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-2">
                <h3
                  onClick={() => onQuickView(product)}
                  className="font-serif text-sm sm:text-base text-[#1C1C1C] hover:text-[#C5A059] cursor-pointer transition-colors leading-snug line-clamp-1"
                >
                  {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-[#1C1C1C] whitespace-nowrap">
                      {currencySymbol}{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-[#999] line-through whitespace-nowrap">
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
                    className={`flex-shrink-0 p-1.5 rounded-full border transition-all ${
                      isOutOfStock
                        ? 'bg-[#F0EFEC] text-[#999] cursor-not-allowed border-[#E5E3DB]'
                        : 'bg-[#FAF9F6] hover:bg-[#C5A059] text-[#C5A059] hover:text-white border-[#E5E3DB] hover:border-[#C5A059] active:scale-95'
                    }`}
                    title={isOutOfStock ? 'Item is currently sold out' : 'Order via Instagram Direct'}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
