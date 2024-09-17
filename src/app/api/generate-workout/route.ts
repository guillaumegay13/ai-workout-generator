import { NextResponse } from 'next/server'
import { GENERATE_WORKOUT_ENDPOINT } from '@/contants/api'

export async function POST(request: Request) {
    const payload = await request.json()

    const apiUrl = GENERATE_WORKOUT_ENDPOINT

    console.log("Sending request with payload:", JSON.stringify(payload, null, 2));
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
    console.log("Received response with workout:", JSON.stringify(workout, null, 2));
    return NextResponse.json(workout)
}