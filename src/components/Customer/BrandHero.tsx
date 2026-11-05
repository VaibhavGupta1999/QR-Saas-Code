'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { MenuCategoryKey, MoodKey } from '@/types';
import {
  MapPin,
  Clock,
  ChevronDown,
  Check,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  User,
  Flame,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export interface StorySelection {
  id: string;
  title: string;
  tag: string;
  originNote: string;
  elevation: string;
  process: string;
  category: MenuCategoryKey | 'all';
  mood?: MoodKey;
}

interface BrandHeroProps {
  tableNumber: string;
  onOpenProfile?: () => void;
  onSelectStory?: (story: StorySelection) => void;
}

export const BrandHero: React.FC<BrandHeroProps> = ({
  tableNumber,
  onOpenProfile,
  onSelectStory,
}) => {
  const { setCurrentTable, orderType, customerName, orders } = useBrewStudio();
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [activeStory, setActiveStory] = useState<StorySelection | null>(null);

  const availableTables = [
    'Table 01',
    'Table 02',
    'Table 03',
    'Table 04',
    'Table 05',
    'Table 06',
    'Table 07',
    'Table 08',
    'Table 09',
    'Table 10',
    'Takeaway Counter',
  ];

  // Dynamic wait time based on active barista queue
  const estimatedWaitMinutes = useMemo(() => {
    const activeQueueCount = orders.filter(
      (o) => o.status === 'new' || o.status === 'brewing'
    ).length;
    return Math.max(4, Math.min(14, 3 + activeQueueCount * 2));
  }, [orders]);

  const stories: (StorySelection & { img: string })[] = [
    {
      id: 'ratnagiri',
      title: 'Ratnagiri AA',
      tag: 'Honey Process',
      img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=300&q=80',
      originNote:
        'Grown in the Western Ghats under shade canopy. Fermented in cherry mucilage for 48 hours to unlock white peach, jasmine, and sugarcane clarity.',
      elevation: '1,350 MASL · Western Ghats',
      process: 'Yellow Honey · Light-Medium',
      category: 'manual',
    },
    {
      id: 'manual-lab',
      title: 'Manual Brew Lab',
      tag: '93°C Extraction',
      img: '/images/precision_v60_pourover.jpg',
      originNote:
        'Hand-poured on Hario V60 & Inverted AeroPress using remineralized water at 93°C with a 1:16 brew ratio for tea-like aromatics.',
      elevation: 'Small-Batch Filter Roasts',
      process: '1:16 Ratio · 3m 15s Drawdown',
      category: 'manual',
      mood: 'manual',
    },
    {
      id: 'signatures',
      title: 'Studio Signatures',
      tag: 'Cortado & Cold Brew',
      img: '/images/smoked_cinnamon_cortado.jpg',
      originNote:
        'Our house creations featuring torch-smoked Ceylon cinnamon bark, 18-hour cold brew steeped with Chikmagalur AA, and Ceremonial Uji Matcha.',
      elevation: 'Chikmagalur & Uji Kyoto',
      process: 'House Alchemy & Infusions',
      category: 'signatures',
    },
    {
      id: 'bakehouse',
      title: 'Artisanal Bakehouse',
      tag: '27-Layer French Bakes',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80',
      originNote:
        'Laminated in-house every morning at 5:30 AM using cultured Normandy-style butter, dark Valrhona batons, and aged Parmigiano.',
      elevation: 'Baked Fresh at 06:00 AM',
      process: '72-Hour Cold Fermentation',
      category: 'bakehouse',
    },
  ];

  const handleStoryClick = (story: StorySelection) => {
    if (activeStory?.id === story.id) {
      setActiveStory(null);
    } else {
      setActiveStory(story);
      if (onSelectStory) {
        onSelectStory(story);
      }
    }
  };

  return (
    <section className="relative mb-5" aria-label="Brew Studio India café overview">
      {/* Alabaster & Espresso Editorial Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-editorial border border-[#E6DFD5] bg-[#18120F]">
        <div className="relative h-52 sm:h-60 md:h-68 w-full">
          <Image
            src="/images/brew_studio_hero.jpg"
            alt="Brew Studio India Specialty Coffee Roastery & Bakehouse"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover opacity-55 brightness-95 scale-100 hover:scale-102 transition-transform duration-700"
          />
          {/* Deep warm espresso gradient for crystal-clear editorial typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18120F] via-[#18120F]/75 to-[#18120F]/30" />

          {/* Top Contextual Bar: Table/Experience Switcher & Live Telemetry */}
          <div className="absolute top-3.5 left-3.5 right-3.5 sm:top-5 sm:left-6 sm:right-6 flex items-center justify-between gap-2 z-10 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Table Selector Pill */}
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#18120F]/90 backdrop-blur-md border border-[#E6DFD5]/25 text-xs font-mono font-medium text-[#F9F6F0] hover:border-[#B86B35] transition-all shadow-sm group"
                title="Change your table number"
              >
                {orderType === 'DELIVERY' ? (
                  <MapPin className="w-3.5 h-3.5 text-[#B86B35]" />
                ) : orderType === 'TAKEAWAY' ? (
                  <ShoppingBag className="w-3.5 h-3.5 text-[#B86B35]" />
                ) : (
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[#B86B35]" />
                )}
                <span className="font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
                  {orderType === 'DELIVERY'
                    ? 'DELIVERY'
                    : orderType === 'TAKEAWAY'
                    ? 'TAKEAWAY'
                    : `DINE-IN · ${tableNumber.toUpperCase()}`}
                </span>
                <ChevronDown className="w-3 h-3 text-[#D4A373] group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Experience / Guest Identity Pill */}
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#18120F]/85 backdrop-blur-md border border-[#E6DFD5]/20 text-[11px] sm:text-xs font-mono text-[#F9F6F0] hover:border-[#B86B35] transition-all shadow-sm"
                title="Personalize dining mode or guest name"
              >
                <User className="w-3.5 h-3.5 text-[#D4A373]" />
                <span className="font-medium max-w-[110px] truncate">
                  {customerName ? customerName : 'Guest Preferences'}
                </span>
              </button>
            </div>

            {/* Right Group: Live Barista Prep Telemetry */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#18120F]/90 backdrop-blur-md border border-[#28664B]/60 text-[11px] sm:text-xs font-mono text-[#F9F6F0] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse shrink-0" />
              <Clock className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
              <span className="hidden sm:inline text-[#F9F6F0]/80">Roastery Bar</span>
              <span className="text-[#D4A373] font-semibold tabular-nums">
                ~{estimatedWaitMinutes}m wait
              </span>
            </div>
          </div>

          {/* Bottom Editorial Headline & Origin Provenance */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-mono text-[#D4A373] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B86B35]" />
                Small-Lot Indian Arabica &amp; Artisanal Boulangerie
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#F9F6F0] leading-none">
                  Brew Studio India
                </h1>
                <p className="text-xs sm:text-sm text-[#E6DFD5]/80 mt-1.5 max-w-xl leading-relaxed hidden sm:block">
                  Precision-extracted Ratnagiri &amp; Chikmagalur single-origins paired with 27-layer laminated French bakes.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-[#F9F6F0]/85 shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[#D4A373] font-medium">
                  LOT #26 · 93°C POUR
                </span>
                <span className="hidden md:inline text-white/40">•</span>
                <span className="hidden md:inline text-[#E6DFD5]/80">Indiranagar &amp; Bandra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Craft & Origin Stories Rail */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 bg-[#211A16] border-t border-[#E6DFD5]/10 overflow-x-auto no-scrollbar flex items-center gap-2.5 sm:gap-3">
          <div className="text-[10px] uppercase font-mono tracking-[0.14em] text-[#D4A373] font-bold whitespace-nowrap pr-2.5 border-r border-white/10 shrink-0 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#B86B35]" />
            <span>
              Craft
              <br />
              Notes
            </span>
          </div>

          {stories.map((story) => {
            const isSelected = activeStory?.id === story.id;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleStoryClick(story)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shrink-0 transition-all cursor-pointer group text-left ${
                  isSelected
                    ? 'bg-[#B86B35]/20 border-[#B86B35] ring-1 ring-[#B86B35]/40'
                    : 'bg-[#18120F]/80 border-[#E6DFD5]/12 hover:border-[#B86B35]/60'
                }`}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#B86B35]/40 shrink-0">
                  <Image
                    src={story.img}
                    alt={story.title}
                    fill
                    sizes="32px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F9F6F0] leading-none group-hover:text-[#D4A373] transition-colors flex items-center gap-1">
                    <span>{story.title}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#B86B35]" />}
                  </div>
                  <div className="text-[10px] text-[#9E9083] font-mono leading-none mt-1">
                    {story.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expandable Origin Story Callout Drawer inside Hero */}
        {activeStory && (
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#18120F] border-t border-[#B86B35]/30 text-[#F9F6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#B86B35]/20 border border-[#B86B35]/40 text-[10px] font-mono uppercase tracking-wider text-[#D4A373] font-bold">
                  {activeStory.elevation}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-[#E6DFD5]/80">
                  {activeStory.process}
                </span>
              </div>
              <p className="text-xs text-[#E6DFD5]/90 leading-relaxed pt-0.5">
                {activeStory.originNote}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onSelectStory && (
                <button
                  type="button"
                  onClick={() => onSelectStory(activeStory)}
                  className="px-3 py-1.5 rounded-lg bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filter {activeStory.title}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9E9083] hover:text-white transition-colors"
                aria-label="Close story details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Selector Modal */}
      {showTableModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowTableModal(false)}
        >
          <div
            className="bg-[#18120F] border border-[#E6DFD5]/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-[#F9F6F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#F9F6F0]">
                  Select Table Location
                </h3>
                <p className="text-xs text-[#9E9083] font-mono mt-0.5">
                  Freshly brewed creations will be served to this table
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close table selector"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto no-scrollbar">
              {availableTables.map((t) => {
                const isSelected = tableNumber === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setCurrentTable(t);
                      setShowTableModal(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#B86B35] text-white font-bold shadow-md'
                        : 'bg-[#211A16] text-[#F9F6F0]/80 hover:bg-[#2A221E] hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{t}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowTableModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
            >
              Confirm Table
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
