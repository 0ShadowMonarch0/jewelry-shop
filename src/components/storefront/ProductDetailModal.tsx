import React, { useState } from 'react';
import { 
  X, 
  Instagram, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { Product, SiteSettings } from '../../types';

interface ProductDetailModalProps {
  product: Product & { isAvailable?: boolean };
  relatedProducts: Product[];
  settings: SiteSettings | null;
  currencySymbol?: string;
  onClose: () => void;
  onOrderInstagram: (product: Product) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  settings,
  currencySymbol = 'NPR ',
  onClose,
  onOrderInstagram,
  onSelectRelated
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOutOfStock = product.stock === 0 || product.isAvailable === false;
  const images = product.images.length > 0 ? product.images : [
    {
      id: 'fallback-img',
      productId: product.id,
      cloudinaryPublicId: '',
      secureUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date().toISOString()
    }
  ];

  const currentImage = images[selectedImgIndex] || images[0];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Discover ${product.name} at mini2k.`,
          url: window.location.href
        });
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#FAF9F6] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E5E3DB] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close & Share Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-sm border border-[#E5E3DB]"
            title="Share piece"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#C5A059]" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-sm border border-[#E5E3DB]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-10">
          
          {/* Main Grid: Gallery on Left, Details on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Image Viewport */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#F0EFEC] border border-[#E5E3DB] shadow-xs">
                <img
                  src={currentImage.secureUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Left/Right Carousel Controls if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {isOutOfStock ? (
                    <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <AlertCircle className="w-3 h-3 text-[#E5E3DB]" />
                      Out of Stock
                    </span>
                  ) : (
                    <>
                      {product.isHot && (
                        <span className="bg-[#C5A059] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                          Hot Piece
                        </span>
                      )}
                      {product.isNewDrop && (
                        <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                          New Atelier Drop
                        </span>
                      )}
                      {product.restockedAt && !product.isNewDrop && (
                        <span className="bg-white text-[#1C1C1C] border border-[#E5E3DB] text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                          Restocked
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all bg-[#F0EFEC] ${
                        selectedImgIndex === idx ? 'border-[#C5A059] ring-2 ring-[#C5A059]/20' : 'border-[#E5E3DB] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.secureUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Ordering Column */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#777]">
                    {product.categoryName || 'Atelier Collection'}
                  </span>
                  <span className="font-mono text-[10px] text-[#999] uppercase tracking-wider">
                    SKU: {product.sku}
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1C1C] leading-tight">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-2xl sm:text-3xl font-semibold text-[#1C1C1C]">
                    {currencySymbol}{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-[#999] line-through">
                      {currencySymbol}{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Availability Badge */}
                <div className="pt-1">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0EFEC] text-[#777] border border-[#E5E3DB]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#999]"></span>
                      OUT OF STOCK — Bespoke Inquiry Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1C1C1C] border border-[#E5E3DB]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                      Available in Atelier — Ready for Bespoke Sizing
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2 border-t border-[#E5E3DB] pt-4">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1C1C1C]">
                    Atelier Notes & Craftsmanship
                  </h4>
                  <p className="text-sm text-[#555] leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specifications Matrix */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-2 border-t border-[#E5E3DB] pt-4">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1C1C1C]">
                    Specifications
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs bg-white p-4 rounded-2xl border border-[#E5E3DB]">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-[#FAF9F6] last:border-0">
                        <span className="text-[#777] font-medium">{key}</span>
                        <span className="text-[#1C1C1C] font-semibold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order via Instagram Action */}
              <div className="space-y-3 pt-4 border-t border-[#E5E3DB]">
                <button
                  id="modal-order-instagram-btn"
                  onClick={() => onOrderInstagram(product)}
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-98 ${
                    isOutOfStock
                      ? 'bg-[#F0EFEC] text-[#999] cursor-not-allowed border border-[#E5E3DB]'
                      : 'bg-[#1C1C1C] hover:bg-[#C5A059] text-white'
                  }`}
                >
                  <Instagram className="w-4 h-4 text-[#C5A059] group-hover:text-white" />
                  <span>{isOutOfStock ? 'Item Out of Stock' : 'Inquire via Instagram Direct'}</span>
                </button>

                <p className="text-[11px] text-center text-[#777] font-light">
                  No upfront online payment required. Bespoke orders, sizing, and payment are coordinated via Instagram messaging.
                </p>
              </div>

              {/* Value Props Row */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#555] bg-white p-3 rounded-xl border border-[#E5E3DB]">
                  <Truck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                  <span>Insured Global Courier</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555] bg-white p-3 rounded-xl border border-[#E5E3DB]">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                  <span>Atelier Certificate</span>
                </div>
              </div>

            </div>

          </div>

          {/* Related Pieces Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="border-t border-[#E5E3DB] pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-normal text-[#1C1C1C]">
                  Pairs Elegantly With
                </h3>
                <span className="text-[10px] text-[#777] uppercase tracking-[0.2em] font-bold">
                  Curated Companions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((rel) => {
                  const relImg = rel.images.find(i => i.isPrimary) || rel.images[0];
                  return (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="group cursor-pointer bg-white rounded-2xl p-3.5 border border-[#E5E3DB] hover:border-[#C5A059] transition-all space-y-2 shadow-xs"
                    >
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#F0EFEC]">
                        {relImg && (
                          <img
                            src={relImg.secureUrl}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <h5 className="font-serif text-xs font-normal text-[#1C1C1C] truncate group-hover:text-[#C5A059]">
                        {rel.name}
                      </h5>
                      <div className="text-xs font-semibold text-[#1C1C1C]">
                        {currencySymbol}{rel.price.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
