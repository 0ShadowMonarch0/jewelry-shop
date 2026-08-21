import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Facebook,
} from "lucide-react";
import type { Product, SiteSettings } from "../../types";
import { InstagramGlyph } from "../icons/InstagramGlyph";

interface ProductPageProps {
  product: Product & { isAvailable?: boolean };
  relatedProducts: Product[];
  settings: SiteSettings | null;
  currencySymbol?: string;
  onBack: () => void;
  onOrderInstagram: (
    product: Product,
    quantity: number,
    color?: string,
    size?: string,
  ) => void;
  onSelectRelated: (product: Product) => void;
}

// Product.size is free-text (e.g. "US 6, 7, 8 available" or "Standard"), not a
// structured list — this splits it into short comma-separated pills when that
// looks reasonable, and otherwise falls back to showing it as a single pill
// rather than risk mangling an unstructured description.
function splitIntoPills(value?: string): string[] {
  if (!value) return [];
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length > 1 && parts.every((p) => p.length <= 20)) return parts;
  return [value];
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  relatedProducts,
  settings,
  currencySymbol = "NPR ",
  onBack,
  onOrderInstagram,
  onSelectRelated,
}) => {
  const sizeOptions = splitIntoPills(product.size);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizeOptions[0],
  );

  const isOutOfStock = product.stock === 0 || product.isAvailable === false;
  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "fallback-img",
            productId: product.id,
            cloudinaryPublicId: "",
            secureUrl:
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200",
            sortOrder: 1,
            isPrimary: true,
            createdAt: new Date().toISOString(),
          },
        ];
  const currentImage = images[selectedImgIndex] || images[0];
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const categoryLabel =
    product.categoryNames && product.categoryNames.length > 0
      ? product.categoryNames.join(", ")
      : null;

  const shareLinks = [
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    },
    {
      label: "X",
      icon: null,
      text: "𝕏",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`,
    },
    {
      label: "WhatsApp",
      icon: null,
      text: "WA",
      href: `https://wa.me/?text=${encodeURIComponent(`${product.name} — ${productUrl}`)}`,
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#757575] hover:text-[#1C1C1C] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Catalogue</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Column */}
        <div className="md:col-span-6 flex gap-3">
          {/* Thumbnails: a narrow side rail from sm+ (keeps the main image from
              having to shrink to make room below it); a row under the image
              on mobile instead, where a side rail would be too cramped. */}
          {images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2.5 w-16 flex-shrink-0 max-h-[480px] overflow-y-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-16 overflow-hidden flex-shrink-0 border-2 transition-all bg-[#ECECEC] ${ selectedImgIndex === idx ? "border-[#8A9099] ring-2 ring-[#8A9099]/20" : "border-[#DADADA] opacity-70 hover:opacity-100" } `}
                >
                  <img
                    src={img.secureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <div className="relative overflow-hidden aspect-square max-h-[480px] bg-[#ECECEC] border border-[#DADADA] shadow-xs">
              <img
                src={currentImage.secureUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImgIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-md"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImgIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all shadow-md"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {isOutOfStock ? (
                  <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                    Out of Stock
                  </span>
                ) : (
                  <>
                    {product.isHot && (
                      <span className="bg-[#8A9099] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                        Hot Piece
                      </span>
                    )}
                    {product.isNewDrop && (
                      <span className="bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 shadow-xs">
                        New Drop
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile-only thumbnail row (side rail is hidden below sm) */}
            {images.length > 1 && (
              <div className="flex sm:hidden items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 overflow-hidden flex-shrink-0 border-2 transition-all bg-[#ECECEC] ${ selectedImgIndex === idx ? "border-[#8A9099] ring-2 ring-[#8A9099]/20" : "border-[#DADADA] opacity-70 hover:opacity-100" } `}
                  >
                    <img
                      src={img.secureUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Column */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1C1C] leading-tight">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-sm text-[#757575] leading-relaxed font-light">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-semibold text-[#1C1C1C]">
              {currencySymbol}
              {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-base text-[#8C8C8C] line-through">
                {currencySymbol}
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.color && (
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#757575]">
                Color
              </span>
              <div>
                <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-white border border-[#1C1C1C] text-[#1C1C1C]">
                  {product.color}
                </span>
              </div>
            </div>
          )}

          {sizeOptions.length > 0 && (
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#757575]">
                Size
              </span>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedSize(opt)}
                    className={`px-4 py-1.5 text-xs font-semibold border transition-colors ${ selectedSize === opt ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "bg-white text-[#1C1C1C] border-[#DADADA] hover:border-[#8A9099]" } `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#757575]">
              Quantity
            </span>
            <div className="inline-flex items-center border border-[#DADADA] overflow-hidden bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-[#1C1C1C] hover:bg-[#ECECEC] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 text-sm font-semibold text-[#1C1C1C] min-w-[2ch] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3.5 py-2 text-[#1C1C1C] hover:bg-[#ECECEC] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              id="page-order-instagram-btn"
              onClick={() =>
                onOrderInstagram(product, quantity, product.color, selectedSize)
              }
              disabled={isOutOfStock}
              className={`w-full py-4 text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-98 ${ isOutOfStock ? "bg-[#ECECEC] text-[#8C8C8C] cursor-not-allowed border border-[#DADADA]" : "bg-[#1C1C1C] hover:bg-[#8A9099] text-white" } `}
            >
              <InstagramGlyph className="w-4 h-4" />
              <span>
                {isOutOfStock ? "Item Out of Stock" : "Inquire via Instagram"}
              </span>
            </button>
            <p className="text-[11px] text-center text-[#757575] font-light">
              No upfront online payment required. Sizing and payment are
              coordinated via Instagram messaging.
            </p>
          </div>

          <div className="pt-4 border-t border-[#DADADA] space-y-3 text-xs">
            {categoryLabel && (
              <div className="flex gap-2">
                <span className="text-[#757575] font-semibold">Categories:</span>
                <span className="text-[#1C1C1C]">{categoryLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[#757575] font-semibold">Share:</span>
              {shareLinks.map(({ label, icon: Icon, text, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${label}`}
                  className="w-7 h-7 flex items-center justify-center border border-[#DADADA] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-colors text-[11px] font-bold"
                >
                  {Icon ? <Icon className="w-3.5 h-3.5" /> : text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-14 pt-10 border-t border-[#DADADA]">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1C1C] mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 8).map((rel) => {
              const relImg = rel.images.find((i) => i.isPrimary) || rel.images[0];
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="group cursor-pointer"
                >
                  {/* Only the image sits in a bordered box — details below are plain text, matching the main grid's cards */}
                  <div className="relative aspect-[4/5] bg-[#ECECEC] border border-[#DADADA] overflow-hidden">
                    {relImg && (
                      <img
                        src={relImg.secureUrl}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="pt-3 space-y-1">
                    <h3 className="font-serif text-sm sm:text-base text-[#1C1C1C] truncate group-hover:text-[#6B7076] transition-colors">
                      {rel.name}
                    </h3>
                    <div className="text-xs sm:text-sm font-semibold text-[#1C1C1C]">
                      {currencySymbol}
                      {rel.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
};
