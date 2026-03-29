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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <Link href={`/report/${today}`} className={`nav-tab ${isReport ? 'active' : ''}`}>
                    📋 日報
                </Link>
                <Link href="/manual" className={`nav-tab ${pathname === '/manual' ? 'active' : ''}`}>
                    📘 マニュアル
                </Link>
            </div>
        </nav>
    );
}
