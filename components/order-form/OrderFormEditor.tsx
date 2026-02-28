'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical, Loader2,
  Globe, CreditCard, Monitor, Pencil,
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

/* ── フォームプレビュー ── */
function OrderFormPreview({ title, description, price, paymentType, fields }: {
  title: string; description: string; price: number; paymentType: string; fields: Field[];
}) {
  return (
    <div className="p-6 space-y-5">
      {title ? (
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      ) : (
        <h2 className="text-xl font-bold text-gray-300">タイトルを入力してください</h2>
      )}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {paymentType !== 'free' && price > 0 && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full">
          <CreditCard className="w-4 h-4" />
          {price.toLocaleString()}円
        </div>
      )}
      <div className="space-y-4">
        {fields.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {field.label || '(ラベル未設定)'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.fieldType === 'textarea' ? (
              <div className="w-full h-20 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm">{field.placeholder}</div>
            ) : field.fieldType === 'select' ? (
              <select disabled className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm">
                <option>{field.placeholder || '選択してください'}</option>
                {(field.options || []).map((o, j) => <option key={j}>{o}</option>)}
              </select>
            ) : field.fieldType === 'checkbox' ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-600">{field.label || 'チェックボックス'}</span>
              </label>
            ) : (
              <input type="text" disabled placeholder={field.placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm placeholder:text-gray-400" />
            )}
          </div>
        ))}
      </div>
      {fields.length === 0 && (
        <p className="text-gray-300 text-center py-8">フィールドを追加すると、ここにプレビューが表示されます</p>
      )}
      <button disabled className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md min-h-[44px]">
        {paymentType === 'free' ? '申し込む' : '申し込み・決済へ'}
      </button>
    </div>
  );
}

/* ── メインエディタ ── */
export default function OrderFormEditor({ formId }: { formId?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [paymentType, setPaymentType] = useState<'free' | 'one_time' | 'subscription'>('free');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'univapay' | ''>('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [successMessage, setSuccessMessage] = useState('お申し込みありがとうございます。');
  const [status, setStatus] = useState('draft');
  const [slug, setSlug] = useState('');

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
      setTitle(f.title); setDescription(f.description || '');
      setPrice(f.price || 0); setPaymentType(f.payment_type || 'free');
      setPaymentProvider(f.payment_provider || ''); setStripePriceId(f.stripe_price_id || '');
      setSuccessMessage(f.success_message || ''); setStatus(f.status); setSlug(f.slug);
      if (f.order_form_fields?.length > 0) {
        setFields(f.order_form_fields.map((field: any) => ({
          id: field.id, fieldType: field.field_type, label: field.label,
          placeholder: field.placeholder || '', required: field.required, options: field.options,
        })));
      }
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
    setSaving(true);
    const body = {
      userId, title, description, price: paymentType === 'free' ? 0 : price,
      paymentType, paymentProvider: paymentType !== 'free' ? paymentProvider : null,
      stripePriceId: paymentProvider === 'stripe' ? stripePriceId : null,
      successMessage, status: publishStatus || status,
      fields: fields.map((f) => ({
        field_type: f.fieldType, label: f.label, placeholder: f.placeholder,
        required: f.required, options: f.fieldType === 'select' ? f.options : null,
      })),
    };
    if (formId) {
      const res = await fetch(`/api/order-form/${formId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok && publishStatus) setStatus(publishStatus);
    } else {
      const res = await fetch('/api/order-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const data = await res.json(); router.push(`/order-form/editor/${data.form.id}`); }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/order-form/${slug}` : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/order-form/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{formId ? 'フォーム編集' : '新しいフォーム'}</h1>
          {slug && status === 'published' && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
              <Globe className="w-3 h-3" />公開中
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave()} disabled={saving || !title} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
            <Save className="w-4 h-4" />{saving ? '保存中...' : '保存'}
          </button>
          {formId && (
            <button onClick={() => handleSave(status === 'published' ? 'draft' : 'published')} disabled={saving || !title} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
              <Globe className="w-4 h-4" />{status === 'published' ? '非公開' : '公開'}
            </button>
          )}
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[57px] z-30">
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
          <div className="space-y-5">
            {/* 基本設定 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">基本設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: セミナー申し込みフォーム" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">説明（任意）</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="フォームの説明文" rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">完了メッセージ</label>
                  <input type="text" value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
              </div>
            </div>

            {/* フィールド設定 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">フォームフィールド</h2>
                <button onClick={addField} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors min-h-[44px]">
                  <Plus className="w-4 h-4" />追加
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <button onClick={() => moveField(i, 'up')} disabled={i === 0} className="p-1 mt-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
                      <div className="flex-1 grid sm:grid-cols-2 gap-2">
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
                            <input type="text" value={(field.options || []).join(',')} onChange={(e) => updateField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="選択肢A, 選択肢B" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button onClick={() => removeField(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 決済設定 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-emerald-50 p-1.5 rounded-lg"><CreditCard className="w-4 h-4 text-emerald-600" /></span>決済設定
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
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[57px] lg:h-[calc(100vh-57px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
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
              <OrderFormPreview title={title} description={description} price={price} paymentType={paymentType} fields={fields} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>
    </div>
  );
}
