'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Loader2,
  Globe, CreditCard,
} from 'lucide-react';
import StripeConnectStatus from '@/components/order-form/StripeConnectStatus';

interface Field {
  id?: string;
  fieldType: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[] | null;
}

const FIELD_TYPES = [
  { value: 'text', label: 'テキスト' },
  { value: 'email', label: 'メールアドレス' },
  { value: 'tel', label: '電話番号' },
  { value: 'number', label: '数値' },
  { value: 'textarea', label: '長文テキスト' },
  { value: 'select', label: 'セレクト（選択肢）' },
  { value: 'checkbox', label: 'チェックボックス' },
];

export default function OrderFormEditor({ formId }: { formId?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [paymentType, setPaymentType] = useState<'free' | 'one_time' | 'subscription'>('free');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'univapay' | ''>('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [successMessage, setSuccessMessage] = useState('お申し込みありがとうございます。');
  const [status, setStatus] = useState('draft');
  const [slug, setSlug] = useState('');

  // Form fields
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
        if (formId) await fetchForm(user.id);
      }
      setLoading(false);
    };
    init();
  }, [formId]);

  const fetchForm = async (uid: string) => {
    const res = await fetch(`/api/order-form/${formId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const f = data.form;
      setTitle(f.title);
      setDescription(f.description || '');
      setPrice(f.price || 0);
      setPaymentType(f.payment_type || 'free');
      setPaymentProvider(f.payment_provider || '');
      setStripePriceId(f.stripe_price_id || '');
      setSuccessMessage(f.success_message || '');
      setStatus(f.status);
      setSlug(f.slug);
      if (f.order_form_fields?.length > 0) {
        setFields(f.order_form_fields.map((field: any) => ({
          id: field.id,
          fieldType: field.field_type,
          label: field.label,
          placeholder: field.placeholder || '',
          required: field.required,
          options: field.options,
        })));
      }
    }
  };

  const addField = () => {
    setFields([...fields, { fieldType: 'text', label: '', placeholder: '', required: false, options: null }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async (publishStatus?: string) => {
    if (!userId || !title) return;
    setSaving(true);

    const body = {
      userId,
      title,
      description,
      price: paymentType === 'free' ? 0 : price,
      paymentType,
      paymentProvider: paymentType !== 'free' ? paymentProvider : null,
      stripePriceId: paymentProvider === 'stripe' ? stripePriceId : null,
      successMessage,
      status: publishStatus || status,
      fields: fields.map((f) => ({
        field_type: f.fieldType,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.fieldType === 'select' ? f.options : null,
      })),
    };

    if (formId) {
      const res = await fetch(`/api/order-form/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok && publishStatus) setStatus(publishStatus);
    } else {
      const res = await fetch('/api/order-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/order-form/editor/${data.form.id}`);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/order-form/${slug}` : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/order-form/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {formId ? 'フォーム編集' : '新しいフォーム'}
        </h1>
      </div>

      {/* 公開URL */}
      {slug && status === 'published' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-emerald-700 mb-1">公開URL</p>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
            <Globe className="w-4 h-4" />{publicUrl}
          </a>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左: フォーム設定 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本設定 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-gray-900 mb-4">基本設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: セミナー申し込みフォーム" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">説明（任意）</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="フォームの説明文" rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">完了メッセージ</label>
                <input type="text" value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
            </div>
          </div>

          {/* フィールド設定 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">フォームフィールド</h2>
              <button onClick={addField} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors min-h-[44px]">
                <Plus className="w-4 h-4" />フィールド追加
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 pt-2">
                      <button onClick={() => moveField(i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">タイプ</label>
                        <select value={field.fieldType} onChange={(e) => updateField(i, { fieldType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                          {FIELD_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ラベル</label>
                        <input type="text" value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="項目名" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">プレースホルダー</label>
                        <input type="text" value={field.placeholder} onChange={(e) => updateField(i, { placeholder: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, { required: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded" />
                          <span className="text-sm text-gray-700">必須</span>
                        </label>
                      </div>
                      {field.fieldType === 'select' && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">選択肢（カンマ区切り）</label>
                          <input
                            type="text"
                            value={(field.options || []).join(',')}
                            onChange={(e) => updateField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                            placeholder="選択肢A, 選択肢B, 選択肢C"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400"
                          />
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeField(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右: 決済設定 & アクション */}
        <div className="space-y-6">
          {/* 決済設定 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />決済設定
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">タイプ</label>
                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  <option value="free">無料（決済なし）</option>
                  <option value="one_time">一回払い</option>
                  <option value="subscription">サブスクリプション</option>
                </select>
              </div>

              {paymentType !== 'free' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">金額（円）</label>
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">決済プロバイダ</label>
                    <select value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      <option value="">選択してください</option>
                      <option value="stripe">Stripe</option>
                      <option value="univapay">UnivaPay</option>
                    </select>
                  </div>
                  {paymentProvider === 'stripe' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stripe Price ID（任意）</label>
                        <input type="text" value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_xxx" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">空欄の場合は金額から自動生成します</p>
                      </div>
                      {userId && <StripeConnectStatus userId={userId} />}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* アクション */}
          <div className="space-y-3">
            <button
              onClick={() => handleSave()}
              disabled={saving || !title}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '下書き保存'}
            </button>
            {formId && (
              <button
                onClick={() => handleSave(status === 'published' ? 'draft' : 'published')}
                disabled={saving || !title}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
              >
                <Globe className="w-4 h-4" />
                {status === 'published' ? '非公開にする' : '公開する'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
