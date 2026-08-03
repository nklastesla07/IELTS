import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IELTS Progress Tracker — Theo Dõi Tiến Độ IELTS',
  description:
    'Web app theo dõi tiến độ luyện đề IELTS Listening & Reading, chuỗi ngày học Streak 🔥, phân tích lỗi sai 3 tầng & checklist tự động.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${montserrat.variable} dark`}>
      <body className="bg-darkBg text-textMain font-sans min-h-screen antialiased selection:bg-amber-500 selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
