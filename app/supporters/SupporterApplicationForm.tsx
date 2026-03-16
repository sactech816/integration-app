'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const EXPERIENCE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'never', label: 'まだ使ったことがない' },
  { value: 'few_times', label: '数回使ったことがある' },
  { value: 'regularly', label: '日常的に使っている' },
  { value: 'paid_plan', label: '有料プランで活用中' },
];

const HOW_HEARD_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'in_app', label: '集客メーカー内の案内' },
  { value: 'sns', label: 'SNS' },
  { value: 'referral', label: '知人の紹介' },
  { value: 'search', label: '検索' },
  { value: 'other', label: 'その他' },
];

const SKILL_OPTIONS = [
  '診断クイズ制作',
  'LP制作',
  'Kindle出版',
  'SNS集客',
  'セミナー開催',
  'コンサルティング',
  'Web制作全般',
  'その他',
];

export default function SupporterApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    website_url: '',
    sns_urls: '',
    experience: '',
    teaching_experience: '',
    motivation: '',
    target_audience: '',
    skills: [] as string[],
    how_heard: '',
    agreement: false,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setFormData(prev => ({
          ...prev,
          name: prev.name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '',
          email: prev.email || session.user.email || '',
        }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'agreement') {
      setFormData(prev => ({ ...prev, agreement: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.occupation || !formData.experience || !formData.motivation) {
      setError('必須項目を入力してください');
      return;
    }
    if (!formData.agreement) {
      setError('利用規約に同意してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/supporters/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.length > 0 ? JSON.stringify(formData.skills) : null,
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '送信に失敗しました');
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError('送信に失敗しました。しばらく経ってから再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-green-200 rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">応募を受け付けました</h3>
        <p className="text-gray-600 leading-relaxed">
          ご応募ありがとうございます。<br />
          審査結果はメールでお知らせいたします。<br />
          通常3〜5営業日以内にご連絡いたします。
        </p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">基本情報</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>お名前 <span className="text-red-500">*</span></label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="山田 太郎" className={inputClass} required />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>メールアドレス <span className="text-red-500">*</span></label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" className={inputClass} required />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>電話番号</label>
            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="090-1234-5678" className={inputClass} />
          </div>
          <div>
            <label htmlFor="occupation" className={labelClass}>職業・肩書き <span className="text-red-500">*</span></label>
            <input id="occupation" name="occupation" type="text" value={formData.occupation} onChange={handleChange} placeholder="コンサルタント、講師など" className={inputClass} required />
          </div>
        </div>
      </div>

      {/* Web・SNS */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Web・SNS</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="website_url" className={labelClass}>WebサイトURL</label>
            <input id="website_url" name="website_url" type="url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="sns_urls" className={labelClass}>SNSアカウント（X、Instagram等）</label>
            <textarea id="sns_urls" name="sns_urls" value={formData.sns_urls} onChange={handleChange} placeholder="@username（X）&#10;https://instagram.com/username" rows={3} className={inputClass} />
          </div>
        </div>
      </div>

      {/* 経験・スキル */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">経験・スキル</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="experience" className={labelClass}>集客メーカーの利用経験 <span className="text-red-500">*</span></label>
            <select id="experience" name="experience" value={formData.experience} onChange={handleChange} className={inputClass} required>
              {EXPERIENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="teaching_experience" className={labelClass}>教える・コンサルティングの経験（あれば）</label>
            <textarea id="teaching_experience" name="teaching_experience" value={formData.teaching_experience} onChange={handleChange} placeholder="セミナー講師経験、個別コンサル実績など" rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>得意分野（複数選択可）</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all min-h-[44px] ${
                    formData.skills.includes(skill)
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {formData.skills.includes(skill) && <span className="mr-1">✓</span>}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 応募動機 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">応募について</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="motivation" className={labelClass}>応募動機 <span className="text-red-500">*</span></label>
            <textarea id="motivation" name="motivation" value={formData.motivation} onChange={handleChange} placeholder="サポーターになりたい理由や、どのような活動をしたいかをお書きください" rows={4} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="target_audience" className={labelClass}>サポートしたい対象者</label>
            <input id="target_audience" name="target_audience" type="text" value={formData.target_audience} onChange={handleChange} placeholder="個人起業家、中小企業、フリーランスなど" className={inputClass} />
          </div>
          <div>
            <label htmlFor="how_heard" className={labelClass}>このプログラムを知ったきっかけ</label>
            <select id="how_heard" name="how_heard" value={formData.how_heard} onChange={handleChange} className={inputClass}>
              {HOW_HEARD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 同意・送信 */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            name="agreement"
            checked={formData.agreement}
            onChange={handleChange}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          />
          <span className="text-sm text-gray-600">
            サポーターズ制度の趣旨に同意し、集客メーカーの利用規約に基づいて活動することに同意します。
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              応募する
            </>
          )}
        </button>
      </div>
    </form>
  );
}
