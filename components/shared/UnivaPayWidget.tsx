'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    UnivapayCheckout: any;
  }
}

interface UnivaPayWidgetProps {
  amount: number;
  email: string;
  planId: string;
  planName: string;
  period: 'monthly' | 'yearly';
  service: 'kdl' | 'donation';
  userId?: string;
  onSuccess: (data: { subscriptionId: string }) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export default function UnivaPayWidget({
  amount,
  email,
  planId,
  planName,
  period,
  service,
  userId,
  onSuccess,
  onError,
  onCancel,
}: UnivaPayWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // UnivaPay SDKをロード
  useEffect(() => {
    const loadScript = () => {
      // すでにロード済みの場合
      if (window.UnivapayCheckout) {
        setScriptLoaded(true);
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://widget.univapay.com/client/checkout.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        setError('決済システムの読み込みに失敗しました');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  // ウィジェットを初期化
  useEffect(() => {
    if (!scriptLoaded || !widgetRef.current || !window.UnivapayCheckout) return;

    const appId = process.env.NEXT_PUBLIC_UNIVAPAY_APP_ID;
    
    if (!appId) {
      setError('UnivaPay App IDが設定されていません');
      return;
    }

    try {
      // UnivaPayウィジェットを初期化
      const checkout = new window.UnivapayCheckout({
        appId,
        checkout: 'token', // トークン方式
        container: widgetRef.current,
        locale: 'ja',
        // スタイル設定
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#9ca3af',
            },
          },
          invalid: {
            color: '#dc2626',
          },
        },
      });

      // トークン取得成功時のコールバック
      checkout.on('token', async (token: string) => {
        setIsProcessing(true);
        setError('');

        try {
          // バックエンドでサブスクリプション作成
          const response = await fetch('/api/univapay/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transactionToken: token,
              amount,
              email,
              planId,
              planName,
              period,
              userId,
              service,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || '決済処理に失敗しました');
          }

          onSuccess({ subscriptionId: data.subscriptionId });
        } catch (err: any) {
          setError(err.message);
          onError(err.message);
        } finally {
          setIsProcessing(false);
        }
      });

      // エラー時のコールバック
      checkout.on('error', (err: any) => {
        setError(err.message || 'カード情報の処理に失敗しました');
        onError(err.message);
      });

      // マウント
      checkout.mount();

    } catch (err: any) {
      setError('決済ウィジェットの初期化に失敗しました');
    }
  }, [scriptLoaded, amount, email, planId, planName, period, userId, service, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-amber-500 mr-2" size={24} />
        <span className="text-gray-600">決済フォームを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <CreditCard className="text-amber-600" size={24} />
        <div>
          <h3 className="font-bold text-gray-900">カード情報入力</h3>
          <p className="text-sm text-gray-500">
            {planName} - ¥{amount.toLocaleString()}/{period === 'yearly' ? '年' : '月'}
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* UnivaPayウィジェットコンテナ */}
      <div 
        ref={widgetRef} 
        className="min-h-[200px] mb-4"
        style={{ opacity: isProcessing ? 0.5 : 1 }}
      />

      {/* 処理中オーバーレイ */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-amber-500 mr-2" size={20} />
          <span className="text-gray-600">決済処理中...</span>
        </div>
      )}

      {/* セキュリティバッジ */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
        <Lock size={12} />
        <span>安全な決済処理（UnivaPay）</span>
      </div>

      {/* キャンセルボタン */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium disabled:opacity-50"
        >
          キャンセル
        </button>
      )}
    </div>
  );
}





