'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, ChevronRight, ChevronDown, BookOpen, ArrowLeft, Clipboard, AlertCircle } from 'lucide-react';

interface AnalyzedSection {
  title: string;
  content: string;
}

interface AnalyzedChapter {
  title: string;
  summary: string;
  sections: AnalyzedSection[];
}

interface AnalyzedStructure {
  suggested_title: string;
  suggested_subtitle: string;
  chapters: AnalyzedChapter[];
}

interface ImportStepProps {
  onImportComplete: (structure: AnalyzedStructure) => void;
  onBack: () => void;
  isDemo: boolean;
}

export function ImportStep({ onImportComplete, onBack, isDemo }: ImportStepProps) {
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedStructure, setAnalyzedStructure] = useState<AnalyzedStructure | null>(null);
  const [error, setError] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイルアップロード処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['.txt', '.docx'];
      const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      if (!validTypes.includes(ext)) {
        setError('.txt または .docx ファイルを選択してください');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  // ドラッグ＆ドロップ
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.toLowerCase().slice(droppedFile.name.lastIndexOf('.'));
      if (!['.txt', '.docx'].includes(ext)) {
        setError('.txt または .docx ファイルを選択してください');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  // Step 1: テキスト抽出
  const handleImport = async () => {
    setIsImporting(true);
    setError('');

    try {
      let extractedText = '';

      if (importMode === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/kdl/import-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'ファイルの解析に失敗しました');
        }

        const data = await response.json();
        extractedText = data.text;
        setCharCount(data.charCount);
      } else if (importMode === 'paste') {
        if (!text.trim()) {
          throw new Error('テキストを入力してください');
        }
        extractedText = text;
        setCharCount(text.length);
      }

      // Step 2: 構造分析
      setIsImporting(false);
      setIsAnalyzing(true);

      const analyzeResponse = await fetch('/api/kdl/analyze-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, title: title || undefined }),
      });

      if (!analyzeResponse.ok) {
        const data = await analyzeResponse.json();
        throw new Error(data.error || '構造分析に失敗しました');
      }

      const analyzeData = await analyzeResponse.json();
      setAnalyzedStructure(analyzeData.structure);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || '処理に失敗しました');
    } finally {
      setIsImporting(false);
      setIsAnalyzing(false);
    }
  };

  // 分析結果が表示されている場合
  if (analyzedStructure) {
    const totalSections = analyzedStructure.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-green-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} className="text-green-600" />
              構造分析結果
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {analyzedStructure.chapters.length}章 / {totalSections}節 に分割されました（{charCount.toLocaleString()}文字）
            </p>
          </div>

          <div className="p-6">
            {/* タイトル表示 */}
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-600 font-medium mb-1">推定タイトル</p>
              <p className="font-bold text-gray-800">{analyzedStructure.suggested_title}</p>
              {analyzedStructure.suggested_subtitle && (
                <p className="text-sm text-gray-600 mt-1">{analyzedStructure.suggested_subtitle}</p>
              )}
            </div>

            {/* 章・節ツリー */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {analyzedStructure.chapters.map((chapter, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{chapter.title}</span>
                        <span className="text-xs text-gray-500 ml-2">({chapter.sections.length}節)</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${expandedChapter === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedChapter === i && (
                    <div className="px-3 py-2 space-y-1 bg-white">
                      {chapter.summary && (
                        <p className="text-xs text-gray-500 italic mb-2 px-2">{chapter.summary}</p>
                      )}
                      {chapter.sections.map((section, j) => (
                        <div key={j} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600">
                          <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                          <span>{section.title}</span>
                          {section.content && (
                            <span className="text-xs text-green-500 ml-auto">執筆済</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setAnalyzedStructure(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              やり直す
            </button>
            <button
              onClick={() => onImportComplete(analyzedStructure)}
              className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition flex items-center gap-2 shadow-lg"
            >
              <BookOpen size={16} />
              この構造で書籍を作成
            </button>
          </div>
        </div>
      </div>
    );
  }

  // インポート入力画面
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />
            原稿インポート
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            既存の原稿を取り込み、AIが自動で章・節の構造を分析します
          </p>
        </div>

        <div className="p-6">
          {/* タイトル入力（オプション） */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              書籍タイトル（任意）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="入力しない場合、AIが推定します"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-gray-800"
            />
          </div>

          {/* モード切替タブ */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setImportMode('paste')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
                importMode === 'paste'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clipboard size={16} />
              テキスト貼り付け
            </button>
            <button
              onClick={() => setImportMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
                importMode === 'file'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} />
              ファイルアップロード
            </button>
          </div>

          {/* テキスト貼り付けモード */}
          {importMode === 'paste' && (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="原稿のテキストをここに貼り付けてください..."
                className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-gray-800 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {text.length.toLocaleString()} 文字
              </p>
            </div>
          )}

          {/* ファイルアップロードモード */}
          {importMode === 'file' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                file
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={40} className="text-blue-500" />
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    ファイルを変更
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={40} className="text-gray-400" />
                  <p className="text-gray-600 text-sm">
                    ファイルをドラッグ＆ドロップ、または
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    ファイルを選択
                  </button>
                  <p className="text-xs text-gray-400">対応形式: .txt, .docx</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            戻る
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || isAnalyzing || (importMode === 'paste' && !text.trim()) || (importMode === 'file' && !file)}
            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg transition flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                テキスト抽出中...
              </>
            ) : isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                構造分析中...
              </>
            ) : (
              <>
                <BookOpen size={16} />
                構造を分析する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
