-- コンシェルジュメッセージ: ゲストアクセス対応 + 分析強化

-- user_id を nullable に変更（ゲストユーザー対応）
alter table concierge_messages alter column user_id drop not null;

-- visitor_id 追加（ゲスト識別用、localStorage由来）
alter table concierge_messages add column if not exists visitor_id text;

-- user_type 追加（ユーザー区分: guest, free, standard, business, premium）
alter table concierge_messages add column if not exists user_type text default 'guest';

-- トークン数追加（コスト計算用）
alter table concierge_messages add column if not exists input_tokens integer;
alter table concierge_messages add column if not exists output_tokens integer;

-- 満足度フィードバック追加（1=thumbs up, -1=thumbs down, null=未評価）
alter table concierge_messages add column if not exists feedback smallint;

-- ユーザーコンテキスト（タイムゾーン、言語、ページ等）
alter table concierge_messages add column if not exists context jsonb default '{}';

-- RLSポリシー更新: ゲストはvisitor_idで自分のメッセージを閲覧可能
-- まず既存ポリシーを確認して必要に応じて追加
-- 注意: 既存のuser_id必須ポリシーがある場合は調整が必要

-- ゲスト用SELECTポリシー（visitor_idベース、Service Roleで挿入）
-- Service Role Key経由でINSERTするためINSERTポリシーは不要

-- インデックス追加
create index if not exists idx_concierge_messages_visitor on concierge_messages(visitor_id) where visitor_id is not null;
create index if not exists idx_concierge_messages_user_type on concierge_messages(user_type);
create index if not exists idx_concierge_messages_feedback on concierge_messages(feedback) where feedback is not null;
