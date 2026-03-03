import { NextResponse } from 'next/server';
import { initializeSpreadsheet } from '@/lib/googleSheets';

export async function POST() {
    try {
        await initializeSpreadsheet();
        return NextResponse.json({ success: true, message: 'スプレッドシートの初期設定が完了しました' });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : '';
        console.error('[setup] Error:', msg, stack);
        return NextResponse.json({ success: false, error: msg, stack }, { status: 500 });
    }
}
