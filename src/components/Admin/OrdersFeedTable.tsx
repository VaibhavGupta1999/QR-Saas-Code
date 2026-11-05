'use client';

import React, { useState } from 'react';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  Printer,
  Phone,
  User,
  CheckCircle2,
  FileText,
  Download,
  Share2,
  ArrowRight,
} from 'lucide-react';

export const OrdersFeedTable: React.FC = () => {
  const { orders, verifyOrderPayment, updateOrderStatus } = useBrewStudio();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const selectedReceiptOrder: Order | null =
    orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        o.tableNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
      case 'brewing':
        return 'bg-[#B86B35]/20 text-[#D4A373] border-[#B86B35]/40';
      case 'ready':
        return 'bg-[#28664B]/20 text-[#34D399] border-[#28664B]/40';
      case 'completed':
        return 'bg-white/5 text-[#9E9083] border-white/10';
      case 'cancelled':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
  };

  const getNextStatusAction = (
    status: OrderStatus
  ): { next: OrderStatus; label: string } | null => {
    if (status === 'new') return { next: 'brewing', label: 'Start Prep' };
    if (status === 'brewing') return { next: 'ready', label: 'Mark Ready' };
    if (status === 'ready') return { next: 'completed', label: 'Complete' };
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSlip = (ord: Order) => {
    const text = `
========================================
          BREW STUDIO INDIA
    Specialty Coffee Lab & Bakehouse
100ft Rd, Indiranagar, Bengaluru - 560038
GSTIN: 29AABCU9603R1ZM | FSSAI: 11223344556677
========================================
TOKEN: #${ord.id}
TABLE: ${ord.tableNumber}
GUEST: ${ord.customerName}
${ord.customerPhone ? `PHONE: ${ord.customerPhone}\n` : ''}DATE:  ${new Date(
      ord.createdAt
    ).toLocaleString()}
----------------------------------------
ITEMIZED BILL:
${ord.items
  .map(
    (it) =>
      `  ${it.quantity}x ${it.name} - ₹${it.totalPrice}${
        it.customization?.milk?.name ? `\n     [${it.customization.milk.name}]` : ''
      }`
  )
  .join('\n')}
----------------------------------------
Subtotal:       ₹${ord.subtotal}
CGST (2.5%):    ₹${Math.round(ord.tax / 2)}
SGST (2.5%):    ₹${Math.round(ord.tax / 2)}
----------------------------------------
TOTAL BILL:     ₹${ord.total}
PAYMENT:        ${ord.paymentMode === 'instant_upi' ? 'UPI Online' : 'Counter POS'}
STATUS:         ${ord.paymentStatus.toUpperCase()}
========================================
 Thank you for visiting Brew Studio India!
========================================`.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrewStudio_Receipt_${ord.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = (ord: Order) => {
    const cleanPhone = (ord.customerPhone || '').replace(/\D/g, '');
    const msg = `*BREW STUDIO INDIA — Official Tax Receipt*\nToken: *#${ord.id}* (${ord.tableNumber})\nGuest: ${ord.customerName}\n\n*Order Summary:*\n${ord.items
      .map((i) => `• ${i.quantity}x ${i.name} — ₹${i.totalPrice}`)
      .join('\n')}\n\nSubtotal: ₹${ord.subtotal}\nGST (5%): ₹${ord.tax}\n*Grand Total: ₹${ord.total}* (${ord.paymentStatus.toUpperCase()})\n\nThank you for brewing with us!`;
    const waUrl = `https://wa.me/${cleanPhone.length >= 10 ? cleanPhone : ''}?text=${encodeURIComponent(
      msg
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian p-4 sm:p-6 mb-8 text-[#F5F0E6]">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A221E] no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#F5F0E6]">
              Live Order Feed &amp; 80mm Thermal Receipt Inspector
            </h2>
            <span className="px-2.5 py-0.5 rounded-md bg-[#B86B35]/20 text-[#D4A373] border border-[#B86B35]/30 font-mono text-[10px] font-bold tabular-nums">
              {orders.length} Tickets
            </span>
          </div>
          <p className="text-xs text-[#9E9083] font-mono mt-0.5">
            Select any order row to inspect its 80mm GST invoice, verify counter payments, or advance prep status
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'all', label: 'All Orders' },
              { key: 'new', label: 'New' },
              { key: 'brewing', label: 'In Prep' },
              { key: 'ready', label: 'Ready' },
              { key: 'completed', label: 'Completed' },
            ] as const
          ).map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                statusFilter === st.key
                  ? 'bg-[#B86B35] text-white font-bold'
                  : 'bg-[#211A16] text-[#9E9083] hover:text-white border border-[#2A221E]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="py-3 no-print">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9083]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by token (#BS-204), guest name, mobile, or table..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#211A16] border border-[#2A221E] text-xs text-[#F5F0E6] placeholder:text-[#9E9083] focus:outline-none focus:border-[#B86B35]"
          />
        </div>
      </div>

      {/* Split-Pane Workspace: Left 7 Cols = Live Orders Table, Right 5 Cols = Sticky 80mm Thermal Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Pane: Orders Feed */}
        <div className="lg:col-span-7 space-y-3 no-print">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-[#9E9083] font-mono text-xs bg-[#211A16]/50 rounded-2xl border border-[#2A221E] p-6">
              No orders match your current filter criteria.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedReceiptOrder?.id === ord.id;
              const nextAction = getNextStatusAction(ord.status);

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#211A16] border-[#B86B35] ring-1 ring-[#B86B35]/30 shadow-md'
                      : 'bg-[#171210] hover:bg-[#211A16]/60 border-[#2A221E]'
                  }`}
                >
                  {/* Top Row: Token, Table, Guest & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2A221E]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#D4A373] tabular-nums">
                        #{ord.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0F0C0A] border border-[#2A221E] text-[#F5F0E6] text-[11px] font-mono font-semibold">
                        {ord.tableNumber}
                      </span>
                      <span className="font-sans text-xs font-bold text-[#F5F0E6] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#B86B35]" />
                        <span>{ord.customerName}</span>
                      </span>
                      {ord.customerPhone && (
                        <span className="font-mono text-[11px] text-[#9E9083] hidden sm:inline flex items-center gap-1">
                          <Phone className="w-3 h-3 inline mr-0.5" />
                          {ord.customerPhone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Itemized Summary */}
                  <div className="py-2.5 text-xs text-[#F5F0E6]/85 space-y-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          <strong className="font-mono text-[#D4A373]">
                            {item.quantity}×
                          </strong>{' '}
                          {item.name}
                          {item.customization?.milk?.name &&
                            item.station === 'barista' && (
                              <span className="text-[11px] text-[#9E9083] font-mono ml-1.5">
                                [{item.customization.milk.name}]
                              </span>
                            )}
                        </span>
                        <span className="font-mono text-[11px] text-[#9E9083] tabular-nums shrink-0">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row: Total, Inline Payment Verification & Status Advance */}
                  <div className="pt-2.5 border-t border-[#2A221E] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-[#F5F0E6] tabular-nums">
                        ₹{ord.total}
                      </span>

                      {ord.paymentStatus === 'paid' ? (
                        <span className="px-2 py-0.5 rounded bg-[#28664B]/20 border border-[#28664B]/40 text-[#34D399] text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Paid ({ord.paymentMode === 'instant_upi' ? 'UPI' : 'Counter'})
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            verifyOrderPayment(ord.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-[#28664B] text-amber-300 hover:text-white border border-amber-500/40 text-[10px] font-bold transition-colors"
                        >
                          ✓ Verify Counter Paid
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {nextAction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(ord.id, nextAction.next);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0F0C0A] hover:bg-[#B86B35] text-[#D4A373] hover:text-white border border-[#2A221E] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>{nextAction.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(ord.id);
                          setTimeout(() => window.print(), 150);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#B86B35]/20 hover:bg-[#B86B35] text-[#D4A373] hover:text-white border border-[#B86B35]/40 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Sticky 80mm Thermal Receipt Inspector */}
        <div className="lg:col-span-5 lg:sticky lg:top-16">
          {selectedReceiptOrder && (
            <div
              id="printable-receipt"
              className="bg-[#F9F6F0] text-[#18120F] rounded-2xl p-5 shadow-2xl border border-[#E6DFD5] flex flex-col justify-between"
            >
              {/* Inspector Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5] no-print">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5C5148] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#B86B35]" />
                  <span>80mm Thermal GST Slip</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#18120F] text-[#F9F6F0] font-mono text-[10px] font-bold">
                  #{selectedReceiptOrder.id}
                </span>
              </div>

              {/* Authentic 80mm Thermal Receipt Paper Body */}
              <div className="my-3 text-center font-mono text-xs space-y-3">
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#18120F] tracking-tight">
                    BREW STUDIO INDIA
                  </h3>
                  <p className="text-[10px] text-[#5C5148] font-semibold mt-0.5">
                    Specialty Coffee Roastery &amp; Boulangerie
                  </p>
                  <p className="text-[10px] text-[#8C7E71]">
                    100ft Rd, Indiranagar, Bengaluru • Bandra West, Mumbai
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[9px] text-[#8C7E71] mt-1">
                    <span>GSTIN: 29AABCU9603R1ZM</span>
                    <span>•</span>
                    <span>FSSAI: 11223344556677</span>
                  </div>
                </div>

                {/* Order Meta Header */}
                <div className="border-y border-dashed border-[#18120F]/30 py-2.5 text-left space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>TOKEN: #{selectedReceiptOrder.id}</span>
                    <span className="text-[#B86B35]">{selectedReceiptOrder.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GUEST: {selectedReceiptOrder.customerName}</span>
                    <span suppressHydrationWarning>
                      {new Date(selectedReceiptOrder.createdAt).toLocaleDateString([], {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {selectedReceiptOrder.customerPhone && (
                    <div className="flex justify-between text-[#5C5148]">
                      <span>MOBILE: {selectedReceiptOrder.customerPhone}</span>
                      <span suppressHydrationWarning>
                        {new Date(selectedReceiptOrder.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Itemized Breakdown */}
                <div className="text-left space-y-2 py-1">
                  {selectedReceiptOrder.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start text-[11px] gap-2"
                    >
                      <div>
                        <div className="font-bold text-[#18120F]">
                          {it.quantity}× {it.name}
                        </div>
                        {it.customization && it.station === 'barista' && (
                          <div className="text-[10px] text-[#5C5148] leading-snug">
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
                      <span className="font-bold font-mono text-[#18120F] shrink-0 tabular-nums">
                        ₹{it.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tax & Grand Total */}
                <div className="border-t border-dashed border-[#18120F]/30 pt-2.5 space-y-1 text-left text-[11px]">
                  <div className="flex justify-between text-[#5C5148] tabular-nums">
                    <span>Taxable Subtotal</span>
                    <span>₹{selectedReceiptOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#5C5148] tabular-nums">
                    <span>CGST (2.5%)</span>
                    <span>₹{Math.round(selectedReceiptOrder.tax / 2)}</span>
                  </div>
                  <div className="flex justify-between text-[#5C5148] tabular-nums">
                    <span>SGST (2.5%)</span>
                    <span>₹{Math.round(selectedReceiptOrder.tax / 2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#18120F] pt-1.5 border-t border-[#18120F] tabular-nums">
                    <span>GRAND TOTAL (INR)</span>
                    <span className="text-base text-[#B86B35]">
                      ₹{selectedReceiptOrder.total}
                    </span>
                  </div>
                </div>

                {/* Settlement Status */}
                <div className="pt-2 text-[10px] text-[#5C5148] border-t border-dashed border-[#18120F]/30 space-y-1">
                  <div className="flex justify-between font-semibold text-[#18120F]">
                    <span>Settlement Mode:</span>
                    <span>
                      {selectedReceiptOrder.paymentMode === 'instant_upi'
                        ? 'Instant UPI Online'
                        : 'Counter POS'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Status:</span>
                    <span
                      className={`font-bold ${
                        selectedReceiptOrder.paymentStatus === 'paid'
                          ? 'text-[#28664B]'
                          : 'text-amber-700'
                      }`}
                    >
                      {selectedReceiptOrder.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar inside Inspector */}
              <div className="pt-3 border-t border-[#E6DFD5] grid grid-cols-3 gap-2 no-print">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-2 rounded-xl bg-[#18120F] hover:bg-[#B86B35] text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSlip(selectedReceiptOrder)}
                  className="py-2.5 px-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD5] text-[#18120F] border border-[#E6DFD5] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B86B35]" />
                  <span>Save .TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(selectedReceiptOrder)}
                  className="py-2.5 px-2 rounded-xl bg-[#28664B] hover:bg-[#1E503A] text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
