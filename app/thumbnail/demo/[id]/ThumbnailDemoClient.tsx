'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, Monitor, Square, Smartphone } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import {
  thumbnailTemplates,
  PLATFORM_CATEGORIES,
  STYLE_CATEGORIES,
} from '@/constants/templates/thumbnail';

const aspectRatioMap: Record<string, { width: number; height: number }> = {
  '16:9': { width: 16, height: 9 },
  '1:1': { width: 1, height: 1 },
  '9:16': { width: 9, height: 16 },
};

const platformIconMap: Record<string, typeof Monitor> = {
  youtube: Monitor,
  instagram_post: Square,
  instagram_story: Smartphone,
  twitter: Monitor,
  threads: Square,
  banner: Monitor,
};

export default function ThumbnailDemoClient() {
  const params = useParams();
  const id = params.id as string;
  const template = thumbnailTemplates.find((t) => t.id === id);

  const currentIndex = thumbnailTemplates.findIndex((t) => t.id === id);
  const prev = currentIndex > 0 ? thumbnailTemplates[currentIndex - 1] : null;
  const next = currentIndex < thumbnailTemplates.length - 1 ? thumbnailTemplates[currentIndex + 1] : null;

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">テンプレートが見つかりません</h1>
          <Link href="/demos" className="text-blue-600 hover:underline">デモ一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const platform = PLATFORM_CATEGORIES.find((p) => p.id === template.platformCategory);
  const style = STYLE_CATEGORIES.find((s) => s.id === template.styleCategory);
  const ratio = aspectRatioMap[template.aspectRatio] || aspectRatioMap['16:9'];
  const PlatformIcon = platformIconMap[template.platformCategory] || Monitor;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/demos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          デモ一覧に戻る
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-2xl mb-4">
            <ImageIcon size={32} className="text-sky-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{template.name}</h1>
          <p className="text-gray-600 text-lg mb-3">{template.description}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 text-sm font-bold rounded-full">
              <PlatformIcon size={14} />
              {platform?.label}
            </span>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
              {style?.label}
            </span>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
              {template.aspectRatio}
            </span>
          </div>
        </div>

        {/* サムネイルプレビュー（カラーテーマ別） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {template.colorThemes.map((theme) => (
            <div key={theme.id} className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              {/* カラープレビュー */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  aspectRatio: `${ratio.width}/${ratio.height}`,
                  maxHeight: 300,
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1] || theme.colors[0]})`,
                }}
              >
                <div className="text-center text-white px-4">
                  <p className="text-2xl font-black drop-shadow-lg">サンプルテキスト</p>
                  <p className="text-sm opacity-80 mt-1 drop-shadow">Sample Thumbnail</p>
                </div>
              </div>
              {/* テーマ情報 */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{theme.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{theme.promptModifier}</p>
              </div>
            </div>
          ))}
        </div>

        {/* タグ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-500 mb-3">タグ</h2>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between mt-8">
          {prev ? (
            <Link
              href={`/thumbnail/demo/${prev.id}`}
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-colors"
            >
              <ChevronLeft size={18} />
              {prev.name}
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/thumbnail/demo/${next.id}`}
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-colors"
            >
              {next.name}
              <ChevronRight size={18} />
            </Link>
          ) : <div />}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <Link
            href="/thumbnail/editor"
            className="inline-flex items-center justify-center gap-2 bg-sky-600 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-sky-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <ImageIcon size={22} />
            サムネイルを作成する
          </Link>
        </div>
      </div>

      <Footer setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }} />
    </div>
  );
}
