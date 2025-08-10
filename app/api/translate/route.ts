// TypeScript
import { NextResponse } from 'next/server'

const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const TEXT_MODEL = process.env.DEEPSEEK_TEXT_MODEL || 'deepseek-chat'
const API_KEY = process.env.DEEPSEEK

export async function POST(req: Request) {
    try {
        if (!API_KEY) {
            return NextResponse.json({ error: 'Server misconfig: missing DEEPSEEK' }, { status: 500 })
        }

        const { text, toLang } = await req.json().catch(() => ({}))
        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'text is required' }, { status: 400 })
        }
        if (!toLang || typeof toLang !== 'string') {
            return NextResponse.json({ error: 'toLang is required' }, { status: 400 })
        }

        // Text モデルへは content を「文字列」で送る
        const prompt = `Translate the following text into ${toLang}. Respond with translated text only, no extra notes:\n\n${text}`

        const body = {
            model: TEXT_MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
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
            const errText = await res.text().catch(() => '')
            return NextResponse.json({ error: `Deepseek Text ${res.status}: ${errText}` }, { status: 502 })
        }

        const json = await res.json()
        const out = json?.choices?.[0]?.message?.content ?? ''
        return NextResponse.json({ text: out })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'unexpected error' }, { status: 500 })
    }
}