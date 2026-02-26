'use client';

import Image from 'next/image';
import type { QuizResult } from '@/lib/types';

interface EntertainmentResultCardProps {
  result: QuizResult;
  resultImage?: string;
}

export default function EntertainmentResultCard({
  result,
  resultImage,
}: EntertainmentResultCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* 画像エリア */}
      {(resultImage || result.image_url) && (
        <div className="relative w-full aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
          <Image
            src={resultImage || result.image_url!}
            alt={result.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        </div>
      )}

      {/* テキストエリア */}
      <div className="p-5 text-center">
        <p className="text-xs font-semibold text-pink-500 mb-1">あなたのタイプは...</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{result.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
      </div>
    </div>
  );
}
