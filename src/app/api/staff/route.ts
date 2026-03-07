import { NextResponse } from 'next/server';
import { getStaff, addStaff, updateStaff, deleteStaff, reorderStaff } from '@/lib/googleSheets';

export async function GET() {
    try {
        const staff = await getStaff();
        return NextResponse.json({ success: true, data: staff });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const member = await addStaff(body);
        return NextResponse.json({ success: true, data: member });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        await updateStaff(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { ids } = await req.json();
        await reorderStaff(ids);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await deleteStaff(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
