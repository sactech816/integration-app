'use client';

import { LogIn } from 'lucide-react';

interface LoginRequiredProps {
  toolName?: string;
  onLogin: () => void;
}

/**
 * 未ログインユーザーに表示するログイン誘導画面
 * エディタの入口で使用（パターンA: シンプルなログイン画面）
 */
export default function LoginRequired({ toolName, onLogin }: LoginRequiredProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-8 max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
        <p className="text-gray-600 mb-6 text-sm">
          {toolName ? `${toolName}を利用するには` : 'このツールを利用するには'}
          <br />無料登録が必要です。
        </p>
        <button
          onClick={onLogin}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
        >
          ログイン / 新規登録
        </button>
        <p className="text-xs text-gray-400 mt-3">
          登録は30秒で完了・クレジットカード不要
        </p>
      </div>
    </div>
  );
}
