'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Loader2, Check, AlertCircle, RefreshCw, Star, MessageSquare
} from 'lucide-react';
import { WizardState, SubtitleSuggestion } from './types';

interface Step2SubtitleProps {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  subtitleSuggestions: SubtitleSuggestion[];
  setSubtitleSuggestions: React.Dispatch<React.SetStateAction<SubtitleSuggestion[]>>;
  relatedKeywords: { set1: string[]; set2: string[] };
  setRelatedKeywords: React.Dispatch<React.SetStateAction<{ set1: string[]; set2: string[] }>>;
  isGeneratingSubtitle: boolean;
  setIsGeneratingSubtitle: React.Dispatch<React.SetStateAction<boolean>>;
  subtitleError: string;
  setSubtitleError: React.Dispatch<React.SetStateAction<string>>;
}

export const Step2Subtitle: React.FC<Step2SubtitleProps> = ({ 
  state, 
  setState, 
  subtitleSuggestions, 
  setSubtitleSuggestions, 
  relatedKeywords,
  setRelatedKeywords,
  isGeneratingSubtitle, 
  setIsGeneratingSubtitle, 
  subtitleError, 
  setSubtitleError 
}) => {
  const [retakeInstruction, setRetakeInstruction] = useState('');
  
  const handleGenerateSubtitles = async (instruction?: string) => {
    if (!state.selectedTitle.trim()) {
      setSubtitleError('タイトルが設定されていません');
      return;
    }
    
    setIsGeneratingSubtitle(true);
    setSubtitleError('');
    
    try {
      const response = await fetch('/api/kdl/generate-subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: state.selectedTitle, instruction }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'サブタイトル生成に失敗しました');
      }
      
      const data = await response.json();
      setSubtitleSuggestions(data.subtitles);
      setRelatedKeywords({
        set1: data.keywords_set1 || [],
        set2: data.keywords_set2 || [],
      });
      if (instruction) setRetakeInstruction('');
    } catch (err: any) {
      setSubtitleError(err.message || 'サブタイトル生成中にエラーが発生しました');
    } finally {
      setIsGeneratingSubtitle(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="text-amber-500" size={24} />
          サブタイトルを設定しましょう
        </h2>
        <p className="text-gray-600 text-sm">
          サブタイトルは本の内容をより具体的に伝え、読者の興味を引きます。AIがSEOに最適化された案を提案します。
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium">選択中のタイトル:</p>
        <p className="text-lg font-bold text-gray-900 mt-1">{state.selectedTitle || '（未設定）'}</p>
      </div>

      <button
        onClick={() => handleGenerateSubtitles()}
        disabled={isGeneratingSubtitle || !state.selectedTitle.trim()}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:shadow-none"
      >
        {isGeneratingSubtitle ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            AIがサブタイトル案を生成中...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            AIにサブタイトル案を出してもらう
          </>
        )}
      </button>

      {subtitleError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{subtitleError}</p>
        </div>
      )}

      {/* 関連キーワード表示 */}
      {(relatedKeywords.set1.length > 0 || relatedKeywords.set2.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <Star size={16} className="text-blue-500" />
            関連SEOキーワード（タイトルに含まれていないもの）
          </h3>
          {relatedKeywords.set1.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {relatedKeywords.set1.map((keyword, index) => (
                <span key={`set1-${index}`} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          )}
          {relatedKeywords.set2.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {relatedKeywords.set2.map((keyword, index) => (
                <span key={`set2-${index}`} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* サブタイトル候補リスト */}
      {subtitleSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">サブタイトル候補（クリックして選択）</h3>
            <button
              onClick={() => handleGenerateSubtitles()}
              disabled={isGeneratingSubtitle}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw size={14} className={isGeneratingSubtitle ? 'animate-spin' : ''} />
              再生成
            </button>
          </div>

          {/* 再生成（リテイク）機能 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-bold text-blue-700 flex items-center gap-2">
              <MessageSquare size={16} />
              AIへの要望（リテイク）
            </label>
            <textarea
              value={retakeInstruction}
              onChange={(e) => setRetakeInstruction(e.target.value)}
              placeholder="例: もう少しキャッチーに、副業に関する表現を入れて"
              className="w-full border border-blue-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
              rows={2}
            />
            <button
              onClick={() => handleGenerateSubtitles(retakeInstruction)}
              disabled={isGeneratingSubtitle || !retakeInstruction.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm"
            >
              {isGeneratingSubtitle ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              要望を入れて再生成する
            </button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {subtitleSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setState(prev => ({ ...prev, subtitle: suggestion.subtitle }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  state.subtitle === suggestion.subtitle
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-25'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        suggestion.score >= 90 ? 'bg-green-100 text-green-700' :
                        suggestion.score >= 80 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        SEOスコア: {suggestion.score}点
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{suggestion.subtitle}</h4>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>
                  {state.subtitle === suggestion.subtitle && (
                    <div className="bg-amber-500 text-white p-1 rounded-full flex-shrink-0">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 手動入力オプション */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          または、サブタイトルを直接入力
        </label>
        <textarea
          value={state.subtitle}
          onChange={(e) => setState(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="例: 忙しい会社員でも1日30分で実践できる最強メソッド"
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-2">
          ※ サブタイトルは「～する方法」「～のための」「～できる」などの形式が効果的です
        </p>
      </div>

      {/* 選択されたサブタイトルのプレビュー */}
      {state.subtitle && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">📖 タイトル・サブタイトルのプレビュー</h3>
          <p className="text-lg font-bold text-gray-900">{state.selectedTitle}</p>
          <p className="text-base text-gray-700 mt-1">― {state.subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default Step2Subtitle;












