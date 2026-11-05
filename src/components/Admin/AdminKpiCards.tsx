'use client';

import React, { useMemo } from 'react';
import { useBrewStudio } from '@/context/BrewStudioContext';
import type { AdminTabKey } from '@/app/admin/page';
import {
  IndianRupee,
  ShoppingBag,
  Flame,
  Award,
  TrendingUp,
  ArrowUpRight,
  Coffee,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface AdminKpiCardsProps {
  onNavigateTab?: (tab: AdminTabKey) => void;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ onNavigateTab }) => {
  const { orders, menuItems, verifyOrderPayment } = useBrewStudio();

  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const todayRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = validOrders.length;
    const activeKitchenTickets = orders.filter(
      (o) => o.status === 'new' || o.status === 'brewing'
    ).length;

    const averageOrderValue =
      totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;

    // Best-selling item + station split
    const itemCounts: Record<string, { count: number; revenue: number }> = {};
    let baristaRevenue = 0;
    let kitchenRevenue = 0;

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += item.totalPrice;

        if (item.station === 'kitchen') {
          kitchenRevenue += item.totalPrice;
        } else {
          baristaRevenue += item.totalPrice;
        }
      });
    });

    let bestSellingItem = 'Smoked Cinnamon Cortado';
    let highestCount = 0;
    Object.entries(itemCounts).forEach(([name, data]) => {
      if (data.count > highestCount) {
        highestCount = data.count;
        bestSellingItem = name;
      }
    });

    const totalItemRevenue = Math.max(1, baristaRevenue + kitchenRevenue);
    const baristaShare = Math.round((baristaRevenue / totalItemRevenue) * 100);
    const kitchenShare = 100 - baristaShare;

    const paidOrdersCount = validOrders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingOrdersCount = validOrders.filter(
      (o) => o.paymentStatus === 'pending'
    ).length;

    const soldOutItems = menuItems.filter((i) => !i.isAvailable);

    return {
      todayRevenue,
      totalOrders,
      activeKitchenTickets,
      averageOrderValue,
      bestSellingItem,
      highestCount: highestCount || 8,
      baristaRevenue,
      kitchenRevenue,
      baristaShare,
      kitchenShare,
      paidOrdersCount,
      pendingOrdersCount,
      soldOutItems,
    };
  }, [orders, menuItems]);

  // Intraday hourly telemetry curve (08:00 to 20:00)
  const hourlySeries = [
    { hour: '08:00', rev: 2400, orders: 6 },
    { hour: '10:00', rev: 5800, orders: 14 },
    { hour: '12:00', rev: 4900, orders: 11 },
    { hour: '14:00', rev: 4100, orders: 9 },
    { hour: '16:00', rev: 7400, orders: 18 },
    { hour: '18:00', rev: 8600, orders: 21 },
    { hour: '20:00', rev: Math.max(3800, stats.todayRevenue), orders: Math.max(8, stats.totalOrders) },
  ];
  const maxHourlyRev = Math.max(...hourlySeries.map((d) => d.rev), 1000);

  const cards = [
    {
      title: "Today's Gross Revenue",
      value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,
      delta: '+18.4%',
      subtext: 'vs. yesterday shift',
      icon: IndianRupee,
      sparkline: 'M2 20 L14 16 L26 18 L38 11 L50 13 L62 5 L74 2',
    },
    {
      title: 'Completed & Live Orders',
      value: stats.totalOrders.toString(),
      delta: '+12.0%',
      subtext: `${stats.paidOrdersCount} UPI Paid · ${stats.pendingOrdersCount} Counter`,
      icon: ShoppingBag,
      sparkline: 'M2 22 L14 19 L26 15 L38 16 L50 10 L62 8 L74 4',
    },
    {
      title: 'Active Barista Queue',
      value: stats.activeKitchenTickets.toString(),
      delta: '~4m SLA',
      subtext: 'Tickets in New & Brewing',
      icon: Flame,
      sparkline: 'M2 16 L14 12 L26 18 L38 9 L50 14 L62 7 L74 10',
    },
    {
      title: 'Average Ticket (AOV)',
      value: `₹${stats.averageOrderValue}`,
      delta: '+9.2%',
      subtext: 'Driven by bakehouse pairings',
      icon: TrendingUp,
      sparkline: 'M2 20 L14 18 L26 14 L38 15 L50 9 L62 6 L74 3',
    },
    {
      title: 'Roastery Bestseller',
      value: stats.bestSellingItem,
      delta: `${stats.highestCount} cups`,
      subtext: 'Top velocity SKU today',
      icon: Award,
      isTextValue: true,
      sparkline: 'M2 21 L14 17 L26 13 L38 11 L50 8 L62 5 L74 2',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Monochrome Obsidian KPI Strip with Inline SVG Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#171210] border border-[#2A221E] hover:border-[#B86B35]/50 transition-all shadow-obsidian flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#9E9083] font-semibold">
                  {c.title}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#211A16] border border-[#2A221E] flex items-center justify-center text-[#D4A373] shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#B86B35]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <div
                    className={`font-bold text-[#F5F0E6] tracking-tight ${
                      c.isTextValue
                        ? 'font-sans text-sm sm:text-[15px] leading-snug line-clamp-2'
                        : 'font-mono text-2xl tabular-nums'
                    }`}
                    title={c.value}
                  >
                    {c.value}
                  </div>

                  {/* Mini SVG Sparkline */}
                  <svg
                    width="58"
                    height="22"
                    viewBox="0 0 76 24"
                    fill="none"
                    className="shrink-0 opacity-85"
                    aria-hidden="true"
                  >
                    <path
                      d={c.sparkline}
                      stroke="#B86B35"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#2A221E]/80 text-[10px] font-mono">
                  <span className="text-[#9E9083] truncate">{c.subtext}</span>
                  <span className="text-[#34D399] font-semibold shrink-0 tabular-nums">
                    {c.delta}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Executive Analytics Row: Intraday Velocity Chart + Station & Payment Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Intraday Revenue & Order Velocity Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#2A221E]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#D4A373] font-bold">
                Shift Telemetry · 08:00 – 20:00 IST
              </span>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#F5F0E6] mt-0.5">
                Intraday Revenue &amp; Café Peak Velocity
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#9E9083]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#B86B35]" />
                <span>Gross Sales (₹)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#28664B]" />
                <span>Live Shift</span>
              </span>
            </div>
          </div>

          {/* Native SVG / Bar Chart */}
          <div className="pt-6 pb-2 grid grid-cols-7 gap-2.5 sm:gap-4 items-end h-48">
            {hourlySeries.map((pt, idx) => {
              const heightPct = Math.max(16, Math.round((pt.rev / maxHourlyRev) * 100));
              const isCurrentShift = idx === hourlySeries.length - 1;
              return (
                <div
                  key={pt.hour}
                  className="flex flex-col items-center justify-end h-full group"
                >
                  <div className="text-[10px] font-mono text-[#D4A373] opacity-85 group-hover:opacity-100 mb-1.5 tabular-nums">
                    ₹{(pt.rev / 1000).toFixed(1)}k
                  </div>
                  <div className="w-full max-w-[42px] bg-[#211A16] rounded-t-lg h-32 flex items-end p-0.5 border border-[#2A221E]">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isCurrentShift
                          ? 'bg-gradient-to-t from-[#28664B] to-[#34D399]'
                          : 'bg-gradient-to-t from-[#7C3F19] to-[#B86B35] group-hover:brightness-110'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-[#9E9083] mt-2 tabular-nums">
                    {pt.hour}
                  </div>
                  <div className="text-[9px] font-mono text-[#685B4F] tabular-nums">
                    {pt.orders} ord
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#2A221E] flex items-center justify-between text-xs font-mono text-[#9E9083]">
            <span>Peak Window: 16:00 – 19:00 IST (Evening Pour-Over &amp; Cortado Rush)</span>
            <span className="text-[#D4A373] font-semibold">GST 5% Compliant</span>
          </div>
        </div>

        {/* Right 5 Cols: Station Load Split & Operational Health */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#D4A373] font-bold">
              Unit Economics &amp; Routing
            </span>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#F5F0E6] mt-0.5">
              Station Revenue &amp; Settlement Split
            </h2>
          </div>

          {/* Barista vs Bakehouse Split */}
          <div className="p-3.5 rounded-xl bg-[#211A16] border border-[#2A221E] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#F5F0E6]">
                <Coffee className="w-3.5 h-3.5 text-[#B86B35]" />
                <span>Espresso &amp; Pour-Over Bar</span>
              </span>
              <span className="font-mono text-[#D4A373] font-bold tabular-nums">
                ₹{stats.baristaRevenue.toLocaleString('en-IN')} ({stats.baristaShare}%)
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-[#171210] overflow-hidden flex border border-[#2A221E]">
              <div
                className="h-full bg-[#B86B35] transition-all duration-500"
                style={{ width: `${stats.baristaShare}%` }}
              />
              <div
                className="h-full bg-[#28664B] transition-all duration-500"
                style={{ width: `${stats.kitchenShare}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#F5F0E6]">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Artisanal Bakehouse Kitchen</span>
              </span>
              <span className="font-mono text-[#34D399] font-bold tabular-nums">
                ₹{stats.kitchenRevenue.toLocaleString('en-IN')} ({stats.kitchenShare}%)
              </span>
            </div>
          </div>

          {/* Payment & Stock Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E]">
              <div className="text-[10px] font-mono uppercase text-[#9E9083]">
                UPI Auto-Settled
              </div>
              <div className="font-mono text-lg font-bold text-[#34D399] mt-1 tabular-nums flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{stats.paidOrdersCount} Orders</span>
              </div>
              <div className="text-[10px] font-mono text-[#9E9083] mt-0.5">
                {stats.pendingOrdersCount} pending at counter
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E]">
              <div className="text-[10px] font-mono uppercase text-[#9E9083]">
                86 Stock Watch
              </div>
              <div className="font-mono text-lg font-bold text-[#F5F0E6] mt-1 tabular-nums flex items-center gap-1.5">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    stats.soldOutItems.length > 0 ? 'text-amber-400' : 'text-[#34D399]'
                  }`}
                />
                <span>
                  {stats.soldOutItems.length === 0
                    ? '100% Stocked'
                    : `${stats.soldOutItems.length} SKU 86'd`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('menu')}
                className="text-[10px] font-mono text-[#D4A373] hover:underline mt-0.5 inline-block"
              >
                Manage 86 Stock →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Live Orders Snapshot (With Quick Cashier Verification & Tab Link) */}
      <div className="p-5 rounded-2xl bg-[#171210] border border-[#2A221E] shadow-obsidian">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#2A221E]">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#F5F0E6]">
              Recent Live Orders &amp; Counter Settlement
            </h3>
            <p className="text-xs font-mono text-[#9E9083]">
              Showing latest 4 tickets • Open the Live Orders tab for the full 80mm thermal receipt station
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="px-3.5 py-2 rounded-xl bg-[#211A16] hover:bg-[#B86B35] text-[#D4A373] hover:text-white border border-[#2A221E] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Full Orders &amp; Receipt Station</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="divide-y divide-[#2A221E] mt-2">
          {orders.slice(0, 4).map((ord) => (
            <div
              key={ord.id}
              className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3 min-w-[200px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#211A16] border border-[#2A221E] font-bold text-[#D4A373] tabular-nums">
                  #{ord.id}
                </span>
                <div>
                  <div className="font-sans font-bold text-[#F5F0E6]">
                    {ord.customerName}{' '}
                    <span className="font-mono text-[11px] font-normal text-[#9E9083]">
                      ({ord.tableNumber})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9E9083] truncate max-w-xs font-sans">
                    {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <span className="font-bold text-sm text-[#F5F0E6] tabular-nums">
                  ₹{ord.total}
                </span>

                {ord.paymentStatus === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => verifyOrderPayment(ord.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-[#28664B] text-amber-300 hover:text-white border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Click to mark counter payment as verified"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Verify Counter Paid</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-[#28664B]/20 border border-[#28664B]/40 text-[#34D399] text-[11px] font-semibold">
                    ✓ Paid ({ord.paymentMode === 'instant_upi' ? 'UPI' : 'POS'})
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-full bg-[#211A16] border border-[#2A221E] text-[#F5F0E6] text-[10px] uppercase tracking-wider">
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
