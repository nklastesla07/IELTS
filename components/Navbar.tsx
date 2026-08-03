'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { StreakBadge } from '@/components/StreakBadge';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  ShieldCheck,
  LogOut,
  Flame,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentStreak?: number;
}

export function Navbar({ currentStreak = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, role: 'ALL' },
    { label: 'Nhập Kết Quả', href: '/submit', icon: PlusCircle, role: 'STUDENT' },
    { label: 'Lịch Sử & Snapshots', href: '/history', icon: History, role: 'ALL' },
    { label: 'Trang Quản Trị', href: '/admin/dashboard', icon: ShieldCheck, role: 'ADMIN' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-darkBg/90 backdrop-blur-md border-b border-cardBorder">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-gradient-accent text-white shadow-lg group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              IELTS <span className="bg-gradient-accent bg-clip-text text-transparent">Tracker</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.role === 'ADMIN' && !isAdmin) return null;
              if (item.role === 'STUDENT' && isAdmin) return null;

              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-accent text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {!isAdmin && session?.user && (
              <StreakBadge currentStreak={currentStreak} compact />
            )}

            {session?.user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-textHeading">{session.user.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {isAdmin ? '🛡️ ADMIN' : '🎓 HỌC SINH'}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  title="Đăng xuất"
                  className="p-2 rounded-xl text-zinc-400 hover:text-dangerRed hover:bg-dangerRed/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-accent text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
