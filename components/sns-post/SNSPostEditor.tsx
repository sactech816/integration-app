'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Eye,
  PenLine,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { SNSPlatform, SNSPostTone, SNSPost } from '@/lib/types';
import PlatformTabs from './PlatformTabs';
import { PLATFORM_CONFIG } from './PlatformTabs';
import ToneSelector from './ToneSelector';
import HashtagEditor from './HashtagEditor';
import PostPreview from './PostPreview';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

type SNSPostEditorProps = {
  user: { id: string; email?: string } | null;
  editingPost?: SNSPost | null;
  setShowAuth: (show: boolean) => void;
};

export default function SNSPostEditor({ user, editingPost, setShowAuth }: SNSPostEditorProps) {
  const router = useRouter();

  // State
  const [platform, setPlatform] = useState<SNSPlatform>('twitter');
  const [tone, setTone] = useState<SNSPostTone>('business');
  const [topic, setTopic] = useState('');
  const [postText, setPostText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    platform: true,
    tone: true,
    topic: true,
    text: true,
    hashtags: true,
  });

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Load editing data
  useEffect(() => {
    if (editingPost) {
      setPlatform(editingPost.platform || 'twitter');
      setTone(editingPost.tone || 'business');
      setTitle(editingPost.title || '');
      setPostText(editingPost.content?.text || '');
      setHashtags(editingPost.content?.hashtags || []);
      setTopic(editingPost.content?.topic || '');
      setSavedSlug(editingPost.slug);
    }
  }, [editingPost]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const platformConfig = PLATFORM_CONFIG[platform];
  const charCount = postText.length;
  const charLimit = platformConfig.charLimit;
  const charRatio = charCount / charLimit;

  const getCharColor = () => {
    if (charRatio > 1) return 'text-red-600';
    if (charRatio > 0.95) return 'text-red-500';
    if (charRatio > 0.8) return 'text-amber-500';
    return 'text-gray-500';
  };

  // AI Generate
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/sns-post/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          tone,
          topic,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPostText(data.text || '');
        setHashtags(data.hashtags || []);
        if (data.title) setTitle(data.title);
        // Open text and hashtag sections
        setOpenSections((prev) => ({ ...prev, text: true, hashtags: true }));
      } else {
        alert(data.error || 'AI生成に失敗しました');
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('AI生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save
  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!postText.trim()) {
      alert('投稿テキストを入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const slug = savedSlug || generateSlug();
      const postData = {
        slug,
        title: title || 'SNS投稿',
        user_id: user.id,
        platform,
        tone,
        content: {
          text: postText,
          hashtags,
          topic,
        },
        status: 'published',
        updated_at: new Date().toISOString(),
      };

      if (savedSlug) {
        // Update
        const { error } = await supabase!
          .from(TABLES.SNS_POSTS)
          .update(postData)
          .eq('slug', savedSlug);

        if (error) throw error;
        alert('更新しました');
      } else {
        // Insert
        const { error } = await supabase!
          .from(TABLES.SNS_POSTS)
          .insert(postData);

        if (error) throw error;
        setSavedSlug(slug);
        setShowCompleteModal(true);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert('保存に失敗しました: ' + (error.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // Copy helpers
  const handleCopyText = async () => {
    const hashtagText = hashtags.map((t) => `#${t}`).join(' ');
    const fullText = postText + (hashtagText ? `\n\n${hashtagText}` : '');
    await navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyHashtags = async () => {
    const hashtagText = hashtags.map((t) => `#${t}`).join(' ');
    await navigator.clipboard.writeText(hashtagText);
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const publicUrl = savedSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sns-post/${savedSlug}`
    : '';

  // Section header component
  const SectionHeader = ({
    title,
    step,
    sectionKey,
  }: {
    title: string;
    step: number;
    sectionKey: keyof typeof openSections;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full text-left py-2"
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
          {step}
        </span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {openSections[sectionKey] ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <>
      {/* Editor Header */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">SNS投稿メーカー</h1>
            {savedSlug && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                公開URL
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              disabled={!postText}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
            >
              {copiedText ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copiedText ? 'コピー済み' : 'テキストコピー'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
              mobileTab === 'editor'
                ? 'text-sky-600 border-b-2 border-sky-600'
                : 'text-gray-500'
            }`}
          >
            <PenLine className="w-4 h-4" />
            編集
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
              mobileTab === 'preview'
                ? 'text-sky-600 border-b-2 border-sky-600'
                : 'text-gray-500'
            }`}
          >
            <Eye className="w-4 h-4" />
            プレビュー
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Editor Panel */}
        <div
          className={`w-full lg:w-1/2 p-4 lg:p-6 space-y-4 pb-32 ${
            mobileTab !== 'editor' ? 'hidden lg:block' : ''
          }`}
        >
          {/* STEP 1: Platform */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4">
            <SectionHeader title="プラットフォーム選択" step={1} sectionKey="platform" />
            {openSections.platform && (
              <div className="mt-3">
                <PlatformTabs selected={platform} onChange={setPlatform} />
              </div>
            )}
          </div>

          {/* STEP 2: Tone */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4">
            <SectionHeader title="トーン選択" step={2} sectionKey="tone" />
            {openSections.tone && (
              <div className="mt-3">
                <ToneSelector selected={tone} onChange={setTone} />
              </div>
            )}
          </div>

          {/* STEP 3: Topic */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4">
            <SectionHeader title="トピック・キーワード" step={3} sectionKey="topic" />
            {openSections.topic && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="投稿のトピックやキーワードを入力してください（例: 新商品の告知、ブログ更新のお知らせ、業界トレンドについて）"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md min-h-[44px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AIで投稿を生成
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* STEP 4: Text Edit */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4">
            <SectionHeader title="投稿テキスト" step={4} sectionKey="text" />
            {openSections.text && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="投稿テキストを入力または生成してください"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-semibold ${getCharColor()}`}>
                    {charCount} / {charLimit}文字
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyText}
                      disabled={!postText}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                    >
                      {copiedText ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      コピー
                    </button>
                  </div>
                </div>
                {/* Character limit bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      charRatio > 1
                        ? 'bg-red-500'
                        : charRatio > 0.95
                        ? 'bg-red-400'
                        : charRatio > 0.8
                        ? 'bg-amber-400'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${Math.min(charRatio * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: Hashtags */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4">
            <SectionHeader title="ハッシュタグ" step={5} sectionKey="hashtags" />
            {openSections.hashtags && (
              <div className="mt-3 space-y-3">
                <HashtagEditor
                  hashtags={hashtags}
                  onChange={setHashtags}
                  limit={platformConfig.hashtagLimit}
                />
                {hashtags.length > 0 && (
                  <button
                    onClick={handleCopyHashtags}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {copiedHashtags ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedHashtags ? 'コピー済み' : 'ハッシュタグをコピー'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div
          className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] lg:overflow-y-auto bg-gray-100 lg:border-l border-gray-200 p-4 lg:p-6 ${
            mobileTab !== 'preview' ? 'hidden lg:block' : ''
          }`}
        >
          <div className="sticky top-0 pb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
              {platformConfig.label} プレビュー
            </h2>
            <PostPreview platform={platform} text={postText} hashtags={hashtags} />

            {/* Copy buttons in preview */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleCopyText}
                disabled={!postText}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    テキスト+ハッシュタグをコピー
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save button (sticky bottom) */}
      <div className="sticky bottom-4 z-30 px-4 lg:w-1/2">
        <div className="bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-6 pb-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !postText.trim()}
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {savedSlug ? '更新して保存' : '保存して公開'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Creation Complete Modal */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="SNS投稿メーカー"
        publicUrl={publicUrl}
        contentTitle={title || 'SNS投稿'}
        theme="blue"
      />
    </>
  );
}
