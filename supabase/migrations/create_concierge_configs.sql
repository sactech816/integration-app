-- コンシェルジュメーカー設定テーブル
-- ユーザーが作成するカスタムコンシェルジュの設定を保存

create table if not exists concierge_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- 基本設定
  name text not null default 'アシスタント',
  greeting text default 'こんにちは！何かお手伝いできることはありますか？',
  personality text default '',

  -- ナレッジ
  knowledge_text text default '',
  faq_items jsonb default '[]',

  -- デザイン
  avatar_style jsonb default '{"type": "default", "primaryColor": "#3B82F6"}',
  design jsonb default '{"position": "bottom-right", "bubbleSize": 56, "headerColor": "#3B82F6", "fontFamily": "system"}',

  -- 設定
  settings jsonb default '{"dailyLimit": 50, "maxTokens": 512, "model": "claude-haiku-4-5-20251001", "allowedTopics": "", "blockedTopics": ""}',

  -- 公開状態
  is_published boolean default false,
  slug text unique,

  -- メタ
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLSポリシー
alter table concierge_configs enable row level security;

create policy "Users can view own configs"
  on concierge_configs for select
  using (auth.uid() = user_id);

create policy "Users can insert own configs"
  on concierge_configs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own configs"
  on concierge_configs for update
  using (auth.uid() = user_id);

create policy "Users can delete own configs"
  on concierge_configs for delete
  using (auth.uid() = user_id);

-- 公開されたコンシェルジュはslugで誰でも閲覧可能
create policy "Published configs are viewable by slug"
  on concierge_configs for select
  using (is_published = true and slug is not null);

-- インデックス
create index if not exists idx_concierge_configs_user on concierge_configs(user_id);
create index if not exists idx_concierge_configs_slug on concierge_configs(slug) where slug is not null;

-- コンシェルジュメッセージテーブル（エンドユーザー用）
create table if not exists concierge_visitor_messages (
  id uuid primary key default gen_random_uuid(),
  config_id uuid not null references concierge_configs(id) on delete cascade,
  visitor_id text not null,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table concierge_visitor_messages enable row level security;

-- コンフィグオーナーのみ閲覧可能
create policy "Config owners can view visitor messages"
  on concierge_visitor_messages for select
  using (
    exists (
      select 1 from concierge_configs
      where concierge_configs.id = concierge_visitor_messages.config_id
      and concierge_configs.user_id = auth.uid()
    )
  );

create index if not exists idx_concierge_visitor_messages_config on concierge_visitor_messages(config_id, created_at desc);
