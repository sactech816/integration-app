'use client';

import React from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  Send,
  MoreHorizontal,
  Twitter,
  Instagram,
} from 'lucide-react';
import { SNSPlatform } from '@/lib/types';

type PostPreviewProps = {
  platform: SNSPlatform;
  text: string;
  hashtags: string[];
};

function XPreview({ text, hashtags }: { text: string; hashtags: string[] }) {
  const hashtagText = hashtags.map((t) => `#${t}`).join(' ');
  const fullText = text + (hashtagText ? `\n\n${hashtagText}` : '');

  return (
    <div className="bg-black rounded-2xl p-4 max-w-md mx-auto">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Twitter className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-sm">あなたの名前</span>
            <span className="text-gray-500 text-sm">@your_handle</span>
          </div>
          <div className="mt-1 text-white text-sm whitespace-pre-wrap break-words">
            {fullText || (
              <span className="text-gray-600">投稿テキストがここに表示されます...</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 text-gray-500 max-w-[300px]">
            <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="hover:text-blue-400 transition-colors">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramPreview({ text, hashtags }: { text: string; hashtags: string[] }) {
  const hashtagText = hashtags.map((t) => `#${t}`).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900">your_account</span>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Instagram className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <span className="text-sm">画像プレビュー</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-gray-900" />
            <MessageCircle className="w-6 h-6 text-gray-900" />
            <Send className="w-6 h-6 text-gray-900" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-900" />
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
          <span className="font-semibold">your_account</span>{' '}
          {text || (
            <span className="text-gray-400">キャプションがここに表示されます...</span>
          )}
        </p>
        {hashtagText && (
          <p className="text-sm text-blue-600 mt-1 break-words">{hashtagText}</p>
        )}
      </div>
    </div>
  );
}

function ThreadsPreview({ text, hashtags }: { text: string; hashtags: string[] }) {
  const hashtagText = hashtags.map((t) => `#${t}`).join(' ');
  const fullText = text + (hashtagText ? `\n\n${hashtagText}` : '');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 max-w-md mx-auto p-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
        </div>
        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 text-sm">your_account</span>
          </div>
          <div className="mt-1 text-gray-900 text-sm whitespace-pre-wrap break-words">
            {fullText || (
              <span className="text-gray-400">投稿テキストがここに表示されます...</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-gray-500">
            <button className="hover:text-gray-900 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="hover:text-gray-900 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="hover:text-gray-900 transition-colors">
              <Repeat2 className="w-5 h-5" />
            </button>
            <button className="hover:text-gray-900 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostPreview({ platform, text, hashtags }: PostPreviewProps) {
  switch (platform) {
    case 'twitter':
      return <XPreview text={text} hashtags={hashtags} />;
    case 'instagram':
      return <InstagramPreview text={text} hashtags={hashtags} />;
    case 'threads':
      return <ThreadsPreview text={text} hashtags={hashtags} />;
    default:
      return <XPreview text={text} hashtags={hashtags} />;
  }
}
