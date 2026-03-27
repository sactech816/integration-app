'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, GripVertical, Image as ImageIcon, Type, X, ImagePlus, ChevronDown } from 'lucide-react';
import type { SwipeCard, SwipeAspectRatio } from '@/lib/types';
import { supabase, TABLES } from '@/lib/supabase';
import { ASPECT_SIZES } from './SwipeCarousel';

interface ThumbnailOption {
  id: string;
  title: string;
  image_url: string;
}

interface SwipeCardEditorProps {
  card: SwipeCard;
  index: number;
  aspectRatio: SwipeAspectRatio;
  userId?: string;
  onUpdate: (id: string, updates: Partial<SwipeCard>) => void;
  onRemove: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function SwipeCardEditor({
  card,
  index,
  aspectRatio,
  userId,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SwipeCardEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);

  const aspect = ASPECT_SIZES[aspectRatio];
  const previewPadding = `${(aspect.height / aspect.width) * 100}%`;

  // サムネイル画像一覧を取得
  const loadThumbnails = async () => {
    if (!supabase || !userId) return;
    if (thumbnails.length > 0) return;
    setLoadingThumbnails(true);
    try {
      const { data } = await supabase
        .from(TABLES.THUMBNAILS)
        .select('id, title, image_url, text_overlay')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        // image_url がある or text_overlay.backgroundImageUrl があるものをフィルタ
        const filtered = data
          .map((t: Record<string, unknown>) => {
            const imgUrl = t.image_url as string | null;
            const overlay = t.text_overlay as { backgroundImageUrl?: string } | null;
            const url = imgUrl || overlay?.backgroundImageUrl || '';
            return url ? { id: t.id as string, title: (t.title as string) || '無題', image_url: url } : null;
          })
          .filter((t): t is ThumbnailOption => t !== null);
        setThumbnails(filtered);
      }
    } catch {
      // ignore
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${userId || 'guest'}/${Date.now()}_${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('swipe-images')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('swipe-images')
        .getPublicUrl(filePath);

      onUpdate(card.id, {
        type: 'image',
        imageUrl: urlData.publicUrl,
      });
    } catch (err) {
      console.error('Upload error:', err);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectThumbnail = (thumb: ThumbnailOption) => {
    onUpdate(card.id, {
      type: 'image',
      imageUrl: thumb.image_url,
    });
    setShowThumbnailPicker(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {card.imageUrl ? (
            <img src={card.imageUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 truncate">
            カード {index + 1}
            {card.textOverlay?.title && ` - ${card.textOverlay.title}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="上に移動"
          >
            ▲
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="下に移動"
          >
            ▼
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(card.id); }}
            className="p-1 text-red-400 hover:text-red-600"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 展開時の編集エリア */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-100">
          {/* モード切替 */}
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(card.id, { type: 'image' })}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                card.type === 'image'
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4" /> 画像アップロード
            </button>
            <button
              onClick={() => onUpdate(card.id, { type: 'template' })}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                card.type === 'template'
                  ? 'bg-purple-50 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Type className="w-4 h-4" /> テンプレ＋テキスト
            </button>
          </div>

          {/* 画像アップロードモード */}
          {card.type === 'image' && (
            <div className="space-y-3">
              {card.imageUrl && (
                <div className="relative rounded-xl overflow-hidden" style={{ paddingTop: previewPadding }}>
                  <img
                    src={card.imageUrl}
                    alt={`カード ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onUpdate(card.id, { imageUrl: undefined })}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                    title="画像を削除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all ${card.imageUrl ? '' : 'py-8'}`}
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'アップロード中...' : card.imageUrl ? '画像を変更' : '画像を選択'}
                  </p>
                  {!card.imageUrl && (
                    <p className="text-xs text-gray-400 mt-1">{aspect.label}</p>
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* サムネイルメーカーから選択 */}
              {userId && (
                <div>
                  <button
                    onClick={() => { setShowThumbnailPicker(!showThumbnailPicker); loadThumbnails(); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-pink-300 rounded-xl text-pink-600 hover:bg-pink-50 transition-all text-sm font-medium"
                  >
                    <ImagePlus className="w-4 h-4" />
                    サムネイルメーカーから選択
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showThumbnailPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showThumbnailPicker && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2">
                      {loadingThumbnails ? (
                        <p className="text-xs text-gray-400 text-center py-4">読み込み中...</p>
                      ) : thumbnails.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">サムネイルがありません</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {thumbnails.map(thumb => (
                            <button
                              key={thumb.id}
                              onClick={() => handleSelectThumbnail(thumb)}
                              className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-pink-400 transition-all aspect-video"
                            >
                              <img src={thumb.image_url} alt={thumb.title} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* テンプレート+テキストモード */}
          {card.type === 'template' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メインテキスト</label>
                <input
                  type="text"
                  value={card.textOverlay?.title || ''}
                  onChange={(e) => onUpdate(card.id, {
                    textOverlay: { ...card.textOverlay, title: e.target.value },
                  })}
                  placeholder="メインテキストを入力"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">サブテキスト</label>
                <input
                  type="text"
                  value={card.textOverlay?.subtitle || ''}
                  onChange={(e) => onUpdate(card.id, {
                    textOverlay: { ...card.textOverlay, subtitle: e.target.value },
                  })}
                  placeholder="サブテキストを入力"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  maxLength={50}
                />
              </div>

              {/* 背景画像 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">背景画像</label>
                {card.textOverlay?.backgroundImageUrl || card.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden" style={{ paddingTop: '30%' }}>
                    <img
                      src={card.textOverlay?.backgroundImageUrl || card.imageUrl}
                      alt="背景"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onUpdate(card.id, {
                        imageUrl: undefined,
                        textOverlay: { ...card.textOverlay, backgroundImageUrl: undefined },
                      })}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (ev) => {
                          const file = (ev.target as HTMLInputElement).files?.[0];
                          if (!file || !supabase) return;
                          setUploading(true);
                          try {
                            const ext = file.name.split('.').pop() || 'png';
                            const filePath = `${userId || 'guest'}/${Date.now()}_bg_${index}.${ext}`;
                            const { error } = await supabase.storage
                              .from('swipe-images')
                              .upload(filePath, file, { contentType: file.type });
                            if (error) throw error;
                            const { data } = supabase.storage.from('swipe-images').getPublicUrl(filePath);
                            onUpdate(card.id, {
                              imageUrl: data.publicUrl,
                              textOverlay: { ...card.textOverlay, backgroundImageUrl: data.publicUrl },
                            });
                          } catch {
                            alert('背景画像のアップロードに失敗しました');
                          } finally {
                            setUploading(false);
                          }
                        };
                        input.click();
                      }}
                      disabled={uploading}
                      className="flex-1 border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-all text-xs text-gray-500"
                    >
                      {uploading ? 'アップロード中...' : 'アップロード'}
                    </button>
                    {userId && (
                      <button
                        onClick={() => { setShowThumbnailPicker(!showThumbnailPicker); loadThumbnails(); }}
                        className="flex-1 border border-pink-300 rounded-lg p-3 text-center hover:bg-pink-50 transition-all text-xs text-pink-600 font-medium"
                      >
                        サムネイルから選択
                      </button>
                    )}
                  </div>
                )}

                {/* テンプレートモード用サムネイルピッカー */}
                {showThumbnailPicker && card.type === 'template' && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2">
                    {loadingThumbnails ? (
                      <p className="text-xs text-gray-400 text-center py-4">読み込み中...</p>
                    ) : thumbnails.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">サムネイルがありません</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {thumbnails.map(thumb => (
                          <button
                            key={thumb.id}
                            onClick={() => {
                              onUpdate(card.id, {
                                imageUrl: thumb.image_url,
                                textOverlay: { ...card.textOverlay, backgroundImageUrl: thumb.image_url },
                              });
                              setShowThumbnailPicker(false);
                            }}
                            className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-pink-400 transition-all aspect-video"
                          >
                            <img src={thumb.image_url} alt={thumb.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* プレビュー */}
              <div className="relative rounded-xl overflow-hidden shadow-inner" style={{ paddingTop: previewPadding }}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center p-6 text-center">
                  {(card.textOverlay?.backgroundImageUrl || card.imageUrl) && (
                    <img
                      src={card.textOverlay?.backgroundImageUrl || card.imageUrl}
                      alt="背景"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="relative z-10">
                    <p className="text-white font-bold text-lg leading-tight">
                      {card.textOverlay?.title || 'メインテキスト'}
                    </p>
                    {card.textOverlay?.subtitle && (
                      <p className="text-white/80 text-sm mt-2">
                        {card.textOverlay.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
