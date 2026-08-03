'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import {
  Users,
  Flame,
  Award,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  KeyRound,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchStudents();
      }
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = students.filter((s) => s.isActive).length;
  const totalSubmissionsClass = students.reduce((acc, s) => acc + (s._count?.submissions || 0), 0);

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Admin Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-cardBg border border-cardBorder shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accentDark/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accentLight/10 border border-accentLight/20 text-accentLight text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trang Quản Trị Gia Sư / Trung Tâm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tổng Quan Lớp Học 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Theo dõi tiến độ, cấp mã mời riêng và quản lý snapshots của toàn bộ học sinh.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/students"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-accent text-white text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <Users className="w-4 h-4" />
              <span>Quản Lý Học Sinh</span>
            </Link>

            <Link
              href="/admin/snapshots"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-sm font-bold shadow-md hover:bg-zinc-800 transition-colors"
            >
              <span>Reset & Snapshots</span>
            </Link>
          </div>
        </div>

        {/* Top Class Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Tổng Số Học Sinh</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-white">{students.length}</span>
              <span className="text-xs text-emerald-400 font-semibold">({activeCount} đang hoạt động)</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Tổng Bài Nộp Cả Lớp</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold bg-gradient-accent bg-clip-text text-transparent">
                {totalSubmissionsClass}
              </span>
              <span className="text-xs text-zinc-400">lần làm</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-cardBg border border-cardBorder shadow-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Học Sinh Giữ Chuỗi Cao Nhất</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-amber-400">
                🔥 {Math.max(...students.map((s) => s.currentStreak || 0), 0)}
              </span>
              <span className="text-xs text-zinc-400">ngày</span>
            </div>
          </div>
        </div>

        {/* Student Leaderboard */}
        <div className="rounded-3xl p-6 bg-cardBg border border-cardBorder shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-textHeading">Bảng Xếp Hạng Tiến Độ Học Sinh</h3>
            <Link href="/admin/students" className="text-xs text-accentLight font-semibold hover:underline">
              Xem tất cả & quản lý mã mời →
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 text-center py-8">Đang nạp danh sách...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">Chưa có học sinh nào. Hãy tạo học sinh mới!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/80 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">Học Sinh</th>
                    <th className="p-4">Mã Mời (Invite Code)</th>
                    <th className="p-4">Chuỗi Streak 🔥</th>
                    <th className="p-4">Tổng Bài Nộp</th>
                    <th className="p-4 rounded-r-xl text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white">{student.fullName}</p>
                          <p className="text-xs text-zinc-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-accentLight">{student.inviteCode}</td>
                      <td className="p-4 font-bold text-amber-400">🔥 {student.currentStreak} ngày</td>
                      <td className="p-4 font-semibold text-zinc-200">{student._count?.submissions || 0} bài</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard?studentId=${student.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Dashboard</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
