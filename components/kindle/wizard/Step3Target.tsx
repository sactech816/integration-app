'use client';

import React, { useState } from 'react';
import { 
  Target, Sparkles, Loader2, Check, AlertCircle, RefreshCw, Star, MessageSquare
} from 'lucide-react';
import { WizardState, TargetSuggestion } from './types';

interface Step3TargetProps {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  targetSuggestions: TargetSuggestion[];
  setTargetSuggestions: React.Dispatch<React.SetStateAction<TargetSuggestion[]>>;
  isGeneratingTarget: boolean;
  setIsGeneratingTarget: React.Dispatch<React.SetStateAction<boolean>>;
  targetError: string;
  setTargetError: React.Dispatch<React.SetStateAction<string>>;
}

export const Step3Target: React.FC<Step3TargetProps> = ({ 
  state, 
  setState, 
  targetSuggestions,
  setTargetSuggestions,
  isGeneratingTarget,
  setIsGeneratingTarget,
  targetError,
  setTargetError
}) => {
  const [mode, setMode] = useState<'select' | 'edit' | 'manual'>('select');
  const [retakeInstruction, setRetakeInstruction] = useState('');
  
  const [editingTarget, setEditingTarget] = useState<TargetSuggestion>({
    profile: '',
    merits: ['', ''],
    benefits: ['', ''],
    differentiation: ['', ''],
    usp: ''
  });
  
  const handleGenerateTargets = async (instruction?: string) => {
    if (!state.selectedTitle.trim()) {
      setTargetError('タイトルが設定されていません');
      return;
    }
    
    setIsGeneratingTarget(true);
    setTargetError('');
    
    try {
      const response = await fetch('/api/kdl/generate-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: state.selectedTitle,
          subtitle: state.subtitle,
          instruction
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ターゲット生成に失敗しました');
      }
      
      const data = await response.json();
      setTargetSuggestions(data.targets);
      setMode('select');
      if (instruction) setRetakeInstruction('');
    } catch (err: any) {
      setTargetError(err.message || 'ターゲット生成中にエラーが発生しました');
    } finally {
      setIsGeneratingTarget(false);
    }
  };

  const isSelected = (target: TargetSuggestion) => {
    return state.selectedTarget?.profile === target.profile && 
           state.selectedTarget?.usp === target.usp;
  };

  const selectAndEdit = (target: TargetSuggestion) => {
    setEditingTarget({ ...target });
    setState(prev => ({ ...prev, selectedTarget: target }));
    setMode('edit');
  };

  const startManualInput = () => {
    setEditingTarget({
      profile: '',
      merits: ['', ''],
      benefits: ['', ''],
      differentiation: ['', ''],
      usp: ''
    });
    setMode('manual');
  };

  const confirmEdit = () => {
    const cleanedTarget: TargetSuggestion = {
      ...editingTarget,
      merits: editingTarget.merits.filter(m => m.trim() !== ''),
      benefits: editingTarget.benefits.filter(b => b.trim() !== ''),
      differentiation: editingTarget.differentiation.filter(d => d.trim() !== ''),
    };
    
    if (!cleanedTarget.profile.trim()) {
      setTargetError('プロフィールを入力してください');
      return;
    }
    if (cleanedTarget.merits.length === 0) {
      setTargetError('メリットを少なくとも1つ入力してください');
      return;
    }
    if (cleanedTarget.benefits.length === 0) {
      setTargetError('ベネフィットを少なくとも1つ入力してください');
      return;
    }
    if (!cleanedTarget.usp.trim()) {
      setTargetError('USPを入力してください');
      return;
    }
    
    setTargetError('');
    setState(prev => ({ ...prev, selectedTarget: cleanedTarget }));
    setMode('select');
  };

  const updateArrayItem = (
    field: 'merits' | 'benefits' | 'differentiation',
    index: number,
    value: string
  ) => {
    setEditingTarget(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'merits' | 'benefits' | 'differentiation') => {
    if (editingTarget[field].length >= 5) return;
    setEditingTarget(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'merits' | 'benefits' | 'differentiation', index: number) => {
    if (editingTarget[field].length <= 1) return;
    setEditingTarget(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const renderEditForm = () => (
    <div className="space-y-5 bg-white rounded-xl border-2 border-amber-300 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          {mode === 'manual' ? '📝 手動入力' : '✏️ ターゲット編集'}
        </h3>
        <button
          onClick={() => setMode('select')}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          キャンセル
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          プロフィール（誰に向けた本？）
        </label>
        <input
          type="text"
          value={editingTarget.profile}
          onChange={(e) => setEditingTarget(prev => ({ ...prev, profile: e.target.value }))}
          placeholder="例: 副業を始めたいが何から手をつけていいかわからない30代会社員"
          className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-blue-700 mb-2">
          メリット（機能的利点）
        </label>
        <div className="space-y-2">
          {editingTarget.merits.map((merit, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={merit}
                onChange={(e) => updateArrayItem('merits', index, e.target.value)}
                placeholder={`メリット${index + 1}`}
                className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-gray-900 placeholder-gray-400 focus:border-blue-400 outline-none text-sm"
              />
              {editingTarget.merits.length > 1 && (
                <button
                  onClick={() => removeArrayItem('merits', index)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {editingTarget.merits.length < 5 && (
            <button
              onClick={() => addArrayItem('merits')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              + メリットを追加
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-green-700 mb-2">
          ベネフィット（人生的価値）
        </label>
        <div className="space-y-2">
          {editingTarget.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                placeholder={`ベネフィット${index + 1}`}
                className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-gray-900 placeholder-gray-400 focus:border-green-400 outline-none text-sm"
              />
              {editingTarget.benefits.length > 1 && (
                <button
                  onClick={() => removeArrayItem('benefits', index)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {editingTarget.benefits.length < 5 && (
            <button
              onClick={() => addArrayItem('benefits')}
              className="text-green-600 text-sm font-medium hover:text-green-700"
            >
              + ベネフィットを追加
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-purple-700 mb-2">
          差別化要素（競合との違い）
        </label>
        <div className="space-y-2">
          {editingTarget.differentiation.map((diff, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={diff}
                onChange={(e) => updateArrayItem('differentiation', index, e.target.value)}
                placeholder={`差別化要素${index + 1}`}
                className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-gray-900 placeholder-gray-400 focus:border-purple-400 outline-none text-sm"
              />
              {editingTarget.differentiation.length > 1 && (
                <button
                  onClick={() => removeArrayItem('differentiation', index)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {editingTarget.differentiation.length < 5 && (
            <button
              onClick={() => addArrayItem('differentiation')}
              className="text-purple-600 text-sm font-medium hover:text-purple-700"
            >
              + 差別化要素を追加
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-amber-700 mb-2">
          💎 USP（独自の強み）
        </label>
        <textarea
          value={editingTarget.usp}
          onChange={(e) => setEditingTarget(prev => ({ ...prev, usp: e.target.value }))}
          placeholder="例: 「忙しい会社員でも、1日30分の積み重ねで確実に成果を出せる」再現性の高い実践メソッド"
          className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
          rows={2}
        />
      </div>

      <button
        onClick={confirmEdit}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
      >
        <Check size={20} />
        この内容で確定する
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="text-amber-500" size={24} />
          ターゲット読者を設定しましょう
        </h2>
        <p className="text-gray-600 text-sm">
          AIに提案してもらうか、手動で入力できます。選択後に編集も可能です。
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-amber-800">設定中の本:</p>
        <p className="text-base font-bold text-gray-900">{state.selectedTitle}</p>
        {state.subtitle && (
          <p className="text-sm text-gray-700">― {state.subtitle}</p>
        )}
      </div>

      {(mode === 'edit' || mode === 'manual') ? (
        renderEditForm()
      ) : (
        <>
          <button
            onClick={() => handleGenerateTargets()}
            disabled={isGeneratingTarget || !state.selectedTitle.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:shadow-none"
          >
            {isGeneratingTarget ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                AIがターゲット読者を分析中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                AIにターゲット読者を提案してもらう
              </>
            )}
          </button>

          <button
            onClick={startManualInput}
            className="w-full bg-white border-2 border-gray-300 hover:border-amber-400 text-gray-700 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Target size={20} />
            手動でターゲットを入力する
          </button>
        </>
      )}

      {targetError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{targetError}</p>
        </div>
      )}

      {mode === 'select' && targetSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">ターゲット読者候補（クリックして選択・編集）</h3>
            <button
              onClick={() => handleGenerateTargets()}
              disabled={isGeneratingTarget}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw size={14} className={isGeneratingTarget ? 'animate-spin' : ''} />
              再生成
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-bold text-blue-700 flex items-center gap-2">
              <MessageSquare size={16} />
              AIへの要望（リテイク）
            </label>
            <textarea
              value={retakeInstruction}
              onChange={(e) => setRetakeInstruction(e.target.value)}
              placeholder="例: もう少しターゲットを初心者に絞って、シンプルな表現で"
              className="w-full border border-blue-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
              rows={2}
            />
            <button
              onClick={() => handleGenerateTargets(retakeInstruction)}
              disabled={isGeneratingTarget || !retakeInstruction.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm"
            >
              {isGeneratingTarget ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              要望を入れて再生成する
            </button>
          </div>
          
          <div className="space-y-4">
            {targetSuggestions.map((target, index) => (
              <button
                key={index}
                onClick={() => selectAndEdit(target)}
                className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
                  isSelected(target)
                    ? 'border-amber-500 shadow-lg'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className={`px-5 py-4 flex items-center justify-between ${
                  isSelected(target) ? 'bg-amber-500 text-white' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${isSelected(target) ? 'text-white' : 'text-amber-600'}`}>
                      ターゲット {index + 1}
                    </span>
                    <span className={`text-sm ${isSelected(target) ? 'text-amber-100' : 'text-gray-600'}`}>
                      {target.profile}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected(target) && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">選択中</span>
                    )}
                    <span className={`text-xs ${isSelected(target) ? 'text-amber-100' : 'text-gray-500'}`}>
                      クリックで編集 →
                    </span>
                  </div>
                </div>

                <div className={`p-5 space-y-4 ${isSelected(target) ? 'bg-amber-50' : 'bg-white'}`}>
                  <div>
                    <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1">
                      <Star size={14} /> メリット（機能的利点）
                    </h4>
                    <ul className="space-y-1">
                      {target.merits.map((merit, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {merit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                      <Star size={14} /> ベネフィット（人生的価値）
                    </h4>
                    <ul className="space-y-1">
                      {target.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1">
                      <Star size={14} /> 差別化要素（競合との違い）
                    </h4>
                    <ul className="space-y-1">
                      {target.differentiation.map((diff, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-amber-800 mb-1">
                      💎 USP（独自の強み）
                    </h4>
                    <p className="text-sm text-gray-800 font-medium">{target.usp}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'select' && state.selectedTarget && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-green-800 mb-2 text-sm flex items-center gap-2">
                <Check size={16} /> 選択中のターゲット読者
              </h3>
              <p className="text-base font-bold text-gray-900">{state.selectedTarget.profile}</p>
              <p className="text-sm text-gray-700 mt-1">{state.selectedTarget.usp}</p>
            </div>
            <button
              onClick={() => {
                setEditingTarget({ ...state.selectedTarget! });
                setMode('edit');
              }}
              className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg"
            >
              ✏️ 編集
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Target;

