'use client';

import { useState } from 'react';
import { FileText, Sparkles, CheckCircle, Loader2, Crown, ClipboardCopy, Download, ChevronDown, ChevronUp, Eye, BookOpen } from 'lucide-react';
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
  const [showSample, setShowSample] = useState(false);

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

  // 未購入 → 購入CTA（料金・概要・サンプル付き）
  return (
    <div id="premium-report" className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 rounded-2xl shadow-md overflow-hidden">
      {/* ヘッダー */}
      <div className="p-6 sm:p-8 pb-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full mb-3">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">AI申請書作成</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            AIが補助金申請書のドラフトを自動生成
          </h2>
          <p className="text-sm text-gray-600">
            入力した事業情報をもとに、申請書の主要セクション（全5章・約8〜12ページ相当）をAIが作成します
          </p>
        </div>

        {/* 料金表示 */}
        <div className="bg-white/90 border border-teal-200 rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs text-gray-500 mb-1">1補助金あたり</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-teal-700">¥1,500</span>
            <span className="text-sm text-gray-500">（税込）</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Stripe決済 / クレジットカード対応</p>
        </div>
      </div>

      {/* 生成される内容の概要 */}
      <div className="px-6 sm:px-8 pb-6">
        <div className="mb-2 flex items-center gap-1.5">
          <BookOpen size={14} className="text-teal-600" />
          <p className="text-sm font-bold text-gray-900">生成される申請書の内容</p>
        </div>
        <div className="space-y-2 mb-6">
          {[
            { num: '01', title: '事業計画概要', desc: '企業概要・事業の現状と課題・成長戦略', pages: '約2〜3ページ' },
            { num: '02', title: '補助事業の具体的内容', desc: '導入計画・技術的優位性・実施体制', pages: '約2〜3ページ' },
            { num: '03', title: '導入効果・事業効果', desc: '定量的KPI・売上/生産性向上の見込み', pages: '約1〜2ページ' },
            { num: '04', title: '経費明細', desc: '補助対象経費の内訳と金額根拠', pages: '約1ページ' },
            { num: '05', title: '実施スケジュール', desc: '段階的な実施計画・マイルストーン', pages: '約1ページ' },
          ].map((s) => (
            <div key={s.num} className="bg-white/80 border border-white rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">{s.num}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                  <span className="shrink-0 text-[10px] text-gray-400">{s.pages}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* サンプルプレビュー */}
        <div className="mb-6">
          <button
            onClick={() => setShowSample(!showSample)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors py-2"
          >
            <Eye size={14} />
            サンプルを見る
            {showSample ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSample && (
            <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* サンプルヘッダー */}
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500">サンプル：IT導入補助金 — 事業計画概要（抜粋）</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">SAMPLE</span>
              </div>
              {/* サンプル本文 */}
              <div className="p-5 text-sm text-gray-700 leading-relaxed space-y-3 relative">
                <h4 className="font-bold text-gray-900">1. 企業概要</h4>
                <p>
                  当社は東京都に本社を構える従業員15名の○○業を営む中小企業です。
                  創業以来、△△分野において地域密着型のサービスを提供してまいりました。
                  現在の年間売上高は約□□万円で、主要顧客は■■です。
                </p>
                <h4 className="font-bold text-gray-900">2. 現状の課題</h4>
                <p>
                  現在、受発注管理を紙ベースおよびExcelで行っており、以下の課題が顕在化しています。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>受注から納品までの情報伝達に平均2日のタイムラグが発生</li>
                  <li>月次の売上集計に経理担当者が延べ20時間を費やしている</li>
                  <li>顧客情報が属人化しており、担当者不在時に対応品質が低下</li>
                </ul>
                <h4 className="font-bold text-gray-900">3. IT導入による改善計画</h4>
                <p>
                  上記課題を解決するため、クラウド型の業務管理システム（○○ツール）を導入し、
                  受発注〜請求〜顧客管理を一元化します。これにより...
                </p>
                {/* ぼかしオーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="px-5 py-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">※ 実際の申請書はあなたの事業情報をもとにAIが生成します</p>
              </div>
            </div>
          )}
        </div>

        {/* 購入ボタン */}
        {selectedSubsidy ? (
          <button
            onClick={() => handlePurchase(selectedSubsidy)}
            disabled={purchasing}
            className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {purchasing ? (
              <><Loader2 size={20} className="animate-spin" /> 処理中...</>
            ) : (
              <><FileText size={20} /> 申請書をAIで作成する — ¥1,500</>
            )}
          </button>
        ) : (
          <p className="text-center text-sm text-gray-500">上の結果から補助金を選んで「申請書をAIで作成する」を押してください</p>
        )}
        <p className="text-center text-xs text-gray-400 mt-3">
          ※ AIが生成したドラフトです。実際の申請には加筆・修正が必要です。
        </p>
      </div>
    </div>
  );
}
