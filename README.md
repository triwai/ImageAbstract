# ImageAbstract — Apple-like Holographic OCR (by Triwi)

A beautiful, Apple‑like holographic UI (Vercel-quality) to extract text from images using Deepseek AI. Optional translation is included. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

Source: https://github.com/triwai/ImageAbstract

## 機能
- 画像からテキストを抽出（Deepseek AI / Vision）
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
Deepseek API キーは `DEEPSEEK` に設定してください（必須）。

オプションで以下も指定可能です。
- `DEEPSEEK_BASE_URL`（デフォルト: `https://api.deepseek.com`）
- `DEEPSEEK_VISION_MODEL`（デフォルト: `deepseek-vl2`）
- `DEEPSEEK_TEXT_MODEL`（デフォルト: `deepseek-chat`）

`.env.example` を参考に `.env` を作成してください。

```
DEEPSEEK=YOUR_DEEPSEEK_API_KEY
# DEEPSEEK_BASE_URL=https://api.deepseek.com
# DEEPSEEK_VISION_MODEL=deepseek-vl2
# DEEPSEEK_TEXT_MODEL=deepseek-chat
```

## ローカル開発
1. リポジトリをクローン
2. 依存関係のインストール
   - npm i
3. `.env.example` の.exampleを削除して `.env` へ変更
4. 開発サーバ起動
   - npm run dev
5. http://localhost:3000 にアクセス

注意: このプロジェクトは Next.js App Router + Tailwind を使用しています。画像は 5MB 以内を推奨です。

## API エンドポイント
- `POST /api/extract` — 画像から文字を抽出
  - FormData フィールド名 `file`（`image/*`）
  - レスポンス: `{ text: string }`
- `POST /api/translate` — テキストを翻訳
  - JSON: `{ text: string, toLang: string }`
  - レスポンス: `{ text: string }`

サーバ側では Deepseek の OpenAI 互換エンドポイント `/v1/chat/completions` を利用しています。（Vision: `deepseek-vl2`, Text: `deepseek-chat`）

## Vercel デプロイ手順
1. GitHub に公開リポジトリとしてこのプロジェクトをプッシュします。
2. https://vercel.com/import または "New Project" からリポジトリを選択します。
3. Environment Variables に `DEEPSEEK` を追加して保存します。（必要に応じて他の環境変数も）
4. Build & Deploy。完了後、表示された URL にアクセスします。

ヒント:
- 画像処理は Route Handler を `runtime = 'nodejs'` として実行しています（Buffer 利用のため）。
- Vercel の無料プランではリクエスト時間やサイズ制限があります。大きな画像は避け、5MB 程度までを推奨します。

## ライセンス
Copyright © Triwi

## クレジット
- Deepseek AI
- Vercel（UI のインスピレーション）

---
Made with ❤️ by Triwi