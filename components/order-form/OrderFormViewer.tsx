'use client';

import { useState, useEffect } from 'react';
import { FileText, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { getOrderFormColor } from '@/constants/orderFormThemes';

interface Field {
  id: string;
  field_type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[] | null;
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
  order_form_fields: Field[];
}

export default function OrderFormViewer({ slug }: { slug: string }) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});

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
        initial[f.id] = f.field_type === 'checkbox' ? false : '';
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
      const value = fieldValues[f.id];
      fieldsData[f.label] = value;
      if (f.field_type === 'email') email = value as string;
      if (f.label.includes('名前') || f.label.includes('Name') || f.label === 'お名前') {
        name = value as string;
      }
    });

    if (!email) {
      setError('メールアドレスを入力してください');
      setSubmitting(false);
      return;
    }

    const res = await fetch(`/api/order-form/${form.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, fieldsData }),
    });

    if (!res.ok) {
      const data = await res.json();
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
      }
      setError('決済セッションの作成に失敗しました');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
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
  const isEntertainment = layout === 'entertainment';
  const isFree = form.payment_type === 'free' || form.price === 0;

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
      <div className="max-w-lg mx-auto">
        <div
          className={`shadow-lg overflow-hidden ${isBusiness ? 'rounded-lg' : isEntertainment ? 'rounded-3xl' : 'rounded-2xl'}`}
          style={{ backgroundColor: color.cardBg, border: color.cardBorder }}
        >
          {/* ヘッダー部分 (business / entertainment) */}
          {isBusiness && (
            <div className="px-8 py-6" style={{ background: color.headerBg }}>
              <h1 className="text-xl font-bold" style={{ color: color.headerText }}>{form.title}</h1>
              {form.description && <p className="text-sm mt-1 opacity-90" style={{ color: color.headerText }}>{form.description}</p>}
              {!isFree && (
                <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: color.headerText }}>
                  <CreditCard className="w-4 h-4" />
                  {form.price.toLocaleString()}円
                </div>
              )}
            </div>
          )}
          {isEntertainment && (
            <div className="px-8 py-8 text-center" style={{ background: color.headerBg }}>
              <h1 className="text-2xl font-black tracking-wide" style={{ color: color.headerText }}>{form.title}</h1>
              {form.description && <p className="text-sm mt-2 opacity-90" style={{ color: color.headerText }}>{form.description}</p>}
              {!isFree && (
                <div className="inline-flex items-center gap-1 mt-4 px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: color.headerText }}>
                  <CreditCard className="w-4 h-4" />
                  {form.price.toLocaleString()}円
                </div>
              )}
            </div>
          )}

          <div className={`${isBusiness ? 'px-8 py-6' : isEntertainment ? 'px-8 py-8' : 'p-8'}`}>
            {/* standard layout header */}
            {layout === 'standard' && (
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2" style={{ color: color.textPrimary }}>{form.title}</h1>
                {form.description && <p className="text-sm" style={{ color: color.textSecondary }}>{form.description}</p>}
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
              {form.order_form_fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold mb-1" style={{ color: color.textPrimary }}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

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
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
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
              ))}

              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all min-h-[44px] ${isEntertainment ? 'rounded-full text-base font-black' : isBusiness ? 'rounded-lg' : 'rounded-xl'}`}
                style={{ backgroundColor: color.buttonBg, color: color.buttonText }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color.buttonHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = color.buttonBg; }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isFree ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {submitting ? '送信中...' : isFree ? '申し込む' : `${form.price.toLocaleString()}円で申し込む`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
