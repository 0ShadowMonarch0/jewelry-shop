import React from 'react';

// Shown in place of the whole storefront while the initial data fetch
// (settings/categories/products) is in flight, so a page refresh never
// flashes the hardcoded fallback copy (e.g. Hero's default headline) before
// swapping to the real admin-configured content a moment later.
export const StorefrontSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F3] flex flex-col font-sans animate-pulse">

      {/* Header bar */}
      <div className="w-full border-b border-[#DADADA] bg-[#F4F4F3]/95">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#DADADA]"></div>
            <div className="hidden sm:block w-24 h-3 bg-[#DADADA]"></div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-2.5 bg-[#DADADA]"></div>
            <div className="w-16 h-2.5 bg-[#DADADA]"></div>
            <div className="w-10 h-2.5 bg-[#DADADA]"></div>
            <div className="w-12 h-2.5 bg-[#DADADA]"></div>
          </div>
          <div className="w-24 h-9 bg-[#DADADA]"></div>
        </div>
      </div>

      {/* Hero block */}
      <div className="w-full min-h-[420px] sm:min-h-[600px] bg-[#ECECEC] flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-40 h-2.5 bg-[#DADADA]"></div>
        <div className="w-72 sm:w-96 h-8 sm:h-10 bg-[#DADADA]"></div>
        <div className="w-56 sm:w-80 h-3 bg-[#DADADA]"></div>
        <div className="flex items-center gap-3 pt-2">
          <div className="w-32 h-11 bg-[#DADADA]"></div>
          <div className="w-32 h-11 bg-[#DADADA]"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full py-8 space-y-8">

        {/* Category pills row */}
        <div className="space-y-4">
          <div className="w-40 h-5 bg-[#ECECEC]"></div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-28 h-10 bg-[#ECECEC] flex-shrink-0"></div>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="masonry-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="masonry-item space-y-3">
              <div className="bg-[#ECECEC] aspect-[4/5] w-full"></div>
              <div className="h-4 bg-[#ECECEC] w-3/4"></div>
              <div className="h-3 bg-[#ECECEC] w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
