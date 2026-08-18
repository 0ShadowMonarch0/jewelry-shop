import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import type { SiteSettings, Category } from '../../types';

interface FooterProps {
  settings: SiteSettings | null;
  categories: Category[];
  onSelectCategory: (id: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory
}) => {
  const storeName = settings?.storeName || 'AURELIA';
  const instagramHandle = settings?.instagramHandle || 'aurelia_jewelry';
  const contactEmail = settings?.contactEmail || 'concierge@aureliajewelry.com';
  const contactPhone = settings?.contactPhone || '+1 (555) 234-8900';
  const atelierAddress = settings?.atelierAddress || 'Via del Corso, Florence & SoHo, New York';
  const aboutText = settings?.aboutText || 'Aurelia Fine Jewelry was founded on the philosophy that fine jewelry should be intimate, timeless, and sculpturally distinct. Handcrafted in limited micro-batches in our atelier.';
  const philosophyEyebrow = settings?.footerPhilosophyEyebrow || 'Atelier Philosophy';
  const collectionsHeading = settings?.footerCollectionsHeading || 'Collections';
  const orderingHeading = settings?.footerOrderingHeading || 'Instagram Ordering';
  const orderingText = settings?.footerOrderingText || 'We provide tailored bespoke sizing, custom diamond settings, and insured global delivery. Inquire directly via Instagram messaging.';
  const bottomTagline = settings?.footerBottomTagline || 'Curated in Florence & New York';

  return (
    <footer className="bg-[#1C1C1C] text-[#FAF9F6] pt-16 pb-10 border-t border-[#2A2A2A] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#2A2A2A]">
          
          {/* Col 1: Brand & Narrative */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#C5A059]"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">
                {philosophyEyebrow}
              </span>
            </div>
            <span className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tighter uppercase text-[#FAF9F6] block">
              {storeName}
            </span>
            <p className="text-xs sm:text-sm text-[#A5A29B] leading-relaxed font-light max-w-md">
              {aboutText}
            </p>

            <div className="pt-2">
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#2A2A2A] hover:bg-[#C5A059] hover:text-[#1C1C1C] text-[#FAF9F6] px-5 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] transition-all"
              >
                <Instagram className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-mono">@{instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Curated Collections */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
              {collectionsHeading}
            </h4>
            <ul className="space-y-2 text-xs text-[#A5A29B]">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors uppercase tracking-wider text-[11px]"
                >
                  All Atelier Curations
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors uppercase tracking-wider text-[11px]"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Concierge & Direct Inquiry */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
              {orderingHeading}
            </h4>
            <p className="text-xs text-[#A5A29B] leading-relaxed font-light">
              {orderingText}
            </p>
            
            <div className="space-y-2 pt-1 text-xs text-[#A5A29B]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                <span>{atelierAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </div>
              {contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                  <span>{contactPhone}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar matching Design HTML footer aesthetic */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] uppercase tracking-[0.2em] text-[#777]">
          <div>
            © {new Date().getFullYear()} {storeName} Fine Jewelry. All rights reserved.
          </div>

          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Shipping</span>
          </div>

          <div>{bottomTagline}</div>
        </div>

      </div>
    </footer>
  );
};
