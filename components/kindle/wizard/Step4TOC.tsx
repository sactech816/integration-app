'use client';

import React, { useState, useEffect } from 'react';
import { 
  List, Sparkles, Loader2, AlertCircle, Copy, Trash2, 
  ArrowLeftRight, Maximize2, ArrowRight, ArrowLeft, Rocket, MessageSquare
} from 'lucide-react';
import { 
  WizardState, Chapter, TOCSlot, RecommendedPattern, 
  CHAPTER_PATTERNS, cleanTarget, cleanChapters 
} from './types';
import { TOCEditor } from './TOCEditor';

interface Step4TOCProps {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onSave: () => Promise<void>;
  isSaving: boolean;
  saveError: string;
}

export const Step4TOC: React.FC<Step4TOCProps> = ({ state, setState, onSave, isSaving, saveError }) => {
  const [error, setError] = useState('');
  const [selectedPatternId, setSelectedPatternId] = useState<string>('basic');
  const [recommendations, setRecommendations] = useState<RecommendedPattern[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [retakeInstruction, setRetakeInstruction] = useState('');
  
  const [slot1, setSlot1] = useState<TOCSlot>({ chapters: [], patternId: '', patternName: '', estimatedWords: '' });
  const [slot2, setSlot2] = useState<TOCSlot>({ chapters: [], patternId: '', patternName: '', estimatedWords: '' });
  const [isGeneratingSlot1, setIsGeneratingSlot1] = useState(false);
  const [isGeneratingSlot2, setIsGeneratingSlot2] = useState(false);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  
  const [viewMode, setViewMode] = useState<'tabs' | 'split'>('tabs');
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await fetch('/api/kdl/generate-chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: state.selectedTitle,
            subtitle: state.subtitle,
            target: cleanTarget(state.selectedTarget),
            action: 'recommend',
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
          if (data.recommendations?.[0]?.patternId) {
            setSelectedPatternId(data.recommendations[0].patternId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };
    fetchRecommendations();
  }, [state.selectedTitle, state.subtitle, state.selectedTarget]);

  const handleGenerateTOC = async (slotNumber: 1 | 2, instruction?: string) => {
    const setIsGenerating = slotNumber === 1 ? setIsGeneratingSlot1 : setIsGeneratingSlot2;
    const setSlot = slotNumber === 1 ? setSlot1 : setSlot2;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/kdl/generate-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.selectedTitle,
          subtitle: state.subtitle,
          target: cleanTarget(state.selectedTarget),
          patternId: selectedPatternId,
          instruction,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '目次生成に失敗しました');
      }
      
      const data = await response.json();
      setSlot({
        chapters: data.chapters,
        patternId: data.patternId || selectedPatternId,
        patternName: data.pattern || CHAPTER_PATTERNS[selectedPatternId as keyof typeof CHAPTER_PATTERNS]?.name || '',
        estimatedWords: data.totalEstimatedWords || '',
      });
      if (instruction) setRetakeInstruction('');
    } catch (err: any) {
      setError(err.message || '目次生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySlot1ToSlot2 = () => {
    if (!window.confirm('目次案Aの内容を目次案Bにコピーしますか？\n（目次案Bの内容は上書きされます）')) return;
    setSlot2({ ...slot1, chapters: cleanChapters(slot1.chapters) });
  };
  
  const copySlot2ToSlot1 = () => {
    if (!window.confirm('目次案Bの内容を目次案Aにコピーしますか？\n（目次案Aの内容は上書きされます）')) return;
    setSlot1({ ...slot2, chapters: cleanChapters(slot2.chapters) });
  };

  const copyChapterToOther = (chapterIndex: number, fromSlot: 1 | 2) => {
    const sourceChapters = fromSlot === 1 ? slot1.chapters : slot2.chapters;
    const setTargetSlot = fromSlot === 1 ? setSlot2 : setSlot1;
    const chapter = sourceChapters[chapterIndex];
    
    const cleanChapter: Chapter = {
      title: chapter.title,
      summary: chapter.summary,
      sections: chapter.sections.map(s => ({ title: s.title }))
    };
    
    setTargetSlot(prev => ({
      ...prev,
      chapters: [...prev.chapters, cleanChapter]
    }));
  };

  const confirmSlot = (slotNumber: 1 | 2) => {
    const slot = slotNumber === 1 ? slot1 : slot2;
    setState(prev => ({ ...prev, chapters: cleanChapters(slot.chapters) }));
    setActiveSlot(slotNumber);
  };

  const clearSlot = (slotNumber: 1 | 2) => {
    const label = slotNumber === 1 ? 'A' : 'B';
    if (!window.confirm(`目次案${label}の内容をすべて削除しますか？`)) return;
    const setSlot = slotNumber === 1 ? setSlot1 : setSlot2;
    setSlot({ chapters: [], patternId: '', patternName: '', estimatedWords: '' });
  };

  const getRecommendationBadge = (patternId: string) => {
    const rec = recommendations.find(r => r.patternId === patternId);
    if (!rec) return null;
    const index = recommendations.findIndex(r => r.patternId === patternId);
    if (index === 0) return { label: 'おすすめ', color: 'bg-amber-500 text-white' };
    if (index === 1) return { label: '2nd', color: 'bg-gray-200 text-gray-700' };
    if (index === 2) return { label: '3rd', color: 'bg-gray-100 text-gray-600' };
    return null;
  };

  const renderSlotPanel = (slotNumber: 1 | 2, isFullWidth: boolean = false) => {
    const slot = slotNumber === 1 ? slot1 : slot2;
    const setSlot = slotNumber === 1 ? setSlot1 : setSlot2;
    const isGenerating = slotNumber === 1 ? isGeneratingSlot1 : isGeneratingSlot2;
    const label = slotNumber === 1 ? 'A' : 'B';
    const isAdopted = activeSlot === slotNumber && state.chapters.length > 0;
    const copyTo = slotNumber === 1 ? copySlot1ToSlot2 : copySlot2ToSlot1;

    return (
      <div className={`border-2 rounded-xl p-4 transition-all ${isAdopted ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={`font-bold text-lg flex items-center gap-2 ${isAdopted ? 'text-green-700' : 'text-gray-900'}`}>
              📋 目次案 {label}
              {isAdopted && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">採用中</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {slot.chapters.length > 0 && (
              <>
                <button
                  onClick={copyTo}
                  className="text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 text-sm"
                  title={`目次案${label === 'A' ? 'B' : 'A'}にコピー`}
                >
                  <Copy size={14} />
                  {label === 'A' ? 'B' : 'A'}へコピー
                </button>
                <button
                  onClick={() => clearSlot(slotNumber)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="クリア"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => handleGenerateTOC(slotNumber)}
              disabled={isGenerating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md disabled:shadow-none"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {slot.chapters.length > 0 ? '再生成' : 'AIで生成'}
            </button>
          </div>
        </div>

        <TOCEditor
          chapters={slot.chapters}
          onUpdate={(chapters) => setSlot(prev => ({ ...prev, chapters }))}
          patternName={slot.patternName}
          estimatedWords={slot.estimatedWords}
          onCopyChapterTo={slot.chapters.length > 0 ? (chapterIndex) => copyChapterToOther(chapterIndex, slotNumber) : undefined}
          isFullWidth={isFullWidth}
          otherSlotLabel={label === 'A' ? 'B' : 'A'}
        />

        {slot.chapters.length > 0 && (
          <button
            onClick={() => confirmSlot(slotNumber)}
            className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
              isAdopted
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-2 border-amber-300'
            }`}
          >
            {isAdopted ? '✓ この目次を採用中' : `この目次を採用する`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <List className="text-amber-500" size={24} />
          目次を作成しましょう
        </h2>
        <p className="text-gray-600 text-sm">
          パターンを選んでAIに目次を作成してもらい、比較・編集できます。章の並び替えや他方へのコピーも可能です。
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
        <p className="text-sm font-bold text-gray-900">{state.selectedTitle}</p>
        {state.subtitle && <p className="text-sm text-gray-700">― {state.subtitle}</p>}
        {state.selectedTarget && <p className="text-xs text-gray-600">ターゲット: {state.selectedTarget.profile}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">章立てパターンを選択</h3>
          {isLoadingRecommendations && <Loader2 className="animate-spin text-amber-500" size={16} />}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(CHAPTER_PATTERNS).map((pattern) => {
            const badge = getRecommendationBadge(pattern.id);
            const rec = recommendations.find(r => r.patternId === pattern.id);
            return (
              <button
                key={pattern.id}
                onClick={() => setSelectedPatternId(pattern.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                  selectedPatternId === pattern.id
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                {badge && (
                  <span className={`absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full font-bold ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{pattern.icon}</span>
                  <span className="font-bold text-sm text-gray-900">{pattern.name}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{pattern.description}</p>
                {rec && (
                  <p className="text-xs text-amber-700 mt-1 line-clamp-1">💡 {rec.reason}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <label className="block text-sm font-bold text-blue-700 flex items-center gap-2">
          <MessageSquare size={16} />
          AIへの要望（リテイク）
        </label>
        <textarea
          value={retakeInstruction}
          onChange={(e) => setRetakeInstruction(e.target.value)}
          placeholder="例: 章の数を5つに減らして、より実践的な内容に"
          className="w-full border border-blue-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
          rows={2}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerateTOC(1, retakeInstruction)}
            disabled={isGeneratingSlot1 || !retakeInstruction.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            {isGeneratingSlot1 ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            要望を入れて目次案Aを再生成
          </button>
          <button
            onClick={() => handleGenerateTOC(2, retakeInstruction)}
            disabled={isGeneratingSlot2 || !retakeInstruction.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            {isGeneratingSlot2 ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            要望を入れて目次案Bを再生成
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">目次案の編集</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tabs')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'tabs' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Maximize2 size={14} className="inline mr-1" />
            フル表示
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'split' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight size={14} className="inline mr-1" />
            比較表示
          </button>
        </div>
      </div>

      {viewMode === 'tabs' ? (
        <div>
          <div className="flex border-b-2 border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('A')}
              className={`flex-1 py-3 text-center font-bold transition-all relative ${
                activeTab === 'A'
                  ? 'text-amber-600 border-b-2 border-amber-500 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 目次案 A
              {slot1.chapters.length > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {slot1.chapters.length}章
                </span>
              )}
              {activeSlot === 1 && state.chapters.length > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">採用中</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('B')}
              className={`flex-1 py-3 text-center font-bold transition-all relative ${
                activeTab === 'B'
                  ? 'text-amber-600 border-b-2 border-amber-500 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 目次案 B
              {slot2.chapters.length > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {slot2.chapters.length}章
                </span>
              )}
              {activeSlot === 2 && state.chapters.length > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">採用中</span>
              )}
            </button>
          </div>

          {activeTab === 'A' ? renderSlotPanel(1, true) : renderSlotPanel(2, true)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderSlotPanel(1, false)}
          {renderSlotPanel(2, false)}
        </div>
      )}

      {(slot1.chapters.length > 0 || slot2.chapters.length > 0) && (
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-6 py-3">
            <span className="text-sm text-gray-500">一括コピー:</span>
            <button
              onClick={copySlot1ToSlot2}
              disabled={slot1.chapters.length === 0}
              className="text-gray-600 hover:text-amber-600 disabled:text-gray-300 flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white disabled:hover:bg-transparent transition-all"
            >
              A → B <ArrowRight size={14} />
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={copySlot2ToSlot1}
              disabled={slot2.chapters.length === 0}
              className="text-gray-600 hover:text-amber-600 disabled:text-gray-300 flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white disabled:hover:bg-transparent transition-all"
            >
              <ArrowLeft size={14} /> B → A
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{saveError}</p>
        </div>
      )}

      {state.chapters.length > 0 && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:shadow-none text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              保存中...
            </>
          ) : (
            <>
              <Rocket size={24} />
              この構成で執筆を始める
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Step4TOC;

