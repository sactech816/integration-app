-- concierge_messages に config_id カラムを追加
-- カスタムコンシェルジュの会話を識別し、作成者向けアクセス解析を可能にする
ALTER TABLE concierge_messages
  ADD COLUMN IF NOT EXISTS config_id UUID REFERENCES concierge_configs(id) ON DELETE SET NULL;

-- config別の分析クエリ用インデックス
CREATE INDEX IF NOT EXISTS idx_concierge_messages_config_id
  ON concierge_messages(config_id, created_at DESC) WHERE config_id IS NOT NULL;
