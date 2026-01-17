# メール送信トラブルシューティングガイド

予約メールが届かない場合の診断・解決方法

## 📧 メール送信の仕様

### 予約完了時
1. **予約申込者へ**: 予約完了確認メール
2. **予約作成者（メニュー所有者）へ**: 新規予約通知メール

### 日程調整回答時
1. **回答者へ**: 出欠表付き確認メール（メールアドレス入力時のみ）

## 🔍 診断手順

### ステップ1: 環境変数の確認

必要な環境変数が設定されているか確認：

```bash
# ローカル環境
cat .env.local | grep RESEND

# Vercel環境
# Settings > Environment Variables で確認
```

**必須の環境変数:**
- `RESEND_API_KEY` - Resend API Key（必須）
- `RESEND_FROM_EMAIL` - 送信元メールアドレス（推奨）

**推奨の環境変数:**
- `NEXT_PUBLIC_APP_URL` - アプリケーションURL

### ステップ2: ログの確認

#### ローカル開発環境

ターミナルで以下のログを確認：

```
[Booking] Sending notification email to: http://localhost:3000/api/booking/notify
[Booking Notify] Received request: { bookingId: 'xxx', type: 'confirm' }
[Booking Notify] Sending emails... { customerEmail: 'xxx', ownerEmail: 'xxx', emailCount: 2 }
[Booking Notify] Email 1 sent successfully: { id: 'xxx' }
[Booking Notify] Email 2 sent successfully: { id: 'xxx' }
[Booking Notify] Successfully sent 2/2 emails
[Booking] Email notification sent: { success: true, sent: 2, total: 2 }
```

#### Vercel環境

1. Vercelダッシュボードにアクセス
2. プロジェクト選択 > Functions > Logs
3. 最新のログを確認

### ステップ3: エラーの特定

#### エラー: "Email service not configured"

```
[Booking Notify] RESEND_API_KEY is not configured
```

**解決方法:**
1. `.env.local`（ローカル）またはVercelの環境変数に`RESEND_API_KEY`を設定
2. アプリケーションを再起動・再デプロイ

#### エラー: "Domain not verified"

```
[Booking Notify] Email 1 failed: Domain not verified
```

**解決方法:**

**テスト環境の場合:**
- `RESEND_FROM_EMAIL`を設定せず、デフォルトの`onboarding@resend.dev`を使用
- 受信者のメールアドレスをResendで認証

**本番環境の場合:**
1. Resendでドメインを追加
2. DNSレコードを設定
3. ドメイン認証を完了
4. `RESEND_FROM_EMAIL`に認証済みドメインのメールアドレスを設定

#### エラー: "Email address not verified"（テスト環境）

```
[Booking Notify] Email 1 failed: Email address not verified
```

**解決方法:**
1. [Resendダッシュボード](https://resend.com/emails)にログイン
2. テストしたいメールアドレスを追加して認証
3. 認証メールのリンクをクリック

#### メールが送信されているがログがない

**原因:** メール送信APIが呼び出されていない可能性

**解決方法:**
1. ブラウザのNetwork タブで`/api/booking/notify`へのリクエストを確認
2. `NEXT_PUBLIC_APP_URL`が正しく設定されているか確認
3. サーバーログで`[Booking] Sending notification email`を検索

## 🧪 テスト方法

### 1. 環境変数のテスト

```bash
# ローカル環境で確認
node -e "console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '設定済み' : '未設定')"
node -e "console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'デフォルト使用')"
```

### 2. メール送信APIの直接テスト

```bash
curl -X POST http://localhost:3000/api/booking/notify \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"test-booking-id","type":"confirm"}'
```

### 3. 予約フローの完全テスト

1. 予約メニューを作成
2. 予約枠を追加
3. 公開URLから予約を実施
4. ターミナル/Vercel Logsでログを確認
5. メールボックス（迷惑メールフォルダ含む）を確認

## 📝 よくある問題と解決策

### 問題: メールが迷惑メールに入る

**解決策:**
1. ドメイン認証を完了させる（SPF、DKIM、DMARC）
2. 送信元ドメインの評判を確認
3. メール内容を改善（スパム判定されやすい単語を避ける）

### 問題: メールが遅延する

**原因:** 
- Resendの送信キューが混雑
- 受信側サーバーの処理遅延

**解決策:**
- [Resend Status](https://status.resend.com/)で障害を確認
- 数分待ってから再確認

### 問題: ログインユーザーにメールが届かない

**原因:** Supabase Auth からメールアドレスを取得できていない

**確認方法:**
```
[Booking Notify] Sending emails... { customerEmail: null, ownerEmail: 'xxx', emailCount: 1 }
```

**解決策:**
1. ユーザーがメールアドレスで登録しているか確認
2. Supabase Authの設定を確認

### 問題: 予約作成者にメールが届かない

**原因:** メニュー所有者のメールアドレスが取得できていない

**確認方法:**
```
[Booking Notify] Sending emails... { customerEmail: 'xxx', ownerEmail: null, emailCount: 1 }
```

**解決策:**
1. 予約メニュー作成者がメールアドレスで登録しているか確認
2. Supabase RLSポリシーでauth.admin.getUserByIdが実行可能か確認

## 🔧 デバッグコマンド

### ログをリアルタイムで監視

```bash
# ローカル開発
npm run dev | grep -i "booking\|notify\|email"

# Vercel（vercel-cliインストール済み）
vercel logs --follow
```

### 特定のキーワードでログを検索

```bash
# エラーのみ抽出
vercel logs | grep -i "error\|failed"

# メール送信関連のみ抽出
vercel logs | grep -i "booking notify"
```

## 📞 サポート

問題が解決しない場合:

1. **Resendサポート**: https://resend.com/support
2. **Supabaseサポート**: https://supabase.com/support
3. **プロジェクトログの共有**: エラーログを確認して詳細を共有

## ✅ チェックリスト

予約メールが正しく動作するために確認：

- [ ] `RESEND_API_KEY`が設定されている
- [ ] `RESEND_FROM_EMAIL`が設定されている（または`onboarding@resend.dev`を使用）
- [ ] ドメイン認証が完了している（本番環境）
- [ ] テスト用メールアドレスが認証されている（テスト環境）
- [ ] ログで送信成功が確認できる
- [ ] 迷惑メールフォルダを確認した
- [ ] Resendダッシュボードで送信ログを確認した

---

最終更新: 2026年1月16日
