'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import {
  Users,
  UserPlus,
  RefreshCw,
  Ban,
  CheckCircle2,
  Copy,
  Eye,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
      console.error('Lỗi nạp học sinh:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email }),
      });

      if (res.ok) {
        setFullName('');
        setEmail('');
        setShowAddModal(false);
        fetchStudents();
      } else {
        const err = await res.json();
        alert(err.error || 'Có lỗi xảy ra khi tạo học sinh');
      }
    } catch (err) {
      alert('Lỗi tạo học sinh');
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateCode = async (id: string) => {
    if (!confirm('Bạn có chắc muốn tạo lại mã mời mới cho học sinh này? Mã cũ sẽ không dùng được nữa.')) return;

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REGENERATE_INVITE' }),
      });

      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      alert('Lỗi đổi mã mời');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_ACTIVE', isActive: !currentActive }),
      });

      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      alert('Lỗi đổi trạng thái');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Quản Lý Học Sinh & Mã Mời (Invite Codes) 🔑
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Tạo học sinh mới, sinh mã mời 8 ký tự tự động, thu hồi hoặc cấp lại mã mời khi cần.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-accent text-white text-sm font-bold shadow-xl hover:scale-105 transition-transform"
          >
            <UserPlus className="w-5 h-5" />
            <span>Thêm Học Sinh Mới</span>
          </button>
        </div>

        {/* Student Table */}
        <div className="rounded-3xl p-6 bg-cardBg border border-cardBorder shadow-xl space-y-4">
          {loading ? (
            <p className="text-sm text-zinc-400 text-center py-8">Đang nạp danh sách...</p>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-zinc-400">Chưa có học sinh nào trong hệ thống.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-accent text-white text-xs font-bold"
              >
                Tạo Học Sinh Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/80 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">Học Sinh</th>
                    <th className="p-4">Mã Mời (Invite Code)</th>
                    <th className="p-4">Streak 🔥</th>
                    <th className="p-4">Trạng Thái</th>
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

                      <td className="p-4">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700">
                          <span className="font-mono font-extrabold text-accentLight">{student.inviteCode}</span>
                          <button
                            onClick={() => copyToClipboard(student.inviteCode)}
                            title="Copy Mã Mời"
                            className="text-zinc-500 hover:text-white"
                          >
                            {copiedCode === student.inviteCode ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-amber-400">🔥 {student.currentStreak} ngày</td>

                      <td className="p-4">
                        {student.isActive ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-dangerRed/10 text-dangerRed border border-dangerRed/20 text-xs font-semibold">
                            Đã vô hiệu
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleRegenerateCode(student.id)}
                          title="Tạo lại mã mời mới"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                          <span>Đổi Mã</span>
                        </button>

                        <button
                          onClick={() => handleToggleActive(student.id, student.isActive)}
                          title={student.isActive ? 'Vô hiệu hóa học sinh' : 'Kích hoạt lại'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            student.isActive
                              ? 'bg-dangerRed/10 text-dangerRed hover:bg-dangerRed/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {student.isActive ? 'Vô Hiệu' : 'Mở Lai'}
                        </button>

                        <Link
                          href={`/dashboard?studentId=${student.id}`}
                          className="px-3 py-1.5 rounded-lg bg-accentLight/10 text-accentLight hover:bg-accentLight/20 text-xs font-bold transition-colors inline-block"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardBg border border-cardBorder rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-white">Thêm Học Sinh Mới</h2>
              <p className="text-xs text-zinc-400 mt-1">Hệ thống sẽ tự động tạo Mã Mời (Invite Code) 8 ký tự riêng.</p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Họ và Tên Học Sinh
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accentLight"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Đăng Nhập
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vanda@gmail.com"
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accentLight"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-gradient-accent text-white text-xs font-bold shadow-lg"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
