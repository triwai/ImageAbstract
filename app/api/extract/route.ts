
import { NextResponse } from 'next/server'

const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const VISION_MODEL = process.env.DEEPSEEK_VISION_MODEL || 'deepseek-vl2'
const API_KEY = process.env.DEEPSEEK

export const runtime = 'nodejs'

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

        // 画像を小さくしてみる（デバッグ用）
        if (b64.length > 500000) { // 約375KB以上の場合
            return NextResponse.json({ error: 'Image too large for processing' }, { status: 400 })
        }

        // Deepseek Vision の正確な形式を試す
        const requestBody = {
            "model": VISION_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all readable text from this image."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `data:${file.type};base64,${b64}`
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 2048
        }

        // デバッグ情報
        console.log('Request details:', {
            model: VISION_MODEL,
            imageType: file.type,
            base64Length: b64.length,
            jsonSize: JSON.stringify(requestBody).length
        })

        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        const responseText = await response.text()

        if (!response.ok) {
            console.error('Full error response:', responseText)

            // もし Vision モデルに問題があれば、テキストモデルでエラーメッセージを返す
            if (responseText.includes('model') || responseText.includes('vision')) {
                return NextResponse.json({
                    error: 'Vision model not available. Please check if deepseek-vl2 is accessible with your API key.'
                }, { status: 502 })
            }

            return NextResponse.json({
                error: `Deepseek Vision ${response.status}: ${responseText}`
            }, { status: 502 })
        }

        const responseData = JSON.parse(responseText)
        const extractedText = responseData?.choices?.[0]?.message?.content || ''
        return NextResponse.json({ text: extractedText })

    } catch (error: any) {
        console.error('Extract API error:', error)
        return NextResponse.json({
            error: error?.message || 'Unexpected error occurred'
        }, { status: 500 })
    }
}