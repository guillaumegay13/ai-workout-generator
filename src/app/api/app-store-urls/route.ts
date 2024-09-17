import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        ios: process.env.IOS_APP_STORE_URL || '',
        android: process.env.ANDROID_PLAY_STORE_URL || '',
    });
}