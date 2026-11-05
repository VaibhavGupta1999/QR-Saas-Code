'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Station } from '@/types';
import { useBrewStudio } from '@/context/BrewStudioContext';
import { playCafeOrderChime } from '@/utils/sound';
import {
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  UtensilsCrossed,
  Layers,
  BellRing,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface KdsHeaderProps {
  stationFilter: Station | 'all';
  onStationFilterChange: (station: Station | 'all') => void;
  newCount: number;
  brewingCount: number;
  readyCount: number;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  stationFilter,
  onStationFilterChange,
  newCount,
  brewingCount,
  readyCount,
}) => {
  const { soundEnabled, toggleSound, seedRandomOrder } = useBrewStudio();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = () => {
    setSimulating(true);
    seedRandomOrder();
    setTimeout(() => setSimulating(false), 1500);
  };

  const stations: { key: Station | 'all'; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'All Stations', icon: Layers },
    { key: 'barista', label: 'Espresso Bar', icon: Coffee },
    { key: 'kitchen', label: 'Bakehouse Kitchen', icon: UtensilsCrossed },
  ];

  return (
    <header className="mb-2.5 rounded-xl bg-[#140F0D] border border-[#2A221E] px-3.5 py-2 sm:px-4 sm:py-2.5 text-[#F5F0E6] shadow-obsidian">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Terminal Scope */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#211A16] border border-[#B86B35]/40 flex items-center justify-center text-[#D4A373] shadow-inner shrink-0">
            <Coffee className="w-4 h-4 text-[#B86B35]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#FAF7F2] leading-none">
                Brew Studio KDS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#28664B]/20 text-[#34D399] border border-[#28664B]/40 font-mono text-[9px] font-bold tracking-wider uppercase">
                Active Expediter
              </span>
            </div>
            <p className="text-[11px] text-[#9E9083] font-mono mt-0.5">
              Live Touchscreen Expediter · Target SLA &lt; 5m 00s
            </p>
          </div>
        </div>

        {/* Center: Station Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1C1613] border border-[#2A221E]">
          {stations.map((st) => {
            const isSelected = stationFilter === st.key;
            const Icon = st.icon;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => onStationFilterChange(st.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#B86B35] text-white font-bold shadow-xs'
                    : 'text-[#9E9083] hover:text-[#FAF7F2] hover:bg-white/5'
                }`}
                title={`Filter KDS tickets for ${st.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{st.label}</span>
                <span className="sm:hidden">{st.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Live Digital Clock & Operational Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Digital Clock */}
          <div className="px-3 py-1.5 rounded-xl bg-[#1C1613] border border-[#2A221E] flex items-center gap-1.5 font-mono text-xs font-bold text-[#D4A373] tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#B86B35]" />
            <span>{currentTime || '12:00:00'}</span>
          </div>

          {/* Sound Notification Control */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors border ${
              soundEnabled
                ? 'bg-[#28664B]/15 text-[#34D399] border-[#28664B]/40 hover:bg-[#28664B]/25'
                : 'bg-[#1C1613] text-[#9E9083] border-[#2A221E] hover:text-white'
            }`}
            title={soundEnabled ? 'Kitchen service chime enabled (click to mute)' : 'Chime muted (click to enable)'}
            aria-label="Toggle kitchen service bell"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#34D399]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="hidden md:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Manual Chime Ring */}
          <button
            type="button"
            onClick={() => playCafeOrderChime()}
            title="Ring two-tone service bell"
            className="p-2 rounded-xl bg-[#1C1613] hover:bg-[#211A16] text-[#D4A373] border border-[#2A221E] transition-colors"
            aria-label="Play sample chime"
          >
            <BellRing className="w-3.5 h-3.5" />
          </button>

          {/* Simulate New Ticket */}
          <button
            type="button"
            onClick={handleSimulate}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-xs transition-all active:scale-95 ${
              simulating
                ? 'bg-[#28664B] text-white'
                : 'bg-[#B86B35] hover:bg-[#A05A28] text-white'
            }`}
            title="Inject a real-time order ticket to test KDS workflow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {simulating ? 'Fired!' : '+ Test Ticket'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
