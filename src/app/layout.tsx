import type { Metadata } from 'next';
import './globals.css';
import AppNav from '@/components/AppNav';

export const metadata: Metadata = {
  title: '介護施設 日報',
  description: '介護施設向けの日報管理システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="app-layout">
          <AppNav />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
