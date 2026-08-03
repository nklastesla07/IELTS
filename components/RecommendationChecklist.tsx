'use client';

import React, { useState } from 'react';
import { RecommendationTask } from '@/lib/recommendations';
import { CheckCircle2, Circle, Sparkles, ArrowRight } from 'lucide-react';

interface RecommendationChecklistProps {
  recommendations: RecommendationTask[];
}

export function RecommendationChecklist({ recommendations }: RecommendationChecklistProps) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl text-center py-8">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-textHeading">Tuyệt vời! Không phát hiện lỗi nghiêm trọng.</h4>
        <p className="text-xs text-zinc-400 mt-1">Hãy tiếp tục duy trì phong độ và nộp thêm bài làm để nhận checklist tối ưu.</p>
      </div>
    );
  }

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-accent text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textHeading">Checklist Nhiệm Vụ Hôm Nay (Tự Động)</h3>
            <p className="text-xs text-zinc-400">Đề xuất hành động khắc phục trực tiếp dựa trên lỗi bạn đã nộp</p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
          Đã xong: <span className="text-emerald-400 font-bold">{completedCount}</span> / {recommendations.length}
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isDone = !!completedTasks[rec.id];
          return (
            <div
              key={rec.id}
              onClick={() => toggleTask(rec.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 opacity-70'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button className="mt-0.5 text-emerald-400 focus:outline-none">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-500 hover:text-amber-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {rec.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Tự động kích hoạt</span>
                  </div>

                  <h4 className={`text-sm font-bold mt-1 ${isDone ? 'line-through text-zinc-400' : 'text-textHeading'}`}>
                    {rec.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">{rec.description}</p>

                  <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    <div className="flex items-center space-x-1 text-emerald-400 font-semibold mb-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Hành động cần làm ngay:</span>
                    </div>
                    {rec.suggestedAction}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
