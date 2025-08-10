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

        // MIME タイプをそのまま使用（PNG、JPEG、WebP等に対応）
        const mime = file.type || 'image/png'
        const imageUrl = `data:${mime};base64,${b64}`

        // Deepseek Vision リクエストボディ
        const requestBody = {
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Extract all readable text from the image. Return plain text only."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4096,
            temperature: 0
        }

        // デバッグ用
        console.log('Image info:', {
            originalType: file.type,
            size: file.size,
            mimeUsed: mime
        })

        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        const responseText = await response.text()

        if (!response.ok) {
            console.error('Deepseek error response:', responseText)
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