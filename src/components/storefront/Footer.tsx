import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import type { SiteSettings, Category } from '../../types';
import { InstagramGlyph } from '../icons/InstagramGlyph';

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
  const storeName = settings?.storeName || 'mini2k';
  const instagramHandle = settings?.instagramHandle || 'mini2k.np';
  const contactEmail = settings?.contactEmail || 'concierge@mini2k.com';
  const atelierAddress = settings?.atelierAddress || 'Via del Corso, Florence & SoHo, New York';
  const aboutText = settings?.aboutText || 'mini2k was founded on the philosophy that fine jewelry should be intimate, timeless, and sculpturally distinct. Handcrafted in limited micro-batches in our atelier.';
  const philosophyEyebrow = settings?.footerPhilosophyEyebrow || 'Atelier Philosophy';
  const collectionsHeading = settings?.footerCollectionsHeading || 'Collections';
  const orderingHeading = settings?.footerOrderingHeading || 'Instagram Ordering';
  const orderingText = settings?.footerOrderingText || 'We provide tailored bespoke sizing, custom diamond settings, and insured global delivery. Inquire directly via Instagram messaging.';
  const bottomTagline = settings?.footerBottomTagline || 'Curated in Florence & New York';

  return (
    <footer className="bg-[#1C1C1C] text-[#F4F4F3] pt-16 pb-10 border-t border-[#2A2A2A] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#2A2A2A]">
          
          {/* Col 1: Brand & Narrative */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#8A9099]"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A9099]">
                {philosophyEyebrow}
              </span>
            </div>
            <span className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tighter uppercase text-[#F4F4F3] block">
              {storeName}
            </span>
            <p className="text-xs sm:text-sm text-[#9A9A9A] leading-relaxed font-light max-w-md">
              {aboutText}
            </p>

            <div className="pt-2">
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#2A2A2A] hover:bg-[#8A9099] hover:text-[#1C1C1C] text-[#F4F4F3] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all"
              >
                <InstagramGlyph className="w-3.5 h-3.5" />
                <span className="font-mono">@{instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Curated Collections */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-[0.25em] text-[#8A9099]">
              {collectionsHeading}
            </h4>
            <ul className="space-y-2 text-xs text-[#9A9A9A]">
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
            <h4 className="font-serif text-sm font-semibold uppercase tracking-[0.25em] text-[#8A9099]">
              {orderingHeading}
            </h4>
            <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
              {orderingText}
            </p>
            
            <div className="space-y-2 pt-1 text-xs text-[#9A9A9A]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8A9099] flex-shrink-0" />
                <span>{atelierAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8A9099] flex-shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar matching Design HTML footer aesthetic */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] uppercase tracking-[0.2em] text-[#757575]">
          <div>
            © {new Date().getFullYear()} {storeName} Fine Jewelry. All rights reserved.
          </div>

          <div>{bottomTagline}</div>
        </div>

      </div>
    </footer>
  );
};
