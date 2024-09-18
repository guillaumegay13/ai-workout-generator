import { NextResponse } from 'next/server';
import { sql } from '@/utils/database';
import { initDatabase } from '@/utils/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await initDatabase();

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