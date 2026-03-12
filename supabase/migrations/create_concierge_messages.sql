-- コンシェルジュ（AIチャットアシスタント）のメッセージ履歴テーブル
create table if not exists concierge_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- インデックス
create index if not exists idx_concierge_user_session
  on concierge_messages(user_id, session_id, created_at);

-- RLS
alter table concierge_messages enable row level security;

create policy "Users can read own concierge messages"
  on concierge_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own concierge messages"
  on concierge_messages for insert
  with check (auth.uid() = user_id);
