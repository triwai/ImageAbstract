'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function classNames(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(' ')
}

const languages = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' }
]

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [text, setText] = useState<string>('')
  const [translated, setTranslated] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [tLoading, setTLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [enableTranslate, setEnableTranslate] = useState<boolean>(false)
  const [toLang, setToLang] = useState<string>('ja')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      if (!f.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。')
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MBまでです。')
        return
      }
      setError('')
      setFile(f)
      setText('')
      setTranslated('')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) {
      if (!f.type.startsWith('image/')) {
        setError('画像ファイルをドロップしてください。')
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MBまでです。')
        return
      }
      setError('')
      setFile(f)
      setText('')
      setTranslated('')
    }
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const extractText = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setText('')
    setTranslated('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: '抽出に失敗しました。'}))
        throw new Error(data.error || '抽出に失敗しました。')
      }
      const data = await res.json() as { text: string }
      setText(data.text || '')
    } catch (e: any) {
      setError(e.message || '抽出に失敗しました。')
    } finally {
      setLoading(false)
    }
  }, [file])

  const translateText = useCallback(async () => {
    if (!text) return
    setTLoading(true)
    setError('')
    setTranslated('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, toLang })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: '翻訳に失敗しました。'}))
        throw new Error(data.error || '翻訳に失敗しました。')
      }
      const data = await res.json() as { text: string }
      setTranslated(data.text || '')
    } catch (e: any) {
      setError(e.message || '翻訳に失敗しました。')
    } finally {
      setTLoading(false)
    }
  }, [text, toLang])

  const copy = useCallback(async (value: string) => {
    try { await navigator.clipboard.writeText(value) } catch {}
  }, [])

  const download = useCallback((value: string, name = 'extracted.txt') => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="w-full max-w-5xl">
      <div className={classNames('glass-card holo-border rounded-2xl p-6 md:p-10', 'shadow-glass')}>
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">ImageAbstract</h1>
            <p className="text-white/70 text-sm md:text-base">AppleライクなホログラフィックUIで画像の文字を抽出（Deepseek対応）</p>
            <p className="text-white/50 text-xs">by Triwi • Source: https://github.com/triwai/ImageAbstract</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="btn-primary">画像を選択</button>
            <a className="btn-ghost" href="https://vercel.com/new" target="_blank" rel="noreferrer">Vercelでデプロイ</a>
          </div>
        </header>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={classNames(
            'mt-6 grid md:grid-cols-2 gap-6',
          )}
        >
          <div className="rounded-xl border border-white/15 bg-white/5 min-h-72 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-10 text-white/70">
                <div className="text-5xl mb-4">🫧</div>
                <p className="mb-2">画像をドラッグ&ドロップ、または「画像を選択」</p>
                <p className="text-xs">PNG/JPG 最大 5MB</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button onClick={extractText} disabled={!file || loading} className="btn-primary disabled:opacity-50">
                {loading ? '抽出中…' : '文字を抽出'}
              </button>
              <button onClick={() => { setEnableTranslate(v => !v); if (!enableTranslate) setTranslated(''); }} className="btn-ghost">
                翻訳 {enableTranslate ? 'ON' : 'OFF'}
              </button>
              {enableTranslate && (
                <select value={toLang} onChange={(e) => setToLang(e.target.value)} className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-sm">
                  {languages.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
                </select>
              )}
              {enableTranslate && (
                <button onClick={translateText} disabled={!text || tLoading} className="btn-primary disabled:opacity-50">
                  {tLoading ? '翻訳中…' : '翻訳する'}
                </button>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-300">{error}</div>
            )}

            <section className="grid gap-4">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">抽出結果</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copy(text)} className="btn-ghost">コピー</button>
                    <button onClick={() => download(text)} className="btn-ghost">ダウンロード</button>
                  </div>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="ここに抽出結果が表示されます" className="w-full h-40 bg-transparent outline-none resize-y" />
              </div>

              {enableTranslate && (
                <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">翻訳結果 ({languages.find(l => l.code === toLang)?.label})</h3>
                    <div className="flex gap-2">
                      <button onClick={() => copy(translated)} className="btn-ghost">コピー</button>
                      <button onClick={() => download(translated, 'translated.txt')} className="btn-ghost">ダウンロード</button>
                    </div>
                  </div>
                  <textarea value={translated} onChange={(e) => setTranslated(e.target.value)} placeholder="ここに翻訳結果が表示されます" className="w-full h-40 bg-transparent outline-none resize-y" />
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <footer className="text-center text-white/50 text-xs mt-6">
        Made by Triwi • Deploy on Vercel • Deepseek APIでOCR/翻訳
      </footer>
    </div>
  )
}
