'use client';

import React from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HeatmapProps {
  cycleStartDate: Date | string;
  submissionDates: Array<Date | string>;
}

export function Heatmap({ cycleStartDate, submissionDates }: HeatmapProps) {
  const startDate = new Date(cycleStartDate);
  const endDate = new Date();

  // Ensure interval is at least 28 days for visual appeal
  const effectiveStartDate = subDays(endDate, 29);
  const displayStart = startDate < effectiveStartDate ? startDate : effectiveStartDate;

  const allDays = eachDayOfInterval({
    start: displayStart,
    end: endDate,
  });

  const parsedSubDates = submissionDates.map((d) => new Date(d));

  const getSubmissionsForDay = (day: Date) => {
    return parsedSubDates.filter((subDate) => isSameDay(subDate, day)).length;
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-800/80 border-zinc-700/60 hover:border-zinc-500';
    if (count === 1) return 'bg-emerald-600/60 border-emerald-500/80 hover:scale-110 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (count === 2) return 'bg-emerald-500 border-emerald-400 hover:scale-110 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
    return 'bg-emerald-400 border-white hover:scale-110 shadow-[0_0_16px_rgba(52,211,153,0.8)]';
  };

  return (
    <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-textHeading">Lịch Hoạt Động (Contribution Heatmap)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tính từ mốc chu kỳ hiện tại ({format(startDate, 'dd/MM/yyyy', { locale: vi })})
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <span>Ít</span>
          <div className="w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600/60 border border-emerald-500/80" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-white" />
          <span>Nhiều</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-full">
          {allDays.map((day) => {
            const count = getSubmissionsForDay(day);
            const dateFormatted = format(day, 'dd/MM/yyyy (EEEE)', { locale: vi });
            return (
              <div
                key={day.toISOString()}
                title={`${dateFormatted}: ${count} bài nộp`}
                className={`w-4 h-4 rounded-sm border transition-all duration-200 cursor-pointer ${getIntensityClass(
                  count
                )}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
