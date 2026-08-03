'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  compact?: boolean;
}

export function StreakBadge({ currentStreak, longestStreak, compact = false }: StreakBadgeProps) {
  const isGlowing = currentStreak > 0;

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
          isGlowing
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
        }`}
      >
        <Flame className={`w-4 h-4 ${isGlowing ? 'animate-pulse text-amber-500 fill-amber-500' : 'text-zinc-500'}`} />
        <span className="text-sm font-semibold tracking-wide">
          🔥 {currentStreak} <span className="hidden sm:inline">ngày</span>
        </span>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl p-6 bg-cardBg border border-cardBorder hover:border-amber-500/40 transition-all duration-300 shadow-xl">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-red-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Chuỗi Học (Streak)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              {currentStreak}
            </span>
            <span className="text-lg font-medium text-zinc-300">Ngày liên tiếp</span>
          </div>
          {longestStreak !== undefined && (
            <p className="text-xs text-zinc-400 mt-2">
              Kỷ lục tốt nhất: <span className="font-semibold text-amber-400">{longestStreak} ngày</span>
            </p>
          )}
        </div>

        <div className={`p-4 rounded-2xl ${isGlowing ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800/80 border border-zinc-700'}`}>
          <Flame className={`w-10 h-10 ${isGlowing ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-zinc-500'}`} />
        </div>
      </div>
    </div>
  );
}
