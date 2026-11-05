'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, CustomizationOptions } from '@/types';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { X, Plus, Minus, Check, Sparkles, MessageSquare, Flame, Snowflake } from 'lucide-react';

interface BaristaCustomizerProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    customization: CustomizationOptions,
    quantity: number
  ) => void;
}

export const BaristaCustomizer: React.FC<BaristaCustomizerProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { menuItems, addToCart, cart } = useBrewStudio();

  const [temperature, setTemperature] = useState<'Hot 🔥' | 'Iced 🧊'>('Hot 🔥');
  const [bean, setBean] = useState<{ name: string; price: number }>({
    name: 'Studio House Blend (Chikmagalur AA)',
    price: 0,
  });
  const [milk, setMilk] = useState<{ name: string; price: number }>({
    name: 'Whole Farm Milk',
    price: 0,
  });
  const [sweetness, setSweetness] = useState<{ name: string; price: number }>({
    name: 'Barista Balanced (50%)',
    price: 0,
  });
  const [boosters, setBoosters] = useState<{ name: string; price: number }[]>([]);
  const [specialNote, setSpecialNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedPairingIds, setAddedPairingIds] = useState<string[]>([]);

  // Reset customization state cleanly whenever a new item is opened
  useEffect(() => {
    if (!item) return;
    const isNaturallyIced =
      item.category === 'iced-coffee' ||
      item.name.toLowerCase().includes('iced') ||
      item.name.toLowerCase().includes('cold') ||
      item.name.toLowerCase().includes('tonic');

    setTemperature(isNaturallyIced ? 'Iced 🧊' : 'Hot 🔥');
    setBean({
      name:
        item.category === 'manual'
          ? 'Ratnagiri Estate Honey Single-Origin'
          : 'Studio House Blend (Chikmagalur AA)',
      price: 0,
    });
    setMilk({
      name: 'Whole Farm Milk',
      price: 0,
    });
    setSweetness({
      name: 'Barista Balanced (50%)',
      price: 0,
    });
    setBoosters([]);
    setSpecialNote('');
    setQuantity(1);
    setAddedPairingIds([]);
  }, [item]);

  // Available options
  const beanOptions = [
    {
      name: 'Studio House Blend (Chikmagalur AA)',
      shortLabel: 'Chikmagalur AA',
      price: 0,
      desc: 'Balanced dark cocoa, toasted hazelnut & velvet crema',
    },
    {
      name: 'Ratnagiri Estate Honey Single-Origin',
      shortLabel: 'Ratnagiri Honey',
      price: 40,
      desc: 'High-elevation floral aroma, white peach & jasmine clarity',
    },
    {
      name: 'Swiss Water Decaf Arabica',
      shortLabel: 'Swiss Decaf',
      price: 30,
      desc: '99.9% caffeine-free chemical-free process, full body',
    },
  ];

  const milkOptions = [
    { name: 'Whole Farm Milk', shortLabel: 'Farm Dairy', price: 0, desc: 'Rich, silky micro-foam' },
    { name: 'Barista Oat Milk (Oatly)', shortLabel: 'Oatly Oat', price: 60, desc: 'Creamy plant-based oat' },
    { name: 'Artisanal Almond Milk', shortLabel: 'Almond Milk', price: 60, desc: 'Light roasted nut profile' },
    { name: 'Black / No Milk', shortLabel: 'Black / Pure', price: 0, desc: 'Pure single-origin clarity' },
  ];

  const sweetnessOptions = [
    { name: 'Unsweetened (0%)', sub: 'Pure coffee notes', price: 0 },
    { name: 'Barista Balanced (50%)', sub: 'Recommended craft ratio', price: 0 },
    { name: 'Regular Sweet (100%)', sub: 'Classic cafe sweetness', price: 0 },
    { name: 'Organic Jaggery Syrup', sub: 'Unrefined cane nectar', price: 25 },
  ];

  const boosterOptions = [
    { name: 'Extra Espresso Ristretto Shot', sub: 'Double caffeine kick', price: 50 },
    { name: 'Sea-Salt Vanilla Cold Foam', sub: 'Velvety salted cream cap', price: 45 },
    { name: 'House Roasted Hazelnut Infusion', sub: 'Warm praline aroma', price: 40 },
    { name: 'Torch-Smoked Ceylon Cinnamon', sub: 'Aromatic spice finish', price: 0 },
  ];

  const toggleBooster = (b: { name: string; price: number }) => {
    setBoosters((prev) => {
      const exists = prev.some((existing) => existing.name === b.name);
      if (exists) {
        return prev.filter((existing) => existing.name !== b.name);
      } else {
        return [...prev, b];
      }
    });
  };

  // Dynamic sensory profile calculation
  const sensoryProfile = useMemo(() => {
    const isRatnagiri = bean.name.includes('Ratnagiri');
    const isOat = milk.name.includes('Oat');
    const isBlack = milk.name.includes('Black');
    const isUnsweetened = sweetness.name.includes('0%');
    const isSweet = sweetness.name.includes('100%') || sweetness.name.includes('Jaggery');

    return {
      acidity: isRatnagiri ? 82 : 48,
      body: isBlack ? 52 : isOat ? 88 : 78,
      sweetness: isUnsweetened ? 28 : isSweet ? 86 : 58,
    };
  }, [bean.name, milk.name, sweetness.name]);

  // Recommended pairings for this item
  const pairingItems = useMemo(() => {
    if (!item?.pairingItemIds || item.pairingItemIds.length === 0) return [];
    return menuItems.filter(
      (m) => item.pairingItemIds?.includes(m.id) && m.isAvailable
    );
  }, [item, menuItems]);

  // Dynamic price calculation
  const calculatedUnitPrice = useMemo(() => {
    if (!item) return 0;
    const boosterTotal = boosters.reduce((acc, curr) => acc + curr.price, 0);
    return item.price + bean.price + milk.price + sweetness.price + boosterTotal;
  }, [item, bean, milk, sweetness, boosters]);

  const totalCalculatedPrice = calculatedUnitPrice * quantity;

  if (!isOpen || !item) return null;

  const activeBeanShort =
    beanOptions.find((b) => b.name === bean.name)?.shortLabel || 'House Blend';
  const activeMilkShort =
    milkOptions.find((m) => m.name === milk.name)?.shortLabel || 'Farm Dairy';

  const handleConfirm = () => {
    onAddToCart(
      item,
      {
        temperature,
        bean,
        milk,
        sweetness,
        boosters,
        specialNote: specialNote.trim(),
      },
      quantity
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[560px] max-h-[92vh] bg-[#FAF6F0] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E2D6C5]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customizer-title"
      >
        {/* 1. EDITORIAL HERO HEADER */}
        <div className="relative h-44 sm:h-52 w-full bg-[#18120F] shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140E0B] via-[#140E0B]/65 to-black/25" />

          {/* Top Bar: Badge & Close Button */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-[#18120F]/85 backdrop-blur-md border border-[#D4A373]/40 text-[11px] font-sans font-bold uppercase tracking-[0.14em] text-[#E6C29F] flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              Barista Dial-In Sheet
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/65 hover:bg-black text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close customizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Hero Content: Product Name, Base Specs & Live Recipe Pill */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-xs sm:text-[13px] font-sans font-medium text-[#E6DFD5] tracking-wide">
                Base <strong className="text-white font-bold">₹{item.price}</strong> · {item.calories} kcal · {item.roastLevel || 'Medium'} Roast
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-[#B86B35]/30 backdrop-blur-md border border-[#D4A373]/50 text-[11px] font-sans font-bold text-[#FDE6C4] uppercase tracking-wider">
                {temperature.replace(' 🔥', '').replace(' 🧊', '')} · {activeBeanShort} · {activeMilkShort}
              </span>
            </div>

            <h2
              id="customizer-title"
              className="font-editorial text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight"
            >
              {item.name}
            </h2>
          </div>
        </div>

        {/* 2. HIGH-CONTRAST SENSORY TELEMETRY STRIP */}
        <div className="px-5 py-3 bg-[#F2EAE0] border-b border-[#E2D6C5] grid grid-cols-3 gap-4 shrink-0">
          {[
            { label: 'Acidity', value: sensoryProfile.acidity },
            { label: 'Body & Crema', value: sensoryProfile.body },
            { label: 'Sweetness', value: sensoryProfile.sweetness },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-sans mb-1.5">
                <span className="font-bold uppercase tracking-wider text-[#3B2D23]">
                  {stat.label}
                </span>
                <span className="font-mono font-extrabold text-[#18120F] tabular-nums">
                  {stat.value}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#DFD3C3] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8C4A1C] to-[#C87A3B] rounded-full transition-all duration-300"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 3. SCROLLABLE CUSTOMIZATION STEPS (Clean hidden scrollbar) */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-6 flex-1">
          {/* STEP 01: SERVING TEMPERATURE */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#231812] text-[#F5EDE3] font-mono text-[11px] font-bold">
                  01
                </span>
                <h3 className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E]">
                  Serving Temperature
                </h3>
              </div>
              <span className="text-[11px] font-sans font-semibold text-[#7A685A]">
                Select one
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['Hot 🔥', 'Iced 🧊'] as const).map((temp) => {
                const isSelected = temperature === temp;
                const isHot = temp.startsWith('Hot');
                return (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperature(temp)}
                    className={`py-3.5 px-4 rounded-2xl text-sm sm:text-[15px] font-sans font-bold flex items-center justify-between border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E140E] text-white border-[#B86B35] shadow-md'
                        : 'bg-white text-[#231812] border-[#E4D9C8] hover:border-[#B86B35]/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isHot ? (
                        <Flame className={`w-4 h-4 ${isSelected ? 'text-[#F4A261]' : 'text-[#B86B35]'}`} />
                      ) : (
                        <Snowflake className={`w-4 h-4 ${isSelected ? 'text-[#93C5FD]' : 'text-[#3B82F6]'}`} />
                      )}
                      <span>{isHot ? 'Hot' : 'Iced'}</span>
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#B86B35] border-[#B86B35] text-white'
                          : 'border-[#C8B9A6] bg-[#FAF6F0]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 02: SINGLE-ORIGIN / BLEND BEAN */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#231812] text-[#F5EDE3] font-mono text-[11px] font-bold">
                  02
                </span>
                <h3 className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E]">
                  Single-Origin / Blend Bean
                </h3>
              </div>
              <span className="text-[11px] font-sans font-semibold text-[#7A685A]">
                Freshly ground to order
              </span>
            </div>

            <div className="space-y-2.5">
              {beanOptions.map((b) => {
                const isSelected = bean.name === b.name;
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setBean({ name: b.name, price: b.price })}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border-2 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B86B35] shadow-md ring-2 ring-[#B86B35]/15'
                        : 'bg-white/90 border-[#E4D9C8] hover:border-[#C8B59E] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Tactile Radio Circle */}
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#B86B35] border-[#B86B35] text-white'
                            : 'border-[#C5B4A0] bg-[#FAF6F0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>

                      <div className="min-w-0">
                        <div className="text-sm sm:text-[15px] font-sans font-bold text-[#18120F] leading-snug">
                          {b.name}
                        </div>
                        <div className="text-xs sm:text-[13px] font-sans text-[#5A483B] leading-relaxed mt-0.5">
                          {b.desc}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold shrink-0 tabular-nums ${
                        b.price === 0
                          ? isSelected
                            ? 'bg-[#231812] text-[#F5EDE3]'
                            : 'bg-[#F2EAE0] text-[#5A483B]'
                          : 'bg-[#F7DFCE] text-[#9A4E1C]'
                      }`}
                    >
                      {b.price === 0 ? 'Included' : `+₹${b.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 03: MILK CRAFT & TEXTURE */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#231812] text-[#F5EDE3] font-mono text-[11px] font-bold">
                  03
                </span>
                <h3 className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E]">
                  Milk Craft &amp; Texture
                </h3>
              </div>
              <span className="text-[11px] font-sans font-semibold text-[#7A685A]">
                Steamed to 65°C
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {milkOptions.map((m) => {
                const isSelected = milk.name === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMilk({ name: m.name, price: m.price })}
                    className={`p-3.5 rounded-2xl text-left border-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B86B35] shadow-md ring-2 ring-[#B86B35]/15'
                        : 'bg-white/90 border-[#E4D9C8] hover:border-[#C8B59E] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#B86B35] border-[#B86B35] text-white'
                            : 'border-[#C5B4A0] bg-[#FAF6F0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] sm:text-sm font-sans font-bold text-[#18120F] leading-snug">
                          {m.name}
                        </div>
                        <div className="text-xs font-sans text-[#5A483B] mt-0.5">
                          {m.desc}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold shrink-0 tabular-nums ${
                        m.price === 0
                          ? 'bg-[#F2EAE0] text-[#5A483B]'
                          : 'bg-[#F7DFCE] text-[#9A4E1C]'
                      }`}
                    >
                      {m.price === 0 ? 'Included' : `+₹${m.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 04: SWEETNESS CALIBRATION */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#231812] text-[#F5EDE3] font-mono text-[11px] font-bold">
                  04
                </span>
                <h3 className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E]">
                  Sweetness Calibration
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sweetnessOptions.map((s) => {
                const isSelected = sweetness.name === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSweetness({ name: s.name, price: s.price })}
                    className={`p-3.5 rounded-2xl text-left border-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E140E] text-white border-[#B86B35] shadow-md'
                        : 'bg-white text-[#18120F] border-[#E4D9C8] hover:border-[#B86B35]/60'
                    }`}
                  >
                    <div>
                      <div className="text-[13px] sm:text-sm font-sans font-bold leading-snug">
                        {s.name}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-[#D4A373]' : 'text-[#6B5A4D]'
                        }`}
                      >
                        {s.sub}
                      </div>
                    </div>

                    {s.price > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#F7DFCE] text-[#9A4E1C] font-mono text-xs font-bold shrink-0">
                        +₹{s.price}
                      </span>
                    ) : (
                      isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#B86B35] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 05: BARISTA EXTRACTION BOOSTERS */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#231812] text-[#F5EDE3] font-mono text-[11px] font-bold">
                  05
                </span>
                <h3 className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E]">
                  Extraction Boosters
                </h3>
              </div>
              <span className="text-[11px] font-sans font-semibold text-[#7A685A]">
                Optional · Multi-select
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {boosterOptions.map((booster) => {
                const isSelected = boosters.some((b) => b.name === booster.name);
                return (
                  <button
                    key={booster.name}
                    type="button"
                    onClick={() => toggleBooster({ name: booster.name, price: booster.price })}
                    className={`p-3.5 rounded-2xl text-left border-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#B86B35] shadow-md ring-2 ring-[#B86B35]/15'
                        : 'bg-white/90 border-[#E4D9C8] hover:border-[#C8B59E]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#B86B35] border-[#B86B35] text-white'
                            : 'border-[#C5B4A0] bg-[#FAF6F0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] sm:text-sm font-sans font-bold text-[#18120F] leading-snug">
                          {booster.name}
                        </div>
                        <div className="text-xs font-sans text-[#5A483B] mt-0.5">
                          {booster.sub}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-[#F7DFCE] text-[#9A4E1C] font-mono text-xs font-bold shrink-0 tabular-nums">
                      {booster.price === 0 ? 'Free' : `+₹${booster.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 06: SOMMELIER BAKEHOUSE PAIRING */}
          {pairingItems.length > 0 && (
            <section className="p-4 rounded-2xl bg-[#F2EAE0] border border-[#DFD2C0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-wider text-[#1E140E] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B86B35]" />
                  Chef&apos;s Pairing Recommendation
                </span>
                <span className="text-[11px] font-sans font-semibold text-[#6B5A4D]">
                  1-Tap Add
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pairingItems.map((pair) => {
                  const isAdded =
                    addedPairingIds.includes(pair.id) ||
                    cart.some((c) => c.menuItem.id === pair.id);
                  return (
                    <div
                      key={pair.id}
                      className="p-2.5 rounded-xl bg-white border border-[#E4D9C8] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#F2EAE0]">
                          <Image
                            src={pair.image}
                            alt={pair.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-[13px] font-sans font-bold text-[#18120F] truncate">
                            {pair.name}
                          </div>
                          <div className="text-xs font-mono text-[#9A4E1C] font-bold tabular-nums">
                            +₹{pair.price}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(pair);
                          setAddedPairingIds((prev) => [...prev, pair.id]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold shrink-0 transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-[#28664B] text-white'
                            : 'bg-[#1E140E] hover:bg-[#B86B35] text-white'
                        }`}
                      >
                        {isAdded ? '✓ Added' : '+ Pair'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 07: BARISTA PREPARATION NOTE */}
          <section>
            <label
              htmlFor="barista-special-note"
              className="text-xs sm:text-[13px] font-sans font-extrabold uppercase tracking-[0.08em] text-[#1E140E] flex items-center gap-2 mb-2"
            >
              <MessageSquare className="w-4 h-4 text-[#B86B35]" />
              <span>06 · Special Barista Instructions</span>
            </label>
            <input
              id="barista-special-note"
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Extra warm 68°C silky micro-foam, light cinnamon dust..."
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#E4D9C8] text-sm font-sans text-[#18120F] placeholder:text-[#8C7E71] focus:outline-none focus:border-[#B86B35] transition-colors"
            />
          </section>
        </div>

        {/* 4. STICKY ACTION FOOTER */}
        <div className="px-5 py-3.5 bg-white border-t border-[#E4D9C8] flex items-center justify-between gap-3 shrink-0 shadow-[0_-8px_24px_rgba(24,18,15,0.06)]">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 px-3 h-12 rounded-2xl bg-[#F5EDE3] border border-[#DDD0C0]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3B2D23] hover:bg-[#E5D8C7] transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="font-mono text-base font-extrabold text-[#1E140E] w-6 text-center tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3B2D23] hover:bg-[#E5D8C7] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Primary Add to Ticket CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 px-5 rounded-2xl bg-[#1E140E] hover:bg-[#2C1E16] text-white font-sans text-sm sm:text-[15px] font-bold flex items-center justify-between shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <span>Add Custom Cup to Ticket</span>
            <span className="font-mono text-sm font-extrabold bg-[#B86B35] text-white px-3 py-1 rounded-xl tabular-nums shadow-2xs">
              ₹{totalCalculatedPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
