'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function classNames(...a: (string | false | null | undefined)[]) {
    return a.filter(Boolean).join(' ')
}

type Lang = { code: string; label: string; flag: string }

const languages: Lang[] = [
    { code: 'ja', label: '日本語',  flag: '🇯🇵' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文',     flag: '🇨🇳' },
    { code: 'ko', label: '한국어',   flag: '🇰🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español',  flag: '🇪🇸' }
]

// OCR言語マッピング (Tesseract.js用)
const ocrLanguages: Record<string, string> = {
    ja: 'jpn',
    en: 'eng',
    zh: 'chi_sim',
    ko: 'kor',
    fr: 'fra',
    es: 'spa'
}

function LanguagePicker({
                            value,
                            onChange,
                            disabled,
                            label
                        }: {
    value: string
    onChange: (code: string) => void
    disabled?: boolean
    label?: string
}) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number>(() => Math.max(0, languages.findIndex(l => l.code === value)))
    const btnRef = useRef<HTMLButtonElement>(null)
    const popRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    const selected = useMemo(() => languages.find(l => l.code === value) ?? languages[0], [value])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!open) return
            const t = e.target as Node
            if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open])

    // Body scroll lock when dropdown is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    const onKeyDownBtn = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
            setActiveIndex(Math.max(0, languages.findIndex(l => l.code === value)))
            requestAnimationFrame(() => {
                popRef.current?.focus()
            })
        }
    }, [disabled, value])

    const onKeyDownList = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!open) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => (i + 1) % languages.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => (i - 1 + languages.length) % languages.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const lang = languages[activeIndex]
            if (lang) {
                onChange(lang.code)
                setOpen(false)
                btnRef.current?.focus()
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setOpen(false)
            btnRef.current?.focus()
        }
    }, [open, activeIndex, onChange])

    const selectLang = useCallback((code: string) => {
        onChange(code)
        setOpen(false)
        btnRef.current?.focus()
    }, [onChange])

    return (
        <>
            {/* Backdrop blur overlay */}
            <div
                ref={overlayRef}
                className={classNames(
                    'fixed inset-0 z-30 transition-all duration-300',
                    open
                        ? 'backdrop-blur-md bg-black/20 opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setOpen(false)}
            />

            <div className="relative">
                {label && (
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        {label}
                    </label>
                )}

                <button
                    ref={btnRef}
                    type="button"
                    onClick={() => !disabled && setOpen(o => !o)}
                    onKeyDown={onKeyDownBtn}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={classNames(
                        'group relative inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm min-w-[140px]',
                        'border border-white/20 bg-white/8 hover:bg-white/12',
                        'shadow-lg hover:shadow-xl transition-all duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-holo-400/60',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        open ? 'z-50 bg-white/15 shadow-2xl ring-2 ring-holo-400/40' : ''
                    )}
                >
                    <span className="text-xl">{selected.flag}</span>
                    <div className="flex-1 text-left">
                        <div className="font-medium text-white">{selected.label}</div>
                        <div className="text-xs text-white/60">{selected.code.toUpperCase()}</div>
                    </div>
                    <svg
                        className={classNames(
                            'w-4 h-4 text-white/60 transition-transform duration-200',
                            open ? 'rotate-180' : ''
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                <div
                    ref={popRef}
                    tabIndex={-1}
                    onKeyDown={onKeyDownList}
                    className={classNames(
                        'absolute z-40 mt-3 w-72 origin-top',
                        open
                            ? 'scale-100 opacity-100 pointer-events-auto'
                            : 'scale-95 opacity-0 pointer-events-none',
                        'transition-all duration-200 ease-out'
                    )}
                    role="listbox"
                    aria-activedescendant={languages[activeIndex]?.code}
                >
                    <div className="rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                        <div className="p-3">
                            <div className="text-xs font-semibold text-white/80 mb-3 px-3">
                                言語を選択
                            </div>
                            <div className="max-h-64 overflow-auto custom-scroll space-y-1">
                                {languages.map((l, i) => {
                                    const active = i === activeIndex
                                    const selectedItem = l.code === value
                                    return (
                                        <button
                                            key={l.code}
                                            id={l.code}
                                            type="button"
                                            role="option"
                                            aria-selected={selectedItem}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            onClick={() => selectLang(l.code)}
                                            className={classNames(
                                                'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left',
                                                'transition-all duration-150',
                                                active
                                                    ? 'bg-white/20 shadow-lg transform scale-[1.02]'
                                                    : 'hover:bg-white/10',
                                                selectedItem
                                                    ? 'bg-holo-gradient/20 ring-2 ring-holo-400/50 shadow-lg'
                                                    : ''
                                            )}
                                        >
                                            <span className="text-2xl">{l.flag}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">
                                                    {l.label}
                                                </div>
                                                <div className="text-xs text-white/70">
                                                    {l.code.toUpperCase()}
                                                </div>
                                            </div>
                                            {selectedItem && (
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-holo-400/80">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="border-t border-white/15 bg-white/5 px-4 py-3">
                            <div className="text-[10px] text-white/60 flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded border border-white/20">↑↓</kbd>
                                <span>移動</span>
                                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded border border-white/20">Enter</kbd>
                                <span>決定</span>
                                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded border border-white/20">Esc</kbd>
                                <span>閉じる</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

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
    const [ocrLang, setOcrLang] = useState<string>('en')
    const [ocrProgress, setOcrProgress] = useState<number>(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const workerRef = useRef<any>(null)

    useEffect(() => {
        if (!file) return
        const url = URL.createObjectURL(file)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [file])

    // Tesseract Worker の初期化（動的インポート）
    const initializeWorker = useCallback(async () => {
        if (workerRef.current) {
            return workerRef.current
        }

        try {
            // 動的インポートでTesseract.jsを読み込み
            const { createWorker } = await import('tesseract.js')

            const tessLang = ocrLanguages[ocrLang] || 'eng'

            const worker = await createWorker(tessLang, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100))
                    }
                }
            })

            workerRef.current = worker
            return worker
        } catch (err) {
            console.error('Failed to initialize OCR worker:', err)
            throw new Error('OCRエンジンの初期化に失敗しました')
        }
    }, [ocrLang])

    const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            if (!f.type.startsWith('image/')) {
                setError('画像ファイルを選択してください。')
                return
            }
            if (f.size > 10 * 1024 * 1024) {
                setError('ファイルサイズは10MBまでです。')
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
            if (f.size > 10 * 1024 * 1024) {
                setError('ファイルサイズは10MBまでです。')
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

    // OCR実行（クライアントサイド）
    const extractText = useCallback(async () => {
        if (!file) return
        setLoading(true)
        setError('')
        setText('')
        setTranslated('')
        setOcrProgress(0)

        try {
            const worker = await initializeWorker()
            const { data: { text } } = await worker.recognize(file)
            setText(text.trim())
        } catch (e: any) {
            setError(e.message || '文字抽出に失敗しました。')
        } finally {
            setLoading(false)
            setOcrProgress(0)
        }
    }, [file, initializeWorker])

    // 翻訳（DeepseekのText APIを使用）
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

    // クリーンアップ
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate?.()
                workerRef.current = null
            }
        }
    }, [])

    return (
        <div className="w-full max-w-5xl">
            <div className={classNames('glass-card holo-border rounded-2xl p-6 md:p-10', 'shadow-glass')}>
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">ImageAbstract</h1>
                        <p className="text-white/70 text-sm md:text-base">ブラウザ内GPU加速OCRで画像の文字を抽出</p>
                        <p className="text-white/50 text-xs">クライアントサイド処理・プライバシー保護</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => inputRef.current?.click()} className="btn-primary">画像を選択</button>
                        <a className="btn-ghost" href="https://github.com/triwai/ImageAbstract" target="_blank" rel="noreferrer">GitHub</a>
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
                                <p className="mb-2">画像をドラッグ&ドロップ、または「画像を選択」</p>
                                <p className="text-xs">PNG/JPG/WebP 最大 10MB（ローカル処理）</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                            <LanguagePicker
                                value={ocrLang}
                                onChange={setOcrLang}
                                disabled={loading}
                                label="OCR言語"
                            />

                            <button
                                onClick={extractText}
                                disabled={!file || loading}
                                className="w-full btn-primary disabled:opacity-50 py-3 text-base font-semibold"
                            >
                                {loading ? `抽出中... ${ocrProgress}%` : '文字を抽出'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white/80">翻訳機能</span>
                            <button
                                onClick={() => { setEnableTranslate(v => !v); if (!enableTranslate) setTranslated(''); }}
                                className={classNames(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    enableTranslate ? 'bg-holo-gradient' : 'bg-white/20'
                                )}
                            >
                                <span
                                    className={classNames(
                                        'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
                                        enableTranslate ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>

                        {enableTranslate && (
                            <div className="space-y-4">
                                <LanguagePicker
                                    value={toLang}
                                    onChange={setToLang}
                                    disabled={!text && !loading}
                                    label="翻訳先言語"
                                />

                                <button
                                    onClick={translateText}
                                    disabled={!text || tLoading}
                                    className="w-full btn-primary disabled:opacity-50 py-3 text-base font-semibold"
                                >
                                    {tLoading ? '翻訳中...' : '翻訳する'}
                                </button>
                            </div>
                        )}

                        {loading && ocrProgress > 0 && (
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-holo-gradient h-full rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <section className="space-y-4">
                            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-white">抽出結果</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => copy(text)} className="btn-ghost text-xs">コピー</button>
                                        <button onClick={() => download(text)} className="btn-ghost text-xs">保存</button>
                                    </div>
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="ここに抽出結果が表示されます"
                                    className="w-full h-40 bg-transparent outline-none resize-y text-white/90 placeholder-white/40"
                                />
                            </div>

                            {enableTranslate && (
                                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-white">
                                            翻訳結果 ({languages.find(l => l.code === toLang)?.label})
                                        </h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => copy(translated)} className="btn-ghost text-xs">コピー</button>
                                            <button onClick={() => download(translated, 'translated.txt')} className="btn-ghost text-xs">保存</button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={translated}
                                        onChange={(e) => setTranslated(e.target.value)}
                                        placeholder="ここに翻訳結果が表示されます"
                                        className="w-full h-40 bg-transparent outline-none resize-y text-white/90 placeholder-white/40"
                                    />
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <footer className="text-center text-white/50 text-xs mt-6">
                Made by Triwai
            </footer>
        </div>
    )
}