'use client';

import React, { useState, useCallback } from 'react';
import { ChapterSidebar } from './ChapterSidebar';
import { TiptapEditor } from './TiptapEditor';

interface Section {
  id: string;
  title: string;
  order_index: number;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  summary: string | null;
  order_index: number;
  sections: Section[];
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
}

interface EditorLayoutProps {
  book: Book;
  chapters: Chapter[];
  onUpdateSectionContent: (sectionId: string, content: string) => Promise<void>;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  book,
  chapters,
  onUpdateSectionContent,
}) => {
  // 初期値: 最初の章の最初の節
  const getInitialSectionId = () => {
    if (chapters.length > 0 && chapters[0].sections.length > 0) {
      return chapters[0].sections[0].id;
    }
    return '';
  };

  const [activeSectionId, setActiveSectionId] = useState<string>(getInitialSectionId);
  const [chaptersData, setChaptersData] = useState<Chapter[]>(chapters);

  // 現在選択中の節を取得
  const getActiveSection = useCallback(() => {
    for (const chapter of chaptersData) {
      const section = chapter.sections.find(s => s.id === activeSectionId);
      if (section) {
        return section;
      }
    }
    return null;
  }, [chaptersData, activeSectionId]);

  const activeSection = getActiveSection();

  // 節の内容を保存
  const handleSave = useCallback(async (sectionId: string, content: string) => {
    await onUpdateSectionContent(sectionId, content);
    
    // ローカルの状態も更新
    setChaptersData(prev => prev.map(chapter => ({
      ...chapter,
      sections: chapter.sections.map(section =>
        section.id === sectionId
          ? { ...section, content }
          : section
      ),
    })));
  }, [onUpdateSectionContent]);

  // 節を選択
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
  }, []);

  if (!activeSection) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-2">節が見つかりません</p>
          <p className="text-sm text-gray-400">目次から節を選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* 左サイドバー: 目次 */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 overflow-hidden">
        <ChapterSidebar
          chapters={chaptersData}
          activeSectionId={activeSectionId}
          onSectionClick={handleSectionClick}
          bookTitle={book.title}
          bookSubtitle={book.subtitle}
        />
      </div>

      {/* 右メイン: エディタ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TiptapEditor
          key={activeSectionId}
          initialContent={activeSection.content}
          sectionId={activeSectionId}
          sectionTitle={activeSection.title || '無題の節'}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default EditorLayout;

