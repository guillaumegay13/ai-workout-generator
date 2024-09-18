import { NextResponse } from 'next/server';

export async function GET() {
    const endpoint = process.env.GENERATE_WORKOUT_ENDPOINT;

    if (!endpoint) {
        return NextResponse.json({ error: 'Workout generation endpoint is not configured.' }, { status: 500 });
    }

    return NextResponse.json({ endpoint });
}