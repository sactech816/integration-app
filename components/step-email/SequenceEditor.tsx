'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Play, Pause, Square,
  Mail, Clock, ChevronDown, ChevronUp, GripVertical, Users,
  CheckCircle2, AlertTriangle, Zap, ListOrdered, BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  subject: string;
  html_content: string;
  text_content: string | null;
}

interface ProgressStats {
  active: number;
  completed: number;
  paused: number;
  total: number;
}

interface SequenceEditorProps {
  sequenceId: string;
  userId: string;
}

export default function SequenceEditor({ sequenceId, userId }: SequenceEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  const [sequence, setSequence] = useState<any>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({ active: 0, completed: 0, paused: 0, total: 0 });

  // ステップ編集状態
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<Partial<Step> | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState({ subject: '', html_content: '', delay_days: 0 });

  useEffect(() => {
    fetchSequence();
  }, [sequenceId]);

  const fetchSequence = async () => {
    setLoading(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setSequence(data.sequence);
      setSteps(data.steps || []);
      setProgressStats(data.progressStats || { active: 0, completed: 0, paused: 0, total: 0 });
      // 新規ステップのデフォルト delay_days を設定
      const maxDelay = data.steps?.length > 0
        ? Math.max(...data.steps.map((s: Step) => s.delay_days)) + 1
        : 0;
      setNewStep(prev => ({ ...prev, delay_days: maxDelay }));
    } else {
      router.push('/step-email/dashboard');
    }
    setLoading(false);
  };

  const handleAddStep = async () => {
    if (!newStep.subject.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subject: newStep.subject,
        htmlContent: newStep.html_content,
        delayDays: newStep.delay_days,
      }),
    });
    if (res.ok) {
      await fetchSequence();
      setNewStep({ subject: '', html_content: '', delay_days: 0 });
      setAddingStep(false);
    }
    setSaving(false);
  };

  const handleUpdateStep = async (stepId: string) => {
    if (!editingStep) return;
    setSaving(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subject: editingStep.subject,
        htmlContent: editingStep.html_content,
        delayDays: editingStep.delay_days,
      }),
    });
    if (res.ok) {
      await fetchSequence();
      setEditingStep(null);
      setExpandedStep(null);
    }
    setSaving(false);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('このステップを削除しますか？')) return;
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}/steps/${stepId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchSequence();
    }
  };

  const handleActivate = async () => {
    if (steps.length === 0) {
      alert('ステップを1つ以上追加してから有効化してください。');
      return;
    }
    if (!confirm('このシーケンスを有効化しますか？\n\n有効化すると、リストの購読者に対してステップメールの自動配信が開始されます。')) return;
    setActivating(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`シーケンスを有効化しました。${data.enrolledCount}人の購読者が登録されました。`);
      await fetchSequence();
    } else {
      const data = await res.json();
      alert(data.error || '有効化に失敗しました');
    }
    setActivating(false);
  };

  const handlePause = async () => {
    setSaving(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: 'paused' }),
    });
    if (res.ok) {
      await fetchSequence();
    }
    setSaving(false);
  };

  const handleResume = async () => {
    setSaving(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: 'active' }),
    });
    if (res.ok) {
      await fetchSequence();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!sequence) return null;

  const getDelayLabel = (days: number) => {
    if (days === 0) return '登録直後';
    return `${days}日後`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/step-email/dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{sequence.name}</h1>
            <p className="text-sm text-gray-500">{sequence.list_name} / {steps.length}ステップ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sequence.status === 'draft' && (
            <button
              onClick={handleActivate}
              disabled={activating || steps.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              有効化
            </button>
          )}
          {sequence.status === 'active' && (
            <button
              onClick={handlePause}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              <Pause className="w-4 h-4" />
              一時停止
            </button>
          )}
          {sequence.status === 'paused' && (
            <button
              onClick={handleResume}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              <Play className="w-4 h-4" />
              再開
            </button>
          )}
        </div>
      </div>

      {/* ステータスバー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${
              sequence.status === 'active' ? 'bg-green-500' : sequence.status === 'paused' ? 'bg-amber-500' : 'bg-gray-400'
            }`} />
            <span className="text-xs font-semibold text-gray-500">ステータス</span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {sequence.status === 'active' ? '配信中' : sequence.status === 'paused' ? '一時停止' : '下書き'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-gray-500">配信中</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{progressStats.active}人</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-semibold text-gray-500">完了</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{progressStats.completed}人</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-xs font-semibold text-gray-500">総登録</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{progressStats.total}人</p>
        </div>
      </div>

      {/* ステップ一覧 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-l-4 border-teal-500 pl-3">
            ステップ一覧
          </h2>
          <button
            onClick={() => {
              setAddingStep(true);
              const maxDelay = steps.length > 0 ? Math.max(...steps.map(s => s.delay_days)) + 1 : 0;
              setNewStep({ subject: '', html_content: '', delay_days: maxDelay });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            ステップ追加
          </button>
        </div>

        {steps.length === 0 && !addingStep && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">まだステップがありません</p>
            <button
              onClick={() => setAddingStep(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              最初のステップを追加
            </button>
          </div>
        )}

        {/* タイムライン表示 */}
        <div className="space-y-0">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const isEditing = editingStep?.id === step.id;

            return (
              <div key={step.id} className="relative">
                {/* タイムラインの縦線 */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[21px] top-[52px] bottom-0 w-0.5 bg-teal-200" />
                )}

                <div className={`bg-white rounded-xl border ${isExpanded ? 'border-teal-300 shadow-md' : 'border-gray-200 shadow-sm'} mb-3 overflow-hidden transition-all`}>
                  {/* ステップヘッダー */}
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedStep(null);
                        setEditingStep(null);
                      } else {
                        setExpandedStep(step.id);
                        setEditingStep({ ...step });
                      }
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-sm font-bold text-teal-700">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{step.subject}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getDelayLabel(step.delay_days)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* 展開コンテンツ */}
                  {isExpanded && isEditing && editingStep && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">件名</label>
                        <input
                          type="text"
                          value={editingStep.subject || ''}
                          onChange={(e) => setEditingStep({ ...editingStep, subject: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">配信タイミング</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">登録から</span>
                          <input
                            type="number"
                            min={0}
                            value={editingStep.delay_days ?? 0}
                            onChange={(e) => setEditingStep({ ...editingStep, delay_days: parseInt(e.target.value) || 0 })}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          />
                          <span className="text-sm text-gray-600">日後に送信</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">本文（HTML）</label>
                        <textarea
                          value={editingStep.html_content || ''}
                          onChange={(e) => setEditingStep({ ...editingStep, html_content: e.target.value })}
                          rows={10}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono text-sm"
                          placeholder="<p>メール本文をHTMLで記述...</p>"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setExpandedStep(null); setEditingStep(null); }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleUpdateStep(step.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 新規ステップ追加フォーム */}
        {addingStep && (
          <div className="bg-white rounded-xl border border-teal-300 shadow-md p-4 space-y-4 mt-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              新しいステップ
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">件名</label>
              <input
                type="text"
                value={newStep.subject}
                onChange={(e) => setNewStep({ ...newStep, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="例: ご登録ありがとうございます"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">配信タイミング</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">登録から</span>
                <input
                  type="number"
                  min={0}
                  value={newStep.delay_days}
                  onChange={(e) => setNewStep({ ...newStep, delay_days: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <span className="text-sm text-gray-600">日後に送信</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">本文（HTML）</label>
              <textarea
                value={newStep.html_content}
                onChange={(e) => setNewStep({ ...newStep, html_content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono text-sm"
                placeholder="<p>メール本文をHTMLで記述...</p>"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingStep(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddStep}
                disabled={saving || !newStep.subject.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                追加
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 注意書き */}
      {sequence.status === 'draft' && steps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">シーケンスはまだ下書き状態です</p>
            <p className="text-sm text-amber-700 mt-1">
              「有効化」ボタンを押すと、リストの購読者への自動配信が開始されます。ステップの内容を確認してから有効化してください。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
