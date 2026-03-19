'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { Loader2, AlertCircle, ArrowLeft, Printer } from 'lucide-react';

export default function BigFiveReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [mbtiCode, setMbtiCode] = useState('');

  useEffect(() => {
    if (!id) return;
    loadReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      const adminEmails = getAdminEmails();
      const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());

      const res = await fetch(`/api/bigfive/result?id=${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '結果を読み込めませんでした');
        return;
      }

      const result = data.result;

      // 購入チェック（管理者はバイパス）
      if (!result.pdf_purchased && !isAdmin) {
        setError('プレミアムレポートの購入が必要です');
        return;
      }

      if (!result.report_content) {
        setError('レポートがまだ生成されていません。結果ページからレポートを生成してください。');
        return;
      }

      setMbtiCode(result.mbti_code || '');
      setReportHtml(result.report_content);
    } catch {
      setError('レポートを読み込めませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600">レポートを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !reportHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-6">{error || 'レポートが見つかりません'}</p>
          <button
            onClick={() => router.push(`/bigfive/result/${id}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all"
          >
            <ArrowLeft size={16} />
            診断結果に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 印刷時に非表示のツールバー */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/bigfive/result/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            診断結果に戻る
          </button>
          <div className="flex items-center gap-3">
            {mbtiCode && <span className="text-sm text-gray-500 hidden sm:block">タイプ: {mbtiCode}</span>}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 transition-all"
            >
              <Printer size={16} />
              PDF保存 / 印刷
            </button>
          </div>
        </div>
      </div>

      {/* レポート本体 */}
      <div className="report-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
          <div
            className="report-content prose prose-sm sm:prose max-w-none"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </div>

        {/* 印刷時のみ表示されるフッター */}
        <div className="print-only-footer">
          <p>Big Five 性格診断 プレミアムレポート{mbtiCode ? ` | タイプ: ${mbtiCode}` : ''}</p>
          <p>集客メーカー makers.tokyo</p>
        </div>
      </div>
    </>
  );
}
