import React from 'react';
import { ArrowRight, Instagram, Sparkles, Gem } from 'lucide-react';
import type { SiteSettings } from '../../types';

interface HeroProps {
  settings: SiteSettings | null;
  onExplore: () => void;
  onSelectFilter: (filter: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore, onSelectFilter }) => {
  const headline = settings?.heroHeadline || 'Adorn the Unseen';
  const subhead = settings?.heroSubhead || 'Discover artisanal jewelry curated for the modern minimalist. Each piece tells a story of elegance, sculptural craftsmanship, and visual discovery.';
  const instagramHandle = settings?.instagramHandle || 'mini2k.np';
  const eyebrowText = settings?.heroEyebrowText || 'Editorial 2026';
  const currentDropLabel = settings?.heroCurrentDropLabel || 'Current Atelier Drop';
  const currentDropText = settings?.heroCurrentDropText || 'Celestial 18K Solid Gold & Baroque Series';
  const primaryCtaText = settings?.heroCtaText || 'Explore Drop';
  const secondaryCtaText = settings?.heroSecondaryCtaText || 'New Arrivals';
  const inquiryCardTitle = settings?.heroInquiryCardTitle || 'Instagram Inquiry';
  const inquiryCardSubtitle = settings?.heroInquiryCardSubtitle || 'Atelier Concierge';
  const inquiryCardText = settings?.heroInquiryCardText || 'Select any piece from our catalogue to message us directly for bespoke ring sizing and insured global dispatch.';
  const currencySymbol = settings?.currencySymbol || 'NPR ';

  // Italicize the last word for the same editorial flourish as the original
  // static headline, while staying dynamic for any admin-provided text.
  const headlineWords = headline.trim().split(/\s+/);
  const headlineLastWord = headlineWords.pop() || '';
  const headlineLead = headlineWords.join(' ');

  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-[#E5E3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Luxury Prestige Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Typography & Brand Narrative */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 py-2">
            <div className="space-y-6">
              
              {/* Editorial Line Badge */}
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-[#C5A059]"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">
                  {eyebrowText}
                </span>
              </div>

              {/* High-Impact Hero Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.95] tracking-tight text-[#1C1C1C]">
                {headlineLead && <>{headlineLead} </>}
                <span className="italic text-[#C5A059] font-serif">{headlineLastWord}</span>
              </h1>

              {/* Subtext */}
              <p className="text-sm leading-relaxed text-[#555] max-w-sm font-light">
                {subhead}
              </p>

              {/* Current Drop Callout */}
              <div className="flex flex-col gap-1 pt-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999]">
                  {currentDropLabel}
                </div>
                <div className="text-xl font-serif italic text-[#1C1C1C] flex items-center gap-2">
                  <span>{currentDropText}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id="hero-explore-cta"
                  onClick={onExplore}
                  className="bg-[#1C1C1C] hover:bg-[#C5A059] text-white px-6 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors shadow-sm flex items-center gap-2 active:scale-95"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectFilter('newDrop')}
                  className="border border-[#E5E3DB] hover:border-[#C5A059] bg-white text-[#1C1C1C] px-5 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors"
                >
                  {secondaryCtaText}
                </button>
              </div>
            </div>

            {/* Prestige Instagram Inquiry Card */}
            <div className="p-5 sm:p-6 bg-white border border-[#E5E3DB] rounded-2xl shadow-xs space-y-3">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1C1C1C] flex items-center justify-between">
                <span>{inquiryCardTitle}</span>
                <span className="text-[#C5A059] font-mono text-[9px]">{inquiryCardSubtitle}</span>
              </div>
              <p className="text-xs text-[#777] font-light leading-relaxed">
                {inquiryCardText}
              </p>
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 group pt-1"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors font-mono">
                  @{instagramHandle}
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Pinterest Image Showcase. Every tile
              shares one aspect ratio below `sm` so the two visible mobile
              columns stay evenly matched; the staggered mosaic (varied
              ratios + column 2 offset) only kicks in from `sm` up. */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 items-start">

            {/* Column 1 */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <div
                onClick={() => onSelectFilter('newDrop')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-[4/5] flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <div className="absolute top-3.5 left-3.5 z-10 bg-[#1C1C1C] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  New Drop
                </div>
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
                  alt="Pearls"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <div className="text-white font-serif italic text-sm sm:text-base">Baroque Helios Choker</div>
                  <div className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">{currencySymbol}540.00</div>
                </div>
              </div>

              <div
                onClick={() => onSelectFilter('hot')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <div className="absolute top-3.5 left-3.5 z-10 bg-[#C5A059] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Hot
                </div>
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"
                  alt="Rings"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white font-serif italic text-sm">Solstice Molten Ring</div>
                  <div className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">{currencySymbol}680.00</div>
                </div>
              </div>
            </div>

            {/* Column 2 (Staggered with pt-8 on sm) */}
            <div className="flex flex-col gap-4 sm:gap-6 sm:pt-10">
              <div
                onClick={() => onSelectFilter('restocked')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <div className="absolute top-3.5 left-3.5 z-10 bg-white text-[#1C1C1C] border border-[#E5E3DB] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Restocked
                </div>
                <img
                  src="https://images.unsplash.com/photo-1611591475883-8a306c59b666?auto=format&fit=crop&q=80&w=800"
                  alt="Necklaces"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white font-serif italic text-sm">Aethel Pavé Cuff</div>
                  <div className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">{currencySymbol}820.00</div>
                </div>
              </div>

              <div
                onClick={() => onSelectFilter('all')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-[4/5] flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                  alt="Earrings"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white font-serif italic text-sm">Elysian Teardrop Drops</div>
                  <div className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">{currencySymbol}390.00</div>
                </div>
              </div>
            </div>

            {/* Column 3 (Hidden on mobile, visible on sm+) */}
            <div className="hidden sm:flex flex-col gap-4 sm:gap-6">
              <div
                onClick={() => onSelectFilter('all')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-square flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
                  alt="Silk & Stones"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>

              <div
                onClick={() => onSelectFilter('all')}
                className="group relative bg-[#F0EFEC] rounded-3xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-[#E5E3DB] cursor-pointer shadow-xs"
              >
                <div className="absolute top-3.5 left-3.5 z-10 bg-[#FF4444] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Offer
                </div>
                <img
                  src="https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800"
                  alt="Limited Atelier"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExplore();
                    }}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white text-[#1C1C1C] transition-all shadow-md active:scale-95"
                    aria-label="View collection"
                  >
                    <ArrowRight className="w-4 h-4 text-[#1C1C1C]" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
