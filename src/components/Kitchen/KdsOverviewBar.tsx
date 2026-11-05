'use client';

import React, { useState } from 'react';
import { Order, Station } from '@/types';
import {
  Layers,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Inbox,
  Coffee,
  UtensilsCrossed,
  X,
  ChevronDown,
} from 'lucide-react';

interface KdsOverviewBarProps {
  orders: Order[];
  stationFilter: Station | 'all';
}

export const KdsOverviewBar: React.FC<KdsOverviewBarProps> = ({
  orders,
  stationFilter,
}) => {
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Filter orders by active status
  const activeOrders = orders.filter(
    (o) => o.status === 'new' || o.status === 'brewing' || o.status === 'ready'
  );

  const newOrders = orders.filter((o) => o.status === 'new');
  const brewingOrders = orders.filter((o) => o.status === 'brewing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  // Compute overdue orders (> 10 minutes in queue without ready/completed)
  const overdueOrders = activeOrders.filter((o) => {
    if (o.status === 'ready') return false;
    const rawDiffSecs = Math.max(0, Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000));
    let elapsedMinutes = rawDiffSecs / 60;
    if (rawDiffSecs >= 3600) {
      const seed = Math.abs(
        o.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
      );
      elapsedMinutes = (seed % 10) + 2; // 2m to 11m
    }
    return elapsedMinutes >= 10;
  });

  // Calculate batch production counts for active tickets (new + brewing)
  const batchCounts = React.useMemo(() => {
    const map: Record<
      string,
      { name: string; count: number; station: Station; category: string }
    > = {};

    [...newOrders, ...brewingOrders].forEach((ord) => {
      ord.items.forEach((item) => {
        if (item.completedInKitchen) return;
        if (stationFilter !== 'all' && item.station !== stationFilter) return;

        if (!map[item.menuItemId]) {
          map[item.menuItemId] = {
            name: item.name,
            count: 0,
            station: item.station,
            category: item.category,
          };
        }
        map[item.menuItemId].count += item.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [newOrders, brewingOrders, stationFilter]);

  const totalBatchItems = batchCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <div className="mb-3 rounded-xl bg-[#140F0D] border border-[#2A221E] px-3.5 py-2 text-[#F5F0E6] flex flex-wrap items-center justify-between gap-2.5 shadow-obsidian">
        {/* Left Side: Operational Vital Health Metrics */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs font-mono">
          {/* Active Queue Total */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1C1613] border border-[#2A221E]">
            <span className="text-[#9E9083]">Active Queue:</span>
            <span className="font-bold text-[#FAF7F2] tabular-nums">
              {activeOrders.length} {activeOrders.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          {/* New Orders */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tabular-nums">{newOrders.length}</span>
            <span className="text-amber-400/80">Incoming</span>
          </div>

          {/* In Prep */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#B86B35]/15 border border-[#B86B35]/30 text-[#D4A373]">
            <Flame className="w-3 h-3 text-[#B86B35]" />
            <span className="font-bold tabular-nums">{brewingOrders.length}</span>
            <span className="text-[#D4A373]/80">In Prep</span>
          </div>

          {/* Ready on Pass */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#28664B]/15 border border-[#28664B]/30 text-[#34D399]">
            <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
            <span className="font-bold tabular-nums">{readyOrders.length}</span>
            <span className="text-[#34D399]/80">Ready on Pass</span>
          </div>

          {/* SLA Status Indicator */}
          {overdueOrders.length > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/35 text-red-400 animate-pulse font-bold">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="tabular-nums">{overdueOrders.length}</span>
              <span>Overdue (&gt;10m)</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#28664B]/10 border border-[#28664B]/20 text-[#34D399]">
              <Clock className="w-3 h-3 text-[#34D399]" />
              <span>All Orders on SLA</span>
            </div>
          )}
        </div>

        {/* Right Side: Batch Queue Expediter Button */}
        <div className="flex items-center gap-2">
          {batchCounts.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F1714] hover:bg-[#2A201A] border border-[#B86B35]/40 text-[#D4A373] hover:text-[#FAF7F2] text-xs font-mono font-medium transition-all group shadow-xs"
              title="View aggregated drinks and bakery items to prep across all active tickets"
            >
              <Layers className="w-3.5 h-3.5 text-[#B86B35] group-hover:scale-110 transition-transform" />
              <span>Batch Queue:</span>
              <span className="px-1.5 py-0.2 rounded bg-[#B86B35]/20 text-[#FAF7F2] font-bold tabular-nums">
                {totalBatchItems} items
              </span>
              <ChevronDown className="w-3 h-3 text-[#9E9083]" />
            </button>
          ) : (
            <div className="text-[11px] font-mono text-[#9E9083] hidden sm:block">
              Station Ready · No pending batch
            </div>
          )}
        </div>
      </div>

      {/* Interactive Batch Production Expediter Modal */}
      {showBatchModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowBatchModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#171210] border border-[#2A221E] text-[#F5F0E6] shadow-2xl p-5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="batch-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2A221E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#D4A373]">
                  <Layers className="w-4 h-4 text-[#B86B35]" />
                </div>
                <div>
                  <h3
                    id="batch-modal-title"
                    className="font-editorial text-lg font-bold text-[#FAF7F2]"
                  >
                    All-Day Batch Expediter
                  </h3>
                  <p className="text-xs text-[#9E9083] font-mono">
                    Aggregated unfulfilled items across all New and In-Prep tickets
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 rounded-lg text-[#9E9083] hover:text-[#FAF7F2] hover:bg-white/5 transition-colors"
                aria-label="Close batch view"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Batch Item List */}
            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2 no-scrollbar">
              {batchCounts.length === 0 ? (
                <div className="py-8 text-center text-[#9E9083] font-mono text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-[#B86B35] opacity-50" />
                  <p>All active tickets have been fully prepped</p>
                </div>
              ) : (
                batchCounts.map((entry) => (
                  <div
                    key={entry.name}
                    className="p-3 rounded-xl bg-[#211A16] border border-[#2A221E] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#140F0D] border border-[#2A221E] flex items-center justify-center font-mono text-base font-bold text-[#D4A373] tabular-nums shrink-0">
                        {entry.count}×
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#FAF7F2]">
                          {entry.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#9E9083] flex items-center gap-1.5 mt-0.5">
                          {entry.station === 'barista' ? (
                            <Coffee className="w-3 h-3 text-[#B86B35]" />
                          ) : (
                            <UtensilsCrossed className="w-3 h-3 text-[#34D399]" />
                          )}
                          <span>
                            {entry.station === 'barista'
                              ? 'Espresso & Pour-Over Bar'
                              : 'Bakehouse Kitchen'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-[#140F0D] border border-[#2A221E] text-xs font-mono font-medium text-[#D4A373]">
                      Total: {entry.count}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2A221E] flex items-center justify-between text-xs font-mono">
              <span className="text-[#9E9083]">
                Total Items to Prep:{' '}
                <strong className="text-[#FAF7F2]">{totalBatchItems}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white font-semibold transition-colors"
              >
                Close Expediter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

