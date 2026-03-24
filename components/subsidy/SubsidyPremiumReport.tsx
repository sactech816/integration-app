'use client';

import { useState } from 'react';
import { FileText, Sparkles, CheckCircle, Loader2, Crown, ClipboardCopy, Download } from 'lucide-react';
import type { ReportContent } from '@/lib/subsidy/types';

interface Props {
  resultId: string;
  selectedSubsidy: string | null;
  reportPurchased: boolean;
  reportContent: ReportContent | null;
  user: { id: string } | null;
  onSetShowAuth: (show: boolean) => void;
}

export default function SubsidyPremiumReport({
  resultId,
  selectedSubsidy,
  reportPurchased,
  reportContent,
  user,
  onSetShowAuth,
}: Props) {
  const [purchasing, setPurchasing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<ReportContent | null>(reportContent);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handlePurchase = async (subsidyKey: string) => {
    if (!user) {
      onSetShowAuth(true);
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch('/api/subsidy/purchase-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, subsidyKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '購入処理に失敗しました');
      }
    } catch {
      alert('エラーが発生しました');
    } finally {
      setPurchasing(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/subsidy/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      } else {
        alert(data.error || 'レポート生成に失敗しました');
      }
    } catch {
      alert('エラーが発生しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopySection = (key: string, content: string) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // 購入済み＋レポート生成済み → レポート表示
  if (reportPurchased && report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Crown className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold text-gray-900">AI申請書ドラフト — {report.subsidyName}</h2>
        </div>

        {report.sections.map((section) => (
          <div key={section.key} className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-teal-900">{section.title}</h3>
              <button
                onClick={() => handleCopySection(section.key, section.content)}
                className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
              >
                {copiedSection === section.key ? (
                  <><CheckCircle size={14} /> コピー済み</>
                ) : (
                  <><ClipboardCopy size={14} /> コピー</>
                )}
              </button>
            </div>
            <div
              className="p-6 prose prose-sm max-w-none text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center">
          ※ AIが生成したドラフトです。実際の申請書には事業者ご自身の情報で加筆・修正してください。
        </p>
      </div>
    );
  }

  // 購入済み＋レポート未生成 → 生成ボタン
  if (reportPurchased && !report) {
    return (
      <div className="bg-white border border-teal-200 rounded-2xl shadow-md p-8 text-center space-y-4">
        <Crown className="text-amber-500 mx-auto" size={32} />
        <h3 className="text-lg font-bold text-gray-900">申請書AIドラフトを生成</h3>
        <p className="text-sm text-gray-600">ご購入ありがとうございます。下のボタンでAIが申請書ドラフトを生成します。</p>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="h-14 px-8 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {generating ? (
            <><Loader2 size={20} className="animate-spin" /> 生成中（1〜2分）...</>
          ) : (
            <><Sparkles size={20} /> 申請書を生成する</>
          )}
        </button>
      </div>
    );
  }

  // 未購入 → 購入CTA
  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 rounded-2xl shadow-md p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full mb-3">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">AI申請書作成</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          AIが補助金申請書のドラフトを自動生成
        </h2>
        <p className="text-sm text-gray-600">
          入力した事業情報をもとに、申請書の主要セクションをAIが作成します
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {[
          { icon: FileText, title: '事業計画', desc: '現状・課題・戦略', color: 'text-teal-600', bg: 'bg-teal-100' },
          { icon: Sparkles, title: '事業内容', desc: '補助事業の具体的計画', color: 'text-cyan-600', bg: 'bg-cyan-100' },
          { icon: Download, title: '経費明細', desc: '補助対象経費の内訳', color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map((f) => (
          <div key={f.title} className="bg-white/80 border border-white rounded-xl p-3 text-center">
            <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <f.icon className={`w-4 h-4 ${f.color}`} />
            </div>
            <p className="text-xs font-semibold text-gray-900">{f.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      {selectedSubsidy ? (
        <button
          onClick={() => handlePurchase(selectedSubsidy)}
          disabled={purchasing}
          className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {purchasing ? (
            <><Loader2 size={20} className="animate-spin" /> 処理中...</>
          ) : (
            <><FileText size={20} /> 申請書をAIで作成する</>
          )}
        </button>
      ) : (
        <p className="text-center text-sm text-gray-500">上の結果から補助金を選んで「申請書をAIで作成する」を押してください</p>
      )}
    </div>
  );
}
