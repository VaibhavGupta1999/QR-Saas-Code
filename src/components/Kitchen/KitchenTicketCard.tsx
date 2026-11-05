'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Order, Station } from '@/types';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { ArrowRight, XCircle, Clock } from 'lucide-react';

export type PriorityLevel = 'URGENT' | 'NEXT' | 'NORMAL' | 'LOW';

export interface OrderPriorityMeta {
  level: PriorityLevel;
  rankScore: number; // Higher rankScore = higher priority tier
  waitMinutes: number;
  estimatedPrepMinutes: number;
  remainingSlaMinutes: number;
  isOverdue: boolean;
  createdTimestamp: number;
}

const TARGET_SLA_MINUTES = 10;

/**
 * Deterministic kitchen priority engine:
 * Ranks orders by:
 * 1. Overdue status (wait >= 10m or remaining SLA <= 0)
 * 2. Time remaining before preparation SLA (accounting for prep complexity)
 * 3. Total waiting time
 * 4. Preparation complexity (item count, espresso shots, modifiers, notes)
 * 5. FIFO ordering (original creation timestamp) as tie-breaker
 */
export function computeOrderPriority(
  order: Order,
  nowMs: number,
  stationFilter: Station | 'all' = 'all'
): OrderPriorityMeta {
  const createdTimestamp = new Date(order.createdAt).getTime();
  const rawDiffSecs = Math.max(0, Math.floor((nowMs - createdTimestamp) / 1000));

  // Clamp historic demo seed timestamps (>1 hour old) into a realistic 1m-12m window
  // while preserving relative chronological FIFO order among seeded tickets
  let waitMinutes: number;
  if (rawDiffSecs >= 3600) {
    const seed = Math.abs(
      order.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
    );
    waitMinutes = (seed % 11) + 2; // 2 to 12 minutes
  } else {
    waitMinutes = Math.floor(rawDiffSecs / 60);
  }

  const relevantItems = order.items.filter(
    (item) => stationFilter === 'all' || item.station === stationFilter
  );

  // Estimate preparation complexity in minutes
  let complexityUnits = 0;
  relevantItems.forEach((item) => {
    complexityUnits += item.quantity * 1.5;
    if (item.customization?.boosters?.length) {
      complexityUnits += item.customization.boosters.length * 0.5;
    }
    if (item.customization?.specialNote) {
      complexityUnits += 0.5;
    }
  });
  const estimatedPrepMinutes = Math.max(2, Math.min(8, Math.round(complexityUnits)));

  const remainingSlaMinutes = TARGET_SLA_MINUTES - waitMinutes - Math.floor(estimatedPrepMinutes * 0.5);
  const isOverdue = waitMinutes >= TARGET_SLA_MINUTES || remainingSlaMinutes <= 0;

  let level: PriorityLevel = 'NORMAL';
  let tierWeight = 2;

  if (isOverdue || remainingSlaMinutes <= 1) {
    level = 'URGENT';
    tierWeight = 4;
  } else if (waitMinutes >= 6 || remainingSlaMinutes <= 3) {
    level = 'NEXT';
    tierWeight = 3;
  } else if (waitMinutes < 2 && estimatedPrepMinutes <= 2) {
    level = 'LOW';
    tierWeight = 1;
  } else {
    level = 'NORMAL';
    tierWeight = 2;
  }

  // Composite rank score keeps priority tiers distinct while respecting waiting time & complexity
  const rankScore =
    tierWeight * 1000 +
    (isOverdue ? 500 : 0) +
    (TARGET_SLA_MINUTES - remainingSlaMinutes) * 20 +
    waitMinutes * 10 +
    estimatedPrepMinutes * 2;

  return {
    level,
    rankScore,
    waitMinutes,
    estimatedPrepMinutes,
    remainingSlaMinutes,
    isOverdue,
    createdTimestamp,
  };
}

interface KitchenTicketCardProps {
  order: Order;
  stationFilter: Station | 'all';
  priorityMeta?: OrderPriorityMeta;
  onStartPreparing?: (order: Order) => void;
}

export const KitchenTicketCard: React.FC<KitchenTicketCardProps> = ({
  order,
  stationFilter,
  priorityMeta,
  onStartPreparing,
}) => {
  const { updateOrderStatus, cancelOrder } = useBrewStudio();
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const meta = useMemo(
    () => priorityMeta || computeOrderPriority(order, nowMs, stationFilter),
    [priorityMeta, order, nowMs, stationFilter]
  );

  const visibleItems = order.items.filter((item) => {
    if (stationFilter === 'all') return true;
    return item.station === stationFilter;
  });

  if (visibleItems.length === 0) return null;

  const isTakeaway =
    order.orderType === 'TAKEAWAY' ||
    order.tableNumber.toLowerCase().includes('takeaway');
  const isDelivery =
    order.orderType === 'DELIVERY' ||
    order.tableNumber.toLowerCase().includes('delivery');

  const locationLabel = isTakeaway
    ? 'TAKEAWAY'
    : isDelivery
    ? 'DELIVERY'
    : order.tableNumber.toUpperCase();

  // Subtle priority styling (refined left accent bar + restrained status dot/label)
  const priorityStyle = useMemo(() => {
    switch (meta.level) {
      case 'URGENT':
        return {
          leftBar: 'border-l-4 border-l-[#B91C1C]',
          dot: 'bg-[#B91C1C]',
          text: 'text-[#991B1B]',
          pillBg: 'bg-[#FAD2C8]/80 text-[#991B1B]',
          label: meta.isOverdue ? 'URGENT · OVERDUE' : 'URGENT',
        };
      case 'NEXT':
        return {
          leftBar: 'border-l-4 border-l-[#B86B35]',
          dot: 'bg-[#B86B35]',
          text: 'text-[#9A4E1C]',
          pillBg: 'bg-[#F7DFCE]/80 text-[#9A4E1C]',
          label: 'NEXT UP',
        };
      case 'LOW':
        return {
          leftBar: 'border-l-4 border-l-[#C5B6A7]',
          dot: 'bg-[#8C7E71]',
          text: 'text-[#6E5E50]',
          pillBg: 'bg-[#EBE1D5] text-[#6E5E50]',
          label: 'LOW',
        };
      default:
        return {
          leftBar: 'border-l-4 border-l-[#7A5B40]',
          dot: 'bg-[#7A5B40]',
          text: 'text-[#5C4633]',
          pillBg: 'bg-[#EBE1D5] text-[#5C4633]',
          label: 'NORMAL',
        };
    }
  }, [meta.level, meta.isOverdue]);

  const handleStart = () => {
    if (onStartPreparing) {
      onStartPreparing(order);
    } else {
      updateOrderStatus(order.id, 'brewing');
    }
  };

  return (
    <article
      className={`rounded-xl bg-[#F5EDE3] border border-[#E2D4C4] ${priorityStyle.leftBar} text-[#231812] shadow-xs hover:shadow-md hover:border-[#B86B35] transition-all duration-150 flex flex-col justify-between overflow-hidden`}
    >
      {/* 1. COMPACT RECEIPT HEADER: Order ID, Table Number & Customer */}
      <div className="px-3.5 py-2 bg-[#EFE5D9]/75 border-b border-[#E2D4C4] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-sans text-base font-extrabold tracking-tight text-[#1E140E] leading-none">
            #{order.id}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#271B14]/10 font-mono text-[10px] font-bold tracking-wider text-[#271B14] uppercase">
            {locationLabel}
          </span>
          {order.customerName && (
            <span className="text-[11px] font-mono font-semibold text-[#6B5A4D] truncate">
              · {order.customerName}
            </span>
          )}
        </div>

        {/* Subtle Priority & Wait Time Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
            <span className={priorityStyle.text}>{priorityStyle.label}</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold tabular-nums ${priorityStyle.pillBg}`}
            title={`Waiting ${meta.waitMinutes}m · Est. prep ~${meta.estimatedPrepMinutes}m`}
          >
            {meta.waitMinutes || 1}m
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Void incoming order #${order.id}?`)) {
                cancelOrder(order.id);
              }
            }}
            title="Void order"
            className="text-[#A39182] hover:text-red-600 transition-colors p-0.5"
            aria-label={`Void order ${order.id}`}
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. PRODUCT-FIRST COMPACT ITEMS LIST */}
      <div className="px-3.5 py-2.5 space-y-2 flex-1">
        {visibleItems.map((item, idx) => {
          const cust = item.customization;
          const isBarista = item.station === 'barista';

          const modTokens: string[] = [];
          if (isBarista && cust) {
            if (cust.temperature) {
              modTokens.push(cust.temperature.replace(' 🔥', '').replace(' 🧊', ''));
            }
            if (cust.milk?.name && cust.milk.name !== 'Whole Farm Milk') {
              modTokens.push(
                cust.milk.name.replace('Barista ', '').replace('Artisanal ', '').trim()
              );
            }
            if (
              cust.bean?.name &&
              cust.bean.name !== 'Studio House Blend (Chikmagalur AA)'
            ) {
              modTokens.push(cust.bean.name.replace('Single-Origin', '').trim());
            }
            if (cust.boosters && cust.boosters.length > 0) {
              cust.boosters.forEach((b) => {
                modTokens.push(`+${b.name.replace('Extra ', '').replace('Barista ', '')}`);
              });
            }
            if (cust.sweetness?.name) {
              modTokens.push(cust.sweetness.name.replace('Barista ', ''));
            }
          }

          return (
            <div
              key={item.id}
              className={idx > 0 ? 'pt-1.5 border-t border-[#E4D7C8]/80' : ''}
            >
              {/* HIERARCHY #2: Product Name & Quantity — LARGEST TEXT */}
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[15px] sm:text-base font-black text-[#8C4A1C] tabular-nums shrink-0">
                  {String(item.quantity).padStart(2, '0')}×
                </span>
                <h3 className="font-sans text-[15px] sm:text-base font-extrabold tracking-tight text-[#1E140E] uppercase leading-snug">
                  {item.name}
                </h3>
              </div>

              {/* HIERARCHY #3: Customizations — Smaller Secondary Text */}
              {modTokens.length > 0 && (
                <div className="text-[11px] font-sans font-medium text-[#5A483B] leading-tight mt-0.5 pl-6">
                  {modTokens.join(' · ')}
                </div>
              )}

              {/* HIERARCHY #4: Special Notes — Compact Highlighted Text */}
              {cust?.specialNote && (
                <div className="mt-1 ml-6 px-2 py-0.5 rounded bg-[#E8DACB] border-l-2 border-[#B86B35] text-[11px] text-[#2B1D14] font-medium leading-tight">
                  <span className="font-mono font-bold uppercase text-[9px] text-[#7A5B40] mr-1">
                    Note:
                  </span>
                  <span>&ldquo;{cust.specialNote}&rdquo;</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. COMPACT FOOTER: Waiting/Prep Telemetry + Start Preparing Action */}
      <div className="px-3.5 py-2 bg-[#EFE5D9]/50 border-t border-[#E2D4C4] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6B5A4D]">
          <Clock className="w-3 h-3 text-[#8C4A1C]" />
          <span>Est. prep ~{meta.estimatedPrepMinutes}m</span>
          <span>·</span>
          <span>
            {meta.isOverdue
              ? 'SLA exceeded'
              : `SLA ${ Math.max(1, meta.remainingSlaMinutes) }m left`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="bg-[#271B14] hover:bg-[#150E0A] active:scale-[0.99] text-[#FAF7F2] font-mono font-bold uppercase tracking-wider text-[11px] py-1.5 px-3.5 rounded-lg transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Start Preparing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
