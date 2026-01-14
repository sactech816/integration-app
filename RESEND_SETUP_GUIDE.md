# Resend メール送信設定ガイド

予約管理・日程調整システムで予約メールを送信するために、Resendの設定が必要です。

## 📋 必要な環境変数

以下の環境変数を設定してください：

```env
# Resend API Key（必須）
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# 送信元メールアドレス（必須）
RESEND_FROM_EMAIL=noreply@yourdomain.com

# アプリケーションURL（推奨）
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚀 セットアップ手順

### 1. Resendアカウントの作成

1. [Resend](https://resend.com/)にアクセス
2. 「Sign Up」をクリックしてアカウントを作成
3. メールアドレスを確認

### 2. API Keyの取得

1. Resendダッシュボードにログイン
2. 「API Keys」セクションに移動
3. 「Create API Key」をクリック
4. 名前を入力（例: `Production`）して作成
5. 生成されたAPI Keyをコピー

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### 3. ドメインの追加と認証（本番環境用）

#### テスト環境の場合

- デフォルトの`onboarding@resend.dev`から送信可能
- ただし、送信先は登録済みのメールアドレスのみ

#### 本番環境の場合（独自ドメインから送信）

1. Resendダッシュボードで「Domains」に移動
2. 「Add Domain」をクリック
3. あなたのドメイン（例: `yourdomain.com`）を入力
4. 表示されるDNSレコードを、ドメインのDNS設定に追加

**必要なDNSレコード：**

| タイプ | ホスト名 | 値 |
|--------|---------|-----|
| MX | @ | feedback-smtp.us-east-1.amazonses.com |
| TXT | @ | v=spf1 include:amazonses.com ~all |
| CNAME | resend._domainkey | resend._domainkey.yourdomain.com |

5. DNSレコードが反映されるまで待つ（数分〜数時間）
6. Resendで「Verify Domain」をクリック

### 4. 送信元メールアドレスの設定

ドメイン認証が完了したら、環境変数に設定：

```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

よく使われる送信元メールアドレス：
- `noreply@yourdomain.com` - 返信不要な通知
- `booking@yourdomain.com` - 予約関連
- `notification@yourdomain.com` - 通知全般

### 5. 環境変数の設定

#### ローカル開発環境

`.env.local`ファイルに追加：

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Vercel（本番環境）

1. Vercelプロジェクトの「Settings」→「Environment Variables」に移動
2. 各環境変数を追加：
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL`
3. 「Save」をクリック
4. アプリケーションを再デプロイ

## 📧 メール送信の動作確認

### 1. 予約メールのテスト

1. 予約メニューを作成
2. 予約枠を設定
3. 公開URLから予約を実施
4. メールが届くか確認

### 2. 日程調整メールのテスト

1. 日程調整メニューを作成
2. 候補日時を設定
3. 公開URLから出欠を登録（メールアドレスを入力）
4. メールが届くか確認

### 3. ログの確認

サーバーログでメール送信状況を確認：

```bash
# ローカル開発
# コンソールに送信結果が表示されます

# Vercel
# Function Logs で確認
```

## 🔍 トラブルシューティング

### メールが届かない場合

#### 1. 環境変数の確認

```bash
# ローカル環境で確認
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL
```

#### 2. API Keyの権限確認

- Resendダッシュボードで「API Keys」を確認
- API Keyが有効か確認
- 必要に応じて新しいAPI Keyを生成

#### 3. ドメイン認証の確認

- Resendダッシュボードで「Domains」を確認
- ステータスが「Verified」になっているか確認
- DNSレコードが正しく設定されているか確認

#### 4. 送信ログの確認

- Resendダッシュボードで「Logs」を確認
- エラーメッセージがないか確認

#### 5. スパムフォルダの確認

- 受信者のスパムフォルダを確認
- 迷惑メール設定を確認

### よくあるエラー

#### エラー: "Invalid API key"

```
解決方法: API Keyが正しく設定されているか確認
```

#### エラー: "Domain not verified"

```
解決方法: ドメイン認証を完了させるか、テスト環境では onboarding@resend.dev を使用
```

#### エラー: "Email address not verified"

```
解決方法（テスト環境）: Resendで送信先メールアドレスを認証
解決方法（本番環境）: ドメイン認証を完了させる
```

## 📊 送信制限

### 無料プラン

- 月間 3,000通まで
- 1日あたり 100通まで

### 有料プラン

- 月間 50,000通〜
- より高い送信レート

詳細は[Resend Pricing](https://resend.com/pricing)を確認してください。

## 🔒 セキュリティのベストプラクティス

1. **API Keyを公開しない**
   - `.env.local`をGitにコミットしない
   - `.gitignore`に`.env.local`を追加

2. **本番環境とテスト環境でAPI Keyを分ける**
   - 本番用とテスト用で別のAPI Keyを使用

3. **定期的にAPI Keyをローテーション**
   - セキュリティのため、定期的にAPI Keyを更新

## 📚 参考リンク

- [Resend公式ドキュメント](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [DNSレコードの設定方法](https://resend.com/docs/dashboard/domains/introduction)

## ✅ チェックリスト

- [ ] Resendアカウントを作成
- [ ] API Keyを取得
- [ ] ドメインを追加・認証（本番環境）
- [ ] 環境変数を設定
- [ ] テスト送信で動作確認
- [ ] スパムフィルターの確認
- [ ] 送信ログの監視設定

---

問題が解決しない場合は、[Resendサポート](https://resend.com/support)に問い合わせてください。


