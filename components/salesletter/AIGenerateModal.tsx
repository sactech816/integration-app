'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export interface AIGenerateInput {
  productName: string;
  target: string;
  price: string;
  features: string;
  benefits: string;
  urgency: string;
  ctaText: string;
}

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (input: AIGenerateInput) => Promise<void>;
  templateName: string;
  isGenerating: boolean;
}

export default function AIGenerateModal({
  isOpen,
  onClose,
  onGenerate,
  templateName,
  isGenerating,
}: AIGenerateModalProps) {
  const [input, setInput] = useState<AIGenerateInput>({
    productName: '',
    target: '',
    price: '',
    features: '',
    benefits: '',
    urgency: '',
    ctaText: '今すぐ申し込む',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AIGenerateInput, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AIGenerateInput, string>> = {};
    
    if (!input.productName.trim()) {
      newErrors.productName = '商品/サービス名は必須です';
    }
    if (!input.target.trim()) {
      newErrors.target = 'ターゲットは必須です';
    }
    if (!input.features.trim()) {
      newErrors.features = '主な特徴は必須です';
    }
    if (!input.benefits.trim()) {
      newErrors.benefits = 'ベネフィットは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onGenerate(input);
  };

  const handleChange = (field: keyof AIGenerateInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={24} />
              <div>
                <h2 className="text-lg font-bold">AIで自動生成</h2>
                <p className="text-xs text-rose-100">テンプレート: {templateName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 商品/サービス名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              商品/サービス名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={input.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="例: オンライン英会話コース"
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                errors.productName ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isGenerating}
            />
            {errors.productName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.productName}
              </p>
            )}
          </div>

          {/* ターゲット */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              ターゲット（想定顧客）<span className="text-rose-500">*</span>
            </label>
            <textarea
              value={input.target}
              onChange={(e) => handleChange('target', e.target.value)}
              placeholder="例: 30代〜40代のビジネスパーソン、英語を使った仕事に興味がある、忙しくてスクールに通えない"
              rows={2}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none ${
                errors.target ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isGenerating}
            />
            {errors.target && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.target}
              </p>
            )}
          </div>

          {/* 価格 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              価格 <span className="text-gray-400 text-xs font-normal">（任意）</span>
            </label>
            <input
              type="text"
              value={input.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="例: 月額9,800円（税込）"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>

          {/* 主な特徴 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              主な特徴（改行で区切る）<span className="text-rose-500">*</span>
            </label>
            <textarea
              value={input.features}
              onChange={(e) => handleChange('features', e.target.value)}
              placeholder="例:&#10;ネイティブ講師によるマンツーマンレッスン&#10;24時間いつでも予約可能&#10;ビジネス英語に特化したカリキュラム"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none ${
                errors.features ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isGenerating}
            />
            {errors.features && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.features}
              </p>
            )}
          </div>

          {/* ベネフィット */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              ベネフィット（顧客が得られるメリット）<span className="text-rose-500">*</span>
            </label>
            <textarea
              value={input.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              placeholder="例:&#10;3ヶ月で英語でのプレゼンができるようになる&#10;海外クライアントとスムーズに商談できる&#10;キャリアアップの可能性が広がる"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none ${
                errors.benefits ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isGenerating}
            />
            {errors.benefits && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.benefits}
              </p>
            )}
          </div>

          {/* 緊急性/限定性 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              緊急性/限定性 <span className="text-gray-400 text-xs font-normal">（任意）</span>
            </label>
            <input
              type="text"
              value={input.urgency}
              onChange={(e) => handleChange('urgency', e.target.value)}
              placeholder="例: 先着100名様限定、今月末まで30%OFF"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>

          {/* CTA */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              CTA（行動喚起ボタンのテキスト）<span className="text-gray-400 text-xs font-normal">（任意）</span>
            </label>
            <input
              type="text"
              value={input.ctaText}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              placeholder="例: 今すぐ申し込む"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="text-rose-500">*</span> は必須項目です
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={isGenerating}
                className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-bold hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    セールスレターを生成
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
