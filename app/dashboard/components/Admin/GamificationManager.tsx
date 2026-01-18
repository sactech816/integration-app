'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function GamificationManager() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">ゲーミフィケーション管理</h3>
        <p className="text-gray-500 mb-4">
          キャンペーン作成・編集機能は現在準備中です
        </p>
        <p className="text-sm text-gray-400">
          スタンプラリー、ログインボーナス、ガチャなどのキャンペーン管理が可能になります
        </p>
      </div>

      {/* 将来の実装用プレースホルダー */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>実装予定機能:</strong>
          <br />
          ・キャンペーン一覧と作成
          <br />
          ・スタンプラリー設定
          <br />
          ・ログインボーナス設定
          <br />
          ・ガチャ（抽選）設定
          <br />
          ・キャンペーン統計表示
        </p>
      </div>
    </div>
  );
}
