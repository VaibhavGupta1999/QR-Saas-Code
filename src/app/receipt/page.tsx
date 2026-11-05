'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { INITIAL_ORDERS } from '@/data/initialMenu';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Coffee,
  QrCode,
} from 'lucide-react';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('id') || searchParams.get('orderId');
  const viewParam = searchParams.get('view');

  const { orders, activeOrder } = useBrewStudio();

  const order = useMemo(() => {
    if (orderIdParam) {
      const match =
        orders.find((o) => o.id === orderIdParam) ||
        INITIAL_ORDERS.find((o) => o.id === orderIdParam);
      if (match) return match;
    }
    return activeOrder || orders[0] || INITIAL_ORDERS[0];
  }, [orderIdParam, orders, activeOrder]);

  const receiptText = useMemo(() => {
    if (!order) return '';
    return `========================================
          BREW STUDIO INDIA
    Specialty Coffee Lab & Bakehouse
100ft Rd, Indiranagar, Bengaluru - 560038
GSTIN: 29AABCU9603R1ZM | FSSAI: 11223344556677
========================================
ORDER TOKEN: #${order.id}
TABLE:       ${order.tableNumber}
GUEST:       ${order.customerName}
${order.customerPhone ? `MOBILE:      ${order.customerPhone}\n` : ''}DATE:        ${new Date(
      order.createdAt
    ).toLocaleString()}
----------------------------------------
ITEMIZED BILL:
${order.items
  .map(
    (it) =>
      `  ${it.quantity}x ${it.name} - ₹${it.totalPrice}${
        it.customization?.milk?.name && it.station === 'barista'
          ? `\n     [Milk: ${it.customization.milk.name}]`
          : ''
      }${
        it.customization?.bean?.name && it.station === 'barista'
          ? `\n     [Roast: ${it.customization.bean.name}]`
          : ''
      }${
        it.customization?.specialNote
          ? `\n     [Note: "${it.customization.specialNote}"]`
          : ''
      }`
  )
  .join('\n')}
----------------------------------------
Subtotal Amount:     ₹${order.subtotal}
CGST (2.5%):         ₹${Math.round(order.tax / 2)}
SGST (2.5%):         ₹${Math.round(order.tax / 2)}
----------------------------------------
TOTAL BILL (INR):    ₹${order.total}
PAYMENT MODE:        ${
      order.paymentMode === 'instant_upi' ? 'UPI Online' : 'Counter POS'
    }
PAYMENT STATUS:      ${order.paymentStatus.toUpperCase()} (CONFIRMED)
========================================
 Thank you for dining with Brew Studio!
 Follow our roastery: @brewstudioindia
========================================`.trim();
  }, [order]);

  const handleDownloadSlip = () => {
    if (!order || !receiptText) return;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BrewStudio_Tax_Receipt_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = () => {
    if (!order) return;
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    const msg = `*BREW STUDIO INDIA — Official Tax Receipt*\nToken: *#${order.id}* (${order.tableNumber})\nGuest: ${order.customerName}\n\n*Order Summary:*\n${order.items
      .map((i) => `• ${i.quantity}x ${i.name} — ₹${i.totalPrice}`)
      .join('\n')}\n\nSubtotal: ₹${order.subtotal}\nGST (5%): ₹${order.tax}\n*Grand Total: ₹${order.total}* (${order.paymentStatus.toUpperCase()})\n\nThank you for brewing with us!`;
    const waUrl = `https://wa.me/${
      cleanPhone.length >= 10 ? cleanPhone : ''
    }?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0F0C0A] text-[#F5F0E6] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Coffee className="w-10 h-10 text-[#B86B35] mx-auto" />
          <h2 className="text-lg font-bold font-editorial">No order found</h2>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B86B35] text-white text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0C0A] text-[#F5F0E6] flex flex-col items-center justify-start p-3 sm:p-8">
      {/* Top Navbar Actions (Hidden during print) */}
      <header className="w-full max-w-md flex items-center justify-between mb-4 sm:mb-6 no-print">
        <Link
          href="/menu?table=04"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171210] hover:bg-[#211A16] border border-[#2A221E] text-[#F5F0E6] text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4A373]" />
          <span>Menu</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#28664B] hover:bg-[#1E503A] text-white text-xs font-mono font-bold shadow-xs transition-all active:scale-95"
            title="Share receipt via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSlip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#211A16] hover:bg-[#2A221E] border border-[#2A221E] text-[#D4A373] text-xs font-mono font-bold transition-all active:scale-95"
            title="Download formatted text receipt file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .TXT</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-mono font-bold shadow-xs transition-all active:scale-95"
            title="Print thermal receipt or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </header>

      {viewParam === 'slip' ? (
        <main className="w-full max-w-md bg-[#171210] text-[#F5F0E6] rounded-2xl p-5 shadow-2xl border border-[#2A221E] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A221E] mb-3">
            <div className="flex items-center gap-2 font-mono text-xs text-[#D4A373]">
              <FileText className="w-4 h-4 text-[#B86B35]" />
              <span className="font-bold">BrewStudio_Receipt_{order.id}.txt</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#28664B]/20 text-[#34D399] text-[10px] font-mono font-bold border border-[#28664B]/40">
              Raw 80mm Stream
            </span>
          </div>

          <pre className="font-mono text-[10.5px] leading-relaxed bg-[#0F0C0A] p-4 rounded-xl border border-[#2A221E] text-[#D4A373] overflow-x-auto whitespace-pre">
            {receiptText}
          </pre>

          <div className="mt-4 pt-3 border-t border-[#2A221E] flex gap-2 no-print">
            <Link
              href={`/receipt?id=${order.id}`}
              className="flex-1 py-2.5 rounded-xl bg-[#211A16] text-[#D4A373] border border-[#2A221E] text-xs font-mono font-bold flex items-center justify-center gap-2"
            >
              <span>View Invoice Slip</span>
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-[#B86B35] text-white text-xs font-mono font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Direct</span>
            </button>
          </div>
        </main>
      ) : (
        /* Official 80mm Thermal Receipt Card */
        <main
          id="printable-slip"
          className="w-full max-w-md bg-[#F9F6F0] text-[#18120F] rounded-2xl p-5 sm:p-7 shadow-2xl border border-[#E6DFD5] flex flex-col justify-between"
        >
          {/* Receipt Header */}
          <div className="text-center font-mono space-y-2 pb-4 border-b border-dashed border-[#18120F]/30">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#18120F] text-[#D4A373] mb-1">
              <Coffee className="w-5 h-5" />
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#18120F] tracking-tight">
              BREW STUDIO INDIA
            </h1>
            <p className="text-[11px] text-[#5C5148] font-semibold tracking-wide uppercase">
              Specialty Coffee Roastery &amp; Boulangerie
            </p>
            <p className="text-[10px] text-[#8C7E71]">
              100ft Rd, Indiranagar, Bengaluru • Bandra West, Mumbai
            </p>
            <div className="flex items-center justify-center gap-2 text-[9px] text-[#8C7E71] font-mono mt-1">
              <span>GSTIN: 29AABCU9603R1ZM</span>
              <span>•</span>
              <span>FSSAI: 11223344556677</span>
            </div>
          </div>

          {/* Order Metadata Strip */}
          <div className="py-3 border-b border-dashed border-[#18120F]/30 font-mono text-xs space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="text-sm tabular-nums">TOKEN #{order.id}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#B86B35] text-white text-[11px]">
                {order.tableNumber}
              </span>
            </div>
            <div className="flex justify-between text-[#18120F]">
              <span>GUEST: {order.customerName}</span>
              <span suppressHydrationWarning className="text-[#5C5148]">
                {new Date(order.createdAt).toLocaleDateString([], {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between text-[#5C5148] text-[10px]">
                <span>MOBILE: {order.customerPhone}</span>
                <span suppressHydrationWarning>
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Itemized Dish List */}
          <div className="py-4 font-mono text-xs space-y-3 border-b border-dashed border-[#18120F]/30">
            <div className="text-[10px] uppercase font-bold text-[#8C7E71] tracking-wider mb-1">
              Itemized Tax Invoice
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-[#18120F] text-xs">
                    {it.quantity}× {it.name}
                  </div>
                  {it.customization && it.station === 'barista' && (
                    <div className="text-[10px] text-[#5C5148] mt-0.5 leading-snug">
                      [{it.customization.temperature}] [{it.customization.milk.name}]
                      {it.customization.bean.name !==
                        'Studio House Blend (Chikmagalur AA)' && (
                        <span> • {it.customization.bean.name.split(' ')[0]}</span>
                      )}
                      {it.customization.specialNote && (
                        <span className="block italic text-[#B86B35]">
                          &ldquo;{it.customization.specialNote}&rdquo;
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="font-bold font-mono text-[#18120F] text-xs shrink-0 tabular-nums">
                  ₹{it.totalPrice}
                </span>
              </div>
            ))}
          </div>

          {/* Tax Breakdown & Total */}
          <div className="py-3 font-mono text-xs space-y-1.5 border-b border-dashed border-[#18120F]/30 tabular-nums">
            <div className="flex justify-between text-[#5C5148]">
              <span>Taxable Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#5C5148]">
              <span>CGST (2.5%)</span>
              <span>₹{Math.round(order.tax / 2)}</span>
            </div>
            <div className="flex justify-between text-[#5C5148]">
              <span>SGST (2.5%)</span>
              <span>₹{Math.round(order.tax / 2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-sm text-[#18120F] pt-2 border-t border-[#18120F]">
              <span className="text-base tracking-tight">TOTAL TAX INVOICE</span>
              <span className="text-lg text-[#B86B35]">₹{order.total}</span>
            </div>
          </div>

          {/* Payment & Audit Verification */}
          <div className="pt-3 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#5C5148]">Settlement Channel:</span>
              <span className="font-semibold text-[#18120F]">
                {order.paymentMode === 'instant_upi'
                  ? 'Instant UPI Online'
                  : 'Counter POS'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#5C5148]">Verification Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#28664B] text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{order.paymentStatus.toUpperCase()}</span>
              </span>
            </div>

            <div className="pt-3 text-center space-y-2">
              <div className="p-3 rounded-xl bg-white border border-[#E6DFD5] flex items-center justify-between">
                <div className="text-left font-mono text-[9px] text-[#5C5148]">
                  <div className="font-bold text-[#18120F]">
                    OFFICIAL GST RECEIPT VERIFIED
                  </div>
                  <div suppressHydrationWarning>
                    Hash: {order.id}-{order.createdAt.replace(/\D/g, '').slice(-8)}
                  </div>
                  <div>Eligible for corporate hospitality reimbursement</div>
                </div>
                <div className="w-10 h-10 bg-[#18120F] rounded-lg flex items-center justify-center text-[#D4A373]">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>

              <p className="text-[10px] text-[#5C5148] italic">
                Thank you for savoring specialty Indian Arabica with us!
              </p>
            </div>
          </div>

          {/* Action Buttons for Mobile / Guest */}
          <div className="mt-5 pt-4 border-t border-[#E6DFD5] grid grid-cols-3 gap-2 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSlip}
              className="py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD5] text-[#18120F] border border-[#E6DFD5] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#B86B35]" />
              <span>Save .TXT</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 rounded-xl bg-[#28664B] hover:bg-[#1E503A] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0C0A] flex items-center justify-center text-[#D4A373] font-mono text-xs">
          Loading official tax invoice...
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
