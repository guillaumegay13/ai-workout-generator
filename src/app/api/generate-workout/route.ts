import { NextResponse } from 'next/server'
export const maxDuration = 30;

export async function POST(request: Request) {
    const payload = await request.json()

    const apiUrl = process.env.GENERATE_WORKOUT_ENDPOINT

    if (!apiUrl) {
        return NextResponse.json({ error: 'Workout generation endpoint not configured' }, { status: 500 });
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to generate workout' }, { status: response.status })
    }

    const workout = await response.json()
    return NextResponse.json(workout)
}