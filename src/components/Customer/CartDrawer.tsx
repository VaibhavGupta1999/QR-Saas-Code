'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useBrewStudio } from '@/context/BrewStudioContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  CreditCard,
  QrCode,
  User,
  Phone,
  MapPin,
  UtensilsCrossed,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    clearCart,
    placeOrder,
    currentTable,
    setCurrentTable,
    menuItems,
    addToCart,
    customerName,
    customerPhone,
    orderType,
    deliveryAddress,
    updateCustomerProfile,
  } = useBrewStudio();

  const [guestName, setGuestName] = useState<string>(customerName || 'Aarav Sharma');
  const [guestPhone, setGuestPhone] = useState<string>(customerPhone || '+91 98765 43210');
  const [selectedTable, setSelectedTable] = useState<string>(currentTable);
  const [selectedOrderType, setSelectedOrderType] = useState<import('@/types').OrderType>(
    orderType || 'DINE_IN'
  );
  const [delivAddress, setDelivAddress] = useState<string>(deliveryAddress || '');
  const [paymentMode, setPaymentMode] = useState<'upi_counter' | 'instant_upi'>('instant_upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM'>('GPay');
  const [isEditingGuestDetails, setIsEditingGuestDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Sync state from context when drawer opens
  React.useEffect(() => {
    if (customerName) setGuestName(customerName);
    if (customerPhone) setGuestPhone(customerPhone);
    if (orderType) setSelectedOrderType(orderType);
    if (deliveryAddress) setDelivAddress(deliveryAddress);
    if (currentTable) setSelectedTable(currentTable);
  }, [customerName, customerPhone, orderType, deliveryAddress, currentTable, isOpen]);

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

  // Dynamic pairing recommendations derived from items currently in the cart
  const suggestedPairings = useMemo(() => {
    const cartItemIds = new Set(cart.map((c) => c.menuItem.id));
    const recommendedIds = new Set<string>();

    cart.forEach((c) => {
      c.menuItem.pairingItemIds?.forEach((pid) => {
        if (!cartItemIds.has(pid)) {
          recommendedIds.add(pid);
        }
      });
    });

    const dynamicMatches = menuItems.filter(
      (item) => recommendedIds.has(item.id) && item.isAvailable
    );

    if (dynamicMatches.length >= 2) {
      return dynamicMatches.slice(0, 3);
    }

    // Fallback to available bakehouse classics not already in cart
    const fallbackBakehouse = menuItems.filter(
      (item) =>
        item.category === 'bakehouse' &&
        item.isAvailable &&
        !cartItemIds.has(item.id) &&
        !recommendedIds.has(item.id)
    );

    return [...dynamicMatches, ...fallbackBakehouse].slice(0, 3);
  }, [cart, menuItems]);

  const tax = Math.round(cartSubtotal * 0.05); // 5% Hospitality GST
  const grandTotal = cartSubtotal + tax;

  const upiDeepLink = `upi://pay?pa=brewstudio@okhdfcbank&pn=Brew%20Studio%20India&am=${grandTotal}&cu=INR`;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (!guestName.trim()) {
      setIsEditingGuestDetails(true);
      setValidationError('Please enter your name for the order ticket');
      return;
    }

    const cleanPhone = guestPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setIsEditingGuestDetails(true);
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#B86B35', '#D4A373', '#28664B', '#F9F6F0'],
      });
    } catch {
      // Graceful fallback
    }

    const formattedPhone =
      cleanPhone.length === 10 ? `+91 ${cleanPhone}` : guestPhone.trim();
    const finalTable = selectedTable || currentTable;
    if (selectedOrderType === 'DINE_IN') {
      setCurrentTable(finalTable);
    }

    updateCustomerProfile({
      name: guestName.trim(),
      phone: formattedPhone,
      orderType: selectedOrderType,
      deliveryAddress: delivAddress.trim(),
      tableNumber: finalTable,
    });

    setTimeout(() => {
      placeOrder(
        guestName.trim(),
        formattedPhone,
        finalTable,
        paymentMode,
        selectedOrderType,
        delivAddress.trim()
      );
      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  return (
    <>
      {/* 1. Compact Floating Bottom Cart Bar */}
      {cartCount > 0 && !isOpen && (
        <aside
          className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto"
          aria-label="Floating cart summary"
        >
          <button
            type="button"
            onClick={onOpen}
            className="w-full p-3 sm:p-3.5 rounded-2xl bg-[#18120F]/95 backdrop-blur-md border border-[#E6DFD5]/20 text-[#F9F6F0] shadow-float flex items-center justify-between hover:bg-[#18120F] transition-all group active:scale-98"
            aria-label={`View order ticket with ${cartCount} items totaling ₹${grandTotal}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#D4A373] shadow-inner">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#B86B35]" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#B86B35] text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs tabular-nums">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-editorial font-bold text-[#F9F6F0]">
                  Review Order Ticket
                </div>
                <div className="text-[11px] text-[#D4A373] font-mono">
                  {selectedOrderType === 'DINE_IN'
                    ? selectedTable || currentTable
                    : selectedOrderType === 'TAKEAWAY'
                    ? 'Takeaway Pickup'
                    : 'Delivery'}{' '}
                  • {cartCount} item{cartCount > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="font-mono text-base font-bold text-[#F9F6F0] tabular-nums block leading-none">
                  ₹{grandTotal}
                </span>
                <span className="text-[9px] font-mono text-[#9E9083] uppercase">
                  Incl. 5% GST
                </span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#D4A373]" />
              </div>
            </div>
          </button>
        </aside>
      )}

      {/* 2. Slide-up Cart & Express UPI Checkout Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        >
          <div
            className="w-full sm:max-w-xl max-h-[92vh] bg-[#F9F6F0] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E6DFD5]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#18120F] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#B86B35]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="cart-drawer-title"
                    className="font-editorial text-lg sm:text-xl font-bold text-[#F9F6F0]"
                  >
                    Your Order Ticket
                  </h2>
                  <div className="text-[11px] text-[#D4A373] font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B86B35]" />
                    <span>
                      {selectedOrderType === 'DINE_IN'
                        ? `Serving to ${selectedTable || currentTable}`
                        : selectedOrderType === 'TAKEAWAY'
                        ? 'Takeaway Counter Pickup'
                        : 'Express Doorstep Delivery'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    title="Clear entire cart"
                    className="p-1.5 text-white/50 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Clear all items in cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-[#5C5148]">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B86B35]" />
                  <p className="font-editorial text-lg font-bold text-[#18120F]">
                    Your order ticket is empty
                  </p>
                  <p className="text-xs mt-1">
                    Explore single-origins, studio signatures, or fresh bakes to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map((cItem) => (
                    <div
                      key={cItem.cartItemId}
                      className="p-3 rounded-2xl bg-white border border-[#E6DFD5] shadow-editorial flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F2ECE1]">
                          <Image
                            src={cItem.menuItem.image}
                            alt={cItem.menuItem.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs sm:text-[13px] font-bold text-[#18120F] leading-snug">
                            {cItem.menuItem.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#B86B35] font-semibold mt-0.5 tabular-nums">
                            ₹{cItem.unitPrice} each
                          </div>

                          {/* Customization Details */}
                          {cItem.customization && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#F9F6F0] text-[10px] font-mono text-[#18120F] border border-[#E6DFD5]">
                                {cItem.customization.temperature}
                              </span>
                              {cItem.customization.bean.price > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#F9F6F0] text-[10px] font-mono text-[#B86B35] border border-[#E6DFD5]">
                                  {cItem.customization.bean.name}
                                </span>
                              )}
                              {cItem.customization.milk.price > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#F9F6F0] text-[10px] font-mono text-[#28664B] border border-[#E6DFD5]">
                                  {cItem.customization.milk.name}
                                </span>
                              )}
                              {cItem.customization.boosters.map((b, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-[#F9F6F0] text-[10px] font-mono text-[#5C5148] border border-[#E6DFD5]"
                                >
                                  +{b.name}
                                </span>
                              ))}
                              {cItem.customization.specialNote && (
                                <span className="w-full text-[10px] text-[#5C5148] italic mt-0.5 block">
                                  &ldquo;{cItem.customization.specialNote}&rdquo;
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#18120F] tabular-nums">
                          ₹{cItem.totalPrice}
                        </span>

                        <div className="flex items-center gap-1 bg-[#F9F6F0] border border-[#E6DFD5] rounded-xl p-0.5 mt-2">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(cItem.cartItemId, -1)}
                            className="p-1 text-[#5C5148] hover:text-[#18120F] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold w-4 text-center tabular-nums">
                            {cItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(cItem.cartItemId, 1)}
                            className="p-1 text-[#5C5148] hover:text-[#18120F] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Sommelier & Bakehouse Pairings */}
              {cart.length > 0 && suggestedPairings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F2ECE1] border border-[#E6DFD5]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#18120F]">
                      <Sparkles className="w-3.5 h-3.5 text-[#B86B35]" />
                      <span>Recommended Pairings for Your Cup</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#5C5148]">Fresh Bakes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestedPairings.map((pairItem) => (
                      <div
                        key={pairItem.id}
                        className="p-2 rounded-xl bg-white border border-[#E6DFD5] flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#F9F6F0]">
                            <Image
                              src={pairItem.image}
                              alt={pairItem.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate">
                            <div className="text-[11px] font-semibold text-[#18120F] truncate">
                              {pairItem.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#B86B35] tabular-nums">
                              ₹{pairItem.price}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(pairItem)}
                          className="px-2 py-1 rounded-lg bg-[#F9F6F0] hover:bg-[#B86B35] hover:text-white border border-[#B86B35]/30 text-[#B86B35] text-[10px] font-bold shrink-0 transition-colors"
                          aria-label={`Add ${pairItem.name} to order`}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streamlined Guest Identity & Dining Mode */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-1">
                  {validationError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Compact Guest Summary Bar (Expandable on click) */}
                  {!isEditingGuestDetails && guestName.trim() && guestPhone.trim() ? (
                    <div className="p-3 rounded-2xl bg-white border border-[#E6DFD5] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F2ECE1] flex items-center justify-center text-[#18120F] shrink-0">
                          <User className="w-4 h-4 text-[#B86B35]" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#18120F] truncate">
                            {guestName} • <span className="font-mono font-normal text-[#5C5148]">{guestPhone}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#28664B] flex items-center gap-1.5 mt-0.5">
                            <span>
                              {selectedOrderType === 'DINE_IN'
                                ? `Dine-In · ${selectedTable}`
                                : selectedOrderType === 'TAKEAWAY'
                                ? 'Takeaway Pickup'
                                : `Delivery · ${delivAddress || 'Set Address'}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingGuestDetails(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F2ECE1] hover:bg-[#E6DFD5] text-[#18120F] text-[11px] font-mono font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-[#B86B35]" />
                        <span>Edit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#18120F] font-bold">
                          Guest &amp; Table Details
                        </span>
                        {guestName.trim() && guestPhone.trim() && (
                          <button
                            type="button"
                            onClick={() => setIsEditingGuestDetails(false)}
                            className="text-[11px] font-mono text-[#B86B35] font-semibold hover:underline"
                          >
                            Done
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1">
                            Your Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C7E71]" />
                            <input
                              type="text"
                              required
                              value={guestName}
                              onChange={(e) => {
                                setGuestName(e.target.value);
                                if (validationError) setValidationError('');
                              }}
                              placeholder="e.g. Aarav Sharma"
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E6DFD5] text-xs text-[#18120F] focus:outline-none focus:border-[#B86B35]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C7E71]" />
                            <input
                              type="tel"
                              required
                              value={guestPhone}
                              onChange={(e) => {
                                setGuestPhone(e.target.value);
                                if (validationError) setValidationError('');
                              }}
                              placeholder="e.g. 9876543210"
                              maxLength={15}
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E6DFD5] text-xs text-[#18120F] focus:outline-none focus:border-[#B86B35]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Experience Selector */}
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1">
                          Dining Experience
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F2ECE1] border border-[#E6DFD5]">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderType('DINE_IN')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              selectedOrderType === 'DINE_IN'
                                ? 'bg-white text-[#18120F] shadow-2xs'
                                : 'text-[#5C5148] hover:text-[#18120F]'
                            }`}
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5 text-[#B86B35]" />
                            <span>Dine-In</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderType('TAKEAWAY')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              selectedOrderType === 'TAKEAWAY'
                                ? 'bg-white text-[#18120F] shadow-2xs'
                                : 'text-[#5C5148] hover:text-[#18120F]'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#B86B35]" />
                            <span>Takeaway</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderType('DELIVERY')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              selectedOrderType === 'DELIVERY'
                                ? 'bg-white text-[#18120F] shadow-2xs'
                                : 'text-[#5C5148] hover:text-[#18120F]'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#B86B35]" />
                            <span>Delivery</span>
                          </button>
                        </div>
                      </div>

                      {selectedOrderType === 'DINE_IN' && (
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1">
                            Table Number
                          </label>
                          <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E6DFD5] text-xs font-mono font-semibold text-[#18120F] focus:outline-none focus:border-[#B86B35]"
                          >
                            {availableTables.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {selectedOrderType === 'DELIVERY' && (
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1">
                            Delivery Street Address
                          </label>
                          <input
                            type="text"
                            value={delivAddress}
                            onChange={(e) => setDelivAddress(e.target.value)}
                            placeholder="Flat / Villa, 100 Feet Road, Indiranagar"
                            className="w-full px-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E6DFD5] text-xs text-[#18120F] focus:outline-none focus:border-[#B86B35]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Mode Selector */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5C5148] font-bold block mb-1.5">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('instant_upi')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMode === 'instant_upi'
                            ? 'bg-white border-[#28664B] ring-2 ring-[#28664B]/20 shadow-2xs'
                            : 'bg-white/70 border-[#E6DFD5]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#28664B]/15 flex items-center justify-center text-[#28664B] shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#18120F]">
                            Instant UPI
                          </div>
                          <div className="text-[10px] text-[#28664B] font-mono font-semibold">
                            GPay · PhonePe · Paytm
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('upi_counter')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMode === 'upi_counter'
                            ? 'bg-white border-[#B86B35] ring-2 ring-[#B86B35]/20 shadow-2xs'
                            : 'bg-white/70 border-[#E6DFD5]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#B86B35]/15 flex items-center justify-center text-[#B86B35] shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#18120F]">
                            Pay at Counter
                          </div>
                          <div className="text-[10px] text-[#5C5148] font-mono">
                            Card / Cash / Table Bill
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Direct UPI Intent App Selector when Instant UPI is active */}
                    {paymentMode === 'instant_upi' && (
                      <div className="mt-2 p-3 rounded-xl bg-white border border-[#28664B]/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#28664B] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Merchant: brewstudio@okhdfcbank</span>
                          </span>
                          <a
                            href={upiDeepLink}
                            className="font-mono text-[10px] text-[#B86B35] hover:underline font-semibold"
                          >
                            Open UPI App ↗
                          </a>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['GPay', 'PhonePe', 'Paytm', 'BHIM'] as const).map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setSelectedUpiApp(app)}
                              className={`py-1.5 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                                selectedUpiApp === app
                                  ? 'bg-[#18120F] text-[#F9F6F0] border-[#18120F]'
                                  : 'bg-[#F9F6F0] text-[#5C5148] border-[#E6DFD5] hover:border-[#18120F]'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bill Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#5C5148]">
                      <span>Items Subtotal</span>
                      <span className="font-mono tabular-nums">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#5C5148]">
                      <span>Hospitality GST (2.5% CGST + 2.5% SGST)</span>
                      <span className="font-mono tabular-nums">₹{tax}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E6DFD5] flex justify-between font-bold text-[#18120F] text-sm">
                      <span>Grand Total</span>
                      <span className="font-mono text-base text-[#B86B35] tabular-nums">
                        ₹{grandTotal}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border-t border-[#E6DFD5] shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#18120F] hover:bg-[#B86B35] text-white font-bold text-sm shadow-xl flex items-center justify-between transition-all duration-200 active:scale-98 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    {isSubmitting
                      ? 'Broadcasting to Barista KDS...'
                      : paymentMode === 'instant_upi'
                      ? `Pay via ${selectedUpiApp} & Send to Barista`
                      : 'Confirm & Send to Barista'}
                  </span>
                  <span className="font-mono text-base bg-white/15 px-3 py-0.5 rounded-xl tabular-nums">
                    ₹{grandTotal}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
