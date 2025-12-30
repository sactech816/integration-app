# エディタの背景グラデーション仕様書

## 概要

このドキュメントでは、プロフィールエディタとクイズエディタで使用される背景グラデーションの仕様をまとめています。

---

## 1. プロフィールエディタの背景グラデーション

### 1.1 デフォルトグラデーション

**ファイル:** `app/globals.css`, `lib/profileHtmlGenerator.ts`, `app/p/[slug]/layout.tsx`

```css
background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
background-size: 400% 400%;
animation: gradient 15s ease infinite;
```

**説明:**
- `-45deg`: グラデーションの角度（右下から左上へ）
- 4色構成: オレンジ → ピンク → ブルー → ティール
- `400% 400%`: グラデーションサイズを拡大してアニメーションの動きを滑らかに
- `15s`: 15秒かけて1サイクル
- `ease`: イージング関数でスムーズなアニメーション

**アニメーションキーフレーム:**

```css
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 1.2 プリセットグラデーション

**ファイル:** `components/ProfileEditor.tsx` (行1918-1922)

エディタ内で選択可能な5つのプリセット:

| ID | 名前 | グラデーション定義 | 説明 |
|---|---|---|---|
| `sunset` | Sunset | `linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)` | デフォルト・夕焼け風 |
| `ocean` | Ocean | `linear-gradient(-45deg, #1e3c72, #2a5298, #7e8ba3, #a8c0d0)` | 海・青系 |
| `berry` | Berry | `linear-gradient(-45deg, #f093fb, #f5576c, #c471ed, #f64f59)` | ベリー・ピンク系 |
| `forest` | Forest | `linear-gradient(-45deg, #134e5e, #71b280, #134e5e, #71b280)` | 森・緑系 |
| `purple` | Purple | `linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)` | 紫・パープル系 |

**実装場所:**

```tsx
<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
  {presets.map(preset => (
    <button
      key={preset.id}
      onClick={() => setTheme({ gradient: preset.gradient })}
      className="..."
      style={{ background: preset.gradient }}
    >
      {preset.name}
    </button>
  ))}
</div>
```

### 1.3 テンプレート固有のグラデーション

**ファイル:** `constants/templates.ts`

各テンプレートにはカスタムグラデーションが設定されています:

| テンプレートID | カテゴリ | グラデーション定義 | 色の特徴 |
|---|---|---|---|
| `business-consultant` | ビジネス | `linear-gradient(-45deg, #334155, #475569, #64748b, #475569)` | 落ち着いたグレー系 |
| `creator-portfolio` | クリエイター | `linear-gradient(-45deg, #f472b6, #ec4899, #fbbf24, #f59e0b)` | ピンク→イエロー |
| `marketer-fullpackage` | マーケティング | `linear-gradient(-45deg, #3b82f6, #1d4ed8, #06b6d4, #0891b2)` | ブルー系 |
| `book-promotion` | 書籍・出版 | `linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)` | ダークグレー系 |
| `quiz-content-lp` | 診断・リード獲得 | `linear-gradient(-45deg, #7c3aed, #8b5cf6, #a78bfa, #8b5cf6)` | パープル系 |
| `store-business` | 店舗・サービス | `linear-gradient(-45deg, #059669, #10b981, #34d399, #10b981)` | グリーン系 |

### 1.4 背景画像モード

**ファイル:** `app/p/[slug]/layout.tsx` (行54-62)

背景画像が設定されている場合はグラデーションアニメーションを無効化:

```tsx
const backgroundStyle = theme.backgroundImage
  ? {
      backgroundImage: `url(${theme.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      animation: 'none' as const
    }
  : {
      background: theme.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite' as const
    };
```

---

## 2. クイズエディタの背景グラデーション

### 2.1 エディタUIの背景

**ファイル:** `components/Editor.jsx`

クイズエディタでは**グラデーション背景は使用されず**、シンプルな単色背景を採用:

```jsx
<div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
  {/* エディタコンテンツ */}
</div>
```

**背景色:**
- `bg-gray-100` (Tailwind CSS): 薄いグレー (#f3f4f6)

### 2.2 装飾的なグラデーション要素

#### 2.2.1 ログインバナー

**ファイル:** `components/Editor.jsx` (行672)

```jsx
<div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 px-6 py-4">
  {/* 未ログインユーザー向けバナー */}
</div>
```

**説明:**
- `from-indigo-50 to-purple-50`: 薄いインディゴ→パープル
- 横方向のグラデーション (`-to-r`)

#### 2.2.2 サイドバーのクイックアクション

**ファイル:** `components/Editor.jsx` (行751)

```jsx
<div className="p-4 bg-gradient-to-b from-indigo-50 to-white border-b">
  {/* クイックアクションボタン */}
</div>
```

**説明:**
- `from-indigo-50 to-white`: 上から下への淡いグラデーション
- 縦方向のグラデーション (`-to-b`)

#### 2.2.3 AI生成セクション

**ファイル:** `components/Editor.jsx` (行887)

```jsx
<div className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-white hover:border-purple-300 transition-all">
  {/* AI自動生成UI */}
</div>
```

**説明:**
- `from-purple-50 to-white`: 左上から右下への淡いグラデーション
- 対角線方向のグラデーション (`-to-br`)

#### 2.2.4 デザインテーマプレビュー

**ファイル:** `components/Editor.jsx` (行993)

```jsx
{ id: 'pastel', name: 'パステルポップ', color: 'bg-gradient-to-r from-pink-300 to-purple-300', desc: '優しい' }
```

**説明:**
- `from-pink-300 to-purple-300`: ピンク→パープルのプレビュー用グラデーション
- ボタン内で視覚的なプレビューとして表示

---

## 3. その他のコンポーネントでの背景グラデーション使用例

### 3.1 ランディングページ (Portal)

**ファイル:** `components/Portal.jsx` (行86-87)

```jsx
<div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
  <div className="absolute inset-0 opacity-10" style={{
    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  }}></div>
</div>
```

**説明:**
- メインヒーローセクションでダークグラデーションを使用
- ドット模様のオーバーレイで質感を追加

### 3.2 アナウンスメントバナー

**ファイル:** `components/AnnouncementBanner.jsx` (行79-80)

```jsx
const bgClass = isPremium
  ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
  : 'bg-gradient-to-r from-indigo-600 to-blue-600';
```

**説明:**
- プレミアムアナウンスは紫系
- 通常アナウンスは青系

### 3.3 BlockRenderer (各種ブロック)

**ファイル:** `components/BlockRenderer.tsx`

#### ヒーローブロック (行687)

```tsx
backgroundStyle.background = 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)';
```

#### CTA/ボタンブロック (行791)

```tsx
backgroundStyle.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
```

---

## 4. グラデーションの設計パターン

### 4.1 方向性

| 方向 | Tailwind Class | CSS値 | 用途 |
|---|---|---|---|
| 対角線（右下→左上） | - | `-45deg` | メイン背景 |
| 対角線（左上→右下） | `to-br` | `135deg` | ボタン・装飾 |
| 横（左→右） | `to-r` | `to right` | バナー・ヘッダー |
| 縦（上→下） | `to-b` | `to bottom` | サイドバー・セクション |

### 4.2 色数

- **2色グラデーション**: シンプルなボタンやバナー
- **4色グラデーション**: メイン背景（アニメーション対応）

### 4.3 アニメーションの有無

- **アニメーションあり**: プロフィールページのメイン背景
- **アニメーションなし**: エディタUI、ボタン、装飾要素

---

## 5. 実装上の注意点

### 5.1 パフォーマンス

- グラデーションアニメーションは `background-position` のみを変更
- `transform` や `opacity` を使わないため、GPUアクセラレーションは限定的
- モバイルでも滑らかに動作するよう15秒の長めのアニメーション時間を設定

### 5.2 アクセシビリティ

- グラデーション上のテキストは白色または十分なコントラスト比を確保
- 背景画像モードでは `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))` のオーバーレイを追加

### 5.3 カスタマイズ

ユーザーは以下の方法で背景をカスタマイズ可能:

1. **プリセット選択**: 5つの定義済みグラデーションから選択
2. **テンプレート選択**: テンプレートに紐づいたグラデーションを適用
3. **背景画像アップロード**: グラデーションの代わりに画像を使用

---

## 6. 関連ファイル一覧

### プロフィールエディタ関連

- `app/globals.css` - デフォルトグラデーション定義とアニメーション
- `app/p/[slug]/layout.tsx` - プロフィールページのレイアウトとグラデーション適用
- `components/ProfileEditor.tsx` - エディタUI、プリセット選択
- `constants/templates.ts` - テンプレート別グラデーション定義
- `lib/profileHtmlGenerator.ts` - HTML出力時のグラデーション埋め込み

### クイズエディタ関連

- `components/Editor.jsx` - エディタUI（グラデーションは装飾のみ）
- `components/QuizPlayer.jsx` - クイズプレイヤー（グラデーションボタン）

### その他

- `components/Portal.jsx` - ランディングページ
- `components/AnnouncementBanner.jsx` - お知らせバナー
- `components/BlockRenderer.tsx` - 各種ブロックのグラデーション
- `lib/htmlGenerator.js` - HTML出力（クイズ）

---

## 7. まとめ

### プロフィールエディタ

- **メイン背景**: アニメーション付き4色グラデーション（デフォルト: Sunset）
- **カスタマイズ可能**: 5つのプリセット + 6つのテンプレート + 背景画像
- **アニメーション**: 15秒のスムーズな無限ループ

### クイズエディタ

- **メイン背景**: シンプルな単色（グレー）
- **装飾的グラデーション**: バナー、サイドバー、ボタンなどに部分的に使用
- **フォーカス**: コンテンツの視認性とユーザビリティ重視

### 共通の設計思想

- **-45deg**: 統一感のある対角線方向
- **4色構成**: 豊かな色彩変化
- **Tailwind CSS**: 可能な限りユーティリティクラスで実装
- **パフォーマンス**: 軽量でスムーズなアニメーション

