'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import {
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Flame,
  Award,
  Layers,
  BookOpen,
  Headphones,
} from 'lucide-react';

export type Skill = 'LISTENING' | 'READING';
export type SubmissionMode = 'PART_OR_PASSAGE' | 'FULL_TEST';

interface ErrorTagItem {
  id: string;
  skill: Skill;
  groupName: string;
  label: string;
  code: string;
}

const QUESTION_TYPES_BY_SKILL = {
  LISTENING: [
    'Gap Filling',
    'Map/Diagram Label',
    'Multiple Choice (1 đáp án)',
    'Matching Information',
    'Multiple Choice (nhiều đáp án)',
    'Other types',
  ],
  READING: [
    'Matching Heading',
    'T/F/NG',
    'Y/N/NG',
    'Multiple Choice (1 đáp án)',
    'Matching Information',
    'Matching Features',
    'Multiple Choice (nhiều đáp án)',
    'Map/Diagram/Label',
    'Gap Filling',
    'Other types',
  ],
};

export default function SubmitResultPage() {
  const router = useRouter();

  const [skill, setSkill] = useState<Skill>('LISTENING');
  const [mode, setMode] = useState<SubmissionMode>('PART_OR_PASSAGE');
  const [partOrPassageNo, setPartOrPassageNo] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(8);
  const [totalCount, setTotalCount] = useState<number>(10);

  // Question type breakdown: { "Gap Filling": { correct: 6, total: 8 } }
  const [qTypeBreakdown, setQTypeBreakdown] = useState<Record<string, { correct: number; total: number }>>({});

  // Error tag checkboxes
  const [availableTags, setAvailableTags] = useState<ErrorTagItem[]>([]);
  const [selectedTagCodes, setSelectedTagCodes] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    streak?: number;
    band?: number | null;
  }>({ show: false });

  useEffect(() => {
    fetchErrorTags();
  }, []);

  const fetchErrorTags = async () => {
    try {
      const res = await fetch('/api/error-tags');
      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data);
      }
    } catch (err) {
      console.error('Lỗi nạp error tags:', err);
    }
  };

  // Adjust total count automatically based on mode
  useEffect(() => {
    if (mode === 'FULL_TEST') {
      setTotalCount(40);
    } else {
      if (skill === 'LISTENING') setTotalCount(10);
      else setTotalCount(13); // Passage default ~13-14
    }
  }, [mode, skill]);

  const handleTagToggle = (code: string) => {
    setSelectedTagCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleQTypeChange = (qType: string, field: 'correct' | 'total', val: number) => {
    setQTypeBreakdown((prev) => ({
      ...prev,
      [qType]: {
        correct: field === 'correct' ? val : prev[qType]?.correct || 0,
        total: field === 'total' ? val : prev[qType]?.total || 0,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (correctCount < 0 || correctCount > totalCount) {
      alert('Số câu đúng không được lớn hơn tổng số câu.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          mode,
          partOrPassageNo: mode === 'PART_OR_PASSAGE' ? partOrPassageNo : null,
          correctCount,
          totalCount,
          questionTypeBreakdown: qTypeBreakdown,
          errorTagCodes: selectedTagCodes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessModal({
          show: true,
          streak: data.streak?.currentStreak,
          band: data.estimatedBand,
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Có lỗi xảy ra khi nộp bài');
      }
    } catch (err) {
      alert('Lỗi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter error tags by current skill
  const currentSkillTags = availableTags.filter((t) => t.skill === skill);
  // Group error tags by groupName
  const groupedTags: Record<string, ErrorTagItem[]> = {};
  currentSkillTags.forEach((t) => {
    if (!groupedTags[t.groupName]) groupedTags[t.groupName] = [];
    groupedTags[t.groupName].push(t);
  });

  return (
    <div className="min-h-screen bg-darkBg pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-cardBg border border-cardBorder rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Nhập Kết Quả Bài Làm IELTS 🔥
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Nhập kết quả tổng hợp 1 Part/Passage hoặc Đề 40 câu kèm tick chọn lỗi sai để kích hoạt Streak và Checklist.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Choose Skill & Mode */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accentLight flex items-center space-x-2">
                <span>1. Chọn Kỹ Năng & Chế Độ</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSkill('LISTENING')}
                  className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border text-sm font-bold transition-all ${
                    skill === 'LISTENING'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Headphones className="w-5 h-5" />
                  <span>IELTS Listening</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSkill('READING')}
                  className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border text-sm font-bold transition-all ${
                    skill === 'READING'
                      ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>IELTS Reading</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('PART_OR_PASSAGE')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mode === 'PART_OR_PASSAGE'
                      ? 'bg-gradient-accent/10 border-accentLight text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider block text-accentLight">Luyện Lẻ</span>
                  <span className="text-sm font-bold block mt-1">1 Part / 1 Passage</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">Tính độ chính xác trung bình (Mean Accuracy)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('FULL_TEST')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mode === 'FULL_TEST'
                      ? 'bg-gradient-accent/10 border-accentLight text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider block text-amber-400">Thi Thử</span>
                  <span className="text-sm font-bold block mt-1">Đề Đầy Đủ (40 Câu)</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">Quy đổi ra Band điểm ước tính</span>
                </button>
              </div>
            </div>

            {/* Step 2: Numbers */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accentLight">
                2. Kết Quả Số Câu Đúng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mode === 'PART_OR_PASSAGE' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      {skill === 'LISTENING' ? 'Part Mấy?' : 'Passage Mấy?'}
                    </label>
                    <select
                      value={partOrPassageNo}
                      onChange={(e) => setPartOrPassageNo(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-accentLight"
                    >
                      {skill === 'LISTENING' ? (
                        <>
                          <option value={1}>Part 1</option>
                          <option value={2}>Part 2</option>
                          <option value={3}>Part 3</option>
                          <option value={4}>Part 4</option>
                        </>
                      ) : (
                        <>
                          <option value={1}>Passage 1</option>
                          <option value={2}>Passage 2</option>
                          <option value={3}>Passage 3</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Số Câu Đúng
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalCount}
                    value={correctCount}
                    onChange={(e) => setCorrectCount(parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold focus:outline-none focus:border-accentLight"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Tổng Số Câu
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalCount}
                    disabled={mode === 'FULL_TEST'}
                    onChange={(e) => setTotalCount(parseInt(e.target.value) || 10)}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold focus:outline-none focus:border-accentLight disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Question Types Breakdown (Optional) */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accentLight">
                  3. Chi Tiết Theo Dạng Bài (Không Bắt Buộc)
                </h3>
                <span className="text-xs text-zinc-500">Giúp phân tích Tầng 2 chính xác hơn</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUESTION_TYPES_BY_SKILL[skill].map((qType) => {
                  const currentVal = qTypeBreakdown[qType] || { correct: 0, total: 0 };
                  return (
                    <div
                      key={qType}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-zinc-300">{qType}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Đúng"
                          min={0}
                          value={currentVal.correct || ''}
                          onChange={(e) =>
                            handleQTypeChange(qType, 'correct', parseInt(e.target.value) || 0)
                          }
                          className="w-14 p-1.5 text-center text-xs rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                        />
                        <span className="text-zinc-600 text-xs">/</span>
                        <input
                          type="number"
                          placeholder="Tổng"
                          min={0}
                          value={currentVal.total || ''}
                          onChange={(e) =>
                            handleQTypeChange(qType, 'total', parseInt(e.target.value) || 0)
                          }
                          className="w-14 p-1.5 text-center text-xs rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Tick Error Tags */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accentLight">
                  4. Tick Nguyên Nhân Lỗi Sai Mắc Phải
                </h3>
                <span className="text-xs text-amber-400 font-semibold">Tự động tạo Checklist Nhiệm vụ</span>
              </div>

              {Object.keys(groupedTags).length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Đang tải danh mục lỗi...</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedTags).map(([groupName, tags]) => (
                    <div key={groupName} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 mb-3">
                        📂 {groupName}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const isSelected = selectedTagCodes.includes(tag.code);
                          return (
                            <button
                              key={tag.code}
                              type="button"
                              onClick={() => handleTagToggle(tag.code)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                isSelected
                                  ? 'bg-dangerRed/20 border-dangerRed text-dangerRed shadow-[0_0_10px_rgba(248,113,113,0.3)]'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                              }`}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-accent hover:bg-gradient-accent-hover text-white text-base font-extrabold shadow-2xl transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? 'Đang lưu bài nộp...' : 'Lưu Kết Quả & Kích Hoạt Chuỗi 🔥'}
            </button>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardBg border border-cardBorder rounded-3xl p-8 max-w-md w-full text-center space-y-6 animate-scaleUp shadow-2xl">
            <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Flame className="w-12 h-12 fill-amber-500 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Nộp Bài Thành Công!</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Chuỗi ngày học của bạn hiện tại: <strong className="text-amber-400">🔥 {successModal.streak} Ngày liên tiếp</strong>
              </p>

              {successModal.band && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">Band Điểm Ước Tính</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">Band {successModal.band.toFixed(1)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSuccessModal({ show: false });
                router.push('/dashboard');
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-accent text-white font-bold text-sm shadow-xl"
            >
              Về Dashboard Xem Phân Tích & Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
