'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, BookOpen, Home, Plus, FileText, Rocket, CreditCard, LogOut, Lightbulb, Wrench
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface EditorActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loadingLabel?: string;
}

interface KdlHamburgerMenuProps {
  adminKey?: string | null;
  buttonClassName?: string;
  iconColor?: string;
  editorActions?: EditorActionItem[];
}

export default function KdlHamburgerMenu({
  adminKey,
  buttonClassName = "p-2 hover:bg-white/10 rounded-lg transition-colors",
  iconColor = "text-white",
  editorActions,
}: KdlHamburgerMenuProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const adminKeyParam = adminKey ? `?admin_key=${adminKey}` : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード（マイブック）', href: `/kindle${adminKeyParam}`, icon: Home },
    { id: 'new', label: '新規作成', href: `/kindle/new${adminKeyParam}`, icon: Plus },
    { id: 'discovery', label: 'ネタ発掘診断', href: `/kindle/discovery${adminKeyParam}`, icon: Lightbulb },
    { id: 'guide', label: 'まずお読みください', href: '/kindle/guide', icon: FileText, target: '_blank' as const },
    { id: 'publish-guide', label: '出版準備ガイド', href: '/kindle/publish-guide', icon: Rocket, target: '_blank' as const },
    { id: 'plan', label: 'プラン情報', href: `/kindle${adminKeyParam}#plan-info`, icon: CreditCard },
  ];

  const menuContent = (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-[9999] transform transition-transform duration-300 ease-in-out shadow-xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* メニューヘッダー */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={24} />
            <span className="font-bold text-lg">KDL メニュー</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="メニューを閉じる"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-72px)]">
          {/* 執筆ツールセクション（エディタ画面のみ） */}
          {editorActions && editorActions.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Wrench size={14} />
                <span>執筆ツール</span>
              </div>
              {editorActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setIsMenuOpen(false);
                    action.onClick();
                  }}
                  disabled={action.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    action.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-400 flex-shrink-0">{action.icon}</span>
                  <span>{action.disabled && action.loadingLabel ? action.loadingLabel : action.label}</span>
                </button>
              ))}
              <div className="border-t border-gray-200 my-3" />
            </>
          )}

          {/* ナビゲーション */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                target={item.target}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
              >
                <Icon size={20} className="text-gray-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-gray-200 my-3" />

          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>ログアウト</span>
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(true)}
        className={buttonClassName}
        aria-label="メニューを開く"
      >
        <Menu size={24} className={iconColor} />
      </button>

      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
