'use client';

import { Calendar } from 'lucide-react';
import { CalendarEvent, downloadIcsFile } from '@/lib/calendar';

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  filename?: string;
  variant?: 'blue' | 'purple';
  className?: string;
}

export default function AddToCalendarButton({
  event,
  filename,
  variant = 'blue',
  className = '',
}: AddToCalendarButtonProps) {
  const variantStyles =
    variant === 'blue'
      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      : 'bg-purple-100 text-purple-700 hover:bg-purple-200';

  return (
    <button
      onClick={() => downloadIcsFile(event, filename)}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${variantStyles} ${className}`}
    >
      <Calendar size={18} />
      カレンダーに追加
    </button>
  );
}
