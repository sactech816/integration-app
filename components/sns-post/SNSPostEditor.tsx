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
  Share2,
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
import { usePoints } from '@/lib/hooks/usePoints';

type SNSPostEditorProps = {
  user: { id: string; email?: string } | null;
  editingPost?: SNSPost | null;
  setShowAuth: (show: boolean) => void;
};

export default function SNSPostEditor({ user, editingPost, setShowAuth }: SNSPostEditorProps) {
  const router = useRouter();
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: false });

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

    await consumeAndExecute('sns-post', 'save', async () => {
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
    });
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

  // SNS share helpers
  const getFullText = () => {
    const hashtagText = hashtags.map((t) => `#${t}`).join(' ');
    return postText + (hashtagText ? `\n\n${hashtagText}` : '');
  };

  const shareToX = () => {
    const text = getFullText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToThreads = () => {
    const text = getFullText();
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToLine = () => {
    const text = getFullText();
    window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    const text = getFullText();
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
  };

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

            {/* Share & Copy buttons in preview */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                SNSに投稿する
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* X (Twitter) */}
                <button
                  onClick={shareToX}
                  disabled={!postText}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Xで投稿
                </button>

                {/* Threads */}
                <button
                  onClick={shareToThreads}
                  disabled={!postText}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.083.717 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.282-1.6-1.643.077 2.033-.47 3.607-1.642 4.72-1.26 1.194-3.043 1.768-5.447 1.752-1.735-.011-3.196-.545-4.22-1.543-1.078-1.05-1.644-2.528-1.634-4.272.01-1.908.693-3.504 1.974-4.612 1.168-1.012 2.744-1.56 4.562-1.586 1.546-.022 2.924.32 4.094 1.013l-.85 1.873c-.866-.516-1.94-.791-3.196-.775-2.74.04-4.502 1.685-4.517 4.088-.007 1.176.362 2.124 1.07 2.743.67.588 1.63.892 2.776.9 1.786.013 3.088-.384 3.976-1.224.762-.722 1.155-1.737 1.183-3.056-.702-.365-1.532-.562-2.476-.575h-.076l.128-2.117h.052c1.248.014 2.39.218 3.395.601 1.37.52 2.416 1.37 3.025 2.46.815 1.46.896 4.048-1.136 6.037-1.805 1.768-4.016 2.545-7.164 2.566z" />
                  </svg>
                  Threadsで投稿
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  disabled={!postText}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebookで投稿
                </button>

                {/* LINE */}
                <button
                  onClick={shareToLine}
                  disabled={!postText}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#06C755] text-white rounded-xl font-semibold hover:bg-[#05B64C] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  LINEで共有
                </button>
              </div>

              {/* Copy button */}
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
