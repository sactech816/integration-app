# ウェビナーLPメーカー — 引継ぎドキュメント

## 概要
ウェビナー（オンラインセミナー）専用のランディングページ作成ツール。
YouTube動画を中心に、申し込み・視聴・セールスまでの導線を一画面で完結させる。

## 背景・経緯
- ファネル構築ツール整備中に「ウェビナーLP用のツールが欲しい」という需要が発生
- 既存のビジネスLPでも代用可能だが、動画中心＋日時/カウントダウンという専用UIがあるとユーザーにわかりやすい
- ファネルのステップタイプとして `webinar` を追加し、連携する想定

## 主要機能

### 1. ページ構成（セクション/ブロック）

| セクション | 必須 | 内容 |
|---|---|---|
| ヒーロー | ○ | タイトル、サブタイトル、開催日時表示 |
| カウントダウン | - | 開催日時までのカウントダウンタイマー |
| 動画エリア | ○ | YouTube埋め込み（限定公開対応）、Vimeoも可 |
| 講師紹介 | - | アイコン、名前、肩書き、実績 |
| アジェンダ | - | 学べること・内容の箇条書き |
| 参加者の声 | - | テスティモニアル |
| CTA | ○ | 申し込みボタン |

### 2. 時間制御CTA（重要機能）
- **時間経過後にボタン表示**: 動画再生開始からX分後にCTAボタンを表示
- 実装方法: `setTimeout` + React state で制御
- 設定項目: `ctaDelaySeconds` (秒数指定、0 = 即時表示)
- 表示アニメーション: フェードイン + スライドアップ
- ユースケース: VSL（ビデオセールスレター）、ウェビナーリプレイ

```tsx
// 実装イメージ
const [showCta, setShowCta] = useState(ctaDelaySeconds === 0);

useEffect(() => {
  if (ctaDelaySeconds > 0) {
    const timer = setTimeout(() => setShowCta(true), ctaDelaySeconds * 1000);
    return () => clearTimeout(timer);
  }
}, [ctaDelaySeconds]);
```

### 3. 動画ホスティング
- **YouTube推奨**（限定公開OK）
  - 埋め込みiframeで表示
  - ストレージ・帯域コストゼロ
  - ライブ配信もアーカイブも対応
  - 注意: YouTube側で「埋め込みを許可」がONであること（デフォルトON）
- Vimeoも対応可（プロプランなら限定公開＋ドメイン制限も可能）
- 埋め込みURL形式: `https://www.youtube.com/embed/{VIDEO_ID}`

### 4. 開催日時・カウントダウン
- 日時入力: `datetime-local` input
- カウントダウン表示: 日・時・分・秒のリアルタイム更新
- 開催後は「アーカイブ視聴可能」等のテキストに切替

## 技術設計

### DBテーブル: `webinar_lps`
```sql
CREATE TABLE webinar_lps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  -- 動画
  video_url TEXT,                    -- YouTube/Vimeo埋め込みURL
  video_thumbnail TEXT,              -- サムネイル画像URL（オプション）
  -- 日時
  event_date TIMESTAMPTZ,            -- 開催日時
  show_countdown BOOLEAN DEFAULT true,
  -- CTA
  cta_label TEXT DEFAULT '今すぐ申し込む',
  cta_url TEXT,                      -- 申し込みリンク先（order-formやcustom URL）
  cta_delay_seconds INTEGER DEFAULT 0,  -- CTA遅延表示（0=即時）
  -- 講師
  speaker_name TEXT,
  speaker_title TEXT,
  speaker_image TEXT,
  speaker_bio TEXT,
  -- コンテンツ
  agenda JSONB DEFAULT '[]',         -- [{title, description}]
  testimonials JSONB DEFAULT '[]',   -- [{name, text, image?}]
  -- 状態
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  theme TEXT DEFAULT 'dark',         -- 'dark' | 'light'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE webinar_lps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own webinar LPs"
  ON webinar_lps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published webinar LPs are public"
  ON webinar_lps FOR SELECT USING (status = 'published');
```

### ファイル構成（予定）
```
app/
  webinar/
    page.tsx                    -- ランディング紹介ページ
    dashboard/
      page.tsx                  -- 一覧・管理
    new/
      page.tsx                  -- 新規作成
    editor/
      [id]/
        page.tsx                -- 編集
    [slug]/
      page.tsx                  -- 公開ページ（視聴者向け）

components/
  webinar/
    WebinarEditor.tsx           -- エディタ本体
    WebinarPreview.tsx          -- プレビュー
    CountdownTimer.tsx          -- カウントダウンコンポーネント
    DelayedCta.tsx              -- 時間制御CTAコンポーネント

app/api/
  webinar/
    route.ts                    -- GET(一覧), POST(作成)
    [id]/
      route.ts                  -- GET, PATCH, DELETE
```

### ファネル連携
FunnelEditor の STEP_TYPES に追加:
```typescript
{ value: 'webinar', label: 'ウェビナーLP', refType: 'slug', placeholder: '例: my-webinar', hint: '...' }
```

公開ファネルの getContentUrl に追加:
```typescript
case 'webinar': return `/webinar/${ref.slug}`;
```

### ダッシュボード統合
CLAUDE.md のダッシュボードツール追加ルールに従い、以下を更新:
1. `menuItems.ts` — `webinar` を `marketing` カテゴリに追加
2. `SidebarNav.tsx` — contentCounts に追加
3. `Sidebar/index.tsx` — contentCounts に追加
4. `useDashboardData.ts` — webinar_lps テーブルのカウントクエリ追加
5. `MainContent/index.tsx` — ActiveView に追加、WebinarList レンダリング
6. `page.tsx` — URLパラメータ + ハンドラー追加

### ServiceType追加
`lib/types.ts` の ServiceType に `webinar` を追加

## デザイン方針
- テーマ: ダーク系をデフォルト（動画が映える）、ライト系も選択可
- ブランドカラー: 紫〜青系（ウェビナーの高級感）
- カウントダウン: 数字が大きく目立つデザイン
- CTAボタン: 遅延表示時はアニメーション付きで注目を集める
- レスポンシブ: モバイルファーストで動画は16:9維持

## 優先度・フェーズ
1. **Phase 1（MVP）**: DB + API + エディタ（タイトル/動画/CTA/日時） + 公開ページ
2. **Phase 2**: カウントダウン、講師紹介、アジェンダ
3. **Phase 3**: 時間制御CTA、テスティモニアル、テーマ切替
4. **Phase 4**: ファネル連携、ダッシュボード統合、アナリティクス

## 参考パターン（ファネルでの使い方）
```
ビジネスLP（オプトイン） → メルマガ登録 → ウェビナーLP（動画視聴+時間制御CTA） → 申し込みフォーム → サンキュー
```

## 関連ファイル（現在のファネル実装）
- `components/funnel/FunnelEditor.tsx` — ステップタイプ定義
- `app/funnel/[slug]/[stepIndex]/page.tsx` — 公開ページのURL生成
- `app/dashboard/components/Sidebar/menuItems.ts` — ダッシュボード登録
- `app/dashboard/hooks/useDashboardData.ts` — コンテンツカウント

## 備考
- YouTube限定公開の埋め込みは問題なく動作する（確認済み）
- Vimeo対応は将来的にオプションとして追加可能
- 時間制御CTAはウェビナー以外にも汎用的に使える可能性あり（セールスレター等）
