import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Shield } from 'lucide-react';
import type { Product, SiteSettings } from '../../types';
import { api } from '../../lib/api';
import { InstagramGlyph } from '../icons/InstagramGlyph';

interface InstagramOrderModalProps {
  product: Product;
  settings: SiteSettings | null;
  currencySymbol?: string;
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
  onClose: () => void;
}

export const InstagramOrderModal: React.FC<InstagramOrderModalProps> = ({
  product,
  settings,
  currencySymbol = 'NPR ',
  quantity = 1,
  selectedColor,
  selectedSize,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [inquirySaved, setInquirySaved] = useState(false);

  const instagramHandle = settings?.instagramHandle || 'mini2k.np';
  const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];

  // Generate standardized message
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : '';

  const generateMessage = () => {
    let msg = `Hi @${instagramHandle}, I'm interested in ordering the ${product.name} (SKU: ${product.sku}, Qty: ${quantity}, Price: ${currencySymbol}${product.price}).`;
    if (selectedColor) msg += ` Color: ${selectedColor}.`;
    if (selectedSize) msg += ` Size: ${selectedSize}.`;
    if (customNote.trim()) {
      msg += ` Note: ${customNote.trim()}`;
    }
    msg += ` URL: ${productUrl}`;
    return msg;
  };

  const messageText = generateMessage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      recordInquiry();
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const recordInquiry = async () => {
    if (inquirySaved) return;
    try {
      await api.createInquiry({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productPrice: product.price,
        productSlug: product.slug,
        productImage: primaryImg?.secureUrl,
        instagramHandle,
        customerNote: customNote
      });
      setInquirySaved(true);
    } catch (e) {
      // Non-blocking
    }
  };

  const handleDirectInstagramOpen = async () => {
    // Instagram has no equivalent of WhatsApp's wa.me "?text=" pre-fill — a DM
    // link can only open the thread, never insert message text. Copying it to
    // the clipboard first is the closest thing to a one-tap flow: the customer
    // still has to paste, but they don't have to hunt for the Copy button too.
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    recordInquiry();
    const igUrl = `https://ig.me/m/${instagramHandle}`;
    window.open(igUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#F4F4F3] w-full max-w-lg shadow-2xl border border-[#DADADA] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-[#DADADA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#8A9099]"></div>
            <span className="font-serif text-lg font-normal text-[#1C1C1C] tracking-wide">
              Instagram Atelier Inquiry
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#757575] hover:text-[#1C1C1C] hover:bg-[#ECECEC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          
          {/* Selected Product Summary Card */}
          <div className="flex items-center gap-4 p-4 bg-white border border-[#DADADA] shadow-xs">
            {primaryImg && (
              <img
                src={primaryImg.secureUrl}
                alt={product.name}
                className="w-16 h-16 object-cover border border-[#DADADA] bg-[#ECECEC]"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8A9099]">
                {product.sku}
              </span>
              <h4 className="font-serif text-base font-normal text-[#1C1C1C] truncate">
                {product.name}
              </h4>
              <div className="text-sm font-semibold text-[#1C1C1C]">
                {currencySymbol}{product.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Sizing / Bespoke Note Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#757575] uppercase tracking-[0.2em]">
              Bespoke sizing or engraving requests (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g., Size 6.5, 18K yellow gold, gift box..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#DADADA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#8A9099] transition-colors"
            />
          </div>

          {/* Generated Message Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#757575]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Standardized Inquiry:</span>
              <span className="text-[11px] font-mono text-[#8A9099]">@{instagramHandle}</span>
            </div>
            
            <div className="relative bg-[#ECECEC] p-4 border border-[#DADADA] text-xs text-[#1C1C1C] font-mono leading-relaxed select-all">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="open-ig-direct-btn"
              onClick={handleDirectInstagramOpen}
              className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] hover:bg-[#8A9099] text-white py-3.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-md transition-all active:scale-98"
            >
              <InstagramGlyph className="w-4 h-4" />
              <span>Open Instagram & Send DM</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
            </button>
            <p className="text-center text-[10px] text-[#8C8C8C]">
              Instagram can't auto-fill your message — we copy it for you, just paste it into the DM.
            </p>

            <button
              id="copy-inquiry-msg-btn"
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#ECECEC] text-[#1C1C1C] border border-[#DADADA] py-3 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#8A9099]" />
                  <span className="text-[#8A9099] font-bold">Message Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#757575]" />
                  <span>Copy Message Text</span>
                </>
              )}
            </button>
          </div>

          {/* Safety & Atelier Process Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-white text-[11px] text-[#757575] border border-[#DADADA]">
            <Shield className="w-4 h-4 text-[#8A9099] flex-shrink-0 mt-0.5" />
            <span>
              Orders are confirmed personally by our atelier concierge on Instagram. We verify ring sizes, custom engravings, and provide insured courier tracking.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
