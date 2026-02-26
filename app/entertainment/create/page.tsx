'use client';

import { useState, useEffect } from 'react';
import EntertainmentModeSelector from '@/components/entertainment/EntertainmentModeSelector';
import EntertainmentEditor from '@/components/entertainment/EntertainmentEditor';
import EntertainmentWizard from '@/components/entertainment/EntertainmentWizard';
import { type EntertainmentForm, defaultEntertainmentForm } from '@/lib/entertainment/defaults';
import { supabase } from '@/lib/supabase';

type Mode = 'select' | 'editor' | 'wizard';

export default function EntertainmentCreatePage() {
  const [mode, setMode] = useState<Mode>('select');
  const [form, setForm] = useState<EntertainmentForm>(defaultEntertainmentForm);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || undefined });
      }
    });
  }, []);

  if (mode === 'select') {
    return <EntertainmentModeSelector onSelect={setMode} />;
  }

  if (mode === 'wizard') {
    return (
      <EntertainmentWizard
        form={form}
        setForm={setForm}
        onComplete={() => setMode('editor')}
        onSwitchMode={() => setMode('editor')}
      />
    );
  }

  return (
    <EntertainmentEditor
      form={form}
      setForm={setForm}
      onSwitchMode={() => setMode('wizard')}
      onBack={() => setMode('select')}
      user={user}
    />
  );
}
