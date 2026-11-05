'use client';

import React, { useState } from 'react';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { Station } from '@/types';
import { KdsHeader } from '@/components/Kitchen/KdsHeader';
import { KdsOverviewBar } from '@/components/Kitchen/KdsOverviewBar';
import { KdsKanbanBoard } from '@/components/Kitchen/KdsKanbanBoard';
import { StaffAuthGuard } from '@/components/Auth/StaffAuthGuard';

export default function KitchenPage() {
  const { orders } = useBrewStudio();
  const [stationFilter, setStationFilter] = useState<Station | 'all'>('all');

  const newCount = orders.filter((o) => o.status === 'new').length;
  const brewingCount = orders.filter((o) => o.status === 'brewing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <StaffAuthGuard
      requiredRoles={['chef', 'manager', 'owner']}
      terminalTitle="Kitchen KDS Terminal"
    >
      <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] px-3 sm:px-5 py-2.5 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <KdsHeader
            stationFilter={stationFilter}
            onStationFilterChange={setStationFilter}
            newCount={newCount}
            brewingCount={brewingCount}
            readyCount={readyCount}
          />

          <KdsOverviewBar orders={orders} stationFilter={stationFilter} />

          <KdsKanbanBoard orders={orders} stationFilter={stationFilter} />
        </div>
      </div>
    </StaffAuthGuard>
  );
}
