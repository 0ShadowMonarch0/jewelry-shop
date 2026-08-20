import React from 'react';
import type { Category, SiteSettings } from '../../types';

interface CategoryPillsProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  settings?: SiteSettings | null;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  settings
}) => {
  const heading = settings?.categoriesHeading || 'Curated Categories';
  const showAllText = settings?.categoriesShowAllText || 'Show All Curations';
  const allPillLabel = settings?.categoriesAllPillLabel || 'All Atelier';
  // Sub-categories are browsable from the header's Collections menu; this
  // row stays to top-level categories only so it doesn't get overcrowded.
  const topLevelCategories = categories.filter(c => !c.parentId);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#C5A059]"></div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1C1C] tracking-tight">
            {heading}
          </h2>
        </div>
        {activeCategoryId && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] hover:underline"
          >
            {showAllText}
          </button>
        )}
      </div>

      {/* Horizontal scroll on mobile (swipeable pill row); wraps to multiple
          lines from sm+ so pills never get clipped at the viewport edge. */}
      <div className="flex items-center sm:flex-wrap gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        
        {/* 'All' Visual Pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 flex items-center gap-3 pr-5 pl-2.5 py-1.5 rounded-full border transition-all ${
            activeCategoryId === null
              ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-xs'
              : 'bg-white text-[#1C1C1C] border-[#E5E3DB] hover:border-[#C5A059]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#F0EFEC] flex items-center justify-center font-serif text-xs font-bold text-[#1C1C1C]">
            ✦
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] font-medium whitespace-nowrap">
            {allPillLabel}
          </span>
        </button>

        {/* Dynamic Categories */}
        {topLevelCategories.map((cat) => {
          const isSelected = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex-shrink-0 flex items-center gap-3 pr-5 pl-2 py-1.5 rounded-full border transition-all ${
                isSelected
                  ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-xs'
                  : 'bg-white text-[#1C1C1C] border-[#E5E3DB] hover:border-[#C5A059]'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F0EFEC] flex-shrink-0 border border-black/5">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[11px] uppercase tracking-[0.18em] font-medium whitespace-nowrap">
                  {cat.name}
                </span>
                {cat.productCount !== undefined && (
                  <span className={`text-[9px] -mt-0.5 ${isSelected ? 'text-[#C5A059]' : 'text-[#777]'}`}>
                    {cat.productCount} {cat.productCount === 1 ? 'piece' : 'pieces'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
