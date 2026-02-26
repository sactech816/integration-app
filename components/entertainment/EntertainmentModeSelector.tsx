'use client';

import { ArrowLeft, PartyPopper, Wand2, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  onSelect: (mode: 'wizard' | 'editor') => void;
}

export default function EntertainmentModeSelector({ onSelect }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-pink-500" />
            <h1 className="font-bold text-gray-900">エンタメ診断メーカー</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">作成方法を選んでください</h2>
          <p className="text-gray-600 text-sm">あとから切り替えることもできます</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* ウィザード */}
          <button
            onClick={() => onSelect('wizard')}
            className="bg-white border-2 border-gray-200 rounded-2xl shadow-md p-8 text-left hover:border-pink-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-colors">
              <Wand2 className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">ウィザードで作成</h3>
            <p className="text-sm text-gray-600 mb-4">
              テーマを入力するだけで、AIが質問・結果をすべて自動生成。最短2ステップで完成します。
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-pink-600">
              おすすめ
            </span>
          </button>

          {/* エディタ */}
          <button
            onClick={() => onSelect('editor')}
            className="bg-white border-2 border-gray-200 rounded-2xl shadow-md p-8 text-left hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
              <Edit3 className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">エディタで作成</h3>
            <p className="text-sm text-gray-600 mb-4">
              左右分割のエディタで、質問・結果を自由に編集。AI生成との組み合わせも可能です。
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">
              細かく調整したい方に
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
