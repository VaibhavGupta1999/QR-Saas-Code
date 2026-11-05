'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { MenuItem, MenuCategoryKey, RoastLevel, Station } from '@/types';
import {
  Search,
  Plus,
  Sparkles,
  Check,
  X,
  Coffee,
  UtensilsCrossed,
  Edit2,
} from 'lucide-react';

export const MenuManager: React.FC = () => {
  const {
    menuItems,
    toggleItemAvailability,
    toggleItemFeatured,
    updateItemPrice,
    addMenuItem,
  } = useBrewStudio();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<MenuCategoryKey | 'all'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Add Item Modal state (Fixed default category to 'hot-coffee' matching initialMenu.ts)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<MenuCategoryKey>('hot-coffee');
  const [newItemPrice, setNewItemPrice] = useState<string>('249');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemImage, setNewItemImage] = useState<string>(
    '/images/smoked_cinnamon_cortado.jpg'
  );
  const [newItemRoast, setNewItemRoast] = useState<RoastLevel>('Medium');
  const [newItemNotes, setNewItemNotes] = useState<string>('Caramel, Cocoa, Almond');
  const [newItemIsVeg, setNewItemIsVeg] = useState<boolean>(true);
  const [newItemStation, setNewItemStation] = useState<Station>('barista');

  const stockStats = useMemo(() => {
    const total = menuItems.length;
    const inStock = menuItems.filter((i) => i.isAvailable).length;
    const soldOut = total - inStock;
    const featured = menuItems.filter((i) => i.isFeatured).length;
    return { total, inStock, soldOut, featured };
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'signatures') {
        if (!item.isFeatured && item.category !== 'signatures') return false;
      } else if (item.category !== categoryFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tastingNotes.some((n) => n.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setTempPrice(String(item.price));
  };

  const handleSavePrice = (itemId: string) => {
    const p = parseInt(tempPrice, 10);
    if (!isNaN(p) && p > 0) {
      updateItemPrice(itemId, p);
    }
    setEditingPriceId(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const notes = newItemNotes
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    addMenuItem({
      name: newItemName.trim(),
      category: newItemCategory,
      categoryName:
        newItemCategory === 'hot-coffee'
          ? 'Hot Coffee'
          : newItemCategory === 'iced-coffee'
          ? 'Iced Coffee'
          : newItemCategory === 'manual'
          ? 'Manual Brew'
          : newItemCategory === 'non-coffee'
          ? 'Non-Coffee'
          : newItemCategory === 'signatures'
          ? 'Studio Signatures'
          : 'Artisanal Bakehouse',
      price: parseInt(newItemPrice, 10) || 199,
      description:
        newItemDesc.trim() || 'Artisanal creation crafted with precision.',
      image: newItemImage.trim() || '/images/smoked_cinnamon_cortado.jpg',
      badge: 'New',
      tastingNotes: notes.length > 0 ? notes : ['Specialty Roast', 'Smooth Finish'],
      roastLevel: newItemStation === 'barista' ? newItemRoast : undefined,
      caffeineIntensity: newItemStation === 'barista' ? 4 : 1,
      calories: 140,
      isVeg: newItemIsVeg,
      isAvailable: true,
      isFeatured: newItemCategory === 'signatures',
      station: newItemStation,
      moods: ['all', newItemStation === 'barista' ? 'high-caffeine' : 'food'],
      allowsCustomization: newItemStation === 'barista',
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemDesc('');
  };

  return (
    <div className="rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian p-4 sm:p-6 mb-8 text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A221E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#F5F0E6]">
              Menu Engineering &amp; Real-Time 86 Stock Control
            </h2>
            <span className="px-2.5 py-0.5 rounded-md bg-[#B86B35]/20 text-[#D4A373] border border-[#B86B35]/30 font-mono text-[10px] font-bold tabular-nums">
              {menuItems.length} SKUs
            </span>
          </div>
          <p className="text-xs text-[#9E9083] font-mono mt-0.5">
            Instant 86 stock toggles and price updates broadcast live across all guest QR phones
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-mono font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Seasonal Offering</span>
        </button>
      </div>

      {/* Stock & Catalog Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9E9083]">Total Catalog</span>
          <span className="font-mono text-base font-bold text-[#F5F0E6] tabular-nums">
            {stockStats.total}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9E9083]">In Stock</span>
          <span className="font-mono text-base font-bold text-[#34D399] tabular-nums">
            {stockStats.inStock}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9E9083]">86 / Sold Out</span>
          <span
            className={`font-mono text-base font-bold tabular-nums ${
              stockStats.soldOut > 0 ? 'text-red-400' : 'text-[#9E9083]'
            }`}
          >
            {stockStats.soldOut}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9E9083]">Featured ★</span>
          <span className="font-mono text-base font-bold text-[#D4A373] tabular-nums">
            {stockStats.featured}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9083]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offerings by name, tasting notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-[#F5F0E6] placeholder:text-[#9E9083] focus:outline-none focus:border-[#B86B35]"
          />
        </div>

        {/* Synchronized Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'all', label: 'All SKUs' },
              { key: 'signatures', label: '★ Signatures' },
              { key: 'hot-coffee', label: 'Hot Coffee' },
              { key: 'iced-coffee', label: 'Iced Coffee' },
              { key: 'manual', label: 'Manual Lab' },
              { key: 'non-coffee', label: 'Matcha & Craft' },
              { key: 'bakehouse', label: 'Bakehouse' },
            ] as const
          ).map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoryFilter(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                categoryFilter === c.key
                  ? 'bg-[#B86B35] text-white font-bold'
                  : 'bg-[#211A16] text-[#9E9083] hover:text-white border border-[#2A221E]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Mobile Cards Feed */}
      <div className="space-y-3 sm:hidden mt-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl bg-[#211A16] border transition-all ${
              !item.isAvailable
                ? 'opacity-70 border-red-900/40 bg-red-950/10'
                : 'border-[#2A221E]'
            }`}
          >
            <div className="flex items-start gap-3 mb-2.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#2A221E]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-[#F5F0E6] text-xs font-sans truncate">
                    {item.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => toggleItemFeatured(item.id)}
                    className={`p-1 rounded-lg shrink-0 ${
                      item.isFeatured
                        ? 'text-[#D4A373] bg-[#B86B35]/20'
                        : 'text-white/20'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#9E9083] font-mono">
                  {item.station === 'barista' ? (
                    <Coffee className="w-3 h-3 text-[#D4A373]" />
                  ) : (
                    <UtensilsCrossed className="w-3 h-3 text-[#34D399]" />
                  )}
                  <span>{item.categoryName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2A221E] text-xs font-mono">
              <div>
                {editingPriceId === item.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-16 px-1.5 py-0.5 rounded bg-[#0F0C0A] border border-[#B86B35] text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePrice(item.id)}
                      className="p-1 rounded bg-[#28664B] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPriceId(null)}
                      className="p-1 rounded bg-white/10 text-white/60"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEditPrice(item)}
                    className="flex items-center gap-1 font-bold text-[#F5F0E6] hover:text-[#D4A373] tabular-nums"
                  >
                    <span>₹{item.price}</span>
                    <Edit2 className="w-3 h-3 text-[#B86B35]" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleItemAvailability(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  item.isAvailable
                    ? 'bg-[#28664B]/20 text-[#34D399] border border-[#28664B]/40'
                    : 'bg-red-600/20 text-red-400 border border-red-600/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isAvailable ? 'bg-[#34D399]' : 'bg-red-500'
                  }`}
                />
                <span>{item.isAvailable ? 'In Stock' : '86 / Sold Out'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop/Tablet Menu Table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#2A221E] mt-2">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#211A16] text-[#9E9083] font-mono uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Offering &amp; Tasting Profile</th>
              <th className="py-3 px-4">Category &amp; KDS Station</th>
              <th className="py-3 px-4">Live Price (₹)</th>
              <th className="py-3 px-4 text-center">86 Stock Status</th>
              <th className="py-3 px-4 text-center">Spotlight ★</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A221E] bg-[#171210] font-mono">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-[#211A16]/70 transition-colors ${
                  !item.isAvailable ? 'opacity-60 bg-red-950/10' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#2A221E]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-[#F5F0E6] leading-tight flex items-center gap-1.5 font-sans">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#B86B35]/20 text-[#D4A373]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#9E9083] mt-0.5">
                        {item.tastingNotes.join(' • ')}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-[#F5F0E6]/85">
                  <div className="flex items-center gap-1.5">
                    {item.station === 'barista' ? (
                      <Coffee className="w-3.5 h-3.5 text-[#D4A373]" />
                    ) : (
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#34D399]" />
                    )}
                    <span>{item.categoryName}</span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  {editingPriceId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-[#0F0C0A] border border-[#B86B35] text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePrice(item.id)}
                        className="p-1 rounded bg-[#28664B] text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPriceId(null)}
                        className="p-1 rounded bg-white/10 text-white/60 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditPrice(item)}
                      className="group/price flex items-center gap-1.5 font-bold text-[#F5F0E6] hover:text-[#D4A373] transition-colors tabular-nums"
                      title="Click to edit live price"
                    >
                      <span>₹{item.price}</span>
                      <Edit2 className="w-3 h-3 opacity-40 group-hover/price:opacity-100 transition-opacity text-[#B86B35]" />
                    </button>
                  )}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      item.isAvailable
                        ? 'bg-[#28664B]/20 text-[#34D399] border border-[#28664B]/40 hover:bg-[#28664B]/30'
                        : 'bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isAvailable ? 'bg-[#34D399]' : 'bg-red-500'
                      }`}
                    />
                    <span>{item.isAvailable ? 'In Stock' : '86 / Sold Out'}</span>
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleItemFeatured(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isFeatured
                        ? 'text-[#D4A373] bg-[#B86B35]/20 border border-[#B86B35]/40'
                        : 'text-white/20 hover:text-white/60'
                    }`}
                    title="Toggle Studio Signatures spotlight status"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Menu Item Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#171210] border border-[#2A221E] rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl text-[#F5F0E6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2A221E] mb-4">
              <h3 className="font-editorial text-lg font-bold text-[#F5F0E6]">
                Add Seasonal Roast or Bakehouse Offering
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/50 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    Offering Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Cardamom Honey Flat White"
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="249"
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    Menu Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) =>
                      setNewItemCategory(e.target.value as MenuCategoryKey)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  >
                    <option value="hot-coffee">Hot Coffee</option>
                    <option value="iced-coffee">Iced Coffee</option>
                    <option value="manual">Manual Brew Lab</option>
                    <option value="non-coffee">Matcha &amp; Craft</option>
                    <option value="bakehouse">Artisanal Bakehouse</option>
                    <option value="signatures">Studio Signatures</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    KDS Prep Station
                  </label>
                  <select
                    value={newItemStation}
                    onChange={(e) => setNewItemStation(e.target.value as Station)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  >
                    <option value="barista">Espresso &amp; Pour-Over Bar</option>
                    <option value="kitchen">Bakehouse Oven &amp; Kitchen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                  Editorial Description
                </label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Describe origin estate, extraction method, tasting profile..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    Tasting Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    placeholder="Jasmine, Honey, Citrus"
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#9E9083] block mb-1">
                    Roast Profile
                  </label>
                  <select
                    value={newItemRoast}
                    onChange={(e) => setNewItemRoast(e.target.value as RoastLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-white focus:outline-none focus:border-[#B86B35]"
                  >
                    <option value="Light">Light</option>
                    <option value="Light-Medium">Light-Medium</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium-Dark">Medium-Dark</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2A221E]">
                <label className="flex items-center gap-2 text-xs font-mono text-[#F5F0E6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemIsVeg}
                    onChange={(e) => setNewItemIsVeg(e.target.checked)}
                    className="accent-[#28664B]"
                  />
                  <span>100% Pure Vegetarian</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-mono font-bold"
                  >
                    Publish to Live Menu
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
