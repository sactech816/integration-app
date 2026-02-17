'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MarketplaceListing, MarketplacePriceType } from '@/lib/types';
import { MARKETPLACE_CATEGORIES, PRICE_TYPE_LABELS } from '@/constants/marketplace';

interface ListingFormProps {
  listing?: MarketplaceListing | null;
  accessToken: string;
  onSaved: (listing: MarketplaceListing) => void;
  onCancel?: () => void;
}

export default function ListingForm({ listing, accessToken, onSaved, onCancel }: ListingFormProps) {
  const [category, setCategory] = useState(listing?.category || '');
  const [title, setTitle] = useState(listing?.title || '');
  const [description, setDescription] = useState(listing?.description || '');
  const [priceType, setPriceType] = useState<MarketplacePriceType>(listing?.price_type || 'fixed');
  const [priceMin, setPriceMin] = useState(listing?.price_min?.toString() || '');
  const [priceMax, setPriceMax] = useState(listing?.price_max?.toString() || '');
  const [deliveryDays, setDeliveryDays] = useState(listing?.delivery_days?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = MARKETPLACE_CATEGORIES.find(c => c.id === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError('カテゴリを選択してください'); return; }
    if (!title.trim()) { setError('タイトルを入力してください'); return; }
    if (!description.trim()) { setError('説明を入力してください'); return; }
    if (priceType !== 'negotiable' && !priceMin) { setError('価格を入力してください'); return; }

    setSaving(true);
    setError('');

    try {
      const url = listing
        ? `/api/marketplace/listings/${listing.id}`
        : '/api/marketplace/listings';
      const method = listing ? 'PUT' : 'POST';

      const body: Record<string, any> = {
        category,
        is_tool_linked: selectedCategory?.isToolLinked || false,
        linked_service_type: selectedCategory?.linkedServiceType || null,
        title: title.trim(),
        description: description.trim(),
        price_type: priceType,
        price_min: priceType === 'negotiable' ? 0 : parseInt(priceMin),
        price_max: priceType === 'range' && priceMax ? parseInt(priceMax) : null,
        delivery_days: deliveryDays ? parseInt(deliveryDays) : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存に失敗しました');
      }

      const data = await res.json();
      onSaved(data.listing);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">選択してください</option>
          <optgroup label="ツール連携">
            {MARKETPLACE_CATEGORIES.filter(c => c.isToolLinked).map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </optgroup>
          <optgroup label="汎用">
            {MARKETPLACE_CATEGORIES.filter(c => !c.isToolLinked).map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          サービスタイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="例: プロがあなたのビジネスLPを作成します"
          maxLength={80}
        />
        <p className="text-xs text-gray-400 mt-1">{title.length}/80</p>
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          サービス説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="提供するサービスの内容、含まれるもの、対応範囲などを詳しく記載してください"
        />
      </div>

      {/* 価格 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">価格設定</label>
        <div className="flex gap-3 mb-3">
          {Object.entries(PRICE_TYPE_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="priceType"
                value={key}
                checked={priceType === key}
                onChange={e => setPriceType(e.target.value as MarketplacePriceType)}
                className="text-indigo-600"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        {priceType !== 'negotiable' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                placeholder={priceType === 'range' ? '最低価格' : '価格'}
                min={0}
              />
            </div>
            {priceType === 'range' && (
              <>
                <span className="text-gray-400">〜</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="最高価格"
                    min={0}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 納期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">納期目安（日数）</label>
        <input
          type="number"
          value={deliveryDays}
          onChange={e => setDeliveryDays(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="例: 7"
          min={1}
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {listing ? 'サービスを更新' : 'サービスを出品'}
        </button>
      </div>
    </form>
  );
}
