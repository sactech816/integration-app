-- お知らせの並び順を手動で変更可能にするカラムを追加
-- display_order が小さいほど上に表示（NULLの場合は作成日順）

alter table announcements add column if not exists display_order integer;

-- 既存レコードにはNULLを維持（NULLの場合は created_at desc でフォールバック）

create index if not exists idx_announcements_display_order on announcements(display_order asc nulls last, created_at desc);
