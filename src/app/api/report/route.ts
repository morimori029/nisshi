import { NextResponse } from 'next/server';
import { getDailyReport, getDailyReportWithIndex, saveDailyReport } from '@/lib/googleSheets';

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
        const { loadedAt, ...report } = body;

        // 1回の読み込みで競合チェックと rowIndex を取得
        const { report: current, rowIndex } = await getDailyReportWithIndex(report.date);

        // 競合チェック
        if (loadedAt && current?.updatedAt && current.updatedAt > loadedAt) {
            return NextResponse.json(
                { success: false, conflict: true, serverUpdatedAt: current.updatedAt },
                { status: 409 }
            );
        }

        // rowIndex を渡すことで再読み込みを省略
        await saveDailyReport(report, rowIndex > 0 ? rowIndex : undefined);
        // サーバーが設定した updatedAt をクライアントに返す
        return NextResponse.json({ success: true, updatedAt: report.updatedAt });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
