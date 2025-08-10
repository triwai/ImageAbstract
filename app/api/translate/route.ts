import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const key = process.env.DEEPSEEK
    if (!key) {
      return Response.json({ error: 'Server misconfiguration: DEEPSEEK is not set.' }, { status: 500 })
    }

    const { text, toLang } = await req.json().catch(() => ({})) as { text?: string, toLang?: string }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ error: '翻訳するテキストが空です。' }, { status: 400 })
    }

    const target = (toLang || 'ja').trim()
    if (target.length > 12) {
      return Response.json({ error: '言語コードが不正です。' }, { status: 400 })
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const textModel = process.env.DEEPSEEK_TEXT_MODEL || 'deepseek-chat'

    const messages = [
      { role: 'system', content: 'You are a professional translator. Return only the translated text without notes.' },
      { role: 'user', content: `Translate the following into ${target}.\n\nText:\n${text}` }
    ]

    const r = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: textModel, messages, temperature: 0 })
    })

    if (!r.ok) {
      const errText = await r.text()
      return Response.json({ error: `Deepseek API error: ${r.status} ${errText}` }, { status: 502 })
    }

    const json = await r.json()
    const translated: string = json?.choices?.[0]?.message?.content || ''

    return Response.json({ text: translated })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
