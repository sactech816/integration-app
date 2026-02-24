/**
 * カレンダーイベント生成ユーティリティ
 * .ics ファイル生成 & ダウンロード（将来の Google Calendar API 連携にも対応可能な共通型）
 */

export interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

function formatDateToIcs(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcsContent(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@makers.tokyo`;
  const now = formatDateToIcs(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MakersTokyo//CalendarExport//JP',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
  ];

  if (event.allDay) {
    const dateStr = formatDateOnly(event.startTime);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${dateStr}`);
  } else {
    lines.push(`DTSTART:${formatDateToIcs(event.startTime)}`);
    lines.push(`DTEND:${formatDateToIcs(event.endTime)}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

export function downloadIcsFile(event: CalendarEvent, filename?: string): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'event.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
