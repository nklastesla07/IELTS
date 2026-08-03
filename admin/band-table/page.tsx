'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PlusCircle, Trash2, Headphones, BookOpen } from 'lucide-react';

export type Skill = 'LISTENING' | 'READING';

export default function AdminBandTablePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [table, setTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form for adding new row
  const [skill, setSkill] = useState<Skill>('LISTENING');
  const [minScore, setMinScore] = useState<number>(30);
  const [maxScore, setMaxScore] = useState<number>(31);
  const [band, setBand] = useState<number>(7.0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchBandTable();
      }
    }
  }, [status, session, router]);

  const fetchBandTable = async () => {
    try {
      const res = await fetch('/api/band-table');
      if (res.ok) {
        const data = await res.json();
        setTable(data);
      }
    } catch (err) {
      console.error('Lỗi nạp bảng quy đổi band:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/band-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          rawScoreMin: minScore,
          rawScoreMax: maxScore,
          band,
        }),
      });

      if (res.ok) {
        fetchBandTable();
      } else {
        alert('Lỗi thêm mốc band');
      }
    } catch (err) {
      alert('Lỗi thêm mốc band');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mốc quy đổi band này?')) return;

    try {
      const res = await fetch(`/api/band-table?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchBandTable();
      }
    } catch (err) {
      alert('Lỗi xóa');
    }
  };

  const listeningRows = table.filter((t) => t.skill === 'LISTENING');
  const readingRows = table.filter((t) => t.skill === 'READING');

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quản Lý Bảng Quy Đổi Band Điểm 🎯
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Điều chỉnh số câu đúng / 40 câu tương ứng với từng mốc Band điểm IELTS cho Listening & Reading.
          </p>
        </div>

        {/* Add Row Form */}
        <div className="p-6 rounded-3xl bg-cardBg border border-cardBorder shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-accentLight mb-4">
            Thêm Mốc Quy Đổi Mới
          </h3>

          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Kỹ Năng</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as Skill)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none"
              >
                <option value="LISTENING">Listening</option>
                <option value="READING">Reading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Số Câu Đúng Min</label>
              <input
                type="number"
                min={0}
                max={40}
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Số Câu Đúng Max</label>
              <input
                type="number"
                min={0}
                max={40}
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Band Ước Tính</label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={9.0}
                value={band}
                onChange={(e) => setBand(parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-extrabold text-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3.5 px-4 rounded-xl bg-gradient-accent text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
            >
              Thêm Mốc
            </button>
          </form>
        </div>

        {/* Display Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Listening Table */}
          <div className="rounded-3xl p-6 bg-cardBg border border-cardBorder shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-lg">
              <Headphones className="w-5 h-5" />
              <h3>Bảng Band IELTS Listening</h3>
            </div>

            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900 text-xs font-bold text-zinc-400 uppercase">
                <tr>
                  <th className="p-3">Số Câu Đúng (/40)</th>
                  <th className="p-3">Band Score</th>
                  <th className="p-3 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {listeningRows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-3 font-semibold">{row.rawScoreMin} – {row.rawScoreMax} câu</td>
                    <td className="p-3 font-extrabold text-amber-400">Band {row.band.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-zinc-500 hover:text-dangerRed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reading Table */}
          <div className="rounded-3xl p-6 bg-cardBg border border-cardBorder shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-pink-400 font-extrabold text-lg">
              <BookOpen className="w-5 h-5" />
              <h3>Bảng Band IELTS Reading</h3>
            </div>

            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900 text-xs font-bold text-zinc-400 uppercase">
                <tr>
                  <th className="p-3">Số Câu Đúng (/40)</th>
                  <th className="p-3">Band Score</th>
                  <th className="p-3 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {readingRows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-3 font-semibold">{row.rawScoreMin} – {row.rawScoreMax} câu</td>
                    <td className="p-3 font-extrabold text-amber-400">Band {row.band.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-zinc-500 hover:text-dangerRed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
