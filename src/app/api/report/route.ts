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
        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await saveDailyReport(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
