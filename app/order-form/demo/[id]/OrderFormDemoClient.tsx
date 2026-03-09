'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ORDER_FORM_TEMPLATES } from '@/constants/templates/order-form';

const borderRadiusMap = { sm: '4px', md: '8px', lg: '12px', full: '9999px' };

export default function OrderFormDemoClient() {
  const params = useParams();
  const id = params.id as string;
  const template = ORDER_FORM_TEMPLATES.find((t) => t.id === id);

  const currentIndex = ORDER_FORM_TEMPLATES.findIndex((t) => t.id === id);
  const prev = currentIndex > 0 ? ORDER_FORM_TEMPLATES[currentIndex - 1] : null;
  const next = currentIndex < ORDER_FORM_TEMPLATES.length - 1 ? ORDER_FORM_TEMPLATES[currentIndex + 1] : null;

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">テンプレートが見つかりません</h1>
          <Link href="/demos" className="text-blue-600 hover:underline">デモ一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const Icon = template.icon;
  const cta = template.ctaButton;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/demos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          デモ一覧に戻る
        </Link>

        {/* フォームカード */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className={`${template.bg} px-8 py-8 text-center`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md mb-4`}>
              <Icon size={32} className={template.color} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">{template.title}</h1>
            <p className="text-gray-600">{template.formDescription}</p>
            {template.paymentType !== 'free' && (
              <div className="mt-4">
                <span className="text-3xl font-black text-gray-900">
                  &yen;{template.price.toLocaleString()}
                </span>
                {template.paymentType === 'subscription' && (
                  <span className="text-gray-500 text-sm ml-1">/月</span>
                )}
              </div>
            )}
          </div>

          {/* フォーム本体 */}
          <div className="px-8 py-8 space-y-5">
            {template.fields.map((field, i) => (
              <div key={i}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.fieldType === 'textarea' ? (
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder={field.placeholder}
                    rows={3}
                    readOnly
                  />
                ) : field.fieldType === 'select' ? (
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled
                  >
                    <option>{field.placeholder}</option>
                    {(Array.isArray(field.options) ? field.options : []).map((opt: string, j: number) => (
                      <option key={j}>{opt}</option>
                    ))}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5 rounded" />
                    <span className="text-gray-700 text-sm">{field.placeholder}</span>
                  </div>
                ) : (
                  <input
                    type={field.fieldType}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={field.placeholder}
                    readOnly
                  />
                )}
              </div>
            ))}

            {/* CTAボタン */}
            {cta && (
              <div className="pt-4">
                <button
                  type="button"
                  className="w-full font-bold text-lg py-4 transition-all cursor-default"
                  style={{
                    backgroundColor: cta.bgColor,
                    color: cta.textColor,
                    borderRadius: borderRadiusMap[cta.borderRadius || 'md'],
                    boxShadow: cta.shadow === 'lg' ? '0 10px 25px -5px rgba(0,0,0,0.2)' : cta.shadow === 'xl' ? '0 20px 40px -10px rgba(0,0,0,0.25)' : cta.shadow === 'md' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {cta.text}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  ※ これはデモ表示です。実際の送信は行われません。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between mt-8">
          {prev ? (
            <Link
              href={`/order-form/demo/${prev.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
              <ChevronLeft size={18} />
              {prev.name}
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/order-form/demo/${next.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
              {next.name}
              <ChevronRight size={18} />
            </Link>
          ) : <div />}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <Link
            href="/order-form/editor"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <ClipboardList size={22} />
            申し込みフォームを作成する
          </Link>
        </div>
      </div>

      <Footer setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }} />
    </div>
  );
}
