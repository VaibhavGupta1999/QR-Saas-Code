'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { MenuItem, MenuCategoryKey, MoodKey } from '@/types';
import { INITIAL_MENU_ITEMS } from '@/data/initialMenu';
import { BrandHero, StorySelection } from '@/components/Customer/BrandHero';
import { MoodCompass } from '@/components/Customer/MoodCompass';
import { MenuCard } from '@/components/Customer/MenuCard';
import { BaristaCustomizer } from '@/components/Customer/BaristaCustomizer';
import { CartDrawer } from '@/components/Customer/CartDrawer';
import { LiveOrderTracker } from '@/components/Customer/LiveOrderTracker';
import { CustomerOnboardingModal } from '@/components/Customer/CustomerOnboardingModal';
import { Coffee, Sparkles, Plus, SlidersHorizontal } from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const modalParam = searchParams.get('modal');
  const trackerParam = searchParams.get('tracker');
  const heroParam = searchParams.get('hero');
  const onboardingParam = searchParams.get('onboarding');
  const welcomeParam = searchParams.get('welcome');
  const stepParam = searchParams.get('step');

  const {
    menuItems,
    currentTable,
    setCurrentTable,
    addToCart,
    cart,
    orders,
    activeOrder,
    setActiveOrderById,
    orderType,
  } = useBrewStudio();

  // Frictionless QR entry: Only open Onboarding Modal when explicitly requested via URL or Guest Preferences pill
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (modalParam === 'cart' || modalParam === 'customizer' || trackerParam === 'true') {
      return false;
    }
    if (welcomeParam === 'true' || onboardingParam === 'true') {
      return true;
    }
    return false;
  });
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(() => {
    return stepParam === '2' ? 2 : 1;
  });

  useEffect(() => {
    if (modalParam === 'cart' || modalParam === 'customizer' || trackerParam === 'true') {
      return;
    }
    if (welcomeParam === 'true' || onboardingParam === 'true') {
      setIsOnboardingOpen(true);
      if (stepParam === '2') setOnboardingStep(2);
    }
  }, [modalParam, trackerParam, welcomeParam, onboardingParam, stepParam]);

  // Set table from query param if provided (preserves ?table=04)
  useEffect(() => {
    if (tableParam) {
      const formattedTable = tableParam.toLowerCase().includes('table')
        ? tableParam
        : `Table ${tableParam}`;
      setCurrentTable(formattedTable);
    }
  }, [tableParam, setCurrentTable]);

  // Handle tracker query param
  useEffect(() => {
    if (trackerParam === 'true') {
      const order = orders.find((o) => o.tableNumber === currentTable) || orders[0];
      if (order) {
        setActiveOrderById(order.id);
      }
    } else if (trackerParam === 'false') {
      setActiveOrderById(null);
    }
  }, [trackerParam, currentTable, orders, setActiveOrderById]);

  // Filters state
  const [activeMood, setActiveMood] = useState<MoodKey>('all');
  const [activeCategory, setActiveCategory] = useState<MenuCategoryKey | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);

  // Customizer state
  const [selectedItemForCustomizer, setSelectedItemForCustomizer] =
    useState<MenuItem | null>(() => {
      if (modalParam === 'customizer') {
        return (
          INITIAL_MENU_ITEMS.find((i) => i.id === 'smoked-cinnamon-cortado') ||
          INITIAL_MENU_ITEMS[0]
        );
      }
      return null;
    });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(
    () => modalParam === 'customizer'
  );

  // Cart Drawer state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(() => modalParam === 'cart');

  // Handle URL query modal triggers
  useEffect(() => {
    if (modalParam === 'customizer') {
      const targetItem =
        menuItems.find((i) => i.id === 'smoked-cinnamon-cortado') || menuItems[0];
      if (targetItem) {
        setSelectedItemForCustomizer(targetItem);
        setIsCustomizerOpen(true);
      }
    } else if (modalParam === 'cart') {
      if (cart.length === 0 && menuItems.length > 0) {
        addToCart(menuItems[0], {
          temperature: 'Hot 🔥',
          bean: { name: 'Studio House Blend (Chikmagalur AA)', price: 0 },
          milk: { name: 'Barista Oat Milk (Oatly)', price: 60 },
          sweetness: { name: 'Unsweetened (0%)', price: 0 },
          boosters: [],
          specialNote: 'Extra hot micro-foam',
        });
        const croissant = menuItems.find((i) => i.id === 'french-butter-croissant');
        if (croissant) addToCart(croissant);
      }
      setIsCartOpen(true);
    }
  }, [modalParam, menuItems, cart.length, addToCart]);

  // Featured Studio Signatures for the editorial spotlight rail
  const featuredSignatures = useMemo(() => {
    return menuItems.filter((item) => item.isFeatured && item.isAvailable);
  }, [menuItems]);

  // Filtered Items logic (with full support for 'signatures' virtual category)
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Mood filter
      if (activeMood !== 'all' && !item.moods.includes(activeMood)) {
        return false;
      }
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'signatures') {
          if (!item.isFeatured && item.category !== 'signatures') {
            return false;
          }
        } else if (item.category !== activeCategory) {
          return false;
        }
      }
      // Veg filter
      if (isVegOnly && !item.isVeg) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesNotes = item.tastingNotes?.some((n) =>
          n.toLowerCase().includes(query)
        );
        const matchesCategory = item.categoryName?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesNotes && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, activeMood, activeCategory, isVegOnly, searchQuery]);

  // Structured luxury categories configuration
  const categoriesList: {
    key: MenuCategoryKey;
    title: string;
    subtitle: string;
    originTag: string;
  }[] = [
    {
      key: 'hot-coffee',
      title: 'Hot Coffee & Espresso Bar',
      subtitle:
        'Precision double-ristrettos, velvety Flat Whites, and torch-smoked Cortados pulled with Chikmagalur AA Arabica',
      originTag: 'Chikmagalur AA · 9-Bar Extraction',
    },
    {
      key: 'iced-coffee',
      title: 'Iced Coffee & Slow Cold Brews',
      subtitle:
        '18-hour small-lot cold brews, Spanish condensed-milk lattes, and botanical citrus espresso tonics',
      originTag: '18-Hour Steep & Artisanal Ice',
    },
    {
      key: 'manual',
      title: 'Manual Brew Filter Lab',
      subtitle:
        'Single-origin Ratnagiri honey-processed lots hand-extracted via Hario V60, Inverted AeroPress & French Press',
      originTag: 'Ratnagiri Estate · 1,350 MASL',
    },
    {
      key: 'non-coffee',
      title: 'Ceremonial Matcha & Craft Elixirs',
      subtitle:
        'First-harvest Uji Kyoto matcha lattes, 70% Belgian dark hot chocolate, and cold-pressed watermelon mint fizz',
      originTag: 'Uji Kyoto & Single-Origin Cacao',
    },
    {
      key: 'bakehouse',
      title: 'Artisanal Bakehouse & Savory Plates',
      subtitle:
        '27-layer Normandy-butter croissants, caramelized Basque cheesecakes, and black-truffle sourdough melts',
      originTag: 'Laminated Fresh at 05:30 AM',
    },
  ];

  const isFiltering =
    Boolean(searchQuery) ||
    activeMood !== 'all' ||
    activeCategory !== 'all' ||
    isVegOnly;

  const handleStorySelect = (story: StorySelection) => {
    setActiveCategory(story.category);
    if (story.mood) {
      setActiveMood(story.mood);
    } else {
      setActiveMood('all');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-6 pb-28 pt-2 sm:pt-3">
      {/* Brand Hero & Table Context */}
      {heroParam === 'compact' ? (
        <div className="mb-4 p-4 rounded-2xl bg-[#18120F] border border-[#E6DFD5]/30 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#B86B35] font-editorial font-bold text-lg">
              BS
            </div>
            <div>
              <div className="font-editorial text-lg sm:text-2xl font-bold text-[#F9F6F0] leading-none">
                Brew Studio India
              </div>
              <div className="text-xs font-mono text-[#D4A373] mt-1 font-medium">
                Specialty Coffee Lab &amp; Bakehouse •{' '}
                {orderType === 'DELIVERY'
                  ? 'Delivery'
                  : orderType === 'TAKEAWAY'
                  ? 'Takeaway'
                  : currentTable}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOnboardingStep(2);
              setIsOnboardingOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-[#B86B35]/20 border border-[#B86B35]/40 text-[#D4A373] font-mono text-xs font-bold hover:bg-[#B86B35]/30 transition-colors"
          >
            {orderType === 'DELIVERY'
              ? 'Delivery'
              : orderType === 'TAKEAWAY'
              ? 'Takeaway'
              : currentTable}
          </button>
        </div>
      ) : (
        <BrandHero
          tableNumber={currentTable}
          onOpenProfile={() => {
            setOnboardingStep(1);
            setIsOnboardingOpen(true);
          }}
          onSelectStory={handleStorySelect}
        />
      )}

      {/* Live Order Tracker (Displays when guest has an active order or tracker=true) */}
      {(trackerParam === 'true' ||
        (activeOrder && activeOrder.tableNumber === currentTable)) && (
        <LiveOrderTracker />
      )}

      {/* Sticky Editorial Discovery Navigation */}
      <MoodCompass
        activeMood={activeMood}
        onSelectMood={setActiveMood}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVegOnly={isVegOnly}
        onToggleVeg={() => setIsVegOnly(!isVegOnly)}
      />

      {/* Active Filter Metadata Bar */}
      {isFiltering && (
        <div className="mb-4 flex items-center justify-between text-xs text-[#5C5148] font-mono px-1">
          <span>
            Showing <strong className="text-[#18120F]">{filteredItems.length}</strong>{' '}
            curated offerings
            {activeCategory !== 'all' ? ` in ${activeCategory.replace('-', ' ')}` : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              setActiveMood('all');
              setActiveCategory('all');
              setSearchQuery('');
              setIsVegOnly(false);
            }}
            className="text-[#B86B35] hover:underline font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E6DFD5] p-6 shadow-editorial">
          <Coffee className="w-10 h-10 mx-auto text-[#B86B35] opacity-40 mb-3" />
          <h3 className="font-editorial text-xl font-bold text-[#18120F]">
            No Matching Creations Found
          </h3>
          <p className="text-xs text-[#5C5148] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            We couldn&apos;t find items matching your current filter criteria. Try searching for a tasting note (Peach, Jasmine, Hazelnut) or view the full roastery menu.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveMood('all');
              setActiveCategory('all');
              setSearchQuery('');
              setIsVegOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Reset Filters &amp; View Full Menu
          </button>
        </div>
      ) : !isFiltering ? (
        /* Unfiltered View: Studio Signatures Spotlight + Categorized Roastery Sections */
        <div className="space-y-10 sm:space-y-12">
          {/* 1. Studio Signatures Spotlight Rail */}
          {featuredSignatures.length > 0 && (
            <section aria-label="Studio Signatures Spotlight">
              <div className="mb-3.5 flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B86B35]" />
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#18120F] tracking-tight">
                    Studio Signatures &amp; Bestsellers
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCategory('signatures')}
                  className="text-[11px] font-mono uppercase tracking-wider text-[#B86B35] font-semibold hover:underline"
                >
                  View All ({featuredSignatures.length}) →
                </button>
              </div>

              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {featuredSignatures.map((sig) => (
                  <div
                    key={sig.id}
                    className="w-[265px] sm:w-[300px] shrink-0 rounded-2xl bg-[#18120F] text-[#F9F6F0] border border-[#2A221E] overflow-hidden shadow-editorial flex flex-col justify-between group"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-[#211A16]">
                      <Image
                        src={sig.image}
                        alt={sig.name}
                        fill
                        sizes="300px"
                        className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18120F] via-transparent to-black/25" />
                      {sig.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#B86B35] text-white text-[9px] font-mono uppercase tracking-wider font-bold shadow-xs">
                          {sig.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2.5 font-mono text-sm font-bold text-[#F9F6F0] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10 tabular-nums">
                        ₹{sig.price}
                      </span>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4A373] mb-0.5">
                          {sig.categoryName}
                        </div>
                        <h3 className="font-sans text-sm font-bold text-[#F9F6F0] leading-snug">
                          {sig.name}
                        </h3>
                        <p className="text-[11px] text-[#E6DFD5]/75 line-clamp-2 mt-1 leading-relaxed">
                          {sig.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        {sig.allowsCustomization ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForCustomizer(sig);
                                setIsCustomizerOpen(true);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F9F6F0] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <SlidersHorizontal className="w-3 h-3 text-[#D4A373]" />
                              <span>Customize</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => addToCart(sig)}
                              className="py-1.5 px-3 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(sig)}
                            className="w-full py-1.5 px-3 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Categorized Roastery & Bakehouse Sections */}
          {categoriesList.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category === cat.key);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.key} id={cat.key} className="scroll-mt-36">
                {/* Category Section Header */}
                <div className="mb-4 sm:mb-5 pb-2.5 border-b border-[#E6DFD5]">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B86B35]" />
                      <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#18120F] tracking-tight">
                        {cat.title}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B86B35] font-semibold">
                      {cat.originTag}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5148] mt-1 max-w-2xl leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Editorial 2-Column Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  {catItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onCustomize={(selected) => {
                        setSelectedItemForCustomizer(selected);
                        setIsCustomizerOpen(true);
                      }}
                      onQuickAdd={(selected) => {
                        addToCart(selected);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Filtered / Searched Grid View */
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onCustomize={(selected) => {
                setSelectedItemForCustomizer(selected);
                setIsCustomizerOpen(true);
              }}
              onQuickAdd={(selected) => {
                addToCart(selected);
              }}
            />
          ))}
        </div>
      )}

      {/* Artisanal Cafe Footer */}
      <footer className="mt-16 sm:mt-20 text-center border-t border-[#E6DFD5] pt-8 pb-4 text-xs text-[#5C5148]">
        <div className="font-editorial text-xl font-bold text-[#18120F] mb-1">
          Brew Studio India
        </div>
        <p className="text-[11px] font-mono text-[#5C5148]">
          Single-Origin Ratnagiri &amp; Chikmagalur Roasts • Handcrafted in Indiranagar &amp; Bandra
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#8C7E71] font-mono">
          <span>Table QR Ordering</span>
          <span>•</span>
          <span>Live Barista KDS Broadcast</span>
          <span>•</span>
          <span>FSSAI &amp; GST Compliant</span>
        </div>
      </footer>

      {/* Barista Customizer Modal */}
      <BaristaCustomizer
        item={selectedItemForCustomizer}
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedItemForCustomizer(null);
        }}
        onAddToCart={(item, custom, qty) => {
          addToCart(item, custom, qty);
          setIsCartOpen(true);
        }}
      />

      {/* Slide-Up Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
      />

      {/* Personalized Welcome & Experience Modal (Triggered on demand or via ?welcome=true) */}
      <CustomerOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialStep={onboardingStep}
        initialTable={currentTable}
        forceOpen={welcomeParam === 'true' || onboardingParam === 'true'}
      />
    </main>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-xs text-[#B86B35]">
          Dialing in Brew Studio Roastery...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
