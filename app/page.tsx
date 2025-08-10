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

function LanguagePicker({
                            value,
                            onChange,
                            disabled
                        }: {
    value: string
    onChange: (code: string) => void
    disabled?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number>(() => Math.max(0, languages.findIndex(l => l.code === value)))
    const btnRef = useRef<HTMLButtonElement>(null)
    const popRef = useRef<HTMLDivElement>(null)

    const selected = useMemo(() => languages.find(l => l.code === value) ?? languages[0], [value])

    // 外側クリックで閉じる
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

    // Escape で閉じる
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open])

    const onKeyDownBtn = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
            setActiveIndex(Math.max(0, languages.findIndex(l => l.code === value)))
            // 次のフレームでポップアップにフォーカス
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
        <div className="relative">
            <button
                ref={btnRef}
                type="button"
                onClick={() => !disabled && setOpen(o => !o)}
                onKeyDown={onKeyDownBtn}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={classNames(
                    'group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    'border border-white/15 bg-white/5 hover:bg-white/10',
                    'shadow-glass hover:shadow-lg transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-holo-400/60',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                <span className="text-lg">{selected.flag}</span>
                <span className="font-medium">{selected.label}</span>
                <span
                    className={classNames(
                        'ml-1 h-5 w-5 rounded-full border border-white/20',
                        'bg-[conic-gradient(from_180deg,#FFDEE9,#B5FFFC,#C2FFD8,#FBD3E9,#E2B0FF,#FFDEE9)]',
                        'opacity-70 group-hover:opacity-100 transition'
                    )}
                    aria-hidden
                />
            </button>

            {/* Dropdown */}
            <div
                ref={popRef}
                tabIndex={-1}
                onKeyDown={onKeyDownList}
                className={classNames(
                    'absolute z-40 mt-2 w-56 origin-top-right',
                    open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none',
                    'transition transform'
                )}
                role="listbox"
                aria-activedescendant={languages[activeIndex]?.code}
            >
                <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md shadow-glass overflow-hidden">
                    <div className="p-2 max-h-64 overflow-auto custom-scroll">
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
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                                        'transition',
                                        active ? 'bg-white/20' : 'hover:bg-white/10',
                                        selectedItem ? 'ring-1 ring-holo-400/50' : ''
                                    )}
                                >
                                    <span className="text-xl">{l.flag}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{l.label}</div>
                                        <div className="text-xs text-white/60">{l.code}</div>
                                    </div>
                                    {selectedItem && (
                                        <span className="ml-auto text-holo-200">●</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    <div className="border-t border-white/10 p-2 text-[10px] text-white/60">
                        ↑/↓ で移動・Enter で決定・Esc で閉じる
                    </div>
                </div>
            </div>
        </div>
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
                        <p className="text-white/70 text-sm md:text-base">Webで画像の文字を抽出（Deepseek対応）</p>
                        <p className="text-white/50 text-xs">https://github.com/triwai/ImageAbstract</p>
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
                        'mt-r6 grid md:grid-cols-2 gap-6',
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
                        <div className="flex items-center gap-3 flex-wrap">
                            <button onClick={extractText} disabled={!file || loading} className="btn-primary disabled:opacity-50">
                                {loading ? '抽出中…' : '文字を抽出'}
                            </button>
                            <button
                                onClick={() => { setEnableTranslate(v => !v); if (!enableTranslate) setTranslated(''); }}
                                className={enableTranslate ? 'btn-primary' : 'btn-ghost'}
                                aria-pressed={enableTranslate}
                            >
                                翻訳 {enableTranslate ? 'ON' : 'OFF'}
                            </button>

                            {enableTranslate && (
                                <LanguagePicker
                                    value={toLang}
                                    onChange={setToLang}
                                    disabled={!text && !loading}
                                />
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
                                        <h3 className="font-medium">
                                            翻訳結果 ({languages.find(l => l.code === toLang)?.label})
                                        </h3>
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
                Made by Triwai
            </footer>
        </div>
    )
}