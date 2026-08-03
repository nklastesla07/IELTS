'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PartAccuracyStat, QuestionTypeStat } from '@/lib/analytics';

interface Tier2ChartProps {
  listeningParts: PartAccuracyStat[];
  readingParts: PartAccuracyStat[];
  questionTypeStats: QuestionTypeStat[];
}

export function Tier2Chart({ listeningParts, readingParts, questionTypeStats }: Tier2ChartProps) {
  const combinedParts = [
    ...listeningParts.map((p) => ({ label: `LIS ${p.label}`, accuracy: p.accuracy, total: p.total })),
    ...readingParts.map((p) => ({ label: `READ ${p.label}`, accuracy: p.accuracy, total: p.total })),
  ].filter((p) => p.total > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Part / Passage Accuracy Bar Chart */}
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
        <h3 className="text-lg font-bold text-textHeading">Tầng 2A: Phân Tích % Theo Đoạn (Part/Passage)</h3>
        <p className="text-xs text-zinc-400 mt-1 mb-4">Xác định phân đoạn kỹ năng đang mạnh hay yếu nhất</p>

        {combinedParts.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-10">Chưa có đủ bài nộp lẻ để hiển thị.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={combinedParts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" unit="%" />
                <YAxis dataKey="label" type="category" stroke="#a1a1aa" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#e4e4e7',
                  }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Bar dataKey="accuracy" name="Độ chính xác" radius={[0, 8, 8, 0]}>
                  {combinedParts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.accuracy >= 70 ? '#4ade80' : entry.accuracy >= 50 ? '#00c6ff' : '#f87171'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Question Type Accuracy Bar Chart */}
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
        <h3 className="text-lg font-bold text-textHeading">Tầng 2B: Phân Tích % Theo Dạng Bài (Question Types)</h3>
        <p className="text-xs text-zinc-400 mt-1 mb-4">Tỷ lệ làm đúng của từng dạng câu hỏi (T/F/NG, Gap Filling...)</p>

        {questionTypeStats.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-10">Chưa nhập chi tiết dạng bài.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={questionTypeStats} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" unit="%" />
                <YAxis dataKey="questionType" type="category" stroke="#a1a1aa" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#e4e4e7',
                  }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Bar dataKey="accuracy" name="Độ chính xác" radius={[0, 8, 8, 0]} fill="#00c6ff">
                  {questionTypeStats.map((entry, index) => (
                    <Cell
                      key={`qcell-${index}`}
                      fill={entry.accuracy >= 75 ? '#4ade80' : entry.accuracy >= 55 ? '#00c6ff' : '#f87171'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
