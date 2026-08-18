import React, { useState, useEffect } from 'react';
import { Tag, Clock } from 'lucide-react';
import type { Offer, SiteSettings } from '../../types';

interface OffersBannerProps {
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  settings?: SiteSettings | null;
}

export const OffersBanner: React.FC<OffersBannerProps> = ({ offers, settings }) => {
  const offer = offers && offers.length > 0 ? offers[0] : null;
  const eyebrowText = settings?.offersEyebrowText || 'Limited Seasonal Atelier Event';
  const codeLabel = settings?.offersCodeLabel || 'Mention code:';

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    if (!offer || !offer.endDate) return;

    const updateCountdown = () => {
      const diff = new Date(offer.endDate).getTime() - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft({ days, hours, minutes });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [offer?.endDate]);

  if (!offer) return null;

  return (
    <section className="my-8 relative overflow-hidden rounded-3xl bg-[#1C1C1C] text-[#FAF9F6] p-6 sm:p-10 border border-[#2A2A2A] shadow-xl">
      {/* Editorial Gold Ambient Glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Editorial Text */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">
              {eyebrowText}
            </span>
          </div>

          <h3 className="font-serif text-2xl sm:text-4xl font-normal text-[#FAF9F6] tracking-tight">
            {offer.title}
          </h3>

          <p className="text-[#A5A29B] text-sm sm:text-base leading-relaxed font-light">
            {offer.description}
          </p>

          {/* Code badge & Countdown */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {offer.code && (
              <div className="flex items-center gap-2 bg-[#2A2A2A] px-4 py-2 rounded-xl border border-[#3D3D3D]">
                <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-[10px] text-[#A5A29B] uppercase tracking-wider">{codeLabel}</span>
                <span className="font-mono text-xs font-bold text-[#FAF9F6]">{offer.code}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[#A5A29B] bg-black/40 px-3.5 py-2 rounded-xl border border-white/5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Ends: <strong>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</strong></span>
            </div>
          </div>
        </div>

        {/* Right Offer Image Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#2A2A2A] border border-white/10 shadow-lg">
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3.5 right-3.5 bg-[#C5A059] text-[#1C1C1C] font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              {offer.discountValue}{offer.discountType === 'PERCENTAGE' ? '% OFF' : '$ OFF'}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
