'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBrewStudio } from '@/context/BrewStudioContext';
import {
  Smartphone,
  ChefHat,
  LayoutDashboard,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ChevronDown,
  Layers,
  QrCode,
  X,
  Copy,
  Check,
} from 'lucide-react';

export const DemoSwitcherBar: React.FC = () => {
  const pathname = usePathname();
  const {
    orders,
    soundEnabled,
    toggleSound,
    resetToDemoDefaults,
    seedRandomOrder,
    currentTable,
    setCurrentTable,
    orderType,
  } = useBrewStudio();

  const [isStaffOpen, setIsStaffOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrOrigin, setQrOrigin] = useState<string>('https://qr-saas-code.vercel.app');
  const [qrTable, setQrTable] = useState<string>('04');
  const [copiedQr, setCopiedQr] = useState<boolean>(false);
  const [justSimulated, setJustSimulated] = useState<boolean>(false);
  const staffMenuRef = useRef<HTMLDivElement>(null);

  const activeTicketCount = orders.filter(
    (o) => o.status === 'new' || o.status === 'brewing'
  ).length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrOrigin(window.location.origin);
    }
  }, []);

  const handleSimulate = () => {
    setJustSimulated(true);
    seedRandomOrder();
    setTimeout(() => setJustSimulated(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staffMenuRef.current && !staffMenuRef.current.contains(event.target as Node)) {
        setIsStaffOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCustomerActive = pathname === '/' || pathname === '/menu';
  const isKdsActive = pathname === '/kitchen' || pathname === '/kds' || pathname === '/chef';
  const isAdminActive = pathname === '/admin';
  const isOperatorActive = pathname === '/operator';

  const tableQuery = currentTable.replace('Table ', '').trim() || '04';
  const cleanOrigin = qrOrigin.trim().replace(/\/+$/, '');
  const fullQrTargetUrl = `${cleanOrigin}/menu?table=${qrTable}`;
  const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
    fullQrTargetUrl
  )}&color=24-18-15&bgcolor=FFFFFF&margin=2`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#0F0C0A]/95 backdrop-blur-md border-b border-[#2A221E] text-[#F9F6F0] no-print">
        <div className="max-w-7xl mx-auto h-full px-2 sm:px-6 flex items-center justify-between gap-1 sm:gap-2">
          {/* 1. Brand Wordmark & Monogram */}
          <Link
            href={`/menu?table=${tableQuery}`}
            className="flex items-center gap-1.5 sm:gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#171210] border border-[#B86B35]/50 flex items-center justify-center group-hover:border-[#B86B35] transition-colors">
              <span className="font-editorial text-xs sm:text-sm font-bold text-[#D7B18A]">B</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="font-editorial text-xs sm:text-base font-bold tracking-tight text-[#F9F6F0] group-hover:text-[#D7B18A] transition-colors truncate max-w-[80px] sm:max-w-none">
                Brew Studio
              </span>
              <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A7C70]">
                Hospitality OS
              </span>
            </div>
          </Link>

          {/* 2. Unified Role Switcher Pills */}
          <nav
            className="flex items-center gap-0.5 sm:gap-1 bg-[#171210] p-0.5 sm:p-1 rounded-xl border border-[#2A221E] shrink-0"
            aria-label="Platform suite switcher"
          >
            <Link
              href={`/menu?table=${tableQuery}`}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                isCustomerActive
                  ? 'bg-[#F9F6F0] text-[#18120F] font-semibold shadow-xs'
                  : 'text-[#B5A89D] hover:text-[#F9F6F0]'
              }`}
            >
              <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B86B35]" />
              <span className="hidden xs:inline">Menu</span>
              <span className="xs:hidden">Menu</span>
              <span className="hidden lg:inline font-mono text-[10px] opacity-75">
                · {orderType === 'DELIVERY' ? 'Delivery' : orderType === 'TAKEAWAY' ? 'Takeaway' : currentTable}
              </span>
            </Link>

            <Link
              href="/kitchen?unlock=true"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                isKdsActive
                  ? 'bg-[#B86B35] text-white font-semibold shadow-xs'
                  : 'text-[#B5A89D] hover:text-[#F9F6F0]'
              }`}
            >
              <ChefHat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Barista KDS</span>
              <span className="sm:hidden">KDS</span>
              {activeTicketCount > 0 && (
                <span
                  suppressHydrationWarning
                  className={`px-1 sm:px-1.5 py-0.2 rounded-full font-mono text-[9px] sm:text-[10px] font-bold ${
                    isKdsActive ? 'bg-black/30 text-white' : 'bg-[#D97706]/25 text-[#D7B18A]'
                  }`}
                >
                  {activeTicketCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin?unlock=true"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                isAdminActive
                  ? 'bg-[#B86B35] text-white font-semibold shadow-xs'
                  : 'text-[#B5A89D] hover:text-[#F9F6F0]'
              }`}
            >
              <LayoutDashboard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Admin</span>
            </Link>

            {/* More / Operator Dropdown */}
            <div className="relative" ref={staffMenuRef}>
              <button
                onClick={() => setIsStaffOpen(!isStaffOpen)}
                className={`flex items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  isOperatorActive
                    ? 'bg-[#211A16] text-[#D7B18A]'
                    : 'text-[#8A7C70] hover:text-[#F9F6F0]'
                }`}
                aria-expanded={isStaffOpen}
                aria-label="Additional platform routes"
                title="More views & multi-window launchers"
              >
                <ChevronDown
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${
                    isStaffOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isStaffOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#171210] border border-[#2A221E] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8A7C70] border-b border-[#2A221E] mb-1">
                    Platform Suites &amp; Tools
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsStaffOpen(false);
                      setIsQrModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-[#D7B18A] hover:bg-[#211A16] hover:text-[#F9F6F0] transition-colors text-left cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#B86B35]" />
                    <span>Live Table QR Scanner</span>
                  </button>

                  <Link
                    href={`/menu?table=${tableQuery}&welcome=true`}
                    onClick={() => setIsStaffOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs text-[#B5A89D] hover:bg-[#211A16] hover:text-[#F9F6F0] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B86B35]" />
                    <span>Guest Onboarding Modal</span>
                  </Link>

                  <Link
                    href="/operator"
                    onClick={() => setIsStaffOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                      isOperatorActive
                        ? 'bg-[#211A16] text-[#D7B18A] font-semibold'
                        : 'text-[#B5A89D] hover:bg-[#211A16] hover:text-[#F9F6F0]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#2B7A4B]" />
                    <span>SaaS Operator Console</span>
                  </Link>

                  <div className="mt-1 pt-1.5 border-t border-[#2A221E] flex items-center justify-between px-2.5 py-1 text-[10px] font-mono text-[#8A7C70]">
                    <span>Split Screen:</span>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          window.open('/kitchen?unlock=true', '_blank');
                          setIsStaffOpen(false);
                        }}
                        className="hover:text-[#D7B18A] flex items-center gap-0.5 cursor-pointer"
                      >
                        KDS <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => {
                          window.open('/admin?unlock=true', '_blank');
                          setIsStaffOpen(false);
                        }}
                        className="hover:text-[#D7B18A] flex items-center gap-0.5 cursor-pointer"
                      >
                        Admin <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Live Demo Actions (QR Modal, Simulate Order, Audio Chime, Reset) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              title="Show scannable Table QR Code for client demo"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold bg-[#211A16] text-[#F5EDE3] hover:bg-[#B86B35] hover:text-white border border-[#B86B35]/50 transition-all cursor-pointer"
            >
              <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4A373]" />
              <span className="hidden sm:inline">Table QR</span>
              <span className="sm:hidden">QR</span>
            </button>

            <button
              onClick={handleSimulate}
              title="Fire a live test order ticket to KDS & Admin"
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                justSimulated
                  ? 'bg-[#2B7A4B] text-white'
                  : 'bg-[#171210] text-[#D7B18A] hover:bg-[#211A16] border border-[#2A221E]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#B86B35]" />
              <span className="hidden md:inline text-[11px]">
                {justSimulated ? 'Ticket Fired!' : '+ Test Order'}
              </span>
            </button>

            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Service Chime Enabled (Click to Mute)' : 'Chime Muted'}
              className={`p-1 sm:p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors border cursor-pointer ${
                soundEnabled
                  ? 'text-[#4ade80] bg-[#2B7A4B]/15 border-[#2B7A4B]/30 hover:bg-[#2B7A4B]/25'
                  : 'text-[#8A7C70] bg-[#171210] border-[#2A221E] hover:text-[#F9F6F0]'
              }`}
              aria-label={soundEnabled ? 'Mute Kitchen Chime' : 'Unmute Kitchen Chime'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4ade80]" />
              ) : (
                <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C93B3B]" />
              )}
            </button>

            <button
              onClick={() => {
                if (confirm('Reset menu and tickets to clean initial demo state?')) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset demo state"
              className="p-1 sm:p-1.5 rounded-lg text-[#8A7C70] hover:text-[#F9F6F0] bg-[#171210] hover:bg-[#211A16] border border-[#2A221E] transition-colors hidden sm:flex cursor-pointer"
              aria-label="Reset demo state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Instant Client Demo QR Scanner Modal (Fully Responsive on All Phones) */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl bg-[#F9F6F0] text-[#18120F] p-4 sm:p-6 shadow-2xl border-2 border-[#B86B35] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E2D6C5]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B86B35] font-bold">
                  LIVE CLIENT DEMO QR STANDEE
                </span>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#18120F]">
                  Scan for Table {qrTable} Menu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-full bg-[#E6DFD5] hover:bg-[#D8CBB8] text-[#18120F] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Selector Pills */}
            <div className="mt-2.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A483B] font-bold block mb-1">
                Select Table Number:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQrTable(num);
                      setCurrentTable(`Table ${num}`);
                    }}
                    className={`py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      qrTable === num
                        ? 'bg-[#18120F] text-white border-[#18120F]'
                        : 'bg-white text-[#5A483B] border-[#DDD0C0] hover:border-[#B86B35]'
                    }`}
                  >
                    T-{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Scannable QR Code Box */}
            <div className="my-3 p-3 sm:p-4 rounded-2xl bg-white border-2 border-[#18120F] flex flex-col items-center shadow-md">
              <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImgSrc}
                  alt={`Table ${qrTable} QR Code`}
                  width={184}
                  height={184}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mt-1.5 font-mono text-[11px] sm:text-xs font-bold text-[#18120F]">
                TABLE {qrTable} · EXPRESS QR ORDERING
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans text-[#5A483B] text-center">
                Orders placed from this QR sync live to Barista KDS
              </span>
            </div>

            {/* Editable Domain Box for Localhost vs Vercel */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A483B] font-bold block">
                Target Site URL:
              </label>
              <input
                type="text"
                value={qrOrigin}
                onChange={(e) => setQrOrigin(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#D8CBB8] text-[11px] sm:text-xs font-mono text-[#18120F] focus:outline-none focus:border-[#B86B35]"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(fullQrTargetUrl);
                    setCopiedQr(true);
                    setTimeout(() => setCopiedQr(false), 2000);
                  }}
                  className="flex-1 py-2 px-2.5 sm:px-3 rounded-xl bg-[#EFE6DB] hover:bg-[#E2D5C5] text-[#18120F] font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer truncate"
                >
                  {copiedQr ? <Check className="w-3.5 h-3.5 text-[#28664B] shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{copiedQr ? 'Copied Link!' : 'Copy Menu URL'}</span>
                </button>

                <a
                  href={fullQrTargetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-2.5 sm:px-3 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors truncate"
                >
                  <span className="truncate">Open Table {qrTable}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
