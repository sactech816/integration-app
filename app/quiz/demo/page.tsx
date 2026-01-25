'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizDemoRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/demos');
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">
    <p>デモ一覧にリダイレクト中...</p>
  </div>;
}
