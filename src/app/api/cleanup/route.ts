import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database';

export async function GET(request: NextRequest) {
    const secretKey = request.nextUrl.searchParams.get('key');
    if (secretKey !== process.env.CLEANUP_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        await sql`DELETE FROM rate_limits WHERE date < ${yesterdayStr}`;

        return NextResponse.json({ message: 'Cleanup successful' });
    } catch (error) {
        console.error('Cleanup failed:', error);
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}