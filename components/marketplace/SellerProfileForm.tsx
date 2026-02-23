'use client';

import React, { useState, useRef } from 'react';
import { Loader2, Plus, X, Check, UploadCloud, Shuffle, ImageIcon, User } from 'lucide-react';
import { MarketplaceProfile } from '@/lib/types';
import { RESPONSE_TIME_OPTIONS, SUPPORTED_TOOLS, KINDLE_SUBTYPES } from '@/constants/marketplace';
import { supabase } from '@/lib/supabase';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
];

interface SellerProfileFormProps {
  profile: MarketplaceProfile | null;
  accessToken: string;
  onSaved: (profile: MarketplaceProfile) => void;
}

export default function SellerProfileForm({ profile, accessToken, onSaved }: SellerProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(profile?.portfolio_urls || []);
  const [newUrl, setNewUrl] = useState('');
  const [responseTime, setResponseTime] = useState(profile?.response_time || '');
  const [supportedTools, setSupportedTools] = useState<string[]>(profile?.supported_tools || []);
  const [kindleSubtypes, setKindleSubtypes] = useState<string[]>(profile?.kindle_subtypes || []);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showFreeAvatars, setShowFreeAvatars] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('データベースに接続されていません');

    if (file.size > MAX_IMAGE_SIZE) {
      alert(`ファイルサイズが大きすぎます（${(file.size / 1024 / 1024).toFixed(1)}MB）。2MB以内のファイルを選択してください。`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      alert('アップロードエラー: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRandomAvatar = () => {
    const selected = CURATED_AVATARS[Math.floor(Math.random() * CURATED_AVATARS.length)];
    setAvatarUrl(selected);
  };

  const toggleTool = (toolId: string) => {
    setSupportedTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
    if (toolId === 'kindle' && supportedTools.includes('kindle')) {
      setKindleSubtypes([]);
    }
  };

  const toggleKindleSubtype = (subtypeId: string) => {
    setKindleSubtypes(prev =>
      prev.includes(subtypeId) ? prev.filter(s => s !== subtypeId) : [...prev, subtypeId]
    );
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  const addUrl = () => {
    const u = newUrl.trim();
    if (u) {
      setPortfolioUrls([...portfolioUrls, u]);
      setNewUrl('');
    }
  };

  const removeUrl = (index: number) => setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { setError('表示名を入力してください'); return; }

    setSaving(true);
    setError('');

    try {
      const method = profile ? 'PUT' : 'POST';
      const res = await fetch('/api/marketplace/profiles', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          skills,
          portfolio_urls: portfolioUrls,
          response_time: responseTime || null,
          supported_tools: supportedTools,
          kindle_subtypes: kindleSubtypes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存に失敗しました');
      }

      const data = await res.json();
      onSaved(data.profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* アバター画像 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">プロフィール画像</label>
        <p className="text-xs text-gray-500 mb-3">あなたの印象を伝える画像を設定しましょう（2MB以内）</p>

        <div className="flex items-start gap-4">
          {/* プレビュー */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-indigo-300" />
              )}
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 cursor-pointer transition-colors">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                アップロード
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                ランダム
              </button>
            </div>
            <input
              type="text"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
              placeholder="画像URLを直接入力..."
            />
            <button
              type="button"
              onClick={() => setShowFreeAvatars(!showFreeAvatars)}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3" />
              {showFreeAvatars ? 'フリー画像を閉じる' : 'フリー画像から選ぶ'}
            </button>
          </div>
        </div>

        {/* フリーアバターギャラリー */}
        {showFreeAvatars && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CURATED_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setAvatarUrl(url); setShowFreeAvatars(false); }}
                className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all hover:opacity-90 flex-shrink-0 ${
                  avatarUrl === url ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 表示名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          表示名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="クリエイター名"
        />
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="スキルや経験をアピールしましょう"
        />
      </div>

      {/* サポート可能ツール */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          サポート可能なツール
        </label>
        <p className="text-xs text-gray-500 mb-3">対応できるツールを選択してください</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_TOOLS.map(tool => {
            const selected = supportedTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                <span className="truncate">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Kindleサブカテゴリ */}
        {supportedTools.includes('kindle') && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-indigo-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kindle出版の対応範囲
            </label>
            <div className="grid grid-cols-2 gap-2">
              {KINDLE_SUBTYPES.map(sub => {
                const selected = kindleSubtypes.includes(sub.id);
                return (
                  <label
                    key={sub.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      selected
                        ? 'border-purple-400 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleKindleSubtype(sub.id)}
                      className="sr-only"
                    />
                    {selected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    <span>{sub.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* スキルタグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">スキル</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-sm">
              {skill}
              <button type="button" onClick={() => removeSkill(i)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            placeholder="スキルを追加（Enterで確定）"
          />
          <button type="button" onClick={addSkill} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ポートフォリオURL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ポートフォリオURL</label>
        <div className="space-y-2 mb-2">
          {portfolioUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-blue-600 truncate">{url}</span>
              <button type="button" onClick={() => removeUrl(i)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            placeholder="https://..."
          />
          <button type="button" onClick={addUrl} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 返信速度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">返信速度の目安</label>
        <select
          value={responseTime}
          onChange={e => setResponseTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="">選択してください</option>
          {RESPONSE_TIME_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 送信 */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {profile ? 'プロフィールを更新' : 'プロフィールを作成'}
      </button>
    </form>
  );
}
