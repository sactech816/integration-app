'use client';

import { useState, useEffect } from 'react';
import { FileText, CreditCard, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { getOrderFormColor } from '@/constants/orderFormThemes';
import { ViewTracker, trackCompletion } from '@/components/shared/ViewTracker';
import { PREFECTURES } from '@/constants/prefectures';

interface Field {
  id: string;
  field_type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: any;
}

interface CtaButtonSettings {
  text?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'pulse' | 'shimmer' | 'bounce';
  size?: 'md' | 'lg';
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface FormData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  payment_type: string;
  payment_provider: string | null;
  success_message: string;
  design_layout?: string;
  design_color?: string;
  cta_button?: CtaButtonSettings | null;
  title_color?: string | null;
  description_color?: string | null;
  description_size?: string | null;
  order_form_fields: Field[];
}

function getCtaClasses(cta: CtaButtonSettings) {
  const radius = cta.borderRadius === 'sm' ? 'rounded-lg' : cta.borderRadius === 'md' ? 'rounded-xl' : cta.borderRadius === 'lg' ? 'rounded-2xl' : cta.borderRadius === 'full' ? 'rounded-full' : 'rounded-xl';
  const shadow = cta.shadow === 'sm' ? 'shadow-sm' : cta.shadow === 'md' ? 'shadow-md' : cta.shadow === 'lg' ? 'shadow-lg' : cta.shadow === 'xl' ? 'shadow-xl' : '';
  const size = cta.size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base';
  const anim = cta.animation === 'pulse' ? 'cta-pulse' : cta.animation === 'bounce' ? 'cta-bounce' : '';
  return { radius, shadow, size, anim, hasShimmer: cta.animation === 'shimmer' };
}

export default function OrderFormViewer({ slug }: { slug: string }) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [ctaHovered, setCtaHovered] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    const res = await fetch(`/api/order-form/${slug}?public=true`);
    if (res.ok) {
      const data = await res.json();
      setForm(data.form);
      const initial: Record<string, string | boolean> = {};
      data.form.order_form_fields?.forEach((f: Field) => {
        if (f.field_type === 'section_header') return;
        if (f.field_type === 'checkbox' || f.field_type === 'privacy_policy') {
          initial[f.id] = false;
        } else if (f.field_type === 'name_split') {
          initial[f.id + '_sei'] = '';
          initial[f.id + '_mei'] = '';
        } else if (f.field_type === 'address') {
          initial[f.id + '_zip'] = '';
          initial[f.id + '_pref'] = '';
          initial[f.id + '_city'] = '';
          initial[f.id + '_building'] = '';
        } else {
          initial[f.id] = '';
        }
      });
      setFieldValues(initial);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);
    setError('');

    const fieldsData: Record<string, any> = {};
    let email = '';
    let name = '';

    form.order_form_fields.forEach((f) => {
      if (f.field_type === 'section_header') return;
      let value: any;
      if (f.field_type === 'name_split') {
        const sei = (fieldValues[f.id + '_sei'] as string) || '';
        const mei = (fieldValues[f.id + '_mei'] as string) || '';
        value = `${sei} ${mei}`.trim();
      } else if (f.field_type === 'address') {
        const zip = (fieldValues[f.id + '_zip'] as string) || '';
        const pref = (fieldValues[f.id + '_pref'] as string) || '';
        const city = (fieldValues[f.id + '_city'] as string) || '';
        const building = (fieldValues[f.id + '_building'] as string) || '';
        value = `〒${zip} ${pref} ${city} ${building}`.trim();
      } else if (f.field_type === 'privacy_policy') {
        value = fieldValues[f.id] ? '同意済み' : '';
      } else {
        value = fieldValues[f.id];
      }
      fieldsData[f.label] = value;
      if (f.field_type === 'email') email = value as string;
      if (f.field_type === 'name_split' || f.label.includes('名前') || f.label.includes('Name') || f.label === 'お名前') {
        name = value as string;
      }
    });

    if (!email) {
      setError('メールアドレスを入力してください');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/order-form/${form.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, fieldsData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '送信に失敗しました');
        setSubmitting(false);
        return;
      }

      const result = await res.json();

      if (result.requiresPayment) {
        if (result.paymentProvider === 'stripe') {
          const checkoutRes = await fetch(`/api/order-form/${form.id}/stripe-checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: result.submission.id, email }),
          });
          if (checkoutRes.ok) {
            const checkoutData = await checkoutRes.json();
            window.location.href = checkoutData.url;
            return;
          }
          const errData = await checkoutRes.json().catch(() => ({}));
          setError(errData.error || '決済セッションの作成に失敗しました');
          setSubmitting(false);
          return;
        }
        setError('決済セッションの作成に失敗しました');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      trackCompletion(slug, 'order-form');
    } catch {
      setError('送信中にエラーが発生しました。ネットワーク接続を確認してください。');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">フォームが見つかりません</h2>
          <p className="text-gray-600">このフォームは公開されていないか、存在しません。</p>
        </div>
      </div>
    );
  }

  const color = getOrderFormColor(form.design_color);
  const layout = form.design_layout || 'standard';
  const isBusiness = layout === 'business';
  const isPremium = layout === 'premium' || layout === 'entertainment';
  const isFree = form.payment_type === 'free' || form.price === 0;
  const descSizeClass = form.description_size === 'xs' ? 'text-xs' : form.description_size === 'base' ? 'text-base' : form.description_size === 'lg' ? 'text-lg' : 'text-sm';

  // CTA button settings (fallback to theme defaults)
  const cta = form.cta_button || {};
  const ctaBgColor = cta.bgColor || color.buttonBg;
  const ctaTextColor = cta.textColor || color.buttonText;
  const ctaHoverBgColor = cta.hoverBgColor || darkenColor(ctaBgColor, 15);
  const ctaText = cta.text || (isFree ? '申し込む' : `${form.price.toLocaleString()}円で申し込む`);
  const { radius, shadow, size, anim, hasShimmer } = getCtaClasses(cta);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: color.background }}>
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ backgroundColor: color.cardBg, border: color.cardBorder }}>
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: color.accentColor }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: color.textPrimary }}>お申し込み完了</h2>
          <p style={{ color: color.textSecondary }}>{form.success_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: color.background }}>
      <ViewTracker
        contentId={slug}
        contentType="order-form"
        trackScroll={false}
      />
      {/* CTA animation styles */}
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
        .cta-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .cta-bounce { animation: bounce 1s infinite; }
      `}</style>

      <div className={`${isPremium ? 'max-w-2xl' : 'max-w-lg'} mx-auto`}>
        {isPremium ? (
          /* ── Premium Layout ── */
          <div
            className="rounded-xl shadow-xl overflow-hidden"
            style={{ backgroundColor: color.cardBg, border: color.cardBorder }}
          >
            {/* Premium Header with gradient + pattern overlay */}
            <div
              className="relative px-8 py-8 text-center"
              style={{ background: `linear-gradient(135deg, ${color.headerBg}, ${darkenColor(color.headerBg, 15)})` }}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,1) 10px, rgba(255,255,255,1) 11px)' }}
              />
              <div className="relative">
                <h1 className="text-2xl font-black tracking-widest" style={{ color: form.title_color || color.headerText }}>{form.title}</h1>
                {form.description && (
                  <p className={`${descSizeClass} mt-3 opacity-80 whitespace-pre-line`} style={{ color: form.description_color || color.headerText }}>{form.description}</p>
                )}
                {!isFree && (
                  <div className="inline-flex items-center gap-1 mt-4 px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: color.headerText }}>
                    <CreditCard className="w-4 h-4" />
                    {form.price.toLocaleString()}円
                  </div>
                )}
              </div>
            </div>
            {/* Accent line */}
            <div style={{ height: '4px', background: color.accentColor }} />

            {/* Premium Form Body - table-like rows */}
            <form onSubmit={handleSubmit}>
              <div className="divide-y" style={{ borderColor: color.inputBorder }}>
                {form.order_form_fields.map((field) => {
                  const opts = Array.isArray(field.options) ? field.options : [];
                  const policyText = (!Array.isArray(field.options) && field.options?.policyText) || '';

                  if (field.field_type === 'section_header') {
                    return (
                      <div key={field.id} className="flex items-center gap-4 px-6 py-3" style={{ backgroundColor: `${color.accentColor}12` }}>
                        <div className="flex-1 h-px" style={{ backgroundColor: `${color.accentColor}40` }} />
                        <h3 className="font-bold text-sm tracking-wide whitespace-nowrap" style={{ color: color.accentColor }}>{field.label}</h3>
                        <div className="flex-1 h-px" style={{ backgroundColor: `${color.accentColor}40` }} />
                      </div>
                    );
                  }

                  if (field.field_type === 'privacy_policy') {
                    return (
                      <div key={field.id} className="px-6 py-5">
                        <p className="text-sm font-semibold mb-2" style={{ color: color.textPrimary }}>
                          {field.label || '個人情報の取り扱いについて'}
                        </p>
                        {policyText && (
                          <div className="max-h-48 overflow-y-auto px-4 py-3 rounded-lg text-xs mb-3 whitespace-pre-wrap"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, color: color.textSecondary }}>
                            {policyText}
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                          <input
                            type="checkbox"
                            required
                            checked={fieldValues[field.id] as boolean || false}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.checked })}
                            className="w-5 h-5 rounded"
                            style={{ accentColor: color.accentColor }}
                          />
                          <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>
                            上記に同意する <span className="text-red-500">*</span>
                          </span>
                        </label>
                      </div>
                    );
                  }

                  if (field.field_type === 'checkbox') {
                    return (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
                        <div className="px-5 py-4 flex items-center" style={{ backgroundColor: color.badgeBg }}>
                          <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>{field.label}</span>
                        </div>
                        <div className="px-5 py-4 flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                            <input
                              type="checkbox"
                              required={field.required}
                              checked={fieldValues[field.id] as boolean || false}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.checked })}
                              className="w-5 h-5 rounded"
                              style={{ accentColor: color.accentColor }}
                            />
                            <span className="text-sm" style={{ color: color.textSecondary }}>{field.placeholder || field.label}</span>
                          </label>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
                      {/* Label cell */}
                      <div className="px-5 py-4 flex items-start gap-1" style={{ backgroundColor: color.badgeBg }}>
                        <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>{field.label}</span>
                        {field.required && <span className="text-red-500 text-xs font-bold mt-0.5">*</span>}
                      </div>
                      {/* Input cell */}
                      <div className="px-5 py-4">
                        {field.field_type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            placeholder={field.placeholder}
                            value={fieldValues[field.id] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          />
                        ) : field.field_type === 'select' ? (
                          <select
                            required={field.required}
                            value={fieldValues[field.id] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          >
                            <option value="">選択してください</option>
                            {opts.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.field_type === 'radio' ? (
                          <div className="flex flex-wrap gap-3">
                            {opts.map((opt: string) => (
                              <label key={opt} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer min-h-[44px] transition-all"
                                style={{ backgroundColor: fieldValues[field.id] === opt ? color.badgeBg : color.inputBg, border: `1px solid ${fieldValues[field.id] === opt ? color.accentColor : color.inputBorder}` }}>
                                <input
                                  type="radio"
                                  name={`field-${field.id}`}
                                  required={field.required}
                                  value={opt}
                                  checked={fieldValues[field.id] === opt}
                                  onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                                  className="w-4 h-4"
                                  style={{ accentColor: color.accentColor }}
                                />
                                <span className="text-sm" style={{ color: color.textPrimary }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.field_type === 'date' ? (
                          <input
                            type="date"
                            required={field.required}
                            value={fieldValues[field.id] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          />
                        ) : field.field_type === 'name_split' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-xs mb-1" style={{ color: color.textSecondary }}>姓</span>
                              <input
                                type="text"
                                required={field.required}
                                placeholder="山田"
                                value={fieldValues[field.id + '_sei'] as string || ''}
                                onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_sei']: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                                style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                              />
                            </div>
                            <div>
                              <span className="block text-xs mb-1" style={{ color: color.textSecondary }}>名</span>
                              <input
                                type="text"
                                required={field.required}
                                placeholder="太郎"
                                value={fieldValues[field.id + '_mei'] as string || ''}
                                onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_mei']: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                                style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                              />
                            </div>
                          </div>
                        ) : field.field_type === 'address' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold" style={{ color: color.textSecondary }}>〒</span>
                              <input
                                type="text"
                                required={field.required}
                                placeholder="123-4567"
                                pattern="\d{3}-?\d{4}"
                                value={fieldValues[field.id + '_zip'] as string || ''}
                                onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_zip']: e.target.value })}
                                className="w-40 px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                                style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                              />
                            </div>
                            <select
                              required={field.required}
                              value={fieldValues[field.id + '_pref'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_pref']: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg text-gray-900 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            >
                              <option value="">都道府県</option>
                              {PREFECTURES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              required={field.required}
                              placeholder="市区町村番地"
                              value={fieldValues[field.id + '_city'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_city']: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            />
                            <input
                              type="text"
                              placeholder="マンション/ビル名"
                              value={fieldValues[field.id + '_building'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_building']: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            />
                          </div>
                        ) : (
                          <input
                            type={field.field_type}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={fieldValues[field.id] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-red-600 text-sm font-medium px-8 pt-4">{error}</p>}

              {/* Premium CTA area */}
              <div className="px-8 py-8 text-center">
                <p className="text-xs mb-3" style={{ color: color.textSecondary }}>必須項目をご入力の上、送信してください</p>
                <div className="relative max-w-sm mx-auto">
                  <button
                    type="submit"
                    disabled={submitting}
                    onMouseEnter={() => setCtaHovered(true)}
                    onMouseLeave={() => setCtaHovered(false)}
                    className={`w-full inline-flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition-all min-h-[44px] ${radius} ${shadow} ${size} ${anim}`}
                    style={{ backgroundColor: ctaHovered && !submitting ? ctaHoverBgColor : ctaBgColor, color: ctaTextColor }}
                  >
                    {hasShimmer && (
                      <span className="absolute inset-0 cta-shimmer" style={{ borderRadius: 'inherit' }} />
                    )}
                    <span className="relative inline-flex items-center gap-2">
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isFree ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {submitting ? '送信中...' : ctaText}
                    </span>
                  </button>
                </div>
                <p className="text-xs mt-3 flex items-center justify-center gap-1" style={{ color: color.textSecondary, opacity: 0.6 }}>
                  <Shield className="w-3 h-3" />
                  SSL暗号化通信で安全に送信されます
                </p>
              </div>

              {/* Premium Footer */}
              <div className="border-t px-6 py-3 text-center" style={{ borderColor: color.inputBorder, backgroundColor: color.badgeBg }}>
                <p className="text-[10px] tracking-wide" style={{ color: color.textSecondary, opacity: 0.5 }}>Powered by 集客メーカー</p>
              </div>
            </form>
          </div>
        ) : (
          /* ── Standard / Business Layout ── */
          <div
            className={`shadow-lg overflow-hidden ${isBusiness ? 'rounded-lg' : 'rounded-2xl'}`}
            style={{ backgroundColor: color.cardBg, border: color.cardBorder }}
          >
            {isBusiness && (
              <div className="px-8 py-6" style={{ background: color.headerBg }}>
                <h1 className="text-xl font-bold" style={{ color: form.title_color || color.headerText }}>{form.title}</h1>
                {form.description && <p className={`${descSizeClass} mt-1 opacity-90 whitespace-pre-line`} style={{ color: form.description_color || color.headerText }}>{form.description}</p>}
                {!isFree && (
                  <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: color.headerText }}>
                    <CreditCard className="w-4 h-4" />
                    {form.price.toLocaleString()}円
                  </div>
                )}
              </div>
            )}

            <div className={`${isBusiness ? 'px-8 py-6' : 'p-8'}`}>
              {layout === 'standard' && (
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2" style={{ color: form.title_color || color.textPrimary }}>{form.title}</h1>
                  {form.description && <p className={`${descSizeClass} whitespace-pre-line`} style={{ color: form.description_color || color.textSecondary }}>{form.description}</p>}
                  {!isFree && (
                    <div className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 text-sm font-semibold rounded-full"
                      style={{ backgroundColor: color.badgeBg, color: color.badgeText }}>
                      <CreditCard className="w-4 h-4" />
                      {form.price.toLocaleString()}円
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {form.order_form_fields.map((field) => {
                  const opts = Array.isArray(field.options) ? field.options : [];
                  const policyText = (!Array.isArray(field.options) && field.options?.policyText) || '';

                  if (field.field_type === 'section_header') {
                    return (
                      <div key={field.id} className="pt-4 pb-1 border-l-4" style={{ borderColor: color.accentColor, paddingLeft: '12px' }}>
                        <h3 className="font-bold text-base" style={{ color: color.textPrimary }}>{field.label}</h3>
                      </div>
                    );
                  }

                  return (
                    <div key={field.id}>
                      {field.field_type !== 'privacy_policy' && field.field_type !== 'checkbox' && (
                        <label className="block text-sm font-semibold mb-1" style={{ color: color.textPrimary }}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      )}

                      {field.field_type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          placeholder={field.placeholder}
                          value={fieldValues[field.id] as string || ''}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                          style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                        />
                      ) : field.field_type === 'select' ? (
                        <select
                          required={field.required}
                          value={fieldValues[field.id] as string || ''}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 transition-all"
                          style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                        >
                          <option value="">選択してください</option>
                          {opts.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.field_type === 'radio' ? (
                        <div className="flex flex-wrap gap-3">
                          {opts.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer min-h-[44px] transition-all"
                              style={{ backgroundColor: fieldValues[field.id] === opt ? color.badgeBg : color.inputBg, border: `1px solid ${fieldValues[field.id] === opt ? color.accentColor : color.inputBorder}` }}>
                              <input
                                type="radio"
                                name={`field-${field.id}`}
                                required={field.required}
                                value={opt}
                                checked={fieldValues[field.id] === opt}
                                onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                                className="w-4 h-4"
                                style={{ accentColor: color.accentColor }}
                              />
                              <span className="text-sm" style={{ color: color.textPrimary }}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.field_type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                          <input
                            type="checkbox"
                            required={field.required}
                            checked={fieldValues[field.id] as boolean || false}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.checked })}
                            className="w-5 h-5 rounded"
                            style={{ accentColor: color.accentColor }}
                          />
                          <span className="text-sm" style={{ color: color.textSecondary }}>{field.placeholder || field.label}</span>
                        </label>
                      ) : field.field_type === 'date' ? (
                        <input
                          type="date"
                          required={field.required}
                          value={fieldValues[field.id] as string || ''}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 transition-all"
                          style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                        />
                      ) : field.field_type === 'name_split' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-xs mb-1" style={{ color: color.textSecondary }}>姓</span>
                            <input
                              type="text"
                              required={field.required}
                              placeholder="山田"
                              value={fieldValues[field.id + '_sei'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_sei']: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            />
                          </div>
                          <div>
                            <span className="block text-xs mb-1" style={{ color: color.textSecondary }}>名</span>
                            <input
                              type="text"
                              required={field.required}
                              placeholder="太郎"
                              value={fieldValues[field.id + '_mei'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_mei']: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            />
                          </div>
                        </div>
                      ) : field.field_type === 'address' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: color.textSecondary }}>〒</span>
                            <input
                              type="text"
                              required={field.required}
                              placeholder="123-4567"
                              pattern="\d{3}-?\d{4}"
                              value={fieldValues[field.id + '_zip'] as string || ''}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_zip']: e.target.value })}
                              className="w-40 px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                            />
                          </div>
                          <select
                            required={field.required}
                            value={fieldValues[field.id + '_pref'] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_pref']: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          >
                            <option value="">都道府県</option>
                            {PREFECTURES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            required={field.required}
                            placeholder="市区町村番地"
                            value={fieldValues[field.id + '_city'] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_city']: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          />
                          <input
                            type="text"
                            placeholder="マンション/ビル名"
                            value={fieldValues[field.id + '_building'] as string || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id + '_building']: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder:text-gray-400 transition-all"
                            style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                          />
                        </div>
                      ) : field.field_type === 'privacy_policy' ? (
                        <div>
                          <p className="block text-sm font-semibold mb-1" style={{ color: color.textPrimary }}>
                            {field.label || '個人情報の取り扱いについて'}
                          </p>
                          {policyText && (
                            <div className="max-h-48 overflow-y-auto px-4 py-3 rounded-xl text-xs mb-3 whitespace-pre-wrap"
                              style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, color: color.textSecondary }}>
                              {policyText}
                            </div>
                          )}
                          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                            <input
                              type="checkbox"
                              required
                              checked={fieldValues[field.id] as boolean || false}
                              onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.checked })}
                              className="w-5 h-5 rounded"
                              style={{ accentColor: color.accentColor }}
                            />
                            <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>
                              上記に同意する <span className="text-red-500">*</span>
                            </span>
                          </label>
                        </div>
                      ) : (
                        <input
                          type={field.field_type}
                          required={field.required}
                          placeholder={field.placeholder}
                          value={fieldValues[field.id] as string || ''}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                          style={{ backgroundColor: color.inputBg, border: `1px solid ${color.inputBorder}`, outlineColor: color.inputFocusRing }}
                        />
                      )}
                    </div>
                  );
                })}

                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                <div className="relative">
                  <button
                    type="submit"
                    disabled={submitting}
                    onMouseEnter={() => setCtaHovered(true)}
                    onMouseLeave={() => setCtaHovered(false)}
                    className={`w-full inline-flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition-all min-h-[44px] ${radius} ${shadow} ${size} ${anim}`}
                    style={{ backgroundColor: ctaHovered && !submitting ? ctaHoverBgColor : ctaBgColor, color: ctaTextColor }}
                  >
                    {hasShimmer && (
                      <span className="absolute inset-0 cta-shimmer" style={{ borderRadius: 'inherit' }} />
                    )}
                    <span className="relative inline-flex items-center gap-2">
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isFree ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {submitting ? '送信中...' : ctaText}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
