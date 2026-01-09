# UnivaPay 定期課金セットアップガイド

## 概要

UnivaPayを使用した月額サブスクリプション（定期サポート）機能のセットアップ手順です。

## 1. 環境変数の設定

`.env.local` に以下の環境変数を追加してください：

```bash
# UnivaPay設定
UNIVAPAY_APP_TOKEN=your-app-token
UNIVAPAY_SECRET=your-secret-key
UNIVAPAY_STORE_ID=your-store-id          # オプション
UNIVAPAY_WEBHOOK_SECRET=your-webhook-secret  # オプション
```

### 取得方法

1. [UnivaPay管理画面](https://merchant.univapay.com/) にログイン
2. 「設定」→「APIトークン」からトークンを発行
3. App TokenとSecretをメモ

## 2. Webhook設定

### UnivaPay管理画面での設定

| 項目 | 設定値 |
|------|-------|
| URL | `https://www.makers.tokyo/api/univapay/webhook` |
| 利用店舗を指定する | チェックなし |

### 有効にするトリガー

- ✅ 課金情報／ステータスの更新
- ✅ 定期課金成功
- ✅ 定期課金失敗
- ✅ 定期課金一時停止
- ✅ 定期課金完了
- ✅ 定期課金作成
- ✅ 定期課金永久停止
- ✅ キャンセル完了

## 3. データベース設定

Supabaseで以下のSQLを実行：

```sql
-- supabase_subscriptions.sql の内容を実行
```

または、Supabase管理画面のSQL Editorで `supabase_subscriptions.sql` の内容を貼り付けて実行。

## 4. 作成されるファイル

| ファイル | 役割 |
|---------|------|
| `lib/univapay.ts` | UnivaPay APIクライアント |
| `app/api/univapay/checkout/route.ts` | サブスクリプション作成API |
| `app/api/univapay/webhook/route.ts` | Webhook受信・処理 |
| `supabase_subscriptions.sql` | DB定義 |

## 5. 月額プラン

以下の4つのプランが設定されています：

| プランID | 金額 | 説明 |
|---------|------|------|
| `monthly_1000` | ¥1,000/月 | ライトサポート |
| `monthly_3000` | ¥3,000/月 | スタンダードサポート |
| `monthly_5000` | ¥5,000/月 | プレミアムサポート |
| `monthly_10000` | ¥10,000/月 | スペシャルサポート |

## 6. テスト

### テスト用クレジットカード

UnivaPayテスト環境では以下のカード番号が使用可能：

| 番号 | 結果 |
|------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | 失敗 |

- 有効期限：未来の日付
- CVC：任意の3桁

### ローカルでのWebhookテスト

ローカル環境でWebhookをテストする場合は、ngrokなどを使用してください：

```bash
ngrok http 3000
```

生成されたURLを一時的にUnivaPay管理画面に設定。

## 7. 本番移行

1. UnivaPayで本番用APIキーを取得
2. `.env.local` の値を本番用に変更
3. Webhook URLが本番URLになっていることを確認
4. デプロイ

## トラブルシューティング

### Webhookが届かない

1. URLが正しいか確認
2. サーバーが起動しているか確認
3. UnivaPay管理画面でWebhook履歴を確認

### 決済が失敗する

1. APIキーが正しいか確認
2. テスト/本番環境が一致しているか確認
3. サーバーログを確認

## 関連ドキュメント

- [UnivaPay API Documentation](https://developer.univapay.com/)
- [UnivaPay Subscription Guide](https://univapay.com/service/credit/subscriptions/)







