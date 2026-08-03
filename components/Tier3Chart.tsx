'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ErrorCategoryStat, ErrorTagRankStat } from '@/lib/analytics';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface Tier3ChartProps {
  errorCategoryStats: ErrorCategoryStat[];
  topErrorTags: ErrorTagRankStat[];
}

const COLOR_PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#38bdf8', '#c084fc', '#f472b6'];

export function Tier3Chart({ errorCategoryStats, topErrorTags }: Tier3ChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Error Category Doughnut Chart */}
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-textHeading">Tầng 3A: Phân Bổ Nguyên Nhân Lỗi Gốc</h3>
            <p className="text-xs text-zinc-400 mt-1">Phần trăm nguyên nhân lỗi theo Nhóm lớn (Phát âm, Bẫy, Từ vựng...)</p>
          </div>
        </div>

        {errorCategoryStats.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-12">Chưa tick lỗi sai trong các bài nộp.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorCategoryStats}
                  dataKey="count"
                  nameKey="groupName"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {errorCategoryStats.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#e4e4e7',
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} lần (${props.payload.percentage}%)`,
                    props.payload.groupName,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Top 3-5 Error Tags Ranking */}
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-dangerRed" />
            <h3 className="text-lg font-bold text-textHeading">Tầng 3B: Top Lỗi Sai Lặp Lại Nhiều Nhất</h3>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Danh sách các mã lỗi mắc phải nhiều lần nhất trong tháng</p>

          {topErrorTags.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-12">Chưa ghi nhận lỗi sai.</p>
          ) : (
            <div className="space-y-3">
              {topErrorTags.map((tag, idx) => (
                <div
                  key={tag.code}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-dangerRed/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-dangerRed text-zinc-950'
                          : idx === 1
                          ? 'bg-orange-500 text-zinc-950'
                          : 'bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-textMain">{tag.label}</p>
                      <p className="text-xs text-zinc-500">{tag.groupName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-dangerRed/10 border border-dangerRed/20 text-dangerRed text-xs font-bold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{tag.count} lần</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
