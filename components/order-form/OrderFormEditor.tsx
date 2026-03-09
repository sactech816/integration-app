'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, Loader2,
  Globe, CreditCard, Monitor, Pencil, ChevronDown, ChevronUp,
  Settings, ListPlus, CheckCircle, Trophy, Share2, Sparkles,
  Palette, Layout, Briefcase, PartyPopper, MousePointerClick,
  Send, Bell,
} from 'lucide-react';
import { ORDER_FORM_TEMPLATES, type OrderFormTemplate, type OrderFormCtaButton } from '@/constants/templates/order-form';
import {
  ORDER_FORM_COLORS, ORDER_FORM_COLOR_IDS,
  getOrderFormColor,
} from '@/constants/orderFormThemes';
import StripeConnectStatus from '@/components/order-form/StripeConnectStatus';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

interface Field {
  id?: string;
  fieldType: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[] | null;
}

interface CtaButtonSettings {
  text: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'full';
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation: 'none' | 'pulse' | 'shimmer' | 'bounce';
  size: 'md' | 'lg';
}

const DEFAULT_CTA: CtaButtonSettings = {
  text: '',
  bgColor: '#2563eb',
  textColor: '#ffffff',
  hoverBgColor: '',
  borderRadius: 'lg',
  shadow: 'lg',
  animation: 'none',
  size: 'md',
};

const BORDER_RADIUS_OPTIONS = [
  { value: 'sm', label: '角丸 小', preview: 'rounded-lg' },
  { value: 'md', label: '角丸 中', preview: 'rounded-xl' },
  { value: 'lg', label: '角丸 大', preview: 'rounded-2xl' },
  { value: 'full', label: 'ピル型', preview: 'rounded-full' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
  { value: 'xl', label: '特大' },
];

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'pulse', label: 'パルス' },
  { value: 'shimmer', label: 'シマー' },
  { value: 'bounce', label: 'バウンス' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'テキスト' },
  { value: 'email', label: 'メールアドレス' },
  { value: 'tel', label: '電話番号' },
  { value: 'number', label: '数値' },
  { value: 'textarea', label: '長文テキスト' },
  { value: 'select', label: 'セレクト（選択肢）' },
  { value: 'checkbox', label: 'チェックボックス' },
];

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#16a34a',
  '#0891b2', '#db2777', '#4f46e5', '#ca8a04', '#0d9488',
];

/* ── CTA Button Animations CSS ── */
function CtaAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes cta-shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .cta-shimmer {
        background-size: 200% auto;
        background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
        animation: cta-shimmer 2s ease-in-out infinite;
      }
      .cta-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      .cta-bounce {
        animation: bounce 1s infinite;
      }
    `}</style>
  );
}

/* ── 折りたたみセクション（色付き） ── */
function Section({ title, icon, defaultOpen = true, children, badge, borderColor = 'border-gray-200', headerBg = '' }: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  borderColor?: string;
  headerBg?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white border ${borderColor} rounded-xl overflow-hidden shadow-sm`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${headerBg}`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-bold text-gray-900">{title}</h2>
          {badge}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ── CTAボタンプレビュー ── */
function CtaButtonPreview({ cta, label }: { cta: CtaButtonSettings; label: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const radiusClass = cta.borderRadius === 'sm' ? 'rounded-lg' : cta.borderRadius === 'md' ? 'rounded-xl' : cta.borderRadius === 'lg' ? 'rounded-2xl' : 'rounded-full';
  const shadowClass = cta.shadow === 'none' ? '' : cta.shadow === 'sm' ? 'shadow-sm' : cta.shadow === 'md' ? 'shadow-md' : cta.shadow === 'lg' ? 'shadow-lg' : 'shadow-xl';
  const sizeClass = cta.size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base';
  const animClass = cta.animation === 'pulse' ? 'cta-pulse' : cta.animation === 'bounce' ? 'cta-bounce' : '';

  const defaultHoverColor = darkenColor(cta.bgColor, 15);
  const hoverBg = cta.hoverBgColor || defaultHoverColor;
  const currentBg = isHovered ? hoverBg : cta.bgColor;

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full font-bold min-h-[44px] transition-all cursor-pointer ${radiusClass} ${shadowClass} ${sizeClass} ${animClass}`}
        style={{ backgroundColor: currentBg, color: cta.textColor }}
      >
        {cta.animation === 'shimmer' && (
          <span className="absolute inset-0 cta-shimmer" style={{ borderRadius: 'inherit' }} />
        )}
        <span className="relative">{cta.text || label}</span>
      </button>
      <p className="text-xs text-gray-400 text-center mt-1">マウスオーバーで確認できます</p>
    </div>
  );
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/* ── フォームプレビュー ── */
function OrderFormPreview({ title, description, price, paymentType, fields, designLayout, designColor, ctaButton, titleColor, descriptionColor, descriptionSize }: {
  title: string; description: string; price: number; paymentType: string; fields: Field[];
  designLayout: string; designColor: string; ctaButton: CtaButtonSettings;
  titleColor?: string; descriptionColor?: string; descriptionSize?: string;
}) {
  const color = getOrderFormColor(designColor);
  const isBusiness = designLayout === 'business';
  const isEntertainment = designLayout === 'entertainment';
  const isFree = paymentType === 'free';
  const defaultText = isFree ? '申し込む' : `${price.toLocaleString()}円で申し込む`;
  const descSizeClass = descriptionSize === 'xs' ? 'text-xs' : descriptionSize === 'base' ? 'text-base' : descriptionSize === 'lg' ? 'text-lg' : 'text-sm';

  const radiusClass = ctaButton.borderRadius === 'sm' ? 'rounded-lg' : ctaButton.borderRadius === 'md' ? 'rounded-xl' : ctaButton.borderRadius === 'lg' ? 'rounded-2xl' : 'rounded-full';
  const shadowClass = ctaButton.shadow === 'none' ? '' : ctaButton.shadow === 'sm' ? 'shadow-sm' : ctaButton.shadow === 'md' ? 'shadow-md' : ctaButton.shadow === 'lg' ? 'shadow-lg' : 'shadow-xl';
  const sizeClass = ctaButton.size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base';
  const animClass = ctaButton.animation === 'pulse' ? 'cta-pulse' : ctaButton.animation === 'bounce' ? 'cta-bounce' : '';

  return (
    <div className="min-h-[500px] p-6" style={{ background: color.background }}>
      <div
        className={`mx-auto overflow-hidden ${isBusiness ? 'rounded-lg' : isEntertainment ? 'rounded-3xl' : 'rounded-2xl'}`}
        style={{ backgroundColor: color.cardBg, border: color.cardBorder, maxWidth: '440px' }}
      >
        {isBusiness && (
          <div className="px-6 py-5" style={{ background: color.headerBg }}>
            <h2 className="text-lg font-bold" style={{ color: titleColor || color.headerText }}>
              {title || 'タイトルを入力してください'}
            </h2>
            {description && <p className={`${descSizeClass} mt-1 opacity-90 whitespace-pre-line`} style={{ color: descriptionColor || color.headerText }}>{description}</p>}
          </div>
        )}
        {isEntertainment && (
          <div className="px-6 py-6 text-center" style={{ background: color.headerBg }}>
            <h2 className="text-xl font-black tracking-wide" style={{ color: titleColor || color.headerText }}>
              {title || 'タイトルを入力してください'}
            </h2>
            {description && <p className={`${descSizeClass} mt-2 opacity-90 whitespace-pre-line`} style={{ color: descriptionColor || color.headerText }}>{description}</p>}
            {paymentType !== 'free' && price > 0 && (
              <div className="inline-flex items-center gap-1 mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: color.headerText }}>
                <CreditCard className="w-4 h-4" />
                {price.toLocaleString()}円
              </div>
            )}
          </div>
        )}

        <div className={`space-y-5 ${isBusiness ? 'px-6 py-5' : isEntertainment ? 'px-6 py-6' : 'p-6'}`}>
          {designLayout === 'standard' && (
            <>
              <h2 className="text-xl font-bold" style={{ color: title ? (titleColor || color.textPrimary) : '#d1d5db' }}>
                {title || 'タイトルを入力してください'}
              </h2>
              {description && <p className={`${descSizeClass} whitespace-pre-line`} style={{ color: descriptionColor || color.textSecondary }}>{description}</p>}
            </>
          )}

          {(designLayout === 'standard' || isBusiness) && paymentType !== 'free' && price > 0 && (
            <div className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full"
              style={{ backgroundColor: color.badgeBg, color: color.badgeText }}>
              <CreditCard className="w-4 h-4" />
              {price.toLocaleString()}円
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold mb-1" style={{ color: color.textPrimary }}>
                  {field.label || '(ラベル未設定)'}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.fieldType === 'textarea' ? (
                  <div className="w-full h-20 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, color: '#9ca3af' }}>
                    {field.placeholder}
                  </div>
                ) : field.fieldType === 'select' ? (
                  <select disabled className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, color: '#9ca3af' }}>
                    <option>{field.placeholder || '選択してください'}</option>
                    {(field.options || []).map((o, j) => <option key={j}>{o}</option>)}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4 rounded" style={{ accentColor: color.accentColor }} />
                    <span className="text-sm" style={{ color: color.textSecondary }}>{field.label || 'チェックボックス'}</span>
                  </label>
                ) : (
                  <input type="text" disabled placeholder={field.placeholder} className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-400"
                    style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, color: '#9ca3af' }} />
                )}
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <p className="text-center py-8" style={{ color: '#d1d5db' }}>フィールドを追加すると、ここにプレビューが表示されます</p>
          )}

          {/* CTA Button with custom settings */}
          <div className="relative">
            <button disabled className={`w-full font-bold min-h-[44px] transition-all ${radiusClass} ${shadowClass} ${sizeClass} ${animClass}`}
              style={{ backgroundColor: ctaButton.bgColor, color: ctaButton.textColor }}>
              {ctaButton.animation === 'shimmer' && (
                <span className="absolute inset-0 cta-shimmer" style={{ borderRadius: 'inherit' }} />
              )}
              <span className="relative inline-flex items-center gap-2">
                {isFree ? <Settings className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                {ctaButton.text || defaultText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── メインエディタ ── */
export default function OrderFormEditor({ formId }: { formId?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // 完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [savedFormId, setSavedFormId] = useState<string | null>(formId || null);
  const [urlCopied, setUrlCopied] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [paymentType, setPaymentType] = useState<'free' | 'one_time' | 'subscription'>('free');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | ''>('stripe');
  const [stripePriceId, setStripePriceId] = useState('');
  const [successMessage, setSuccessMessage] = useState('お申し込みありがとうございます。');
  const [status, setStatus] = useState('draft');
  const [slug, setSlug] = useState('');

  // メール設定
  const [replyEmailEnabled, setReplyEmailEnabled] = useState(true);
  const [replyEmailSubject, setReplyEmailSubject] = useState('お申し込みありがとうございます');
  const [replyEmailBody, setReplyEmailBody] = useState('');
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [notifyEmails, setNotifyEmails] = useState('');
  const [notifyEmailSubject, setNotifyEmailSubject] = useState('');
  const [notifyEmailBody, setNotifyEmailBody] = useState('');
  const [emailFooterName, setEmailFooterName] = useState('');
  const [paymentEmailEnabled, setPaymentEmailEnabled] = useState(true);
  const [paymentEmailSubject, setPaymentEmailSubject] = useState('決済が完了しました');
  const [paymentEmailBody, setPaymentEmailBody] = useState('');

  // デザイン設定
  const [designLayout, setDesignLayout] = useState('standard');
  const [designColor, setDesignColor] = useState('emerald');

  // テキストスタイル設定
  const [titleColor, setTitleColor] = useState('');
  const [descriptionColor, setDescriptionColor] = useState('');
  const [descriptionSize, setDescriptionSize] = useState<'xs' | 'sm' | 'base' | 'lg'>('sm');

  // CTAボタン設定
  const [ctaButton, setCtaButton] = useState<CtaButtonSettings>({ ...DEFAULT_CTA });
  const updateCta = (updates: Partial<CtaButtonSettings>) => setCtaButton(prev => ({ ...prev, ...updates }));

  const [fields, setFields] = useState<Field[]>([
    { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
    { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
  ]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        if (formId) await fetchForm(user.id, formId);
      }
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchForm = async (uid: string, fId?: string) => {
    const targetId = fId || savedFormId;
    if (!targetId) return;
    const res = await fetch(`/api/order-form/${targetId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const f = data.form;
      setTitle(f.title); setDescription(f.description || '');
      setPrice(f.price || 0); setPaymentType(f.payment_type || 'free');
      setPaymentProvider('stripe'); setStripePriceId(f.stripe_price_id || '');
      setSuccessMessage(f.success_message || ''); setStatus(f.status); setSlug(f.slug);
      if (f.reply_email_enabled !== undefined) setReplyEmailEnabled(f.reply_email_enabled);
      if (f.reply_email_subject) setReplyEmailSubject(f.reply_email_subject);
      if (f.reply_email_body !== undefined) setReplyEmailBody(f.reply_email_body || '');
      if (f.notify_owner !== undefined) setNotifyOwner(f.notify_owner);
      if (f.notify_emails) setNotifyEmails(f.notify_emails);
      if (f.notify_email_subject) setNotifyEmailSubject(f.notify_email_subject);
      if (f.notify_email_body) setNotifyEmailBody(f.notify_email_body);
      if (f.email_footer_name !== undefined) setEmailFooterName(f.email_footer_name || '');
      if (f.payment_email_enabled !== undefined) setPaymentEmailEnabled(f.payment_email_enabled);
      if (f.payment_email_subject) setPaymentEmailSubject(f.payment_email_subject);
      if (f.payment_email_body !== undefined) setPaymentEmailBody(f.payment_email_body || '');
      if (f.design_layout) setDesignLayout(f.design_layout);
      if (f.design_color) setDesignColor(f.design_color);
      if (f.cta_button) {
        setCtaButton({ ...DEFAULT_CTA, ...f.cta_button });
      }
      if (f.title_color) setTitleColor(f.title_color);
      if (f.description_color) setDescriptionColor(f.description_color);
      if (f.description_size) setDescriptionSize(f.description_size);
      if (f.order_form_fields?.length > 0) {
        setFields(f.order_form_fields.map((field: any) => ({
          id: field.id, fieldType: field.field_type, label: field.label,
          placeholder: field.placeholder || '', required: field.required, options: field.options,
        })));
      }
    }
  };

  const handleApplyTemplate = (template: OrderFormTemplate) => {
    if (!confirm(`「${template.name}」テンプレートを適用しますか？`)) return;
    setTitle(template.title);
    setDescription(template.formDescription);
    setPaymentType(template.paymentType);
    setPrice(template.price);
    setSuccessMessage(template.successMessage);
    setReplyEmailSubject(template.replyEmailSubject);
    setFields(template.fields.map(f => ({ ...f })));
    if (template.ctaButton) {
      setCtaButton({ ...DEFAULT_CTA, ...template.ctaButton });
    }
  };

  const addField = () => setFields([...fields, { fieldType: 'text', label: '', placeholder: '', required: false, options: null }]);
  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  const updateField = (index: number, updates: Partial<Field>) => setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const t = direction === 'up' ? index - 1 : index + 1;
    if (t < 0 || t >= newFields.length) return;
    [newFields[index], newFields[t]] = [newFields[t], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async (publishStatus?: string) => {
    if (!userId || !title) return;
    if (paymentType !== 'free' && !stripePriceId && price > 0 && price < 50) {
      alert('Stripeの最低決済金額は50円です。50円以上を設定してください。');
      return;
    }
    setSaving(true);
    const body = {
      userId, title, description, price: paymentType === 'free' ? 0 : price,
      paymentType, paymentProvider: paymentType !== 'free' ? paymentProvider : null,
      stripePriceId: paymentProvider === 'stripe' ? stripePriceId : null,
      successMessage, status: publishStatus || status,
      replyEmailEnabled, replyEmailSubject, replyEmailBody,
      notifyOwner, notifyEmails, notifyEmailSubject, notifyEmailBody,
      emailFooterName,
      paymentEmailEnabled, paymentEmailSubject, paymentEmailBody,
      designLayout, designColor,
      titleColor, descriptionColor, descriptionSize,
      ctaButton,
      fields: fields.map((f) => ({
        field_type: f.fieldType, label: f.label, placeholder: f.placeholder,
        required: f.required, options: f.fieldType === 'select' ? f.options : null,
      })),
    };
    try {
      if (savedFormId) {
        const res = await fetch(`/api/order-form/${savedFormId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          if (publishStatus) setStatus(publishStatus);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(`保存に失敗しました: ${err.error || res.statusText}`);
        }
      } else {
        const res = await fetch('/api/order-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const data = await res.json();
          setCreatedSlug(data.form.slug);
          setSlug(data.form.slug);
          setSavedFormId(data.form.id);
          setStatus('published');
          setShowCompleteModal(true);
          window.history.replaceState(null, '', `/order-form/editor/${data.form.id}`);
        } else {
          const err = await res.json().catch(() => ({}));
          alert(`保存に失敗しました: ${err.error || res.statusText}`);
        }
      }
    } catch (e) {
      alert('保存中にエラーが発生しました。ネットワーク接続を確認してください。');
      console.error('[OrderFormEditor] Save error:', e);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/order-form/${slug}` : '';
  const completeUrl = createdSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/order-form/${createdSlug}` : publicUrl;

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const isFreeForm = paymentType === 'free';
  const defaultCtaText = isFreeForm ? '申し込む' : `${price.toLocaleString()}円で申し込む`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CtaAnimationStyles />
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="申し込みフォーム"
        publicUrl={completeUrl}
        contentTitle={`${title}の申し込みフォーム`}
        theme="emerald"
      />

      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard?view=order-form')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{savedFormId ? 'フォーム編集' : '新しいフォーム'}</h1>
          {slug && status === 'published' && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
              <Globe className="w-3 h-3" />公開中
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />保存しました
            </span>
          )}
          {urlCopied && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />URLコピー済み
            </span>
          )}
          {savedFormId && (
            <button onClick={() => setShowCompleteModal(true)} className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-emerald-700 hover:to-teal-700 whitespace-nowrap transition-all shadow-md text-sm sm:text-base min-h-[44px]">
              <Trophy className="w-4 h-4" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {slug && (
            <button onClick={handleCopyUrl} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 whitespace-nowrap text-sm sm:text-base min-h-[44px]">
              <Share2 className="w-4 h-4" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button onClick={() => handleSave()} disabled={saving || !title} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} <span className="hidden sm:inline">{saving ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[121px] z-30">
        <button onClick={() => setMobileTab('editor')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${mobileTab === 'editor' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-700'}`}>
          <Pencil className="w-4 h-4" />編集
        </button>
        <button onClick={() => setMobileTab('preview')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${mobileTab === 'preview' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-700'}`}>
          <Monitor className="w-4 h-4" />プレビュー
        </button>
      </div>

      {/* 左右パネル */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: 編集 */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-4">
            {/* テンプレート選択 */}
            {!formId && (
              <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </span>
                    <h2 className="font-bold text-gray-900">テンプレートから作成</h2>
                  </div>
                </div>
                <div className="px-5 pb-5 border-t border-emerald-100">
                  <p className="text-sm text-gray-600 mt-4 mb-3">
                    テンプレートを選択すると、タイトル・フィールド・決済タイプなどが自動で設定されます。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ORDER_FORM_TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleApplyTemplate(template)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-all text-left group ${template.bg}`}
                        >
                          <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">
                            <Icon size={20} className={template.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">{template.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-400">{template.fields.length}項目</span>
                              {template.paymentType === 'free' && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">無料</span>
                              )}
                              {template.paymentType === 'one_time' && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">{template.price.toLocaleString()}円</span>
                              )}
                              {template.paymentType === 'subscription' && (
                                <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-semibold">月額</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── 基本設定 ── */}
            <Section
              title="基本設定"
              icon={<span className="bg-emerald-50 p-1.5 rounded-lg"><Settings className="w-4 h-4 text-emerald-600" /></span>}
              borderColor="border-emerald-200"
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: セミナー申し込みフォーム" className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-emerald-50/30" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">タイトル文字色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={titleColor || '#111827'} onChange={(e) => setTitleColor(e.target.value)} className="w-10 h-10 rounded-lg border border-emerald-200 cursor-pointer" />
                    <span className="text-xs text-gray-500">{titleColor || 'テーマ色（デフォルト）'}</span>
                    {titleColor && (
                      <button type="button" onClick={() => setTitleColor('')} className="text-xs text-gray-400 hover:text-gray-600 underline">リセット</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">説明（任意）</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="フォームの説明文（改行可）" rows={3} className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-emerald-50/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">説明文の文字色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={descriptionColor || '#6b7280'} onChange={(e) => setDescriptionColor(e.target.value)} className="w-10 h-10 rounded-lg border border-emerald-200 cursor-pointer" />
                      {descriptionColor && (
                        <button type="button" onClick={() => setDescriptionColor('')} className="text-xs text-gray-400 hover:text-gray-600 underline">リセット</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">説明文の大きさ</label>
                    <select value={descriptionSize} onChange={(e) => setDescriptionSize(e.target.value as 'xs' | 'sm' | 'base' | 'lg')} className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 bg-emerald-50/30">
                      <option value="xs">小さい</option>
                      <option value="sm">標準</option>
                      <option value="base">やや大きい</option>
                      <option value="lg">大きい</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">完了メッセージ</label>
                  <input type="text" value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-emerald-50/30" />
                </div>
                {savedFormId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">公開状態</label>
                    <button
                      onClick={() => handleSave(status === 'published' ? 'draft' : 'published')}
                      disabled={saving}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] transition-all shadow-sm ${
                        status === 'published'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      {status === 'published' ? '公開中' : '非公開（下書き）'}
                    </button>
                  </div>
                )}
              </div>
            </Section>

            {/* ── デザイン設定 ── */}
            <Section
              title="デザイン設定"
              icon={<span className="bg-pink-50 p-1.5 rounded-lg"><Palette className="w-4 h-4 text-pink-600" /></span>}
              borderColor="border-pink-200"
              defaultOpen={false}
            >
              <div className="space-y-5 pt-4">
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">レイアウト</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', name: 'スタンダード', icon: Layout, desc: 'シンプル' },
                      { id: 'business', name: 'ビジネス', icon: Briefcase, desc: '企業・法人向け' },
                      { id: 'entertainment', name: 'エンタメ', icon: PartyPopper, desc: 'イベント向け' },
                    ].map(l => {
                      const Icon = l.icon;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setDesignLayout(l.id)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${designLayout === l.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${designLayout === l.id ? 'text-pink-600' : 'text-gray-400'}`} />
                          <p className="font-bold text-xs text-gray-900">{l.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{l.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">カラーテーマ</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ORDER_FORM_COLOR_IDS.map(cid => {
                      const c = ORDER_FORM_COLORS[cid];
                      return (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => setDesignColor(cid)}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all ${designColor === cid ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-inner" style={{ backgroundColor: c.swatch }} />
                            <span className="font-bold text-xs text-gray-900 truncate">{c.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Section>

            {/* ── フォームフィールド ── */}
            <Section
              title="フォームフィールド"
              icon={<span className="bg-blue-50 p-1.5 rounded-lg"><ListPlus className="w-4 h-4 text-blue-600" /></span>}
              borderColor="border-blue-200"
              badge={<span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{fields.length}</span>}
            >
              <div className="pt-4">
                <div className="flex justify-end mb-3">
                  <button onClick={addField} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors min-h-[44px] shadow-sm">
                    <Plus className="w-4 h-4" />フィールド追加
                  </button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, i) => (
                    <div key={i} className="border border-blue-100 rounded-xl p-3 bg-blue-50/30 hover:border-blue-300 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-0.5 mt-1">
                          <button onClick={() => moveField(i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                          <button onClick={() => moveField(i, 'down')} disabled={i === fields.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex-1 grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-blue-700 mb-1">タイプ</label>
                            <select value={field.fieldType} onChange={(e) => updateField(i, { fieldType: e.target.value })} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 text-sm bg-white">
                              {FIELD_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-blue-700 mb-1">ラベル</label>
                            <input type="text" value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="項目名" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-blue-700 mb-1">プレースホルダー</label>
                            <input type="text" value={field.placeholder} onChange={(e) => updateField(i, { placeholder: e.target.value })} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white" />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                              <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, { required: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                              <span className="text-sm text-gray-700">必須</span>
                            </label>
                          </div>
                          {field.fieldType === 'select' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-blue-700 mb-1">選択肢（カンマ区切り）</label>
                              <input type="text" value={(field.options || []).join(',')} onChange={(e) => updateField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="選択肢A, 選択肢B" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white" />
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeField(i)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-gray-400 text-center py-6 text-sm">「フィールド追加」ボタンで項目を追加してください</p>
                  )}
                </div>
              </div>
            </Section>

            {/* ── CTAボタン設定 ── */}
            <Section
              title="CTAボタン設定"
              icon={<span className="bg-orange-50 p-1.5 rounded-lg"><MousePointerClick className="w-4 h-4 text-orange-600" /></span>}
              borderColor="border-orange-200"
              defaultOpen={false}
            >
              <div className="space-y-5 pt-4">
                {/* プレビュー */}
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3 text-center">ボタンプレビュー</p>
                  <CtaButtonPreview cta={ctaButton} label={defaultCtaText} />
                </div>

                {/* テキスト */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ボタンテキスト</label>
                  <input
                    type="text"
                    value={ctaButton.text}
                    onChange={(e) => updateCta({ text: e.target.value })}
                    placeholder={defaultCtaText}
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 bg-orange-50/30 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">空欄の場合はデフォルトテキストが使用されます</p>
                </div>

                {/* 色設定 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">背景色</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateCta({ bgColor: c })}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${ctaButton.bgColor === c ? 'border-gray-900 scale-110' : 'border-gray-200 hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={ctaButton.bgColor}
                      onChange={(e) => updateCta({ bgColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-orange-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">テキスト色</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['#ffffff', '#000000', '#1f2937', '#f9fafb'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateCta({ textColor: c })}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${ctaButton.textColor === c ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={ctaButton.textColor}
                      onChange={(e) => updateCta({ textColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-orange-200"
                    />
                  </div>
                </div>

                {/* ホバー色 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">マウスオーバー時の背景色</label>
                  <p className="text-xs text-gray-500 mb-2">空欄の場合は背景色を少し暗くした色が使われます</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={ctaButton.hoverBgColor || ctaButton.bgColor}
                      onChange={(e) => updateCta({ hoverBgColor: e.target.value })}
                      className="w-16 h-10 rounded-lg cursor-pointer border border-orange-200"
                    />
                    <input
                      type="text"
                      value={ctaButton.hoverBgColor}
                      onChange={(e) => updateCta({ hoverBgColor: e.target.value })}
                      placeholder="自動（少し暗く）"
                      className="flex-1 px-4 py-2.5 border border-orange-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 bg-orange-50/30 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    {ctaButton.hoverBgColor && (
                      <button
                        type="button"
                        onClick={() => updateCta({ hoverBgColor: '' })}
                        className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded transition-colors"
                      >
                        リセット
                      </button>
                    )}
                  </div>
                </div>

                {/* 角丸 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">角丸</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BORDER_RADIUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCta({ borderRadius: opt.value as CtaButtonSettings['borderRadius'] })}
                        className={`p-2 text-center border-2 transition-all ${opt.preview} ${ctaButton.borderRadius === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className={`w-full h-6 bg-gray-300 mx-auto mb-1 ${opt.preview}`} />
                        <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 影 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">影</label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHADOW_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCta({ shadow: opt.value as CtaButtonSettings['shadow'] })}
                        className={`p-2 rounded-xl text-center border-2 transition-all ${ctaButton.shadow === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* アニメーション */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">アニメーション</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ANIMATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCta({ animation: opt.value as CtaButtonSettings['animation'] })}
                        className={`p-2 rounded-xl text-center border-2 transition-all ${ctaButton.animation === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* サイズ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">サイズ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'md', label: '標準' },
                      { value: 'lg', label: '大きい' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCta({ size: opt.value as CtaButtonSettings['size'] })}
                        className={`p-3 rounded-xl text-center border-2 transition-all ${ctaButton.size === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <p className="text-sm font-semibold text-gray-700">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* ── 決済設定 ── */}
            <Section
              title="決済設定"
              icon={<span className="bg-amber-50 p-1.5 rounded-lg"><CreditCard className="w-4 h-4 text-amber-600" /></span>}
              borderColor="border-amber-200"
              defaultOpen={paymentType !== 'free'}
              badge={paymentType !== 'free' ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                  {paymentType === 'one_time' ? '一回払い' : 'サブスク'}
                </span>
              ) : undefined}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">タイプ</label>
                  <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as 'free' | 'one_time' | 'subscription')} className="w-full px-4 py-3 border border-amber-200 rounded-xl text-gray-900 bg-amber-50/30">
                    <option value="free">無料（決済なし）</option>
                    <option value="one_time">一回払い</option>
                    <option value="subscription">サブスクリプション</option>
                  </select>
                </div>
                {paymentType !== 'free' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">金額（円）</label>
                      <input type="number" value={price || ''} onChange={(e) => setPrice(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)} min={50} placeholder="50" className="w-full px-4 py-3 border border-amber-200 rounded-xl text-gray-900 placeholder:text-gray-400 bg-amber-50/30" />
                      {price > 0 && price < 50 && (
                        <p className="text-xs text-red-500 mt-1">Stripeの最低金額は50円です</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Stripe Price ID（任意）</label>
                      <input type="text" value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_xxx" className="w-full px-4 py-3 border border-amber-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 bg-amber-50/30" />
                      <p className="text-xs text-gray-500 mt-1">空欄の場合は金額から自動生成します</p>
                    </div>
                    {paymentType === 'subscription' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-800 font-semibold">サブスクリプションにはStripe Price IDが必須です。</p>
                        <p className="text-xs text-amber-700 mt-1">Stripeダッシュボードで定期課金用のPrice IDを作成し、上のフィールドに入力してください。</p>
                      </div>
                    )}
                  </>
                )}
                {/* Stripe Connect状態 - 決済タイプに関係なく常に表示 */}
                {userId && <StripeConnectStatus userId={userId} />}
              </div>
            </Section>

            {/* ── 申込者への自動返信メール ── */}
            <Section
              title="申込者への自動返信メール"
              icon={<span className="bg-purple-50 p-1.5 rounded-lg"><Send className="w-4 h-4 text-purple-600" /></span>}
              borderColor="border-purple-200"
              defaultOpen={false}
            >
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={replyEmailEnabled} onChange={(e) => setReplyEmailEnabled(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm font-semibold text-gray-700">自動返信メールを送る</span>
                </label>
                {replyEmailEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">件名</label>
                      <input type="text" value={replyEmailSubject} onChange={(e) => setReplyEmailSubject(e.target.value)} placeholder="お申し込みありがとうございます" className="w-full px-4 py-3 border border-purple-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-purple-50/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">本文（任意）</label>
                      <textarea value={replyEmailBody} onChange={(e) => setReplyEmailBody(e.target.value)} placeholder={`空欄の場合はデフォルトの確認メールが送信されます。\n\n{name} = 申し込み者名\n{email} = メールアドレス\n{form_title} = フォームタイトル`} rows={5} className="w-full px-4 py-3 border border-purple-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-purple-50/30" />
                      <p className="text-xs text-gray-500 mt-1">変数: {'{name}'}, {'{email}'}, {'{form_title}'} が使えます</p>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* ── 作成者への通知メール ── */}
            <Section
              title="作成者への通知メール"
              icon={<span className="bg-teal-50 p-1.5 rounded-lg"><Bell className="w-4 h-4 text-teal-600" /></span>}
              borderColor="border-teal-200"
              defaultOpen={false}
            >
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={notifyOwner} onChange={(e) => setNotifyOwner(e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                  <span className="text-sm font-semibold text-gray-700">申し込み通知メールを受け取る</span>
                </label>
                {notifyOwner && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">通知先メールアドレス（任意）</label>
                      <input type="text" value={notifyEmails} onChange={(e) => setNotifyEmails(e.target.value)} placeholder="空欄の場合はログイン中のメールアドレスに送信されます" className="w-full px-4 py-3 border border-teal-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-teal-50/30" />
                      <p className="text-xs text-gray-500 mt-1">複数の場合はカンマ区切り（例: a@example.com, b@example.com）</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">通知メール件名（任意）</label>
                      <input type="text" value={notifyEmailSubject} onChange={(e) => setNotifyEmailSubject(e.target.value)} placeholder="空欄: 「新しい申し込みがありました」" className="w-full px-4 py-3 border border-teal-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-teal-50/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">通知メール本文（任意）</label>
                      <textarea value={notifyEmailBody} onChange={(e) => setNotifyEmailBody(e.target.value)} placeholder={`空欄の場合は申込内容のサマリーが自動送信されます。\n\n{name} = 申し込み者名\n{email} = メールアドレス\n{form_title} = フォームタイトル\n{fields} = 全入力内容`} rows={5} className="w-full px-4 py-3 border border-teal-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-teal-50/30" />
                      <p className="text-xs text-gray-500 mt-1">変数: {'{name}'}, {'{email}'}, {'{form_title}'}, {'{fields}'} が使えます</p>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* ── 決済完了メール ── */}
            <Section
              title="決済完了メール"
              icon={<span className="bg-emerald-50 p-1.5 rounded-lg"><CheckCircle className="w-4 h-4 text-emerald-600" /></span>}
              borderColor="border-emerald-200"
              defaultOpen={false}
            >
              <div className="space-y-4 pt-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs text-emerald-800">決済が完了した際に申し込み者へ自動送信されるメールです。無料フォームでは送信されません。</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={paymentEmailEnabled} onChange={(e) => setPaymentEmailEnabled(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-sm font-semibold text-gray-700">決済完了メールを送る</span>
                </label>
                {paymentEmailEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">件名</label>
                      <input type="text" value={paymentEmailSubject} onChange={(e) => setPaymentEmailSubject(e.target.value)} placeholder="決済が完了しました" className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-emerald-50/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">本文（任意）</label>
                      <textarea value={paymentEmailBody} onChange={(e) => setPaymentEmailBody(e.target.value)} placeholder={`空欄の場合はデフォルトの決済完了メールが送信されます。\n\n{name} = 申し込み者名\n{email} = メールアドレス\n{form_title} = フォームタイトル\n{amount} = 決済金額`} rows={5} className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-emerald-50/30" />
                      <p className="text-xs text-gray-500 mt-1">変数: {'{name}'}, {'{email}'}, {'{form_title}'}, {'{amount}'} が使えます</p>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* ── メールフッター設定 ── */}
            <Section
              title="メールフッター設定"
              icon={<span className="bg-gray-100 p-1.5 rounded-lg"><Settings className="w-4 h-4 text-gray-600" /></span>}
              borderColor="border-gray-200"
              defaultOpen={false}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">フッター表示名</label>
                  <input type="text" value={emailFooterName} onChange={(e) => setEmailFooterName(e.target.value)} placeholder="集客メーカー（空欄の場合は「集客メーカー」）" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p className="text-xs text-gray-500 mt-1">すべてのメールの最下部に表示される名前です</p>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[138px] lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium">フォームプレビュー</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              <OrderFormPreview title={title} description={description} price={price} paymentType={paymentType} fields={fields} designLayout={designLayout} designColor={designColor} ctaButton={ctaButton} titleColor={titleColor} descriptionColor={descriptionColor} descriptionSize={descriptionSize} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>
    </div>
  );
}
