'use client';

import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { MarketplaceProfile } from '@/lib/types';
import { RESPONSE_TIME_OPTIONS } from '@/constants/marketplace';

interface SellerProfileFormProps {
  profile: MarketplaceProfile | null;
  accessToken: string;
  onSaved: (profile: MarketplaceProfile) => void;
}

export default function SellerProfileForm({ profile, accessToken, onSaved }: SellerProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(profile?.portfolio_urls || []);
  const [newUrl, setNewUrl] = useState('');
  const [responseTime, setResponseTime] = useState(profile?.response_time || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
          skills,
          portfolio_urls: portfolioUrls,
          response_time: responseTime || null,
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

      {/* 表示名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          表示名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="スキルや経験をアピールしましょう"
        />
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
