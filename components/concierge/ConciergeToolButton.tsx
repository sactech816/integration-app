'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { ToolAction } from './types';

interface ConciergeToolButtonProps {
  action: ToolAction;
  onNavigate?: () => void;
}

export default function ConciergeToolButton({ action, onNavigate }: ConciergeToolButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    onNavigate?.();
    router.push(action.url);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-lg
        bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium
        hover:bg-blue-100 hover:border-blue-300 transition-all duration-200
        shadow-sm hover:shadow"
    >
      <span>{action.label}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}
