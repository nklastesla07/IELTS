'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { RefreshCw, Calendar, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSnapshotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [resetting, setResetting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleManualReset = async () => {
    if (
      !confirm(
        'Bạn có chắc muốn thực hiện tổng kết và reset số liệu tháng ngay bây giờ?\n- Hệ thống sẽ tạo bản ghi MonthlySnapshot cho từng học sinh.\n- Mọi số liệu hiển thị dashboard tháng này sẽ tính lại từ mốc hôm nay trở đi.\n- Chuỗi Streak 🔥 của học sinh KHÔNG bị ảnh hưởng.'
      )
    )
      return;

    setResetting(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/cron/monthly-reset', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setResultMsg(data.message);
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi thực hiện reset tháng');
      }
    } catch (err) {
      alert('Lỗi thực hiện reset tháng');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tổng Kết & Reset Hàng Tháng (Monthly Snapshots) 📅
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Hệ thống tự động chạy qua Vercel Cron vào 00:00 ngày 1 hàng tháng. Bạn cũng có thể kích hoạt thủ công dưới đây.
          </p>
        </div>

        {/* Manual Reset Banner */}
        <div className="p-6 rounded-3xl bg-cardBg border border-cardBorder shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Reset Thủ Công Ngay Bây Giờ</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tạo snapshot lưu lại thành tích của tất cả học sinh trong chu kỳ hiện tại và thiết lập mốc chu kỳ mới.
                <br />
                <strong className="text-amber-400">Lưu ý:</strong> Dữ liệu bài nộp gốc không bị xóa. Chuỗi ngày học Streak (🔥) của học sinh được duy trì liên tục xuyên tháng.
              </p>
            </div>

            <button
              onClick={handleManualReset}
              disabled={resetting}
              className="px-6 py-3.5 rounded-2xl bg-gradient-accent hover:bg-gradient-accent-hover text-white text-sm font-extrabold shadow-xl shrink-0 transition-all hover:scale-105 disabled:opacity-50"
            >
              {resetting ? 'Đang tổng kết...' : '⚡ Reset Số Liệu Ngay'}
            </button>
          </div>

          {resultMsg && (
            <div className="flex items-center space-x-2 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{resultMsg}</span>
            </div>
          )}
        </div>

        {/* Vercel Cron Documentation Box */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center space-x-2 text-accentLight font-bold text-sm">
            <Calendar className="w-5 h-5" />
            <h3>Cấu Hình Vercel Cron Job</h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            File <code className="text-white font-mono bg-zinc-950 px-2 py-0.5 rounded">vercel.json</code> đã được tạo sẵn trong dự án với lịch trình:
          </p>

          <pre className="p-4 rounded-xl bg-zinc-950 text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "crons": [
    {
      "path": "/api/cron/monthly-reset",
      "schedule": "0 0 1 * *"
    }
  ]
}`}
          </pre>

          <p className="text-xs text-zinc-500">
            Khi deploy lên Vercel, Cron job này sẽ tự động gọi API endpoint vào 00:00 UTC ngày đầu tiên mỗi tháng.
          </p>
        </div>
      </main>
    </div>
  );
}
