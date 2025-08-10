import { NextResponse } from 'next/server'

// クライアントサイドOCRに移行するため、この API は無効化
export async function POST(req: Request) {
    return NextResponse.json({
        error: 'OCR processing has been moved to client-side for better performance'
    }, { status: 410 })
}