'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppNav() {
    const pathname = usePathname();

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isReport = pathname.startsWith('/report');
    const isSettings = pathname.startsWith('/settings');

    return (
        <nav className="app-nav">
            <span className="app-logo">🏥 介護施設 日報</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <Link href={`/report/${today}`} className={`nav-tab ${isReport ? 'active' : ''}`}>
                    📋 日報
                </Link>
                <Link href="/manual" className={`nav-tab ${pathname === '/manual' ? 'active' : ''}`}>
                    📘 マニュアル
                </Link>
                <Link href="/spec" className={`nav-tab ${pathname === '/spec' ? 'active' : ''}`}>
                    📄 仕様書
                </Link>
            </div>
        </nav>
    );
}
