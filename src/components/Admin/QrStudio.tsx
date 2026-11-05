'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Wifi,
  Coffee,
  Download,
  MapPin,
  Globe,
  RotateCcw,
} from 'lucide-react';

export const QrStudio: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('https://qr-saas-code.vercel.app');
  const [detectedOrigin, setDetectedOrigin] = useState<string>('http://localhost:3000');
  const [qrMode, setQrMode] = useState<'table' | 'universal'>('table');
  const [selectedTable, setSelectedTable] = useState<string>('04');
  const [includeOnboarding, setIncludeOnboarding] = useState<boolean>(false);

  const tablesList = [
    { code: '01', label: 'Table 01' },
    { code: '02', label: 'Table 02' },
    { code: '03', label: 'Table 03' },
    { code: '04', label: 'Table 04' },
    { code: '05', label: 'Table 05' },
    { code: '06', label: 'Table 06' },
    { code: '07', label: 'Table 07' },
    { code: '08', label: 'Table 08' },
    { code: '09', label: 'Table 09' },
    { code: '10', label: 'Table 10' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      setDetectedOrigin(currentOrigin);
      setOrigin(currentOrigin);
    }
  }, []);

  const cleanOrigin = origin.trim().replace(/\/+$/, '');
  const baseMenuUrl =
    qrMode === 'universal'
      ? `${cleanOrigin}/menu`
      : `${cleanOrigin}/menu?table=${selectedTable}`;

  const targetUrl = includeOnboarding
    ? `${baseMenuUrl}${baseMenuUrl.includes('?') ? '&' : '?'}welcome=true`
    : baseMenuUrl;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
    targetUrl
  )}&color=24-18-15&bgcolor=FFFFFF&margin=2`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isLocalhost = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');

  return (
    <div className="rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian p-4 sm:p-6 mb-8 text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A221E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#F5F0E6]">
              Table &amp; Universal QR Standee Studio
            </h2>
            <span className="px-2.5 py-0.5 rounded-md bg-[#B86B35]/20 text-[#D4A373] border border-[#B86B35]/30 font-mono text-[10px] font-bold">
              {qrMode === 'universal' ? 'Universal Mode' : `Table ${selectedTable} Mode`}
            </span>
          </div>
          <p className="text-xs text-[#9E9083] font-mono mt-0.5">
            Dynamic domain-aware QR generator for Vercel cloud deployment &amp; acrylic table tents
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 no-print w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#211A16] hover:bg-[#2A221E] border border-[#2A221E] text-xs font-mono font-medium text-[#F5F0E6] transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#34D399]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied!' : 'Copy URL'}</span>
          </button>

          <a
            href={qrImageUrl}
            download={
              qrMode === 'universal'
                ? 'brew_studio_universal_qr.png'
                : `brew_studio_table_${selectedTable}_qr.png`
            }
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#211A16] hover:bg-[#B86B35]/20 border border-[#B86B35]/40 text-xs font-mono font-medium text-[#D4A373] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-mono font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Standee</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left: Mode Switcher & Configuration */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* Live Domain / Vercel URL Configurator */}
          <div className="p-4 rounded-2xl bg-[#211A16] border border-[#2A221E] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4A373] font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#B86B35]" />
                <span>QR Target Domain (Vercel / Live URL)</span>
              </label>
              {origin !== detectedOrigin && (
                <button
                  type="button"
                  onClick={() => setOrigin(detectedOrigin)}
                  className="text-[10px] font-mono text-[#9E9083] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="https://your-project.vercel.app"
              className="w-full px-3 py-2 rounded-xl bg-[#140F0D] border border-[#33261F] text-xs font-mono text-[#FAF7F2] focus:outline-none focus:border-[#B86B35]"
            />

            {isLocalhost && (
              <p className="text-[11px] text-amber-300/90 font-sans leading-relaxed">
                Tip: When deployed on Vercel, this automatically switches to your public <code className="font-mono text-white">.vercel.app</code> domain so phones can scan directly.
              </p>
            )}
          </div>

          {/* QR Mode Switcher */}
          <div className="p-4 rounded-2xl bg-[#211A16] border border-[#2A221E] space-y-3">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4A373] font-bold block">
              Select QR Deployment Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQrMode('table')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  qrMode === 'table'
                    ? 'bg-[#171210] border-[#B86B35] text-[#F5F0E6] shadow-xs'
                    : 'bg-[#171210]/50 border-[#2A221E] text-[#9E9083] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold font-sans">Table-Specific QR</div>
                <div className="text-[10px] font-mono text-[#9E9083] mt-0.5">
                  Auto-binds ?table=XX
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQrMode('universal')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  qrMode === 'universal'
                    ? 'bg-[#171210] border-[#B86B35] text-[#F5F0E6] shadow-xs'
                    : 'bg-[#171210]/50 border-[#2A221E] text-[#9E9083] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold font-sans">Universal Studio QR</div>
                <div className="text-[10px] font-mono text-[#9E9083] mt-0.5">
                  Single QR for all tables
                </div>
              </button>
            </div>

            {qrMode === 'table' && (
              <div className="pt-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#9E9083] block mb-1.5">
                  Choose Table Standee Number
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {tablesList.map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setSelectedTable(t.code)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        selectedTable === t.code
                          ? 'bg-[#B86B35] text-white border-[#B86B35]'
                          : 'bg-[#171210] text-[#9E9083] border-[#2A221E] hover:text-white'
                      }`}
                    >
                      T-{t.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle Guest Welcome Modal on Scan */}
            <label className="flex items-center justify-between pt-2 border-t border-[#2A221E] cursor-pointer">
              <span className="text-xs text-[#E6DFD5]">
                Open Guest Welcome Sheet on Scan
              </span>
              <input
                type="checkbox"
                checked={includeOnboarding}
                onChange={(e) => setIncludeOnboarding(e.target.checked)}
                className="accent-[#B86B35] w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Scannable destination URL */}
          <div className="p-3.5 rounded-2xl bg-[#211A16] border border-[#2A221E] text-xs font-mono">
            <span className="text-[#9E9083] text-[10px] block mb-1">
              Encoded Scannable Destination URL:
            </span>
            <div className="text-[#D4A373] break-all select-all font-semibold">
              {targetUrl}
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B86B35] text-white font-bold text-[11px] hover:bg-[#A05A28] transition-colors"
              >
                <span>Simulate QR Scan in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Printable Luxury Table Standee Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="printable-table-tent"
            className="w-full max-w-sm rounded-3xl bg-[#F9F6F0] text-[#18120F] p-6 shadow-2xl border-4 border-[#B86B35]/35 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B86B35] via-[#D4A373] to-[#B86B35]" />

            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18120F] text-[#F9F6F0] text-[9px] font-mono uppercase tracking-widest font-bold mb-3 shadow-xs">
                <Coffee className="w-3 h-3 text-[#B86B35]" />
                Specialty Coffee Lab
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#18120F] tracking-tight">
                BREW STUDIO INDIA
              </h3>
              <p className="text-[10px] text-[#5C5148] font-mono mt-0.5">
                @brewstudioindia • Artisanal Roastery &amp; Bakehouse
              </p>
            </div>

            <div className="my-2.5 py-1.5 px-3 rounded-xl bg-[#F2ECE1] border border-[#E6DFD5] text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#B86B35] font-bold flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {qrMode === 'universal'
                    ? 'TABLE QR MENU & EXPRESS ORDERING'
                    : `SERVING AT TABLE ${selectedTable}`}
                </span>
              </div>
              <div className="text-[11px] text-[#5C5148] font-mono">
                Scan with your phone camera to order from your table
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#18120F] shadow-md flex flex-col items-center justify-center my-2">
              <div className="w-48 h-48 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="Brew Studio Table QR Code"
                  width={180}
                  height={180}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center mt-2">
                <div className="font-editorial text-sm font-bold text-[#18120F]">
                  Scan to Craft Your Cup
                </div>
                <div className="text-[10px] text-[#5C5148] font-mono">
                  Instant UPI • Live Barista Tracker • Zero App Download
                </div>
              </div>
            </div>

            <div className="pt-2.5 text-center space-y-1 border-t border-[#E6DFD5]">
              <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-[#5C5148]">
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-[#B86B35]" />
                  <span>
                    Wi-Fi: <strong>BrewStudio_Guest</strong>
                  </span>
                </div>
                <div>
                  Pass: <strong>ratnagiri93</strong>
                </div>
              </div>
              <p className="text-[9px] text-[#8C7E71] font-mono">
                Ratnagiri Honey Pour-Overs • 27-Layer Bakes • Live KDS Tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
