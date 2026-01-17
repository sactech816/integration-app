'use client';

import React from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

type UserExportProps = {
  exportingCsv: boolean;
  exportingSheets: boolean;
  onExportCsv: () => Promise<void>;
  onExportSheets: () => Promise<void>;
};

export default function UserExport({
  exportingCsv,
  exportingSheets,
  onExportCsv,
  onExportSheets,
}: UserExportProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Download size={18} className="text-blue-600" /> ユーザーデータエクスポート
        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
      </h3>
      <div className="flex gap-3">
        <button
          onClick={onExportCsv}
          disabled={exportingCsv}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exportingCsv ? (
            <>
              <Loader2 size={16} className="animate-spin" /> エクスポート中...
            </>
          ) : (
            <>
              <Download size={16} /> CSVダウンロード
            </>
          )}
        </button>
        <button
          onClick={onExportSheets}
          disabled={exportingSheets}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exportingSheets ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 送信中...
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} /> Googleスプレッドシート
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        全ユーザーの情報（メールアドレス、登録日、パートナー状態、購入履歴など）をエクスポートします。
      </p>
    </div>
  );
}
