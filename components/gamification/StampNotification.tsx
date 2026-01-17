'use client';

import React from 'react';
import { CheckCircle, X, Sparkles } from 'lucide-react';

interface StampNotificationProps {
  points: number;
  stampName: string;
  onClose: () => void;
}

export default function StampNotification({ points, stampName, onClose }: StampNotificationProps) {
  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-14 h-14 text-yellow-200 animate-ping" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium opacity-90">スタンプ獲得！</p>
            <p className="text-lg font-bold">{stampName}</p>
            <p className="text-sm opacity-90">+{points}pt</p>
          </div>
        </div>

        {/* 装飾的なキラキラ */}
        <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
        <div className="absolute bottom-3 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse delay-100" />
        <div className="absolute top-4 right-14 w-1 h-1 bg-yellow-200 rounded-full animate-pulse delay-200" />
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
