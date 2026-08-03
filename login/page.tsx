'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Flame, ShieldCheck, UserCheck, KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        loginType: activeTab,
        email,
        password,
        inviteCode,
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else if (res?.ok) {
        if (activeTab === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-accentLight/20 to-accentDark/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-cardBg border border-cardBorder rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-accent text-white shadow-xl mb-4">
            <Flame className="w-8 h-8 fill-white animate-bounce" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            IELTS <span className="bg-gradient-accent bg-clip-text text-transparent">Progress Tracker</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Đăng nhập để theo dõi tiến độ & thắp chuỗi học 🔥</p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('STUDENT');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'STUDENT'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Học Sinh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'ADMIN'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gia Sư / Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-dangerRed/10 border border-dangerRed/30 text-dangerRed text-xs font-semibold mb-6 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'ADMIN' ? 'vanhpham8117@gmail.com' : 'student@example.com'}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accentLight focus:ring-1 focus:ring-accentLight transition-colors"
              />
            </div>
          </div>

          {activeTab === 'STUDENT' ? (
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Mã Mời (Invite Code)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Ví dụ: IELTS999"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-accentLight focus:ring-1 focus:ring-accentLight transition-colors font-mono tracking-wider"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Mã mời được cấp riêng bởi Admin/Gia sư của bạn.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Mật Khẩu Admin
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accentLight focus:ring-1 focus:ring-accentLight transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-accent hover:bg-gradient-accent-hover text-white text-sm font-bold shadow-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Vào Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
          <p className="font-bold text-zinc-300 mb-1">💡 Tài khoản thử nghiệm có sẵn:</p>
          <ul className="space-y-1 text-[11px] font-mono">
            <li>• Admin: <span className="text-accentLight">vanhpham8117@gmail.com</span> (Mật khẩu mặc định trong prompt)</li>
            <li>• Học sinh Demo: <span className="text-amber-400">student@example.com</span> | Mã: <span className="text-amber-400">IELTS999</span></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
