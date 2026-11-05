'use client';

import React from 'react';
import { MoodKey, MenuCategoryKey } from '@/types';
import { Search, X, RotateCcw } from 'lucide-react';

interface MoodCompassProps {
  activeMood: MoodKey;
  onSelectMood: (mood: MoodKey) => void;
  activeCategory: MenuCategoryKey | 'all';
  onSelectCategory: (category: MenuCategoryKey | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVegOnly: boolean;
  onToggleVeg: () => void;
}

export const MoodCompass: React.FC<MoodCompassProps> = ({
  activeMood,
  onSelectMood,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVeg,
}) => {
  // Synchronized 100% with initialMenu.ts categories + 'signatures' spotlight filter
  const categories: { key: MenuCategoryKey | 'all'; label: string }[] = [
    { key: 'all', label: 'All Offerings' },
    { key: 'signatures', label: '★ Signatures' },
    { key: 'hot-coffee', label: 'Hot Coffee' },
    { key: 'iced-coffee', label: 'Iced & Cold Brew' },
    { key: 'manual', label: 'Manual Brew Lab' },
    { key: 'non-coffee', label: 'Matcha & Craft' },
    { key: 'bakehouse', label: 'Artisanal Bakehouse' },
  ];

  const tasteProfiles: { key: MoodKey; label: string }[] = [
    { key: 'all', label: 'All Profiles' },
    { key: 'high-caffeine', label: 'High Caffeine' },
    { key: 'cold', label: 'Cold & Crisp' },
    { key: 'sweet', label: 'Sweet & Velvety' },
    { key: 'manual', label: 'Single-Origin Filter' },
    { key: 'food', label: 'Bakehouse & Savory' },
  ];

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeMood !== 'all' ||
    activeCategory !== 'all' ||
    isVegOnly;

  return (
    <nav
      className="sticky top-12 z-30 glass-alabaster pt-2.5 pb-2.5 mb-5 border-b border-[#E6DFD5] transition-all duration-200"
      aria-label="Menu filtering and category navigation"
    >
      {/* Row 1: Search Bar & FSSAI Pure Veg Toggle */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C7E71]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Cortado, V60, Matcha, Croissant, tasting notes..."
            className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-white border border-[#E6DFD5] text-xs sm:text-[13px] text-[#18120F] placeholder:text-[#8C7E71] focus:outline-none focus:border-[#B86B35] focus:ring-1 focus:ring-[#B86B35] transition-all shadow-xs"
            aria-label="Search menu"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8C7E71] hover:text-[#18120F]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* FSSAI Pure Veg Filter */}
        <button
          type="button"
          onClick={onToggleVeg}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            isVegOnly
              ? 'bg-[#28664B] text-white border-[#28664B] shadow-xs'
              : 'bg-white text-[#18120F] border-[#E6DFD5] hover:border-[#28664B]'
          }`}
          title="Filter 100% Pure Vegetarian items"
          aria-pressed={isVegOnly}
        >
          <span
            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
              isVegOnly ? 'border-white bg-[#28664B]' : 'border-[#28664B] bg-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isVegOnly ? 'bg-white' : 'bg-[#28664B]'
              }`}
            />
          </span>
          <span className="font-sans text-xs">
            Pure Veg
          </span>
        </button>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onSelectMood('all');
              onSelectCategory('all');
              onSearchChange('');
              if (isVegOnly) onToggleVeg();
            }}
            className="p-2 rounded-xl bg-white border border-[#E6DFD5] text-[#5C5148] hover:text-[#B86B35] hover:border-[#B86B35] transition-colors shrink-0"
            title="Reset all filters"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row 2: Synchronized Category Navigation Pills */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-2 border-b border-[#E6DFD5]/70">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-[#18120F] text-[#F9F6F0] font-semibold shadow-xs'
                  : 'text-[#5C5148] hover:text-[#18120F] hover:bg-[#F2ECE1]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: Taste Profile / Mood Sub-Filters */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 pt-2">
        <span className="text-[10px] uppercase font-mono tracking-[0.12em] text-[#8C7E71] font-semibold pl-0.5 pr-1 shrink-0">
          Palate:
        </span>
        {tasteProfiles.map((mood) => {
          const isSelected = activeMood === mood.key;
          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => onSelectMood(mood.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#B86B35]/15 text-[#B86B35] font-bold border border-[#B86B35]/40'
                  : 'text-[#5C5148] hover:text-[#18120F] hover:bg-[#F2ECE1]/70 border border-transparent'
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
