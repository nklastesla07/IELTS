'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { StreakBadge } from '@/components/StreakBadge';
import { Heatmap } from '@/components/Heatmap';
import { Tier1Chart } from '@/components/Tier1Chart';
import { Tier2Chart } from '@/components/Tier2Chart';
import { Tier3Chart } from '@/components/Tier3Chart';
import { RecommendationChecklist } from '@/components/RecommendationChecklist';
import {
  Target,
  Award,
  TrendingUp,
  BookOpen,
  PlusCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-accentLight border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-zinc-400">Đang tải dữ liệu tiến độ...</p>
        </div>
      </div>
    );
  }

  const student = dashboardData?.student;
  const analytics = dashboardData?.analytics;
  const recommendations = dashboardData?.recommendations || [];
  const submissionDates = dashboardData?.submissionDates || [];
  const latestEstimatedBand = dashboardData?.latestEstimatedBand;

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar currentStreak={student?.currentStreak || 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-accent opacity-10 blur-3xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accentLight/10 border border-accentLight/20 text-accentLight text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chu kỳ theo dõi tháng này</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Chào mừng trở lại, <span className="bg-gradient-accent bg-clip-text text-transparent">{session?.user?.name}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Hãy tiếp tục giữ chuỗi luyện đề hàng ngày để nâng band điểm IELTS một cách tự nhiên.
            </p>
          </div>

          <Link
            href="/submit"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-accent hover:bg-gradient-accent-hover text-white text-sm font-bold shadow-xl transition-all duration-200 hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nhập Kết Quả Bài Làm</span>
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Streak */}
          <StreakBadge currentStreak={student?.currentStreak || 0} longestStreak={student?.longestStreak || 0} />

          {/* Card 2: Overall Accuracy */}
          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Độ Chính Xác Trung Bình</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-white">
                {analytics?.overallAccuracy || 0}%
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-4 mt-3 text-xs font-medium text-zinc-400">
              <span>Listening: <strong className="text-emerald-400">{analytics?.listeningAccuracy || 0}%</strong></span>
              <span>Reading: <strong className="text-pink-400">{analytics?.readingAccuracy || 0}%</strong></span>
            </div>
          </div>

          {/* Card 3: Band Estimate */}
          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Band Ước Tính Mới Nhất</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                {latestEstimatedBand !== null && latestEstimatedBand !== undefined ? `Band ${latestEstimatedBand.toFixed(1)}` : 'Chưa thi'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              {latestEstimatedBand
                ? 'Quy đổi khi làm trọn vẹn 1 đề 40 câu'
                : 'Làm bài 40 câu để hệ thống quy đổi Band'}
            </p>
          </div>

          {/* Card 4: Total Submissions */}
          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Tổng Bài Đã Nộp</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-white">
                {analytics?.totalSubmissions || 0}
              </span>
              <span className="text-sm font-medium text-zinc-400">lần làm</span>
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              Đã làm <strong className="text-zinc-200">{analytics?.totalQuestionsAttempted || 0}</strong> câu hỏi
            </p>
          </div>
        </div>

        {/* Heatmap Contribution Graph */}
        <Heatmap
          cycleStartDate={student?.cycleStartDate || new Date()}
          submissionDates={submissionDates}
        />

        {/* Today's Recommendation Checklist */}
        <RecommendationChecklist recommendations={recommendations} />

        {/* Tier 1 Chart: Accuracy over time */}
        <Tier1Chart data={analytics?.accuracyOverTime || []} />

        {/* Tier 2 Charts: Part & Question Type Accuracy */}
        <Tier2Chart
          listeningParts={analytics?.partAccuracyListening || []}
          readingParts={analytics?.partAccuracyReading || []}
          questionTypeStats={analytics?.questionTypeStats || []}
        />

        {/* Tier 3 Charts: Error Category Doughnut & Tag Ranking */}
        <Tier3Chart
          errorCategoryStats={analytics?.errorCategoryStats || []}
          topErrorTags={analytics?.topErrorTags || []}
        />
      </main>
    </div>
  );
}
