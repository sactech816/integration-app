'use client';

import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Star } from 'lucide-react';

interface BookLPSectionEditorProps {
  sectionKey: string;
  sectionLabel: string;
  sectionData: any;
  onSave: (sectionKey: string, data: any) => void;
  onCancel: () => void;
}

// 配列型セクションかどうかを判定
const ARRAY_SECTION_KEYS = ['pain_points', 'benefits', 'key_takeaways', 'chapter_summaries', 'social_proof', 'bonus', 'faq'];

function getInitialData(sectionKey: string, sectionData: any): any {
  if (ARRAY_SECTION_KEYS.includes(sectionKey)) {
    return Array.isArray(sectionData) ? JSON.parse(JSON.stringify(sectionData)) : [];
  }
  if (sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
    return JSON.parse(JSON.stringify(sectionData));
  }
  return {};
}

function TextInput({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      )}
    </div>
  );
}

function DynamicList({ items: rawItems, onUpdate, fields, maxItems = 10 }: {
  items: any[];
  onUpdate: (items: any[]) => void;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
  maxItems?: number;
}) {
  const items = Array.isArray(rawItems) ? rawItems : [];

  const addItem = () => {
    if (items.length >= maxItems) return;
    const newItem: any = {};
    fields.forEach(f => { newItem[f.key] = ''; });
    onUpdate([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative">
          <button
            onClick={() => removeItem(i)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
          <div className="space-y-2 pr-6">
            {fields.map(field => (
              <TextInput
                key={field.key}
                label={`${field.label} #${i + 1}`}
                value={item[field.key] || ''}
                onChange={(v) => updateItem(i, field.key, v)}
                multiline={field.multiline}
              />
            ))}
          </div>
        </div>
      ))}
      {items.length < maxItems && (
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <Plus size={14} /> 追加
        </button>
      )}
    </div>
  );
}

function StringList({ items, onUpdate, label, maxItems = 10 }: {
  items: string[];
  onUpdate: (items: string[]) => void;
  label: string;
  maxItems?: number;
}) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div className="space-y-2">
      {safeItems.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...safeItems];
              updated[i] = e.target.value;
              onUpdate(updated);
            }}
            className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder={`${label} #${i + 1}`}
          />
          <button
            onClick={() => onUpdate(safeItems.filter((_, idx) => idx !== i))}
            className="p-1 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {safeItems.length < maxItems && (
        <button
          onClick={() => onUpdate([...safeItems, ''])}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <Plus size={14} /> 追加
        </button>
      )}
    </div>
  );
}

export default function BookLPSectionEditor({
  sectionKey,
  sectionLabel,
  sectionData,
  onSave,
  onCancel,
}: BookLPSectionEditorProps) {
  const [data, setData] = useState<any>(() => getInitialData(sectionKey, sectionData));

  const handleSave = () => {
    onSave(sectionKey, data);
  };

  const renderEditor = () => {
    switch (sectionKey) {
      case 'hero':
        return (
          <div className="space-y-3">
            <TextInput label="キャッチコピー" value={data.catchcopy || ''} onChange={(v) => setData({ ...data, catchcopy: v })} />
            <TextInput label="サブタイトル" value={data.subtitle || ''} onChange={(v) => setData({ ...data, subtitle: v })} />
            <TextInput label="説明文" value={data.description || ''} onChange={(v) => setData({ ...data, description: v })} multiline />
          </div>
        );

      case 'pain_points':
        return (
          <DynamicList
            items={data || []}
            onUpdate={setData}
            fields={[
              { key: 'title', label: 'タイトル' },
              { key: 'description', label: '説明', multiline: true },
            ]}
          />
        );

      case 'author_profile':
        return (
          <div className="space-y-3">
            <TextInput label="著者名" value={data.name || ''} onChange={(v) => setData({ ...data, name: v })} />
            <TextInput label="肩書き・資格" value={data.credentials || ''} onChange={(v) => setData({ ...data, credentials: v })} multiline />
            <TextInput label="著者ストーリー" value={data.story || ''} onChange={(v) => setData({ ...data, story: v })} multiline />
          </div>
        );

      case 'benefits':
        return (
          <DynamicList
            items={data || []}
            onUpdate={setData}
            fields={[
              { key: 'title', label: 'メリット' },
              { key: 'description', label: '説明', multiline: true },
            ]}
          />
        );

      case 'key_takeaways':
        return (
          <DynamicList
            items={(data || []).map((item: any, i: number) => ({ ...item, number: i + 1 }))}
            onUpdate={(items) => setData(items.map((item: any, i: number) => ({ ...item, number: i + 1 })))}
            fields={[
              { key: 'title', label: 'インサイト' },
              { key: 'description', label: '説明', multiline: true },
            ]}
            maxItems={5}
          />
        );

      case 'target_readers':
        return (
          <div className="space-y-4">
            <TextInput
              label="見出し"
              value={data.heading || ''}
              onChange={(v) => setData({ ...data, heading: v })}
              placeholder="この本はこんなあなたのための本です"
            />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">ターゲット読者</label>
              <StringList
                items={data.items || []}
                onUpdate={(items) => setData({ ...data, items })}
                label="ターゲット"
                maxItems={7}
              />
            </div>
          </div>
        );

      case 'transformation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-red-500 mb-2">Before（読む前）</label>
              <StringList
                items={data.before || []}
                onUpdate={(before) => setData({ ...data, before })}
                label="Before"
                maxItems={5}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-500 mb-2">After（読んだ後）</label>
              <StringList
                items={data.after || []}
                onUpdate={(after) => setData({ ...data, after })}
                label="After"
                maxItems={5}
              />
            </div>
          </div>
        );

      case 'chapter_summaries':
        return (
          <DynamicList
            items={data || []}
            onUpdate={setData}
            fields={[
              { key: 'chapter_title', label: '章タイトル' },
              { key: 'summary', label: '要約', multiline: true },
            ]}
          />
        );

      case 'social_proof': {
        const reviews = Array.isArray(data) ? data : [];
        return (
          <div className="space-y-3">
            {reviews.map((review: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative">
                <button
                  onClick={() => setData(reviews.filter((_: any, idx: number) => idx !== i))}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={14} />
                </button>
                <div className="space-y-2 pr-6">
                  <TextInput
                    label={`レビュー #${i + 1}`}
                    value={review.quote || ''}
                    onChange={(v) => {
                      const updated = [...reviews];
                      updated[i] = { ...updated[i], quote: v };
                      setData(updated);
                    }}
                    multiline
                  />
                  <TextInput
                    label="レビュアー名"
                    value={review.reviewer_name || ''}
                    onChange={(v) => {
                      const updated = [...reviews];
                      updated[i] = { ...updated[i], reviewer_name: v };
                      setData(updated);
                    }}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">評価</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => {
                            const updated = [...reviews];
                            updated[i] = { ...updated[i], rating: n };
                            setData(updated);
                          }}
                          className="p-0.5"
                        >
                          <Star
                            size={16}
                            className={n <= (review.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {reviews.length < 5 && (
              <button
                onClick={() => setData([...reviews, { quote: '', reviewer_name: '', rating: 5 }])}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <Plus size={14} /> レビューを追加
              </button>
            )}
          </div>
        );
      }

      case 'bonus':
        return (
          <DynamicList
            items={data || []}
            onUpdate={setData}
            fields={[
              { key: 'title', label: '特典名' },
              { key: 'description', label: '説明', multiline: true },
            ]}
            maxItems={5}
          />
        );

      case 'faq':
        return (
          <DynamicList
            items={data || []}
            onUpdate={setData}
            fields={[
              { key: 'question', label: '質問' },
              { key: 'answer', label: '回答', multiline: true },
            ]}
          />
        );

      case 'closing_message':
        return (
          <div className="space-y-3">
            <TextInput label="タイトル" value={data.title || ''} onChange={(v) => setData({ ...data, title: v })} />
            <TextInput label="メッセージ" value={data.message || ''} onChange={(v) => setData({ ...data, message: v })} multiline />
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-3">
            <TextInput
              label="Amazon URL"
              value={data.amazon_link || ''}
              onChange={(v) => setData({ ...data, amazon_link: v })}
              placeholder="https://www.amazon.co.jp/dp/..."
            />
            <TextInput
              label="LINE URL"
              value={data.line_link || ''}
              onChange={(v) => setData({ ...data, line_link: v })}
              placeholder="https://line.me/..."
            />
            <TextInput
              label="CTAボタンテキスト"
              value={data.cta_text || ''}
              onChange={(v) => setData({ ...data, cta_text: v })}
              placeholder="今すぐ読む"
            />
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このセクションの編集はサポートされていません。</p>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800 text-sm">{sectionLabel} を編集</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={14} />
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {renderEditor()}
      </div>
    </div>
  );
}
