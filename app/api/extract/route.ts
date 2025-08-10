import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const key = process.env.DEEPSEEK
    if (!key) {
      return Response.json({ error: 'Server misconfiguration: DEEPSEEK is not set.' }, { status: 500 })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: '画像ファイルが見つかりません。' }, { status: 400 })
    }

    const type = (file as Blob).type || 'application/octet-stream'
    if (!type.startsWith('image/')) {
      return Response.json({ error: '画像ファイルを送信してください。' }, { status: 400 })
    }

    const size = (file as Blob).size || 0
    if (size > 5 * 1024 * 1024) {
      return Response.json({ error: 'ファイルサイズは5MBまでです。' }, { status: 400 })
    }

    const buffer = Buffer.from(await (file as Blob).arrayBuffer())
    const b64 = buffer.toString('base64')
    const dataUrl = `data:${type};base64,${b64}`

    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const visionModel = process.env.DEEPSEEK_VISION_MODEL || 'deepseek-vl2'

    const payload = {
      model: visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Extract all textual content from this image. Return plain text only without commentary or formatting.' },
            { type: 'input_image', image_url: dataUrl }
          ]
        }
      ],
      temperature: 0
    }

    const r = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!r.ok) {
      const errText = await r.text()
      return Response.json({ error: `Deepseek API error: ${r.status} ${errText}` }, { status: 502 })
    }

    const json = await r.json()
    const text: string = json?.choices?.[0]?.message?.content || ''

    return Response.json({ text })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
