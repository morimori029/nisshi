'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppNav() {
    const pathname = usePathname();

    const today = new Date().toISOString().split('T')[0];
    const isReport = pathname.startsWith('/report');
    const isSettings = pathname.startsWith('/settings');

    return (
        <nav className="app-nav">
            <span className="app-logo">🏥 介護施設 日報</span>
            <Link href={`/report/${today}`} className={`nav-tab ${isReport ? 'active' : ''}`}>
                📋 日報
            </Link>
            <Link href="/settings" className={`nav-tab ${isSettings ? 'active' : ''}`}>
                👥 職員管理
            </Link>
        </nav>
    );
}
