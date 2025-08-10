// TypeScript
import { NextResponse } from 'next/server'

const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const VISION_MODEL = process.env.DEEPSEEK_VISION_MODEL || 'deepseek-vl2'
const API_KEY = process.env.DEEPSEEK

export const runtime = 'nodejs' // Buffer/atob/btoa不要、Nodeランタイム明示

export async function POST(req: Request) {
    try {
        if (!API_KEY) {
            return NextResponse.json({ error: 'Server misconfig: missing DEEPSEEK' }, { status: 500 })
        }

        const form = await req.formData()
        const file = form.get('file')
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'file is required' }, { status: 400 })
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'file must be image/*' }, { status: 400 })
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'file is too large (<=5MB)' }, { status: 400 })
        }

        // ファイルを base64 化
        const buf = Buffer.from(await file.arrayBuffer())
        const b64 = buf.toString('base64')
        const mime = file.type || 'image/png'
        const dataUrl = `data:${mime};base64,${b64}`

        // Deepseek Vision へ: messages[0].content は配列（text + image_url）
        const body = {
            model: VISION_MODEL,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract all readable text from the image. Return plain text only.' },
                        { type: 'image_url', image_url: { url: dataUrl } }
                    ]
                }
            ],
            // max_tokens: 2048, // 必要なら
            // temperature: 0
        }

        const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            const text = await res.text().catch(() => '')
            return NextResponse.json({ error: `Deepseek Vision ${res.status}: ${text}` }, { status: 502 })
        }

        const json = await res.json()
        const out = json?.choices?.[0]?.message?.content ?? ''
        return NextResponse.json({ text: out })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'unexpected error' }, { status: 500 })
    }
}