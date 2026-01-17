'use client';

import React from 'react';
import { User } from 'lucide-react';

type SidebarUserInfoProps = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  contentCount: number;
  totalViews: number;
};

export default function SidebarUserInfo({
  user,
  isAdmin,
  contentCount,
  totalViews,
}: SidebarUserInfoProps) {
  if (!user) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-indigo-100 p-2.5 rounded-full text-indigo-600">
          <User size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 font-bold">ログイン中</p>
            {isAdmin && (
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-gray-50 px-2 py-1.5 rounded-lg">
          <div className="text-lg font-extrabold text-indigo-600">{contentCount}</div>
          <div className="text-[10px] text-gray-500 font-bold">作成数</div>
        </div>
        <div className="bg-gray-50 px-2 py-1.5 rounded-lg">
          <div className="text-lg font-extrabold text-green-600">{totalViews}</div>
          <div className="text-[10px] text-gray-500 font-bold">総PV数</div>
        </div>
      </div>
    </div>
  );
}
