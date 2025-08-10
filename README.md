# ImageAbstract — Apple-like Holographic OCR (by Triwai)

A beautiful, Apple‑like holographic UI (Vercel-quality) to extract text from images using OCR & Deepseek AI translation.
Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## 機能

- 画像からテキストを抽出（OCR）
- オプションの翻訳（Deepseek Text）
- ドラッグ＆ドロップ / 画像プレビュー
- 結果のコピー／ダウンロード
- Vercel のような美しいホログラフィック UI（ガラスモーフィズム）

## スクリーンショット

UI は App Router のトップページ `/` に実装されています。Apple ライクなホログラフィック背景、ガラスカード、グラデーションオーブなど。

## 技術

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## 環境変数

Deepseek API キーは `DEEPSEEK` に設定してください（翻訳機能を有効化するために必要です。）。

オプションで以下も指定可能です。

- `DEEPSEEK_BASE_URL`（デフォルト: `https://api.deepseek.com`）
- `DEEPSEEK_VISION_MODEL`（デフォルト: `deepseek-vl2`）
- `DEEPSEEK_TEXT_MODEL`（デフォルト: `deepseek-chat`）

`.env.example` を参考に `.env` を作成してください。
