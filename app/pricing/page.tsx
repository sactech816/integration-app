'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowLeft, Sparkles, Crown, Users } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>トップページに戻る</span>
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">わかりやすい料金プラン</h1>
          <p className="text-gray-600 text-lg">まずは無料で、すべての機能をお試しいただけます。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* ゲスト */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col bg-white hover:shadow-lg transition">
            <div className="mb-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-gray-500" />
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">お試し体験</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">ゲスト</h2>
              <div className="mt-1 text-gray-500">
                <span className="text-3xl font-bold text-gray-800">¥0</span>
                <span className="text-xs">/ 回</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-6 text-center">
              登録なしで、今すぐお試し作成。<br />※保存はされません
            </p>
            
            <ul className="space-y-3 mb-6 flex-1 border-t border-gray-100 pt-4">
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">新規作成</span>
                <Check size={16} className="text-green-500" />
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ポータル掲載</span>
                <Check size={16} className="text-green-500" />
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">URL発行</span>
                <Check size={16} className="text-green-500" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>編集・更新</span>
                <span className="text-gray-300">×</span>
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>アフィリエイト機能</span>
                <span className="text-gray-300">×</span>
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>アクセス解析</span>
                <span className="text-gray-300">×</span>
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>AI利用</span>
                <span className="text-gray-300">×</span>
              </li>
            </ul>

            <Link
              href="/#create-section"
              className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-center rounded-xl transition text-sm"
            >
              登録せず試す
            </Link>
          </div>

          {/* フリープラン */}
          <div className="border-2 border-indigo-600 rounded-2xl p-6 flex flex-col bg-white shadow-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">おすすめ</span>
            </div>
            <div className="mb-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center">
                <Sparkles size={24} className="text-indigo-600" />
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">標準</span>
              <h2 className="text-xl font-bold text-indigo-800 mt-2">フリープラン</h2>
              <div className="mt-1 text-gray-500">
                <span className="text-3xl font-bold text-gray-800">¥0</span>
                <span className="text-xs">/ 月</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-6 text-center font-bold">
              15秒でできるアカウント登録だけでOK！<br />
              ずっと無料で使い放題。
            </p>
            
            <ul className="space-y-3 mb-6 flex-1 border-t border-gray-100 pt-4">
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>新規作成</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>ポータル掲載</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>URL発行</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>編集・更新</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>アフィリエイト機能</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>アクセス解析</span>
                <Check size={16} className="text-indigo-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>AI利用（回数制限）</span>
                <Check size={16} className="text-indigo-600" />
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center rounded-xl transition text-sm shadow-md"
            >
              無料で登録する
            </Link>
          </div>

          {/* プロプラン */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col bg-gradient-to-b from-amber-50 to-orange-50 hover:shadow-lg transition">
            <div className="mb-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown size={24} className="text-white" />
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">ビジネス向け</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">プロプラン</h2>
              <div className="mt-1 text-gray-500">
                <span className="text-3xl font-bold text-gray-800">¥3,980</span>
                <span className="text-xs">/ 月</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-6 text-center">
              本格的なビジネス運用に。<br />制限なしで使い放題。
            </p>
            
            <ul className="space-y-3 mb-6 flex-1 border-t border-amber-200 pt-4">
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>新規作成</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>ポータル掲載</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>URL発行</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>編集・更新</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>アフィリエイト機能</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm text-gray-700">
                <span>アクセス解析</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>AI利用（優先・無制限）</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>HTMLダウンロード</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>埋め込みコード発行</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>フッター非表示</span>
                <Check size={16} className="text-amber-600" />
              </li>
              <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>優先サポート</span>
                <Check size={16} className="text-amber-600" />
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-center rounded-xl transition text-sm shadow-md"
            >
              プロプランに申し込む
            </Link>
          </div>
        </div>

        {/* 補足情報 */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">よくある質問</h3>
            <div className="space-y-4">
              <details className="bg-white p-5 rounded-lg group cursor-pointer border border-gray-200">
                <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                  Q. 本当にずっと無料ですか？
                  <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                  はい、フリープランはずっと無料でご利用いただけます。個人・スモールビジネス向け機能はずっと無料提供をお約束します。
                </p>
              </details>
              
              <details className="bg-white p-5 rounded-lg group cursor-pointer border border-gray-200">
                <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                  Q. プロプランはいつでも解約できますか？
                  <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                  はい、いつでも解約可能です。解約後も、次の請求日までプロプランの機能をご利用いただけます。
                </p>
              </details>

              <details className="bg-white p-5 rounded-lg group cursor-pointer border border-gray-200">
                <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                  Q. 支払い方法は何がありますか？
                  <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                  クレジットカード（Visa, Mastercard, JCB, American Express）でのお支払いに対応しています。
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">まずは無料で始めてみませんか？</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg"
          >
            <Sparkles size={20} />
            無料で始める
          </Link>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← トップページに戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}
