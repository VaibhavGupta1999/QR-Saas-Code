'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { AdminKpiCards } from '@/components/Admin/AdminKpiCards';
import { MenuManager } from '@/components/Admin/MenuManager';
import { OrdersFeedTable } from '@/components/Admin/OrdersFeedTable';
import { QrStudio } from '@/components/Admin/QrStudio';
import { StaffAuthGuard } from '@/components/Auth/StaffAuthGuard';
import {
  LayoutDashboard,
  Utensils,
  Receipt,
  QrCode,
  RotateCcw,
  Sparkles,
  Activity,
} from 'lucide-react';

export type AdminTabKey = 'kpi' | 'orders' | 'menu' | 'qr';

function AdminContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTabKey | null;

  const { resetToDemoDefaults, seedRandomOrder, orders, menuItems } = useBrewStudio();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('kpi');

  useEffect(() => {
    if (tabParam && ['kpi', 'menu', 'orders', 'qr'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const activeOrderCount = orders.filter(
    (o) => o.status === 'new' || o.status === 'brewing' || o.status === 'ready'
  ).length;
  const soldOutCount = menuItems.filter((i) => !i.isAvailable).length;

  return (
    <div className="min-h-screen bg-[#0F0C0A] text-[#F5F0E6] p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Top Precision SaaS Header */}
        <header className="mb-6 rounded-2xl bg-[#171210] border border-[#2A221E] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-obsidian">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#D4A373] shadow-inner">
              <LayoutDashboard className="w-5 h-5 text-[#B86B35]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#F5F0E6]">
                  Roastery Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-[#28664B]/20 border border-[#28664B]/40 text-[#34D399] font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>Live Telemetry</span>
                </span>
              </div>
              <p className="text-xs text-[#9E9083] font-mono mt-0.5">
                Executive Analytics, 80mm GST Thermal Billing, Menu 86 Engineering &amp; QR Studio
              </p>
            </div>
          </div>

          {/* Quick Operational Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => seedRandomOrder()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A05A28] text-white text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Simulate Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset all demo data (menu, orders, and KDS tickets) to pristine state?'
                  )
                ) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset to default demo data"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#211A16] hover:bg-[#2A221E] border border-[#2A221E] text-[#9E9083] hover:text-[#F5F0E6] text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </header>

        {/* Focused Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar border-b border-[#2A221E] pb-3">
          {[
            {
              id: 'kpi' as const,
              label: 'Executive Overview',
              icon: LayoutDashboard,
              badge: null,
            },
            {
              id: 'orders' as const,
              label: 'Live Orders & 80mm Receipts',
              icon: Receipt,
              badge: activeOrderCount > 0 ? `${activeOrderCount} active` : null,
            },
            {
              id: 'menu' as const,
              label: 'Menu Engineering & 86 Stock',
              icon: Utensils,
              badge: soldOutCount > 0 ? `${soldOutCount} 86'd` : `${menuItems.length}`,
            },
            {
              id: 'qr' as const,
              label: 'Table & Universal QR Studio',
              icon: QrCode,
              badge: null,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#211A16] text-[#F5F0E6] border-[#B86B35] font-bold shadow-xs'
                    : 'bg-[#171210] text-[#9E9083] hover:text-[#F5F0E6] hover:bg-[#211A16]/60 border-[#2A221E]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-[#B86B35]' : 'text-[#9E9083]'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums ${
                      isSelected
                        ? 'bg-[#B86B35]/20 text-[#D4A373]'
                        : 'bg-white/5 text-[#9E9083]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Tab Workspaces (Eliminates 4-module vertical scroll overload) */}
        {activeTab === 'kpi' && <AdminKpiCards onNavigateTab={setActiveTab} />}

        {activeTab === 'orders' && <OrdersFeedTable />}

        {activeTab === 'menu' && <MenuManager />}

        {activeTab === 'qr' && <QrStudio />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0C0A] flex items-center justify-center text-[#D4A373] font-mono text-xs">
          Initializing Roastery Command Center...
        </div>
      }
    >
      <StaffAuthGuard
        requiredRoles={['owner', 'manager']}
        terminalTitle="Admin Command Center"
      >
        <AdminContent />
      </StaffAuthGuard>
    </Suspense>
  );
}
