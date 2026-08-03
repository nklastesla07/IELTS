'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { History, Calendar, Award, CheckCircle2, Headphones, BookOpen } from 'lucide-react';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'CURRENT' | 'SNAPSHOTS'>('CURRENT');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchHistoryData();
    }
  }, [status, router]);

  const fetchHistoryData = async () => {
    try {
      const subRes = await fetch('/api/submissions');
      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(data.submissions || []);
      }

      const snapRes = await fetch('/api/snapshots');
      if (snapRes.ok) {
        const snapData = await snapRes.json();
        setSnapshots(snapData || []);
      }
    } catch (err) {
      console.error('Lỗi nạp lịch sử:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Lịch Sử Bài Nộp & Tổng Kết Tháng 📜
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Xem lại các bài đã nộp trong chu kỳ tháng này hoặc các bản snapshot tổng kết của các tháng trước.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab('CURRENT')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CURRENT'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Chu Kỳ Hiện Tại ({submissions.length} bài)
          </button>

          <button
            onClick={() => setActiveTab('SNAPSHOTS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SNAPSHOTS'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lịch Sử Snapshot Các Tháng ({snapshots.length})
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400 text-center py-12">Đang tải lịch sử...</p>
        ) : activeTab === 'CURRENT' ? (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-cardBg border border-cardBorder text-center">
                <p className="text-sm text-zinc-400">Chưa có bài nộp nào trong chu kỳ tháng này.</p>
              </div>
            ) : (
              submissions.map((sub) => {
                const subDateFormatted = format(new Date(sub.submittedAt), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                });
                const accuracy = Math.round((sub.correctCount / sub.totalCount) * 100);

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-cardBg border border-cardBorder shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          sub.skill === 'LISTENING'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        }`}
                      >
                        {sub.skill === 'LISTENING' ? <Headphones className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase text-accentLight font-mono">
                            {sub.skill}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400">
                            {sub.mode === 'FULL_TEST'
                              ? 'Đề 40 Câu'
                              : `${sub.skill === 'LISTENING' ? 'Part' : 'Passage'} ${sub.partOrPassageNo}`}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          Đúng {sub.correctCount} / {sub.totalCount} câu ({accuracy}%)
                        </h4>
                        <span className="text-xs text-zinc-500 mt-1 block">{subDateFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-extrabold text-white">
                        {accuracy >= 80 ? '🔥 Rất Tốt' : accuracy >= 60 ? '👍 Khá' : '⚠️ Cần Cố Gắng'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {snapshots.length === 0 ? (
              <div className="p-8 rounded-3xl bg-cardBg border border-cardBorder text-center">
                <p className="text-sm text-zinc-400">Chưa có bản tổng kết snapshot nào từ các tháng trước.</p>
              </div>
            ) : (
              snapshots.map((snap) => (
                <div key={snap.id} className="p-6 rounded-3xl bg-cardBg border border-cardBorder shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-lg font-extrabold text-amber-400">Tháng {snap.periodLabel}</span>
                    <span className="text-xs text-zinc-400">Tổng bài nộp: {snap.totalSubmissions}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900">
                      <span className="text-zinc-500">Độ chính xác trung bình:</span>
                      <p className="text-base font-bold text-white mt-1">{snap.meanAccuracyOverall}%</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900">
                      <span className="text-zinc-500">Listening Accuracy:</span>
                      <p className="text-base font-bold text-emerald-400 mt-1">
                        {JSON.parse(snap.meanAccuracyBySkill || '{}').LISTENING || 0}%
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900">
                      <span className="text-zinc-500">Reading Accuracy:</span>
                      <p className="text-base font-bold text-pink-400 mt-1">
                        {JSON.parse(snap.meanAccuracyBySkill || '{}').READING || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
