'use client';

import { useState, useCallback, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { X, Palette, Layers, Save, Trash2, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// グラデーション方向のプリセット
const gradientDirections = [
  { label: '↗', value: '-45deg', name: '斜め上' },
  { label: '→', value: '90deg', name: '右' },
  { label: '↘', value: '45deg', name: '斜め下' },
  { label: '↓', value: '180deg', name: '下' },
  { label: '↙', value: '135deg', name: '左下' },
  { label: '←', value: '270deg', name: '左' },
  { label: '↖', value: '-135deg', name: '左上' },
  { label: '↑', value: '0deg', name: '上' },
];

// マイプリセットの型
interface ColorPreset {
  id: string;
  name: string;
  value: string;
  is_animated: boolean;
}

interface CustomColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: string, isAnimated?: boolean) => void;
  initialValue?: string;
  accentColor?: 'emerald' | 'amber'; // エディタごとのアクセントカラー
  userId?: string; // ユーザーID（マイプリセット機能用）
}

export default function CustomColorPicker({
  isOpen,
  onClose,
  onApply,
  initialValue,
  accentColor = 'emerald',
  userId,
}: CustomColorPickerProps) {
  // タブ: 'solid' = 単色, 'gradient' = グラデーション, 'presets' = マイプリセット
  const [mode, setMode] = useState<'solid' | 'gradient' | 'presets'>('gradient');
  
  // 単色用
  const [solidColor, setSolidColor] = useState('#3CACAE');
  
  // グラデーション用
  const [color1, setColor1] = useState('#667eea');
  const [color2, setColor2] = useState('#764ba2');
  const [color3, setColor3] = useState('#f093fb');
  const [color4, setColor4] = useState('#4facfe');
  const [direction, setDirection] = useState('-45deg');
  const [useAnimation, setUseAnimation] = useState(true);
  const [activeColorIndex, setActiveColorIndex] = useState<1 | 2 | 3 | 4>(1);
  
  // マイプリセット用
  const [presets, setPresets] = useState<ColorPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // マイプリセットを読み込み
  const loadPresets = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from('user_color_presets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('プリセット読み込みエラー:', error);
    } finally {
      setIsLoadingPresets(false);
    }
  }, [userId]);

  // モーダルが開いたときにプリセットを読み込み
  useEffect(() => {
    if (isOpen && userId) {
      loadPresets();
    }
  }, [isOpen, userId, loadPresets]);

  // 現在のグラデーション値を生成
  const generateGradient = useCallback(() => {
    return `linear-gradient(${direction}, ${color1}, ${color2}, ${color3}, ${color4})`;
  }, [direction, color1, color2, color3, color4]);

  // 現在のプレビュー値
  const previewValue = mode === 'solid' ? solidColor : generateGradient();
  const previewIsAnimated = mode === 'gradient' && useAnimation;

  // プリセットを保存
  const handleSavePreset = async () => {
    if (!userId || !presetName.trim()) return;
    
    setIsSavingPreset(true);
    try {
      const value = mode === 'solid' ? solidColor : generateGradient();
      const { error } = await supabase
        .from('user_color_presets')
        .insert({
          user_id: userId,
          name: presetName.trim(),
          value,
          is_animated: mode === 'gradient' && useAnimation,
        });
      
      if (error) throw error;
      
      setPresetName('');
      setShowSaveForm(false);
      await loadPresets();
      alert('プリセットを保存しました！');
    } catch (error) {
      console.error('プリセット保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSavingPreset(false);
    }
  };

  // プリセットを削除
  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('このプリセットを削除しますか？')) return;
    
    try {
      const { error } = await supabase
        .from('user_color_presets')
        .delete()
        .eq('id', presetId);
      
      if (error) throw error;
      await loadPresets();
    } catch (error) {
      console.error('プリセット削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // プリセットを適用
  const handleApplyPreset = (preset: ColorPreset) => {
    onApply(preset.value, preset.is_animated);
    onClose();
  };

  // 適用ボタン
  const handleApply = () => {
    if (mode === 'solid') {
      onApply(solidColor, false);
    } else {
      onApply(generateGradient(), useAnimation);
    }
    onClose();
  };

  // アクセントカラーに応じたスタイル
  const accentStyles = {
    emerald: {
      tabActive: 'bg-emerald-100 text-emerald-700',
      tabInactive: 'text-gray-500 hover:bg-gray-100',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'ring-emerald-500',
      border: 'border-emerald-500',
    },
    amber: {
      tabActive: 'bg-amber-100 text-amber-700',
      tabInactive: 'text-gray-500 hover:bg-gray-100',
      button: 'bg-amber-600 hover:bg-amber-700',
      ring: 'ring-amber-500',
      border: 'border-amber-500',
    },
  };
  const styles = accentStyles[accentColor];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">カスタム背景を作成</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => setMode('solid')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              mode === 'solid' ? styles.tabActive : styles.tabInactive
            }`}
          >
            <Palette size={16} />
            単色
          </button>
          <button
            onClick={() => setMode('gradient')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              mode === 'gradient' ? styles.tabActive : styles.tabInactive
            }`}
          >
            <Layers size={16} />
            グラデ
          </button>
          {userId && (
            <button
              onClick={() => setMode('presets')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                mode === 'presets' ? styles.tabActive : styles.tabInactive
              }`}
            >
              <Star size={16} />
              マイプリセット
            </button>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-5 space-y-5">
          {mode === 'presets' ? (
            // マイプリセットモード
            <div className="space-y-4">
              {isLoadingPresets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : presets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">保存したプリセットはありません</p>
                  <p className="text-xs mt-1">単色やグラデーションを作成して保存しましょう</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {presets.map((preset) => {
                    const isSolid = preset.value.startsWith('#');
                    return (
                      <div key={preset.id} className="relative group">
                        <button
                          onClick={() => handleApplyPreset(preset)}
                          className="w-full p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                        >
                          <div
                            className={`w-full h-16 rounded-lg ${!isSolid && preset.is_animated ? 'animate-gradient-xy' : ''}`}
                            style={{
                              background: isSolid ? undefined : preset.value,
                              backgroundColor: isSolid ? preset.value : undefined,
                              backgroundSize: !isSolid && preset.is_animated ? '400% 400%' : 'auto',
                            }}
                          />
                          <span className="text-xs text-gray-600 block mt-1 truncate">{preset.name}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : mode === 'solid' ? (
            // 単色モード
            <div className="space-y-4">
              <div className="flex justify-center">
                <HexColorPicker color={solidColor} onChange={setSolidColor} />
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: solidColor }}
                />
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">カラーコード</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">#</span>
                    <HexColorInput
                      color={solidColor}
                      onChange={setSolidColor}
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm uppercase"
                      prefixed={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // グラデーションモード
            <div className="space-y-4">
              {/* 4色選択 */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  グラデーションの色（4色）
                </label>
                <div className="flex gap-2 mb-3">
                  {[
                    { index: 1 as const, color: color1, setColor: setColor1 },
                    { index: 2 as const, color: color2, setColor: setColor2 },
                    { index: 3 as const, color: color3, setColor: setColor3 },
                    { index: 4 as const, color: color4, setColor: setColor4 },
                  ].map(({ index, color }) => (
                    <button
                      key={index}
                      onClick={() => setActiveColorIndex(index)}
                      className={`flex-1 h-12 rounded-lg border-2 transition-all ${
                        activeColorIndex === index
                          ? `${styles.border} ring-2 ${styles.ring} ring-offset-1`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      <span className="sr-only">色{index}</span>
                    </button>
                  ))}
                </div>
                
                {/* アクティブな色のピッカー */}
                <div className="flex justify-center">
                  <HexColorPicker
                    color={
                      activeColorIndex === 1 ? color1 :
                      activeColorIndex === 2 ? color2 :
                      activeColorIndex === 3 ? color3 : color4
                    }
                    onChange={(newColor) => {
                      if (activeColorIndex === 1) setColor1(newColor);
                      else if (activeColorIndex === 2) setColor2(newColor);
                      else if (activeColorIndex === 3) setColor3(newColor);
                      else setColor4(newColor);
                    }}
                  />
                </div>
                
                {/* カラーコード入力 */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-gray-500">色{activeColorIndex}:</span>
                  <span className="text-gray-400">#</span>
                  <HexColorInput
                    color={
                      activeColorIndex === 1 ? color1 :
                      activeColorIndex === 2 ? color2 :
                      activeColorIndex === 3 ? color3 : color4
                    }
                    onChange={(newColor) => {
                      if (activeColorIndex === 1) setColor1(newColor);
                      else if (activeColorIndex === 2) setColor2(newColor);
                      else if (activeColorIndex === 3) setColor3(newColor);
                      else setColor4(newColor);
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm uppercase"
                    prefixed={false}
                  />
                </div>
              </div>

              {/* グラデーション方向 */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  グラデーションの方向
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientDirections.map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() => setDirection(dir.value)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        direction === dir.value
                          ? `${styles.border} bg-gray-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl block">{dir.label}</span>
                      <span className="text-xs text-gray-500">{dir.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* アニメーション設定 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="useAnimation"
                  checked={useAnimation}
                  onChange={(e) => setUseAnimation(e.target.checked)}
                  className={`w-5 h-5 rounded ${accentColor === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}
                />
                <label htmlFor="useAnimation" className="text-sm text-gray-700">
                  <span className="font-medium">アニメーション</span>
                  <span className="text-gray-500 ml-1">（グラデーションが動く）</span>
                </label>
              </div>
            </div>
          )}

          {/* プレビュー（マイプリセットモード以外） */}
          {mode !== 'presets' && (
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">プレビュー</label>
              <div
                className={`w-full h-24 rounded-xl border border-gray-200 ${
                  previewIsAnimated ? 'animate-gradient-xy' : ''
                }`}
                style={{
                  background: mode === 'solid' ? undefined : previewValue,
                  backgroundColor: mode === 'solid' ? previewValue : undefined,
                  backgroundSize: previewIsAnimated ? '400% 400%' : 'auto',
                }}
              />
            </div>
          )}

          {/* プリセット保存フォーム（ログイン済みかつマイプリセット以外） */}
          {userId && mode !== 'presets' && (
            <div className="border-t border-gray-100 pt-4">
              {showSaveForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="プリセット名"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                    maxLength={50}
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim() || isSavingPreset}
                    className={`px-4 py-2 ${styles.button} text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1`}
                  >
                    {isSavingPreset ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setPresetName('');
                    }}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Star size={16} />
                  マイプリセットに保存
                </button>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          {mode !== 'presets' && (
            <button
              onClick={handleApply}
              className={`flex-1 px-4 py-3 ${styles.button} text-white rounded-xl font-medium transition-colors`}
            >
              適用する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
