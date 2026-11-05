'use client';

import React, { useState, useEffect } from 'react';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { OrderType } from '@/types';
import {
  UtensilsCrossed,
  ShoppingBag,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  User,
  Phone,
  ChevronRight,
  X,
} from 'lucide-react';

interface CustomerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 1 | 2;
  initialTable?: string;
  forceOpen?: boolean;
}

export const CustomerOnboardingModal: React.FC<CustomerOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  initialTable,
  forceOpen = false,
}) => {
  const {
    customerName,
    customerPhone,
    orderType,
    deliveryAddress,
    currentTable,
    setCurrentTable,
    completeOnboarding,
    isOnboarded,
  } = useBrewStudio();

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [name, setName] = useState<string>(customerName || 'Aarav Sharma');
  const [phone, setPhone] = useState<string>(
    customerPhone ? customerPhone.replace(/^\+91\s*/, '') : '98765 43210'
  );
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(orderType || 'DINE_IN');
  const [address, setAddress] = useState<string>(deliveryAddress || '');
  const [selectedTable, setSelectedTable] = useState<string>(initialTable || currentTable || 'Table 04');

  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');

  // Sync with context if already present
  useEffect(() => {
    if (customerName) setName(customerName);
    if (customerPhone) setPhone(customerPhone.replace(/^\+91\s*/, ''));
    if (orderType) setSelectedOrderType(orderType);
    if (deliveryAddress) setAddress(deliveryAddress);
    if (currentTable) setSelectedTable(currentTable);
  }, [customerName, customerPhone, orderType, deliveryAddress, currentTable]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep, isOpen]);

  // Handle Screen 1 submission (Validation)
  const handleProceedToExperience = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let hasError = false;

    if (!name.trim()) {
      setNameError('Please enter your full name');
      hasError = true;
    } else {
      setNameError('');
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits) {
      setPhoneError('Please enter your mobile number');
      hasError = true;
    } else if (cleanDigits.length !== 10) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!hasError) {
      setStep(2);
    }
  };

  // Handle Screen 2 submission (Complete Onboarding)
  const handleFinishOnboarding = () => {
    if (selectedOrderType === 'DELIVERY') {
      if (!address.trim()) {
        setAddressError('Please provide a delivery street address');
        return;
      }
      setAddressError('');
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : phone.trim();

    completeOnboarding({
      name: name.trim(),
      phone: formattedPhone,
      orderType: selectedOrderType,
      deliveryAddress: selectedOrderType === 'DELIVERY' ? address.trim() : '',
      tableNumber: selectedOrderType === 'DINE_IN' ? selectedTable : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  // Extract clean table number display (e.g., "04" from "Table 04")
  const tableDigits = selectedTable.replace(/\D/g, '') || '04';

  const availableTables = [
    'Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05',
    'Table 06', 'Table 07', 'Table 08', 'Table 09', 'Table 10'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#120D0A]/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FAF6F0] text-[#201814] shadow-2xl border border-[#E8DED2]">
        {/* Subtle decorative top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#C97943] via-[#D7B18A] to-[#C97943]" />

        {/* Close Button (only when customer is already onboarded and reviewing profile) */}
        {isOnboarded && !forceOpen && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#82766C] hover:text-[#201814] hover:bg-[#E8DED2]/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {/* ========================================================================= */}
          {/* SCREEN ONE: PERSONALIZED WELCOME */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Header Branding */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#201814] text-[#D7B18A] border border-[#C97943]/30 shadow-md mb-3">
                  <span className="font-editorial text-2xl font-black">B</span>
                </div>

                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-mono font-bold text-[#C97943] mb-1.5 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C97943]" />
                  A BETTER WAY TO DINE
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#201814] tracking-tight leading-snug">
                  Your table. Your taste. Your experience.
                </h2>

                <p className="text-xs sm:text-sm text-[#82766C] mt-2 max-w-sm mx-auto leading-relaxed">
                  A few details before we bring you to our single-origin roasts and artisanal bakes.
                </p>
              </div>

              {/* Minimal Luxury Form */}
              <form onSubmit={handleProceedToExperience} className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="guest-name-input"
                    className="block text-xs font-mono uppercase tracking-wider text-[#38251D] font-bold mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#82766C]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="guest-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-[#201814] placeholder:text-[#82766C]/60 transition-all focus:outline-none ${
                        nameError
                          ? 'border-[#B93838] ring-1 ring-[#B93838]'
                          : 'border-[#E8DED2] focus:border-[#C97943] focus:ring-2 focus:ring-[#C97943]/20'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[11px] text-[#B93838] mt-1 font-mono">{nameError}</p>
                  )}
                </div>

                {/* Mobile Number Field (Indian +91) */}
                <div>
                  <label
                    htmlFor="guest-phone-input"
                    className="block text-xs font-mono uppercase tracking-wider text-[#38251D] font-bold mb-1.5"
                  >
                    Mobile Number
                  </label>
                  <div className="relative flex rounded-xl border border-[#E8DED2] bg-white overflow-hidden transition-all focus-within:border-[#C97943] focus-within:ring-2 focus-within:ring-[#C97943]/20">
                    <div className="inline-flex items-center px-3.5 bg-[#F3ECE1] border-r border-[#E8DED2] text-xs font-mono font-bold text-[#38251D] select-none">
                      <span className="mr-1">🇮🇳</span> +91
                    </div>
                    <input
                      id="guest-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="98765 43210"
                      maxLength={14}
                      className="w-full px-3.5 py-3 text-sm text-[#201814] placeholder:text-[#82766C]/60 bg-transparent focus:outline-none"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-[#B93838] mt-1 font-mono">{phoneError}</p>
                  ) : (
                    <p className="text-[10px] text-[#82766C] mt-1 font-mono">
                      Used for live order readiness notifications via SMS/WhatsApp
                    </p>
                  )}
                </div>

                {/* Primary CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#201814] hover:bg-[#C97943] text-[#FAF6F0] text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98 group"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 text-[#D7B18A] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Minimal Privacy Reassurance */}
              <div className="mt-5 pt-4 border-t border-[#E8DED2] flex items-center justify-center gap-2 text-[11px] text-[#82766C] font-mono text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F7950] shrink-0" />
                <span>Your details are used strictly to coordinate your order tickets.</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN TWO: CHOOSE YOUR EXPERIENCE */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Back to Step 1 & Header */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#82766C] hover:text-[#201814] mb-2.5 transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to details</span>
                </button>

                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#201814] tracking-tight">
                  How would you like to enjoy your meal?
                </h2>
                <p className="text-xs sm:text-sm text-[#82766C] mt-1.5">
                  Choose your experience to explore our menu.
                </p>
              </div>

              {/* Selection Options */}
              <div className="space-y-3 mb-6" role="radiogroup" aria-label="Dining Experience">
                {/* 1. DINE-IN */}
                <div
                  role="radio"
                  aria-checked={selectedOrderType === 'DINE_IN'}
                  tabIndex={0}
                  onClick={() => setSelectedOrderType('DINE_IN')}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') setSelectedOrderType('DINE_IN');
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex items-start gap-3.5 ${
                    selectedOrderType === 'DINE_IN'
                      ? 'bg-white border-[#C97943] ring-2 ring-[#C97943]/20 shadow-md'
                      : 'bg-white/60 hover:bg-white border-[#E8DED2] text-[#201814]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      selectedOrderType === 'DINE_IN'
                        ? 'bg-[#201814] text-[#D7B18A]'
                        : 'bg-[#F3ECE1] text-[#38251D]'
                    }`}
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-editorial text-base sm:text-lg font-bold text-[#201814]">
                        Dine-In
                      </span>
                      {selectedTable && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C97943]/15 text-[#C97943] font-mono text-[10px] font-bold tracking-wider">
                          YOUR TABLE · {tableDigits}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#82766C] mt-0.5 leading-relaxed">
                      Settle in and enjoy your meal with us.
                    </p>

                    {/* Table Switcher Inline */}
                    {selectedOrderType === 'DINE_IN' && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8DED2]/60 flex items-center justify-between text-xs">
                        <span className="text-[#82766C] font-mono text-[11px]">Seated Location:</span>
                        <select
                          value={selectedTable}
                          onChange={(e) => {
                            setSelectedTable(e.target.value);
                            setCurrentTable(e.target.value);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#E8DED2] text-xs font-mono font-semibold text-[#201814] focus:outline-none focus:border-[#C97943]"
                        >
                          {availableTables.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedOrderType === 'DINE_IN'
                          ? 'border-[#C97943] bg-[#C97943] text-white'
                          : 'border-[#E8DED2] bg-white'
                      }`}
                    >
                      {selectedOrderType === 'DINE_IN' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* 2. TAKEAWAY */}
                <div
                  role="radio"
                  aria-checked={selectedOrderType === 'TAKEAWAY'}
                  tabIndex={0}
                  onClick={() => setSelectedOrderType('TAKEAWAY')}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') setSelectedOrderType('TAKEAWAY');
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex items-start gap-3.5 ${
                    selectedOrderType === 'TAKEAWAY'
                      ? 'bg-white border-[#C97943] ring-2 ring-[#C97943]/20 shadow-md'
                      : 'bg-white/60 hover:bg-white border-[#E8DED2] text-[#201814]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      selectedOrderType === 'TAKEAWAY'
                        ? 'bg-[#201814] text-[#D7B18A]'
                        : 'bg-[#F3ECE1] text-[#38251D]'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-editorial text-base sm:text-lg font-bold text-[#201814]">
                        Takeaway
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#2F7950]/10 text-[#2F7950] font-mono text-[10px] font-bold tracking-wider">
                        QUICK PICKUP
                      </span>
                    </div>
                    <p className="text-xs text-[#82766C] mt-0.5 leading-relaxed">
                      Freshly prepared, ready when you are.
                    </p>
                  </div>

                  <div className="pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedOrderType === 'TAKEAWAY'
                          ? 'border-[#C97943] bg-[#C97943] text-white'
                          : 'border-[#E8DED2] bg-white'
                      }`}
                    >
                      {selectedOrderType === 'TAKEAWAY' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* 3. DELIVERY */}
                <div
                  role="radio"
                  aria-checked={selectedOrderType === 'DELIVERY'}
                  tabIndex={0}
                  onClick={() => setSelectedOrderType('DELIVERY')}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') setSelectedOrderType('DELIVERY');
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex items-start gap-3.5 ${
                    selectedOrderType === 'DELIVERY'
                      ? 'bg-white border-[#C97943] ring-2 ring-[#C97943]/20 shadow-md'
                      : 'bg-white/60 hover:bg-white border-[#E8DED2] text-[#201814]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      selectedOrderType === 'DELIVERY'
                        ? 'bg-[#201814] text-[#D7B18A]'
                        : 'bg-[#F3ECE1] text-[#38251D]'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-editorial text-base sm:text-lg font-bold text-[#201814]">
                        Delivery
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#38251D]/10 text-[#38251D] font-mono text-[10px] font-bold tracking-wider">
                        DOORSTEP
                      </span>
                    </div>
                    <p className="text-xs text-[#82766C] mt-0.5 leading-relaxed">
                      Your favourites, delivered to your door.
                    </p>

                    {/* Address Field Expansion */}
                    {selectedOrderType === 'DELIVERY' && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8DED2]/60">
                        <label
                          htmlFor="delivery-address-input"
                          className="block text-[11px] font-mono uppercase text-[#38251D] font-bold mb-1"
                        >
                          Delivery Street Address
                        </label>
                        <input
                          id="delivery-address-input"
                          type="text"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (addressError) setAddressError('');
                          }}
                          placeholder="Flat / Villa, Road, Landmark, Indiranagar"
                          className={`w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border text-xs text-[#201814] placeholder:text-[#82766C]/60 focus:outline-none ${
                            addressError ? 'border-[#B93838]' : 'border-[#E8DED2] focus:border-[#C97943]'
                          }`}
                        />
                        {addressError && (
                          <p className="text-[10px] text-[#B93838] mt-1 font-mono">{addressError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedOrderType === 'DELIVERY'
                          ? 'border-[#C97943] bg-[#C97943] text-white'
                          : 'border-[#E8DED2] bg-white'
                      }`}
                    >
                      {selectedOrderType === 'DELIVERY' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full py-3.5 px-6 rounded-xl bg-[#201814] hover:bg-[#C97943] text-[#FAF6F0] text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98 group"
              >
                <span>Continue to Menu</span>
                <ChevronRight className="w-4 h-4 text-[#D7B18A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
