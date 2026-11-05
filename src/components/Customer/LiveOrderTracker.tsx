'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBrewStudio } from '@/context/BrewStudioContext';
import {
  CheckCircle2,
  Coffee,
  Receipt,
  X,
  BellRing,
  Download,
  Printer,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const LiveOrderTracker: React.FC = () => {
  const searchParams = useSearchParams();
  const isTrackerParam = searchParams.get('tracker') === 'true';
  const { activeOrder: activeOrderFromContext, setActiveOrderById, orders, currentTable } = useBrewStudio();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const activeOrder =
    activeOrderFromContext ||
    (isTrackerParam ? orders.find((o) => o.tableNumber === currentTable) || orders[0] : null);

  if (!activeOrder) return null;

  const steps = [
    {
      id: 'step-1',
      title: 'Ticket Received',
      desc: 'Station queue confirmed',
      activeStatus: ['new', 'brewing', 'ready', 'completed'],
      isCurrent: activeOrder.status === 'new',
    },
    {
      id: 'step-2',
      title: 'Grinding & Brewing',
      desc: 'Precision 93°C extraction & micro-foam',
      activeStatus: ['brewing', 'ready', 'completed'],
      isCurrent: activeOrder.status === 'brewing',
    },
    {
      id: 'step-3',
      title: 'Ready for Service',
      desc: `Runner en route to ${activeOrder.tableNumber}`,
      activeStatus: ['ready', 'completed'],
      isCurrent: activeOrder.status === 'ready' || activeOrder.status === 'completed',
    },
  ];

  const isOrderReady = activeOrder.status === 'ready' || activeOrder.status === 'completed';

  const handleDownloadReceiptSlip = () => {
    const text = `
========================================
         BREW STUDIO INDIA
   Specialty Coffee Lab & Bakehouse
100ft Rd, Indiranagar, Bengaluru - 560038
GSTIN: 29AABCU9603R1ZM | FSSAI: 11223344556677
========================================
ORDER TOKEN: #${activeOrder.id}
TABLE:       ${activeOrder.tableNumber}
GUEST:       ${activeOrder.customerName}
${activeOrder.customerPhone ? `MOBILE:      ${activeOrder.customerPhone}\n` : ''}DATE:        ${new Date(activeOrder.createdAt).toLocaleString()}
----------------------------------------
ITEMIZED BILL:
${activeOrder.items
  .map(
    (it) =>
      `  ${it.quantity}x ${it.name} - ₹${it.totalPrice}${
        it.customization?.milk?.name ? `\n     [Milk: ${it.customization.milk.name}]` : ''
      }${
        it.customization?.specialNote ? `\n     [Note: "${it.customization.specialNote}"]` : ''
      }`
  )
  .join('\n')}
----------------------------------------
Subtotal:       ₹${activeOrder.subtotal}
CGST (2.5%):    ₹${Math.round(activeOrder.tax / 2)}
SGST (2.5%):    ₹${Math.round(activeOrder.tax / 2)}
----------------------------------------
TOTAL BILL:     ₹${activeOrder.total}
PAYMENT:        ${activeOrder.paymentMode === 'instant_upi' ? 'UPI Online' : 'Counter POS'}
STATUS:         ${activeOrder.paymentStatus.toUpperCase()} (CONFIRMED)
========================================
 Thank you for dining with Brew Studio!
========================================`.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BrewStudio_Receipt_${activeOrder.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <aside
        className="mb-5 animate-in fade-in slide-in-from-top-2 duration-300"
        aria-label="Active order status tracker"
      >
        <div
          className={`rounded-2xl border p-4 sm:p-5 shadow-editorial transition-all duration-500 ${
            isOrderReady
              ? 'bg-[#18231B] border-[#2F7950] text-[#F8F4ED]'
              : 'bg-[#201814] border-[#C97943]/40 text-[#F8F4ED]'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-sm ${
                  isOrderReady
                    ? 'bg-[#2F7950] text-white animate-bounce-subtle'
                    : 'bg-[#C97943] text-white'
                }`}
              >
                {isOrderReady ? (
                  <BellRing className="w-5 h-5 animate-pulse" />
                ) : (
                  <Coffee className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#D7B18A]">
                    #{activeOrder.id}
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-white/10 text-[10px] font-mono uppercase tracking-wider text-[#F8F4ED]">
                    {activeOrder.tableNumber}
                  </span>
                </div>
                <div className="text-xs text-white/80 font-medium">
                  {activeOrder.customerName} • {activeOrder.items.length} item
                  {activeOrder.items.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                  activeOrder.status === 'new'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : activeOrder.status === 'brewing'
                    ? 'bg-[#C97943]/30 text-[#D7B18A] border border-[#C97943]/40 animate-pulse'
                    : 'bg-[#2F7950] text-white shadow-sm'
                }`}
              >
                {activeOrder.status === 'new' && 'Order Received'}
                {activeOrder.status === 'brewing' && 'Brewing Fresh 🔥'}
                {activeOrder.status === 'ready' && 'Ready to Serve ✨'}
                {activeOrder.status === 'completed' && 'Delivered ✓'}
              </span>

              <button
                onClick={() => setActiveOrderById(null)}
                title="Dismiss tracker banner"
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss order tracker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Step Timeline Tracker */}
          <div className="p-3 rounded-xl bg-black/35 border border-white/5 mb-3">
            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const isPassed = step.activeStatus.includes(activeOrder.status);
                return (
                  <div key={step.id} className="flex items-start gap-3 relative">
                    {/* Vertical connector line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-[22px] bottom-[-6px] w-0.5 transition-colors duration-500 ${
                          isPassed ? 'bg-[#2F7950]' : 'bg-white/15'
                        }`}
                      />
                    )}

                    {/* Icon Indicator */}
                    <div
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        step.isCurrent
                          ? 'bg-[#C97943] text-white ring-4 ring-[#C97943]/20 animate-pulse'
                          : isPassed
                          ? 'bg-[#2F7950] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="font-mono text-[9px]">{idx + 1}</span>
                      )}
                    </div>

                    {/* Text details */}
                    <div className="flex-1">
                      <div
                        className={`text-xs font-bold leading-tight ${
                          step.isCurrent
                            ? 'text-[#D7B18A]'
                            : isPassed
                            ? 'text-white'
                            : 'text-white/40'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[10px] text-white/60 font-mono mt-0.5">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer meta & Receipt CTA */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#F8F4ED]/80 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-bold text-[#D7B18A]">₹{activeOrder.total}</span>
              <span className="text-white/30">•</span>
              <span className="text-[#4ade80]">
                {activeOrder.paymentStatus === 'paid' ? 'Paid via UPI' : 'Pay at Counter'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C97943]/25 hover:bg-[#C97943]/40 border border-[#C97943]/50 text-[#D7B18A] text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95"
                title="View & Download Official Receipt Slip"
              >
                <Download className="w-3.5 h-3.5 text-[#C97943]" />
                <span>Receipt &amp; Download</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Customer Receipt Modal */}
      {isReceiptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div
            className="bg-[#F8F4ED] text-[#201814] rounded-3xl p-4 sm:p-6 max-w-sm w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-[#C97943]/40 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DED2]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#82766C] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#C97943]" />
                Official Tax Bill Receipt
              </span>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded-lg text-[#82766C] hover:text-[#201814]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="my-3 text-center font-mono text-xs space-y-2">
              <div>
                <h3 className="font-editorial text-2xl font-black text-[#201814] tracking-tight">
                  BREW STUDIO INDIA
                </h3>
                <p className="text-[10px] text-[#82766C] font-semibold mt-0.5">
                  Specialty Coffee Lab &amp; Bakehouse
                </p>
                <p className="text-[9px] text-[#82766C]">
                  100ft Rd, Indiranagar, Bengaluru
                </p>
                <div className="text-[9px] text-[#82766C] mt-1">
                  GSTIN: 29AABCU9603R1ZM • FSSAI: 11223344556677
                </div>
              </div>

              {/* Order Meta */}
              <div className="border-y border-dashed border-[#201814]/30 py-2 text-left space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>TOKEN: #{activeOrder.id}</span>
                  <span className="text-[#C97943]">{activeOrder.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>GUEST: {activeOrder.customerName}</span>
                  <span>
                    {new Date(activeOrder.createdAt).toLocaleDateString([], {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Itemized */}
              <div className="text-left space-y-1.5 py-1 text-[11px]">
                {activeOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[#201814]">
                        {it.quantity}x {it.name}
                      </div>
                      {it.customization && (
                        <div className="text-[9px] text-[#82766C]">
                          [{it.customization.milk?.name || 'Standard'}]
                          {it.customization.specialNote && ` "${it.customization.specialNote}"`}
                        </div>
                      )}
                    </div>
                    <span className="font-bold font-mono text-[#201814]">
                      ₹{it.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tax & Total */}
              <div className="border-t border-dashed border-[#201814]/30 pt-2 space-y-1 text-left text-[11px]">
                <div className="flex justify-between text-[#82766C]">
                  <span>Subtotal Amount</span>
                  <span>₹{activeOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#82766C]">
                  <span>GST (5%)</span>
                  <span>₹{activeOrder.tax}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#201814] pt-1 border-t border-[#201814]">
                  <span>TOTAL BILL (INR)</span>
                  <span className="text-base text-[#C97943]">
                    ₹{activeOrder.total}
                  </span>
                </div>
              </div>

              {/* Verified Payment status */}
              <div className="pt-2 text-[10px] text-[#82766C] border-t border-dashed border-[#201814]/30">
                <div className="flex justify-between font-semibold text-[#201814]">
                  <span>Payment Mode:</span>
                  <span>{activeOrder.paymentMode === 'instant_upi' ? 'UPI Online' : 'Counter POS'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-[#2F7950]">{activeOrder.paymentStatus.toUpperCase()} (VERIFIED)</span>
                </div>
              </div>
            </div>

            {/* Actions: Download Slip & Print */}
            <div className="pt-3 border-t border-[#E8DED2] flex gap-2">
              <button
                onClick={handleDownloadReceiptSlip}
                className="flex-1 py-2.5 rounded-xl bg-[#201814] hover:bg-[#C97943] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#D7B18A]" />
                <span>Download Slip</span>
              </button>
              <Link
                href={`/receipt?id=${activeOrder.id}`}
                target="_blank"
                className="px-3 py-2.5 rounded-xl bg-[#C97943] hover:bg-[#D7B18A] text-white hover:text-[#201814] text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                title="Open Fullscreen Receipt Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Full View</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
