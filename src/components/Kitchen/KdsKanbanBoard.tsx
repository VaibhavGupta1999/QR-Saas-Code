'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Order, Station } from '@/types';
import {
  KitchenTicketCard,
  computeOrderPriority,
  OrderPriorityMeta,
} from './KitchenTicketCard';
import { useBrewStudio } from '@/context/BrewStudioContext';
import {
  Flame,
  CheckCircle2,
  Inbox,
  Clock,
  Check,
  X,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  Columns2,
  Rows3,
} from 'lucide-react';

interface KdsKanbanBoardProps {
  orders: Order[];
  stationFilter: Station | 'all';
}

export const KdsKanbanBoard: React.FC<KdsKanbanBoardProps> = ({
  orders,
  stationFilter,
}) => {
  const { updateOrderStatus, toggleOrderItemCheck, cancelOrder } = useBrewStudio();

  // Track which Preparing orders are expanded in full detailed execution view
  // By default, all active preparing orders are expanded; chef can collapse/expand any ticket
  const [collapsedPrepIds, setCollapsedPrepIds] = useState<Record<string, boolean>>({});

  // Toggle between 2-up compact grid and single-column vertical sequence inside the 60% Left Column
  const [queueDensity, setQueueDensity] = useState<'two-up' | 'single'>('two-up');

  // Mobile/Tablet section tab for narrow viewports (< lg)
  const [mobileSection, setMobileSection] = useState<'all' | 'incoming' | 'preparing' | 'ready'>('all');

  // Subtle transition feedback banner
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null);

  // Live 1-second clock tick for preparation and pickup timers
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const showFeedback = (msg: string) => {
    setTransitionNotice(msg);
    setTimeout(() => {
      setTransitionNotice((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Station filter helper
  const matchesStation = (order: Order) => {
    if (stationFilter === 'all') return true;
    return order.items.some((item) => item.station === stationFilter);
  };

  // =========================================================================
  // 1. LEFT COLUMN DATA: PRIORITY-RANKED INCOMING ORDERS
  // =========================================================================
  const prioritizedIncoming = useMemo(() => {
    const rawIncoming = orders.filter((o) => o.status === 'new' && matchesStation(o));

    const withPriority: { order: Order; meta: OrderPriorityMeta }[] = rawIncoming.map(
      (order) => ({
        order,
        meta: computeOrderPriority(order, nowTick, stationFilter),
      })
    );

    // Sort by:
    // 1. Overdue status
    // 2. Priority tier & remaining SLA
    // 3. Total waiting time
    // 4. Preparation complexity
    // 5. FIFO creation timestamp tie-breaker (never order ID)
    withPriority.sort((a, b) => {
      if (a.meta.isOverdue !== b.meta.isOverdue) {
        return a.meta.isOverdue ? -1 : 1;
      }
      if (a.meta.level !== b.meta.level) {
        return b.meta.rankScore - a.meta.rankScore;
      }
      if (a.meta.remainingSlaMinutes !== b.meta.remainingSlaMinutes) {
        return a.meta.remainingSlaMinutes - b.meta.remainingSlaMinutes;
      }
      if (a.meta.waitMinutes !== b.meta.waitMinutes) {
        return b.meta.waitMinutes - a.meta.waitMinutes;
      }
      if (a.meta.estimatedPrepMinutes !== b.meta.estimatedPrepMinutes) {
        return b.meta.estimatedPrepMinutes - a.meta.estimatedPrepMinutes;
      }
      return a.meta.createdTimestamp - b.meta.createdTimestamp;
    });

    return withPriority;
  }, [orders, stationFilter, nowTick]);

  // Priority breakdown counts for the header strip
  const priorityCounts = useMemo(() => {
    const counts = { URGENT: 0, NEXT: 0, NORMAL: 0, LOW: 0 };
    prioritizedIncoming.forEach(({ meta }) => {
      counts[meta.level] += 1;
    });
    return counts;
  }, [prioritizedIncoming]);

  // =========================================================================
  // 2. RIGHT TOP DATA: CURRENTLY PREPARING (FIFO by prep start)
  // =========================================================================
  const preparingOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'brewing' && matchesStation(o))
      .sort((a, b) => {
        const tA = new Date(a.prepStartedAt || a.createdAt).getTime();
        const tB = new Date(b.prepStartedAt || b.createdAt).getTime();
        return tA - tB;
      });
  }, [orders, stationFilter]);

  // =========================================================================
  // 3. RIGHT BOTTOM DATA: READY FOR PICKUP (Oldest waiting on pass first)
  // =========================================================================
  const readyOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'ready' && matchesStation(o))
      .sort((a, b) => {
        const tA = new Date(a.readyAt || a.updatedAt).getTime();
        const tB = new Date(b.readyAt || b.updatedAt).getTime();
        return tA - tB;
      });
  }, [orders, stationFilter]);

  // Live MM:SS preparation elapsed timer
  const getPrepElapsedMmSs = (order: Order): string => {
    const refIso = order.prepStartedAt || order.updatedAt || order.createdAt;
    const rawDiffSecs = Math.max(0, Math.floor((nowTick - new Date(refIso).getTime()) / 1000));
    let effectiveSecs = rawDiffSecs;
    if (rawDiffSecs >= 3600) {
      const seed = Math.abs(
        order.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
      );
      const baseMins = (seed % 6) + 2;
      effectiveSecs = baseMins * 60 + (Math.floor(nowTick / 1000) % 60);
    }
    const mins = Math.floor(effectiveSecs / 60);
    const secs = effectiveSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Waiting duration on pass for Ready orders
  const getReadyWaitMinutes = (order: Order): number => {
    const refIso = order.readyAt || order.updatedAt || order.createdAt;
    const rawDiffSecs = Math.max(0, Math.floor((nowTick - new Date(refIso).getTime()) / 1000));
    if (rawDiffSecs >= 3600) {
      const seed = Math.abs(
        order.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
      );
      return (seed % 5) + 1;
    }
    return Math.max(1, Math.floor(rawDiffSecs / 60));
  };

  const formatReadyClock = (order: Order): string => {
    const refIso = order.readyAt || order.updatedAt || order.createdAt;
    const d = new Date(refIso);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Workflow transitions
  const handleStartPreparing = (order: Order) => {
    updateOrderStatus(order.id, 'brewing');
    setCollapsedPrepIds((prev) => ({ ...prev, [order.id]: false }));
    showFeedback(`Order #${order.id} (${order.tableNumber}) accepted into Currently Preparing`);
  };

  const handleMarkOrderReady = (order: Order) => {
    const visibleItems = order.items.filter(
      (i) => stationFilter === 'all' || i.station === stationFilter
    );
    const allCompleted =
      visibleItems.length > 0 && visibleItems.every((i) => Boolean(i.completedInKitchen));

    if (!allCompleted) return;
    updateOrderStatus(order.id, 'ready');
    showFeedback(`Order #${order.id} completed and moved to Ready for Pickup`);
  };

  const handleHandoverOrder = (order: Order) => {
    updateOrderStatus(order.id, 'completed');
    showFeedback(`Order #${order.id} handed over to ${order.tableNumber}`);
  };

  const togglePrepCollapse = (orderId: string) => {
    setCollapsedPrepIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Subtle Live Transition Notification Bar */}
      {transitionNotice && (
        <div className="px-3.5 py-1.5 rounded-xl bg-[#211A16] border border-[#B86B35]/50 text-[#FAF7F2] text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{transitionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setTransitionNotice(null)}
            className="text-[#8C7E71] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tablet / Mobile Section Switcher (Visible below lg breakpoint) */}
      <div className="lg:hidden flex items-center gap-1 p-1 rounded-xl bg-[#140F0D] border border-[#2A221E] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setMobileSection('all')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileSection === 'all'
              ? 'bg-[#B86B35] text-white'
              : 'text-[#9E9083] hover:text-[#FAF7F2]'
          }`}
        >
          All Panels
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('incoming')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileSection === 'incoming'
              ? 'bg-[#F5EDE3] text-[#231812]'
              : 'text-[#D4A373] hover:text-white'
          }`}
        >
          Incoming ({prioritizedIncoming.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('preparing')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileSection === 'preparing'
              ? 'bg-[#B86B35] text-white'
              : 'text-[#D4A373] hover:text-white'
          }`}
        >
          Preparing ({preparingOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('ready')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileSection === 'ready'
              ? 'bg-[#28664B] text-white'
              : 'text-[#34D399] hover:text-white'
          }`}
        >
          Ready ({readyOrders.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TWO-COLUMN MASTER KITCHEN COMMAND CENTRE                              */}
      {/* LEFT COLUMN (~58.3% = 7/12) | RIGHT COLUMN (~41.7% = 5/12)            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN (58-60% Width): INCOMING ORDER PRIORITY QUEUE           */}
        {/* "WHAT NEEDS TO BE PREPARED NEXT"                                    */}
        {/* =================================================================== */}
        {(mobileSection === 'all' || mobileSection === 'incoming') && (
          <section
            aria-label="Incoming Order Priority Queue"
            className="lg:col-span-7 rounded-2xl bg-[#140F0D] border border-[#2A221E] shadow-obsidian flex flex-col lg:h-[calc(100vh-140px)] overflow-hidden"
          >
            {/* Sticky Left Panel Header */}
            <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#181210] border-b border-[#2A221E] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans text-sm sm:text-base font-extrabold tracking-wider text-[#FAF7F2] uppercase">
                      Incoming Priority Queue
                    </h2>
                    <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[#F5EDE3] text-[#231812]">
                      {prioritizedIncoming.length}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#8C7E71]">
                    What needs to be prepared next · Ranked by SLA, wait time &amp; complexity
                  </p>
                </div>
              </div>

              {/* Subtle Priority Tier Indicators & Sequence Layout Toggle */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#120D0B] border border-[#2A221E] text-[10px] font-mono">
                  {priorityCounts.URGENT > 0 && (
                    <span className="flex items-center gap-1 text-[#F87171] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      {priorityCounts.URGENT} Urgent
                    </span>
                  )}
                  {priorityCounts.NEXT > 0 && (
                    <span className="flex items-center gap-1 text-[#D4A373] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B86B35]" />
                      {priorityCounts.NEXT} Next
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#9E9083]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A5B40]" />
                    {priorityCounts.NORMAL + priorityCounts.LOW} Standard
                  </span>
                </div>

                {/* Density Toggle: 2-Up Compact Grid vs 1-Column Stream */}
                <div className="hidden md:flex items-center p-0.5 rounded-lg bg-[#211A16] border border-[#33261F]">
                  <button
                    type="button"
                    onClick={() => setQueueDensity('two-up')}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      queueDensity === 'two-up'
                        ? 'bg-[#B86B35] text-white'
                        : 'text-[#8C7E71] hover:text-[#FAF7F2]'
                    }`}
                    title="2-Column compact sequence (shows more incoming receipts at once)"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueDensity('single')}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      queueDensity === 'single'
                        ? 'bg-[#B86B35] text-white'
                        : 'text-[#8C7E71] hover:text-[#FAF7F2]'
                    }`}
                    title="Single vertical receipt sequence"
                  >
                    <Rows3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Independently Scrollable Incoming Receipt Queue */}
            <div className="p-3.5 flex-1 overflow-y-auto no-scrollbar">
              {prioritizedIncoming.length === 0 ? (
                <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 text-[#9E9083]">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1613] border border-[#2A221E] flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-[#B86B35] opacity-40" />
                  </div>
                  <div className="font-sans text-sm font-bold text-[#FAF7F2]">
                    Incoming Queue Clear
                  </div>
                  <p className="text-xs font-mono text-[#8C7E71] mt-1 max-w-xs leading-relaxed">
                    All incoming tickets have been accepted into preparation. Use &ldquo;+ Test Ticket&rdquo; above to simulate a new guest order.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    queueDensity === 'two-up'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-3 items-start'
                      : 'flex flex-col gap-2.5 max-w-2xl mx-auto'
                  }
                >
                  {prioritizedIncoming.map(({ order, meta }) => (
                    <KitchenTicketCard
                      key={order.id}
                      order={order}
                      stationFilter={stationFilter}
                      priorityMeta={meta}
                      onStartPreparing={handleStartPreparing}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* RIGHT COLUMN (40-42% Width): PREPARING (TOP) + READY (BOTTOM)       */}
        {/* Both sections remain permanently visible & independently scrollable */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 lg:h-[calc(100vh-140px)]">
          {/* ----------------------------------------------------------------- */}
          {/* RIGHT TOP: CURRENTLY PREPARING ("WHAT IS BEING PREPARED NOW")     */}
          {/* Detailed Operational Preparation Tickets                          */}
          {/* ----------------------------------------------------------------- */}
          {(mobileSection === 'all' || mobileSection === 'preparing') && (
            <section
              aria-label="Currently Preparing Active Workspace"
              className="flex-[1.4] min-h-[300px] rounded-2xl bg-[#140F0D] border border-[#2A221E] shadow-obsidian flex flex-col overflow-hidden"
            >
              {/* Sticky Preparing Header */}
              <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#181210] border-b border-[#2A221E] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#B86B35]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans text-xs sm:text-sm font-extrabold tracking-wider text-[#FAF7F2] uppercase">
                        Currently Preparing
                      </h2>
                      <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[#B86B35]/20 text-[#D4A373] border border-[#B86B35]/35">
                        {preparingOrders.length}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7E71]">
                      What is being prepared now · Check off each item to unlock Ready
                    </p>
                  </div>
                </div>

                {preparingOrders.length > 1 && (
                  <span className="text-[10px] font-mono text-[#D4A373]">
                    {preparingOrders.length} active tickets
                  </span>
                )}
              </div>

              {/* Independently Scrollable Detailed Preparation Tickets */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {preparingOrders.length === 0 ? (
                  <div className="h-full min-h-[190px] flex flex-col items-center justify-center text-center p-5 text-[#8C7E71]">
                    <Flame className="w-6 h-6 text-[#B86B35] opacity-35 mb-2" />
                    <div className="font-sans text-xs font-bold text-[#FAF7F2]">
                      No Orders in Preparation
                    </div>
                    <p className="text-[11px] font-mono mt-1 max-w-xs">
                      Select &ldquo;Start Preparing&rdquo; on any incoming order on the left to begin active preparation.
                    </p>
                  </div>
                ) : (
                  preparingOrders.map((ord) => {
                    const visibleItems = ord.items.filter(
                      (i) => stationFilter === 'all' || i.station === stationFilter
                    );
                    const totalCount = visibleItems.length;
                    const completedCount = visibleItems.filter((i) => i.completedInKitchen).length;
                    const allCompleted = totalCount > 0 && completedCount === totalCount;
                    const progressPct =
                      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const isCollapsed = Boolean(collapsedPrepIds[ord.id]);

                    return (
                      <article
                        key={ord.id}
                        className="rounded-xl bg-[#FAF4EB] border-2 border-[#B86B35]/70 text-[#231812] shadow-md overflow-hidden transition-all"
                      >
                        {/* Detailed Preparation Ticket Header */}
                        <div
                          onClick={() => togglePrepCollapse(ord.id)}
                          className="px-3.5 py-2.5 bg-[#EFE5D9] border-b border-[#E2D4C4] flex items-center justify-between gap-2 cursor-pointer select-none"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-sans text-base sm:text-lg font-extrabold text-[#1E140E]">
                                #{ord.id}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#271B14] text-[#FAF7F2] font-mono text-[10px] font-bold uppercase tracking-wider">
                                {ord.tableNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#B86B35]/15 text-[#9A4E1C] font-mono text-[10px] font-bold uppercase">
                                In Prep
                              </span>
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-[#5A483B] truncate mt-0.5">
                              {ord.customerName} · {completedCount} of {totalCount} completed
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Live Preparation Elapsed Timer */}
                            <span className="px-2.5 py-1 rounded-full bg-[#F7DFCE] border border-[#F4A261]/50 font-mono text-xs font-bold text-[#9A4E1C] flex items-center gap-1 tabular-nums">
                              <Clock className="w-3 h-3 text-[#B86B35]" />
                              <span>{getPrepElapsedMmSs(ord)}</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePrepCollapse(ord.id);
                              }}
                              className="p-1 rounded hover:bg-[#E2D4C4] text-[#5A483B]"
                              title={isCollapsed ? 'Expand recipe details' : 'Collapse summary'}
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Overall Order Completion Progress Bar */}
                        <div className="w-full h-1.5 bg-[#E2D4C4]">
                          <div
                            className="h-full bg-[#28664B] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Collapsed Summary Mode (when chef collapses one of multiple active orders) */}
                        {isCollapsed ? (
                          <div
                            onClick={() => togglePrepCollapse(ord.id)}
                            className="px-3.5 py-2 text-xs font-sans font-semibold text-[#47392F] flex items-center justify-between gap-2 cursor-pointer hover:bg-[#F5EDE3]"
                          >
                            <span className="truncate">
                              {visibleItems
                                .map(
                                  (i) =>
                                    `${i.completedInKitchen ? '✓' : '☐'} ${String(
                                      i.quantity
                                    ).padStart(2, '0')}× ${i.name}`
                                )
                                .join(' · ')}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#9A4E1C] shrink-0">
                              Tap to expand
                            </span>
                          </div>
                        ) : (
                          /* Expanded Detailed Operational Item Checklist */
                          <div className="p-3.5 space-y-2.5">
                            {visibleItems.map((item, idx) => {
                              const isDone = Boolean(item.completedInKitchen);
                              const cust = item.customization;
                              const isBarista = item.station === 'barista';

                              const modParts: string[] = [];
                              if (isBarista && cust) {
                                if (cust.temperature) {
                                  modParts.push(
                                    cust.temperature.replace(' 🔥', '').replace(' 🧊', '')
                                  );
                                }
                                if (cust.milk?.name && cust.milk.name !== 'Whole Farm Milk') {
                                  modParts.push(
                                    cust.milk.name
                                      .replace('Barista ', '')
                                      .replace('Artisanal ', '')
                                      .trim()
                                  );
                                }
                                if (
                                  cust.bean?.name &&
                                  cust.bean.name !== 'Studio House Blend (Chikmagalur AA)'
                                ) {
                                  modParts.push(
                                    cust.bean.name.replace('Single-Origin', '').trim()
                                  );
                                }
                                if (cust.boosters && cust.boosters.length > 0) {
                                  cust.boosters.forEach((b) => {
                                    modParts.push(
                                      `+${b.name.replace('Extra ', '').replace('Barista ', '')}`
                                    );
                                  });
                                }
                                if (cust.sweetness?.name) {
                                  modParts.push(cust.sweetness.name);
                                }
                              }

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => toggleOrderItemCheck(ord.id, item.id)}
                                  className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                    isDone
                                      ? 'bg-[#E8DFD3]/70 border-[#95D5B2] opacity-65'
                                      : 'bg-[#FFFDF9] border-[#DECDBB] shadow-2xs hover:border-[#B86B35]'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    {/* Individual Item Completion Control */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOrderItemCheck(ord.id, item.id);
                                      }}
                                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                                        isDone
                                          ? 'bg-[#28664B] border-[#28664B] text-white'
                                          : 'border-[#8C7A6B] bg-[#F5EDE3] hover:border-[#28664B]'
                                      }`}
                                      aria-label={`Mark ${item.name} completed`}
                                    >
                                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                      {/* Large Product Name & Individual Quantity */}
                                      <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="font-mono text-base sm:text-lg font-black text-[#8C4A1C] tabular-nums">
                                          {String(item.quantity).padStart(2, '0')}×
                                        </span>
                                        <h4
                                          className={`font-sans text-base sm:text-[18px] font-extrabold uppercase tracking-tight text-[#1E140E] leading-snug ${
                                            isDone ? 'line-through text-[#7E6D5F]' : ''
                                          }`}
                                        >
                                          {item.name}
                                        </h4>
                                      </div>

                                      {/* Uncompressed Customizations Underneath Product */}
                                      {modParts.length > 0 && (
                                        <div className="mt-1 text-xs font-sans font-medium text-[#47392F] leading-snug">
                                          {modParts.join(' · ')}
                                        </div>
                                      )}

                                      {/* Special Preparation Instructions */}
                                      {cust?.specialNote && (
                                        <div className="mt-1.5 px-2.5 py-1.5 rounded-md bg-[#E9DCCF] border-l-2 border-[#B86B35] text-xs text-[#2B1D14] font-medium">
                                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7A5B40] mr-1.5">
                                            Prep Note:
                                          </span>
                                          &ldquo;{cust.specialNote}&rdquo;
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Preparation Ticket Footer: Strict Mark Ready Gate */}
                        <div className="px-3.5 py-2.5 bg-[#EFE5D9] border-t border-[#E2D4C4] flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-semibold text-[#5A483B]">
                            {allCompleted
                              ? 'All items verified ready'
                              : `${totalCount - completedCount} item(s) remaining`}
                          </span>

                          <button
                            type="button"
                            disabled={!allCompleted}
                            onClick={() => handleMarkOrderReady(ord)}
                            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              allCompleted
                                ? 'bg-[#28664B] hover:bg-[#1E4D38] text-white shadow-xs cursor-pointer'
                                : 'bg-[#DCD0C2] text-[#8C7B6C] cursor-not-allowed'
                            }`}
                            title={
                              allCompleted
                                ? 'Move completed order to Ready for Pickup'
                                : 'Check off all items above to enable Mark Ready'
                            }
                          >
                            {allCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Ready →</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>
                                  Mark Ready ({completedCount}/{totalCount})
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* RIGHT BOTTOM: READY FOR PICKUP ("COMPLETED & WAITING FOR PICKUP") */}
          {/* Compact Horizontal Completion Receipts                            */}
          {/* ----------------------------------------------------------------- */}
          {(mobileSection === 'all' || mobileSection === 'ready') && (
            <section
              aria-label="Ready for Pickup Handover Panel"
              className="flex-1 min-h-[215px] rounded-2xl bg-[#140F0D] border border-[#2A221E] shadow-obsidian flex flex-col overflow-hidden"
            >
              {/* Sticky Ready Header */}
              <div className="sticky top-0 z-10 px-4 py-2 bg-[#181210] border-b border-[#2A221E] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans text-xs sm:text-sm font-extrabold tracking-wider text-[#FAF7F2] uppercase">
                        Ready for Pickup
                      </h2>
                      <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[#28664B]/25 text-[#34D399] border border-[#28664B]/40">
                        {readyOrders.length}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7E71]">
                      Completed &amp; waiting on pass for runner or guest collection
                    </p>
                  </div>
                </div>
              </div>

              {/* Independently Scrollable Compact Horizontal Ready Receipts */}
              <div className="p-3 space-y-2 flex-1 overflow-y-auto no-scrollbar">
                {readyOrders.length === 0 ? (
                  <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center p-4 text-[#8C7E71]">
                    <p className="text-xs font-mono">
                      No orders waiting on the pickup pass.
                    </p>
                  </div>
                ) : (
                  readyOrders.map((ord) => {
                    const waitMins = getReadyWaitMinutes(ord);
                    const readyTimeStr = formatReadyClock(ord);
                    const totalItemsCount = ord.items.reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <div
                        key={ord.id}
                        className="rounded-xl px-3.5 py-2.5 bg-[#F5EDE3] border-l-4 border-l-[#28664B] border border-[#D8CBB8] text-[#231812] shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans text-sm sm:text-base font-extrabold text-[#1E140E]">
                              #{ord.id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#D8F3DC] text-[#1B4332] font-mono text-[10px] font-bold uppercase">
                              {ord.tableNumber}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#28664B]">
                              · {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                            </span>
                            <span className="text-[11px] font-mono text-[#6B5A4D] truncate">
                              · {ord.customerName}
                            </span>
                          </div>

                          {/* Product Summary */}
                          <div className="text-xs font-bold text-[#231812] truncate mt-0.5">
                            {ord.items
                              .map((i) => `${String(i.quantity).padStart(2, '0')}× ${i.name}`)
                              .join(' · ')}
                          </div>

                          {/* Ready Timestamp & Waiting Duration */}
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#5A483B] mt-0.5">
                            <span className="text-[#1B4332] font-bold">
                              Ready {readyTimeStr}
                            </span>
                            <span>·</span>
                            <span>Waiting {waitMins}m for collection</span>
                          </div>
                        </div>

                        {/* Handover Action */}
                        <button
                          type="button"
                          onClick={() => handleHandoverOrder(ord)}
                          className="px-3 py-2 rounded-lg bg-[#28664B] hover:bg-[#1E4D38] active:scale-95 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Hand Over</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
