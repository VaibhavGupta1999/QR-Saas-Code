'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem, RoastLevel } from '@/types';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { Plus, Minus, SlidersHorizontal, Sparkles } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onCustomize,
  onQuickAdd,
}) => {
  const { cart, updateCartQuantity } = useBrewStudio();

  // Check if this item is currently in the guest's cart
  const matchingCartItems = cart.filter((c) => c.menuItem.id === item.id);
  const totalInCart = matchingCartItems.reduce((sum, c) => sum + c.quantity, 0);
  const primaryCartItem = matchingCartItems[matchingCartItems.length - 1];

  const getRoastDotColor = (roast?: RoastLevel) => {
    switch (roast) {
      case 'Light':
        return 'bg-amber-400';
      case 'Light-Medium':
        return 'bg-amber-500';
      case 'Medium':
        return 'bg-[#B86B35]';
      case 'Medium-Dark':
        return 'bg-[#7C3F19]';
      case 'Dark':
        return 'bg-[#18120F]';
      default:
        return 'bg-[#8C7E71]';
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-[#18120F]/90 text-[#F9F6F0] border border-[#D4A373]/40';
      case "Barista's Pick":
        return 'bg-[#28664B]/95 text-white border border-white/15';
      case 'Trending on IG':
        return 'bg-[#211A16]/90 text-[#D4A373] border border-[#D4A373]/40';
      case 'New':
        return 'bg-[#B86B35] text-white';
      case 'Chef Special':
        return 'bg-[#18120F]/90 text-[#F9F6F0]';
      default:
        return 'bg-[#18120F]/90 text-white';
    }
  };

  return (
    <article
      className={`group relative rounded-2xl bg-white border border-[#E6DFD5] overflow-hidden shadow-editorial hover:shadow-editorial-hover hover:border-[#B86B35]/50 transition-all duration-300 flex flex-col justify-between ${
        !item.isAvailable ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      {/* 1. Uncluttered Food Photography with 4:3 Editorial Aspect Ratio */}
      <div
        onClick={() => {
          if (item.isAvailable && item.allowsCustomization) {
            onCustomize(item);
          }
        }}
        className={`relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1] ${
          item.isAvailable && item.allowsCustomization ? 'cursor-pointer' : ''
        }`}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-104 transition-transform duration-500"
        />

        {/* Subtle top gradient only for badge legibility (bottom of photo stays 100% clean) */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Top Row: Editorial Badge (Left) & FSSAI Dietary Emblem (Right) */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 flex items-center justify-between pointer-events-none">
          <div>
            {item.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold tracking-wider uppercase shadow-xs backdrop-blur-xs flex items-center gap-1 ${getBadgeStyle(
                  item.badge
                )}`}
              >
                <Sparkles className="w-2.5 h-2.5 text-[#D4A373] shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-none">{item.badge}</span>
              </span>
            )}
          </div>

          {/* Standard Indian FSSAI Vegetarian / Non-Vegetarian Emblem */}
          <div className="shrink-0 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-[#E6DFD5]">
            <span
              className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-xs border flex items-center justify-center ${
                item.isVeg ? 'border-[#28664B]' : 'border-[#B91C1C]'
              }`}
              title={item.isVeg ? '100% Pure Vegetarian' : 'Contains Egg / Non-Veg'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.isVeg ? 'bg-[#28664B]' : 'bg-[#B91C1C]'
                }`}
              />
            </span>
          </div>
        </div>

        {/* Sold Out Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-[#18120F]/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-10">
            <span className="px-3 py-1 rounded-lg bg-[#211A16] border border-[#B86B35]/40 text-[#F9F6F0] font-editorial text-xs font-bold tracking-wider uppercase shadow-md mb-1">
              86 · Sold Out Today
            </span>
            <p className="text-[10px] text-[#D4A373] font-mono">
              Fresh Batch Tomorrow 08:00 AM
            </p>
          </div>
        )}
      </div>

      {/* 2. Clean Technical Telemetry Strip & Editorial Product Copy */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Technical Roast & Energy Strip (Moved off the image for clean visual hierarchy) */}
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-[#8C7E71] uppercase tracking-wider mb-1.5">
            {item.roastLevel ? (
              <span className="flex items-center gap-1.5 truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${getRoastDotColor(
                    item.roastLevel
                  )}`}
                />
                <span className="truncate">{item.roastLevel} Roast</span>
              </span>
            ) : (
              <span className="truncate">{item.categoryName}</span>
            )}
            <span className="shrink-0 tabular-nums">{item.calories} kcal</span>
          </div>

          {/* Title & Tabular Price Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-sans text-[13px] sm:text-base font-bold text-[#18120F] group-hover:text-[#B86B35] transition-colors leading-snug line-clamp-2">
              {item.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-mono text-[13px] sm:text-base font-bold text-[#18120F] tabular-nums">
                ₹{item.price}
              </span>
              {item.originalPrice && (
                <div className="font-mono text-[10px] text-[#8C7E71] line-through leading-none tabular-nums">
                  ₹{item.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Appetizing Description */}
          <p className="text-[11px] sm:text-xs text-[#5C5148] leading-relaxed mb-2.5 line-clamp-2">
            {item.description}
          </p>

          {/* Tasting Notes Pills */}
          {item.tastingNotes && item.tastingNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tastingNotes.slice(0, 3).map((note, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#F2ECE1] border border-[#E6DFD5] text-[10px] font-mono text-[#5C5148]"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Dual-Mode Action Bar with In-Card Stepper & 1-Tap Quick Add */}
        <div className="pt-2.5 border-t border-[#E6DFD5] flex items-center justify-between gap-1.5 mt-auto">
          {!item.isAvailable ? (
            <button
              type="button"
              disabled
              className="w-full py-1.5 rounded-xl bg-[#F2ECE1] text-[#8C7E71] text-xs font-mono cursor-not-allowed"
            >
              Currently Unavailable
            </button>
          ) : totalInCart > 0 && primaryCartItem ? (
            /* Item is already in cart: Show In-Card Stepper + Optional Customize */
            <div className="w-full flex items-center justify-between gap-1.5">
              {item.allowsCustomization ? (
                <button
                  type="button"
                  onClick={() => onCustomize(item)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD5] text-[#18120F] text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Customize another cup"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#B86B35]" />
                  <span className="hidden sm:inline">Customize</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-[#28664B] font-semibold pl-1">
                  In Ticket
                </span>
              )}

              <div className="flex items-center gap-1.5 bg-[#18120F] text-[#F9F6F0] rounded-xl px-2 py-1 shadow-xs ml-auto">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(primaryCartItem.cartItemId, -1)}
                  className="p-1 text-[#D4A373] hover:text-white transition-colors"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono text-xs font-bold w-4 text-center tabular-nums">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(primaryCartItem.cartItemId, 1)}
                  className="p-1 text-[#D4A373] hover:text-white transition-colors"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : item.allowsCustomization ? (
            /* Customizable Drink: Offer both "Customize" AND 1-Tap "+ Add" */
            <div className="w-full flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => onCustomize(item)}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD5] border border-[#E6DFD5] text-[#18120F] text-[11px] sm:text-xs font-semibold transition-all active:scale-95"
                aria-label={`Customize ${item.name}`}
              >
                <SlidersHorizontal className="w-3 h-3 text-[#B86B35] shrink-0" />
                <span>Customize</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickAdd(item)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
                aria-label={`Quick add standard ${item.name} to order`}
                title="Quick-add standard house recipe"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          ) : (
            /* Direct Bakehouse / Non-Customizable Item */
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[11px] text-[#8C7E71] font-mono truncate hidden sm:inline">
                Fresh Bakehouse
              </span>
              <button
                type="button"
                onClick={() => onQuickAdd(item)}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-all active:scale-95 ml-auto"
                aria-label={`Add ${item.name} to order`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
