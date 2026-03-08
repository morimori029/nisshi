import { NextResponse } from 'next/server';
import { getDailyReport, saveDailyReport } from '@/lib/googleSheets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        if (!date) {
            return NextResponse.json({ success: false, error: 'date is required' }, { status: 400 });
        }
        const report = await getDailyReport(date);
        // ?check=1 のときは updatedAt だけ返す（ポーリング用）
        if (searchParams.get('check') === '1') {
            return NextResponse.json({ success: true, updatedAt: report?.updatedAt ?? null });
        }
        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { loadedAt, force, ...report } = body;

        // 競合チェック（force=true なら無条件上書き）
        if (loadedAt && !force) {
            const current = await getDailyReport(report.date);
            if (current?.updatedAt && current.updatedAt > loadedAt) {
                return NextResponse.json(
                    { success: false, conflict: true, serverUpdatedAt: current.updatedAt },
                    { status: 409 }
                );
            }
        }

        await saveDailyReport(report);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
