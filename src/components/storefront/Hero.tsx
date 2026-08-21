import React from "react";
import { ArrowRight } from "lucide-react";
import type { SiteSettings } from "../../types";
import { InstagramGlyph } from "../icons/InstagramGlyph";

interface HeroProps {
  settings: SiteSettings | null;
  onExplore: () => void;
  onSelectFilter: (filter: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExplore,
  onSelectFilter,
}) => {
  const headline = settings?.heroHeadline || "Adorn the Unseen";
  const subhead =
    settings?.heroSubhead ||
    "Discover artisanal jewelry curated for the modern minimalist. Each piece tells a story of elegance, sculptural craftsmanship, and visual discovery.";
  const instagramHandle = settings?.instagramHandle || "mini2k.np";
  const eyebrowText = settings?.heroEyebrowText || "Editorial 2026";
  const currentDropLabel =
    settings?.heroCurrentDropLabel || "Current Atelier Drop";
  const currentDropText =
    settings?.heroCurrentDropText ||
    "Celestial 18K Solid Gold & Baroque Series";
  const primaryCtaText = settings?.heroCtaText || "Explore Drop";
  const secondaryCtaText = settings?.heroSecondaryCtaText || "New Arrivals";
  const inquiryCardTitle =
    settings?.heroInquiryCardTitle || "Instagram Inquiry";
  const inquiryCardSubtitle =
    settings?.heroInquiryCardSubtitle || "Atelier Concierge";
  const inquiryCardText =
    settings?.heroInquiryCardText ||
    "Select any piece from our catalogue to message us directly for bespoke ring sizing and insured global dispatch.";
  const heroImageUrl =
    settings?.heroImageUrl ||
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920";

  // Italicize the last word for the same editorial flourish as the original
  // static headline, while staying dynamic for any admin-provided text.
  const headlineWords = headline.trim().split(/\s+/);
  const headlineLastWord = headlineWords.pop() || "";
  const headlineLead = headlineWords.join(" ");

  return (
    <section className="relative overflow-hidden min-h-[640px] sm:min-h-[760px] flex items-center justify-center border-b border-[#DADADA]">
      {/* Full-bleed background image */}
      <img
        src={heroImageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Charcoal overlay for text legibility */}
      <div className="absolute inset-0 bg-[#1C1C1C]/60"></div>

      {/* Centered content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-8 py-20 sm:py-28 flex flex-col items-center text-center gap-6">
        {/* Editorial Line Badge */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-[#DADADA]"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#DADADA]">
            {eyebrowText}
          </span>
          <div className="h-[1px] w-12 bg-[#DADADA]"></div>
        </div>

        {/* High-Impact Hero Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.95] tracking-tight text-white">
          {headlineLead && <>{headlineLead} </>}
          <span className="italic text-[#DADADA] font-serif">
            {headlineLastWord}
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-sm leading-relaxed text-white/80 max-w-md font-light">
          {subhead}
        </p>

        {/* Current Drop Callout */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#DADADA]">
            {currentDropLabel}
          </div>
          <div className="text-xl font-serif italic text-white">
            {currentDropText}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="hero-explore-cta"
            onClick={onExplore}
            className="bg-white hover:bg-[#DADADA] text-[#1C1C1C] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectFilter("newDrop")}
            className="border border-white/60 hover:border-white bg-transparent text-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors"
          >
            {secondaryCtaText}
          </button>
        </div>

        {/* Prestige Instagram Inquiry Card */}
        {/* <div className="mt-4 w-full max-w-sm p-5 sm:p-6 bg-white/10 backdrop-blur-md border border-white/25 space-y-3 text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white flex items-center justify-between">
            <span>{inquiryCardTitle}</span>
            <span className="text-[#DADADA] font-mono text-[9px]">{inquiryCardSubtitle}</span>
          </div>
          <p className="text-xs text-white/75 font-light leading-relaxed">
            {inquiryCardText}
          </p>
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 group pt-1"
          >
            <div className="w-8 h-8 bg-white border border-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <InstagramGlyph className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#DADADA] transition-colors font-mono">
              @{instagramHandle}
            </span>
          </a>
        </div>*/}
      </div>
    </section>
  );
};
