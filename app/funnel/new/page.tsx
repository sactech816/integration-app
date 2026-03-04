'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import FunnelEditor from '@/components/funnel/FunnelEditor';
import { FUNNEL_TEMPLATES, FunnelTemplate } from '@/constants/templates/funnel';
import { Loader2, GitBranch, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

function TemplateSelector({ onSelect, onSkip }: { onSelect: (t: FunnelTemplate) => void; onSkip: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
          <GitBranch className="w-4 h-4" />
          新しいファネルを作成
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">テンプレートを選択</h1>
        <p className="text-gray-600">目的に合ったテンプレートを選ぶと、すぐにファネルの構築を始められます</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {FUNNEL_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-lg hover:border-amber-300 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{template.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{template.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full mt-1">{template.badge}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{template.description}</p>
            <div className="space-y-1.5">
              {template.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-gray-700">{step.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
              このテンプレートで作成
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          白紙から作成する
        </button>
      </div>
    </div>
  );
}

function NewFunnelContent() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };

    init();
    return () => { subscription?.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : `/${page}`;
  };

  const handleSelectTemplate = (template: FunnelTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
        currentService="funnel"
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />
      {showEditor ? (
        <FunnelEditor
          initialSteps={selectedTemplate?.steps}
          initialName={selectedTemplate?.name}
        />
      ) : (
        <TemplateSelector
          onSelect={handleSelectTemplate}
          onSkip={handleSkipTemplate}
        />
      )}
    </div>
  );
}

export default function NewFunnelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    }>
      <NewFunnelContent />
    </Suspense>
  );
}
