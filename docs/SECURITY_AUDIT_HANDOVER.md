# セキュリティ強化 引き継ぎドキュメント

> **作成日**: 2026-03-03
> **目的**: プロジェクト全体のServer Actions / API Routesの認証不備を修正する

---

## 背景

本プロジェクトのServer Actions（`app/actions/*.ts`）とAPI Routes（`app/api/**/route.ts`）の多くが、Service Role Key（RLSバイパス）を使用しながら認証チェックを行っていない。これにより、未認証ユーザーが個人情報の取得、データの改ざん・削除、管理者操作を実行できる状態にある。

---

## 共通の問題パターン

### パターン1: 認証チェックなし（管理者専用関数）
管理者ダッシュボードでのみ呼ばれる想定だが、Server ActionやAPIエンドポイントは外部から直接呼び出し可能。

### パターン2: `isAdmin` 引数を信頼
クライアントから `isAdmin: true` を渡せば、サーバー側で管理者として扱われる。
```typescript
// 危険なパターン
export async function deleteContent(type, id, userId, isAdmin) {
  if (isAdmin) { /* 所有者チェックをスキップ */ }
}
```

### パターン3: `userId` 引数を信頼（IDOR）
クライアントから渡された `userId` をそのまま使い、実際のログインユーザーとの照合がない。他人のuserIdを指定すれば他人のデータにアクセス可能。

### パターン4: API Routeで `adminUserId` をパラメータから取得
認証トークンではなくリクエストパラメータから管理者IDを受け取るため、管理者IDを知っていれば誰でも管理者操作が可能。

---

## 推奨する修正方針

### 1. サーバーサイド認証ヘルパーの作成

```typescript
// lib/auth-server.ts（新規作成）
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminEmails } from '@/lib/constants';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    email => user.email?.toLowerCase() === email.toLowerCase()
  );

  return { id: user.id, email: user.email, isAdmin };
}
```

### 2. Server Actionsへの認証追加
`isAdmin`や`userId`を引数から受け取るのをやめ、サーバーサイドでセッションから取得する。

### 3. API Routesへの認証追加
既に保護されているエンドポイント（例: `api/admin/affiliates`）と同じBearer token + admin emailチェックパターンを未保護のエンドポイントに適用する。

---

## 修正対象一覧

### 優先度: CRITICAL（最優先で修正）

#### API Routes — 認証なしでデータ削除・設定変更が可能

| ファイル | メソッド | 問題 |
|---|---|---|
| `api/admin/cleanup/route.ts` | POST | 認証なしでデータ削除（execute_cleanup RPC）が可能 |
| `api/admin/ai-settings/route.ts` | POST | 認証なしでAIモデル設定を書き換え可能 |
| `api/admin/ai-settings/route.ts` | GET | 認証なしでAI設定情報を取得可能 |
| `api/admin/monitor-users/route.ts` | ALL | adminUserIdをパラメータで受け取り認証トークン検証なし |
| `api/admin/ai-usage-stats/route.ts` | GET | 認証なしで全ユーザーのAI使用量統計を取得可能 |
| `api/admin/dashboard-summary/route.ts` | GET | 認証なしで管理者ダッシュボード統計を取得可能 |
| `api/admin/settings-health/route.ts` | GET | 認証なしで内部設定情報を取得可能 |

#### Server Actions — 認証なしで個人情報が漏洩

| ファイル | 関数 | 問題 |
|---|---|---|
| `actions/purchases.ts` | `getAllUsersWithRoles` | 全ユーザーのメール、パートナー情報を認証なしで返却 |
| `actions/purchases.ts` | `getAllUsersWithRolesPaginated` | 全ユーザーのメール、プラン、ポイント、AI使用量を認証なしで返却 |
| `actions/affiliate.ts` | `getAllAffiliates` | 全アフィリエイターのメール、報酬額を認証なしで返却 |
| `actions/leads.ts` | `getLeads` | contentIdだけで全リード（メール、名前、電話）を取得可能 |
| `actions/leads.ts` | `exportLeadsAsCsv` | 同上（CSV形式） |

#### Server Actions — 認証なしで管理者操作・金銭関連の操作が可能

| ファイル | 関数 | 問題 |
|---|---|---|
| `actions/affiliate.ts` | `updateCommissionRate` | 誰でもアフィリエイト報酬率を変更可能 |
| `actions/affiliate.ts` | `confirmConversion` | 誰でもアフィリエイト成果を不正確定可能 |
| `actions/affiliate.ts` | `markConversionPaid` | 誰でも支払い済みマーク可能 |
| `actions/affiliate.ts` | `updateAffiliateServiceSetting` | 誰でもサービス設定を改ざん可能 |
| `actions/purchases.ts` | `setPartnerStatus` | 誰でもパートナーステータスを変更可能 |
| `actions/gamification.ts` | `updateAdminGamificationSetting` | 誰でも管理者設定を改ざん可能 |
| `actions/gamification.ts` | `updatePoints` | ポイントを不正加算可能 |

---

### 優先度: HIGH（早期に修正）

#### Server Actions — `isAdmin` 引数偽装で任意データの削除が可能

| ファイル | 関数 | 問題 |
|---|---|---|
| `actions/content.ts` | `deleteContent` | `isAdmin: true` で任意コンテンツ削除可能 |
| `actions/survey.ts` | `deleteSurvey` | `isAdmin: true` で任意アンケート削除可能 |
| `actions/attendance.ts` | `updateAttendanceEvent` | `isAdmin: true` で任意イベント更新可能 |
| `actions/attendance.ts` | `deleteAttendanceEvent` | `isAdmin: true` で任意イベント削除可能 |
| `actions/booking.ts` | `deleteBookingMenu` | `isAdmin: true` で任意メニュー削除可能 |

#### Server Actions — 認証なしで他人のデータを操作

| ファイル | 関数 | 問題 |
|---|---|---|
| `actions/gamification.ts` | `updateCampaign` | campaignIdだけで更新可能 |
| `actions/gamification.ts` | `deleteCampaign` | campaignIdだけで削除可能 |
| `actions/gamification.ts` | `addGachaPrize` / `updateGachaPrize` / `deleteGachaPrize` | 景品を認証なしで操作可能 |
| `actions/featured.ts` | `addFeaturedContent` / `removeFeaturedContent` | ピックアップ操作が認証なし |
| `actions/attendance.ts` | `deleteAttendanceResponse` | responseIdだけで任意回答を削除可能 |

#### API Routes — 認証なしでデータ改変

| ファイル | メソッド | 問題 |
|---|---|---|
| `api/kdl/structure/add/route.ts` | POST | 認証なしで章・節を追加可能 |
| `api/kdl/structure/delete/route.ts` | DELETE | 認証なしで章・節を削除可能 |
| `api/kdl/structure/move/route.ts` | POST | 認証なしで章・節を並び替え可能 |
| `api/kdl/structure/update/route.ts` | PUT | 認証なしで章・節のタイトルを変更可能 |
| `api/kdl/update-book/route.ts` | PUT | 認証なしで書籍タイトルを変更可能 |
| `api/kdl/section-drafts/route.ts` | ALL | 認証なしでドラフト操作可能 |

---

### 優先度: MEDIUM（計画的に修正）

#### Server Actions — `userId` 引数を信頼（IDOR）

| ファイル | 関数 | 問題 |
|---|---|---|
| `actions/leads.ts` | `getAllLeadsByUser` | 他人のuserIdでリード情報取得可能 |
| `actions/gamification.ts` | 多数（`createCampaign`, `claimWelcomeBonus`, `updateMissionProgress`, `claimMissionReward` 等） | 他人名義でポイント操作可能 |
| `actions/affiliate.ts` | `registerAffiliate`, `getAffiliateInfo`, `getAffiliateStats`, `getAffiliateConversions` | 他人のアフィリエイト情報にアクセス可能 |
| `actions/purchases.ts` | `getUserPurchases`, `getPurchaseStats` | 他人の購入履歴を閲覧可能 |
| `actions/booking.ts` | `duplicateBookingMenu` | 他人のメニューを複製可能 |

#### API Routes — userId パラメータのみで制御

| ファイル | メソッド | 問題 |
|---|---|---|
| `api/ai-credit-check/route.ts` | GET | userId指定で他人のAI利用枠を確認可能 |
| `api/subscription/status/route.ts` | GET | userId指定で他人のサブスク状態を確認可能 |
| `api/makers/subscription-status/route.ts` | GET | userId指定で他人のサブスク状態を確認可能 |
| `api/kdl/usage/route.ts` | GET | userId指定で他人のKDL使用量を確認可能 |
| `api/booking/export/route.ts` | GET | userId指定で他人の予約データをCSV出力可能 |
| `api/export-leads/route.ts` | GET | contentId指定で他人のリードデータを取得可能 |
| `api/funnel/route.ts` | GET | userId指定で他人のファネル一覧を取得可能 |
| `api/order-form/route.ts` | GET | userId指定で他人のフォーム一覧を取得可能 |

---

### 優先度: LOW（余裕があれば修正）

| ファイル | 関数/エンドポイント | 問題 |
|---|---|---|
| `actions/analytics.ts` | `getAnalytics` / `getMultipleAnalytics` | 他人のコンテンツのPV数等を取得可能 |
| `actions/analytics.ts` | `incrementQuizCounter` | カウンターを水増し可能 |
| `actions/booking.ts` | `cancelBooking` | userIdなしでのキャンセルが可能なケース |
| `api/send-result/route.ts` | POST | メール送信にレート制限なし |
| `api/admin/kdl-settings/route.ts` | GET | 料金設定が認証なしで閲覧可能（書き込みは保護済み） |
| `api/settings/plans/route.ts` | GET | プラン設定が認証なしで閲覧可能（書き込みは保護済み） |
| `actions/featured.ts` | `getFeaturedContents` | 公開データだが管理用関数 |

---

## 適切に保護済みのエンドポイント（参考パターン）

以下は正しく認証されている例。修正時のリファレンスとして参照のこと。

### API Routes — Bearer token + admin email チェック
- `api/admin/affiliates/route.ts`
- `api/admin/agency/route.ts`
- `api/admin/award-points/route.ts`
- `api/admin/delete-user/route.ts`
- `api/admin/feedbacks/route.ts`

### API Routes — Cookie認証（Supabase SSR）
- `api/entertainment/generate/route.ts`
- `api/kdl/generate-*/route.ts`
- `api/salesletter/ai-generate/route.ts`
- `api/thumbnail/generate/route.ts`

### API Routes — Webhook署名検証
- `api/stripe/webhook/route.ts`
- `api/order-form/webhook/stripe/route.ts`

---

## 作業手順（推奨）

1. **`lib/auth-server.ts` に認証ヘルパーを作成**
2. **CRITICAL の項目から順に修正**
   - 各関数/エンドポイントに認証チェックを追加
   - `isAdmin` 引数を廃止 → サーバーサイドで判定
3. **HIGH の `isAdmin` 偽装問題を修正**
   - 全ての `isAdmin` パラメータをサーバーサイド判定に置き換え
4. **MEDIUM の IDOR 問題を修正**
   - `userId` をセッションから取得するように変更
5. **各修正後にビルド確認**: `npm run build`
6. **呼び出し元コンポーネントの引数も合わせて修正**
   - `isAdmin` を渡していた箇所の削除
   - `userId` を渡していた箇所をセッション取得に変更
