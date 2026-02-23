'use client';

import React, { useState, useRef } from 'react';
import { Loader2, FileText, DollarSign, Star, Crown, UploadCloud, ImageIcon, X, Shuffle } from 'lucide-react';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { MarketplaceListing, MarketplacePriceType } from '@/lib/types';
import { MARKETPLACE_CATEGORIES, PRICE_TYPE_LABELS } from '@/constants/marketplace';
import { supabase } from '@/lib/supabase';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const CURATED_THUMBNAILS = [
  'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
];

interface ListingFormProps {
  listing?: MarketplaceListing | null;
  accessToken: string;
  onSaved: (listing: MarketplaceListing) => void;
  onCancel?: () => void;
}

export default function ListingForm({ listing, accessToken, onSaved, onCancel }: ListingFormProps) {
  // はじめかたガイド
  const { showOnboarding, setShowOnboarding } = useOnboarding('marketplace_listing_onboarding_dismissed', { skip: !!listing });

  const [category, setCategory] = useState(listing?.category || '');
  const [title, setTitle] = useState(listing?.title || '');
  const [description, setDescription] = useState(listing?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(listing?.thumbnail_url || '');
  const [priceType, setPriceType] = useState<MarketplacePriceType>(listing?.price_type || 'fixed');
  const [priceMin, setPriceMin] = useState(listing?.price_min?.toString() || '');
  const [priceMax, setPriceMax] = useState(listing?.price_max?.toString() || '');
  const [deliveryDays, setDeliveryDays] = useState(listing?.delivery_days?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showFreeImages, setShowFreeImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = MARKETPLACE_CATEGORIES.find(c => c.id === category);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('データベースに接続されていません');

    if (file.size > MAX_IMAGE_SIZE) {
      alert(`ファイルサイズが大きすぎます（${(file.size / 1024 / 1024).toFixed(1)}MB）。2MB以内のファイルを選択してください。`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      setThumbnailUrl(data.publicUrl);
    } catch (err: any) {
      alert('アップロードエラー: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRandomImage = () => {
    const selected = CURATED_THUMBNAILS[Math.floor(Math.random() * CURATED_THUMBNAILS.length)];
    setThumbnailUrl(selected);
  };

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
        thumbnail_url: thumbnailUrl || null,
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          placeholder="例: プロがあなたのビジネスLPを作成します"
          maxLength={80}
        />
        <p className="text-xs text-gray-400 mt-1">{title.length}/80</p>
      </div>

      {/* サムネイル画像 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          サムネイル画像
        </label>
        <p className="text-xs text-gray-500 mb-3">サービスの魅力が伝わる画像を設定しましょう（2MB以内）</p>

        {/* プレビュー */}
        {thumbnailUrl && (
          <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200">
            <img src={thumbnailUrl} alt="サムネイルプレビュー" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => setThumbnailUrl('')}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
            placeholder="画像URL (https://...) またはアップロード"
          />
          <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 cursor-pointer transition-colors whitespace-nowrap">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            アップロード
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
          <button
            type="button"
            onClick={handleRandomImage}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            <Shuffle className="w-4 h-4" />
            ランダム
          </button>
        </div>

        {/* フリー画像ギャラリー */}
        <button
          type="button"
          onClick={() => setShowFreeImages(!showFreeImages)}
          className="mt-2 text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          <ImageIcon className="w-3 h-3" />
          {showFreeImages ? 'フリー画像を閉じる' : 'フリー画像から選ぶ'}
        </button>
        {showFreeImages && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CURATED_THUMBNAILS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setThumbnailUrl(url); setShowFreeImages(false); }}
                className={`aspect-video rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                  thumbnailUrl === url ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
              <span className="text-sm text-gray-900">{label}</span>
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
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="marketplace_listing_onboarding_dismissed"
          title="サービス出品の流れ"
          pages={[{
            subtitle: '出品の基本をご紹介します',
            items: [
              { icon: FileText, iconColor: 'blue', title: 'カテゴリとタイトル', description: 'まずカテゴリを選択し、わかりやすいサービスタイトルを入力してください。タイトルは80文字以内です。' },
              { icon: DollarSign, iconColor: 'amber', title: '価格設定', description: '「固定価格」「価格帯」「応相談」の3種類から選べます。納期目安も設定すると依頼者に親切です。' },
              { icon: Star, iconColor: 'purple', title: '魅力的な説明文', description: 'サービスの内容・含まれるもの・対応範囲を具体的に記載すると、依頼率が上がります。' },
              { icon: Crown, iconColor: 'teal', title: 'プロプラン限定機能', description: 'スキルマーケットプレイスはプロプラン限定です。出品後はマーケットプレイス上で公開されます。' },
            ],
          }]}
          gradientFrom="from-amber-500"
          gradientTo="to-orange-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </form>
  );
}
