'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface AccuracyTimeData {
  date: string;
  accuracy: number;
  listeningAccuracy: number | null;
  readingAccuracy: number | null;
}

interface Tier1ChartProps {
  data: AccuracyTimeData[];
}

export function Tier1Chart({ data }: Tier1ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl text-center py-12">
        <p className="text-zinc-400 text-sm">Chưa có dữ liệu bài nộp trong chu kỳ này để hiển thị biểu đồ.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-textHeading">Tầng 1: Tiến Độ % Độ Chính Xác Theo Thời Gian</h3>
          <p className="text-xs text-zinc-400 mt-1">Biểu đồ Mean Accuracy (%) tổng quát và theo từng kỹ năng</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientOverall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0072ff" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#3f3f46',
                borderRadius: '0.75rem',
                color: '#e4e4e7',
                fontSize: '0.85rem',
              }}
              formatter={(value: any) => [`${value}%`]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            <Line
              type="monotone"
              dataKey="accuracy"
              name="Độ chính xác Tổng"
              stroke="#00c6ff"
              strokeWidth={3}
              dot={{ r: 4, fill: '#00c6ff' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="listeningAccuracy"
              name="Listening (%)"
              stroke="#4ade80"
              strokeWidth={2}
              strokeDasharray="4 4"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="readingAccuracy"
              name="Reading (%)"
              stroke="#f472b6"
              strokeWidth={2}
              strokeDasharray="4 4"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
