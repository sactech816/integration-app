'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, Sparkles, Loader2, Check, AlertCircle, RefreshCw, MessageSquare
} from 'lucide-react';
import { WizardState, TitleSuggestion } from './types';

interface Step1ThemeProps {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  titleSuggestions: TitleSuggestion[];
  setTitleSuggestions: React.Dispatch<React.SetStateAction<TitleSuggestion[]>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const Step1Theme: React.FC<Step1ThemeProps> = ({ 
  state, 
  setState, 
  titleSuggestions, 
  setTitleSuggestions, 
  isGenerating, 
  setIsGenerating, 
  error, 
  setError 
}) => {
  const [retakeInstruction, setRetakeInstruction] = useState('');
  
  const handleGenerateTitles = async (instruction?: string) => {
    if (!state.theme.trim()) {
      setError('テーマを入力してください');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/kdl/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: state.theme, instruction }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'タイトル生成に失敗しました');
      }
      
      const data = await response.json();
      setTitleSuggestions(data.titles);
      if (instruction) setRetakeInstruction('');
    } catch (err: any) {
      setError(err.message || 'タイトル生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Lightbulb className="text-amber-500" size={24} />
          書きたい本のテーマを教えてください
        </h2>
        <p className="text-gray-600 text-sm">
          テーマやキーワードを入力すると、AIがAmazon SEOに最適化されたタイトル案を提案します。
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          テーマ・キーワード
        </label>
        <textarea
          value={state.theme}
          onChange={(e) => setState(prev => ({ ...prev, theme: e.target.value }))}
          placeholder="例: 副業で稼ぐ方法、時間管理術、ダイエット、投資初心者..."
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={() => handleGenerateTitles()}
        disabled={isGenerating || !state.theme.trim()}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:shadow-none"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            AIがタイトル案を生成中...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            AIにタイトル案を出してもらう
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {titleSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">タイトル候補（クリックして選択）</h3>
            <button
              onClick={() => handleGenerateTitles()}
              disabled={isGenerating}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
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
              placeholder="例: もう少し初心者向けに、短めのタイトルで"
              className="w-full border border-blue-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
              rows={2}
            />
            <button
              onClick={() => handleGenerateTitles(retakeInstruction)}
              disabled={isGenerating || !retakeInstruction.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              要望を入れて再生成する
            </button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {titleSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setState(prev => ({ ...prev, selectedTitle: suggestion.title }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  state.selectedTitle === suggestion.title
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
                    <h4 className="font-bold text-gray-900 mb-2">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  {state.selectedTitle === suggestion.title && (
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
          または、タイトルを直接入力
        </label>
        <input
          type="text"
          value={state.selectedTitle}
          onChange={(e) => setState(prev => ({ ...prev, selectedTitle: e.target.value }))}
          placeholder="本のタイトルを入力..."
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default Step1Theme;




















