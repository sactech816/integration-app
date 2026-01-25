# Kindle LP バージョン管理

Kindle LPページのバージョン別管理システムです。

## ファイル構成

```
app/kindle/
  ├── lp/                                # 新規顧客向けLP
  │   ├── page.tsx                       # ルーティング（V1/V2切り替え）
  │   ├── KindleLPClient.tsx             # オリジナル（バックアップ）
  │   ├── KindleLPClientV1.tsx           # パターン1（期間集中プランのみ）
  │   └── KindleLPClientV2.tsx           # パターン2（期間集中プランのみ）
  └── lp-renewal/                        # 継続顧客向けLP
      ├── page.tsx                       # ルーティング
      └── KindleLPRenewalClient.tsx      # 月額プランのみ表示
```

## アクセスURL

- **新規顧客向け**: `https://makers.tokyo/kindle/lp`
  - V1またはV2を表示（page.tsxで切り替え）
  - 期間集中プランのみ表示
  
- **継続顧客向け**: `https://makers.tokyo/kindle/lp-renewal`
  - 月額プランのみ表示
  - 料金プランセクション以下を表示

## バージョン切り替え方法

### 新規顧客向けページ（/kindle/lp）

`app/kindle/lp/page.tsx` の import文を変更：

```typescript
// パターン1を表示（デフォルト）
import KindleLPClient from './KindleLPClientV1';

// パターン2を表示（A/Bテスト時）
// import KindleLPClient from './KindleLPClientV2';

// オリジナルを表示（バックアップ）
// import KindleLPClient from './KindleLPClient';
```

コメントを入れ替えるだけで簡単に切り替えできます。

## 各バージョンの特徴

### V1: 新規顧客向けパターン1

- 期間集中プランのみ表示
- タブ切り替えなし
- 現在のLPをベースにした構成

### V2: 新規顧客向けパターン2

- 期間集中プランのみ表示
- タブ切り替えなし
- V1とA/Bテスト可能
- 将来的に異なるメッセージングやデザインに変更可能

### 継続顧客向け（/kindle/lp-renewal）

- 月額プランのみ表示
- 料金プランセクション以下のみ表示
- シンプルなヒーローセクション
- FAQ・CTAあり
- SEO設定: `noindex` （既存顧客専用のため）

## デプロイ方法

1. ファイルを編集
2. Gitにコミット＆プッシュ
3. Vercelで自動デプロイ

```powershell
git add app/kindle/lp app/kindle/lp-renewal
git commit -m "Update Kindle LP versions"
git push
```

## A/Bテストの実施方法

1. V1でしばらく運用
2. V2に切り替えてデータ計測
3. 効果を比較して最適なバージョンを選択

切り替えは `page.tsx` の1行を変更するだけなので、数秒で完了します。

## トラブルシューティング

### 型エラーが出る場合

```powershell
npx tsc --noEmit
```

### ビルドエラーが出る場合

```powershell
npm run build
```

### ページが表示されない場合

1. `page.tsx` の import文が正しいか確認
2. デプロイが完了しているか確認
3. ブラウザのキャッシュをクリア

## 注意事項

- `KindleLPClient.tsx` はバックアップとして残しているので削除しないでください
- 継続顧客向けページ（/kindle/lp-renewal）は検索エンジンにインデックスされません（noindex設定済み）
- V1とV2は現時点では同じ内容ですが、将来的に異なるメッセージングやデザインに変更できます
