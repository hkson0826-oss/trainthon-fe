const SEOUL = 'Asia/Seoul';

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatSeoul(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatSeoulRange(from: string, to: string): string {
  const dateFmt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL,
    month: 'numeric',
    day: 'numeric',
  });
  const timeFmt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${dateFmt.format(new Date(from))} ${timeFmt.format(new Date(from))}~${timeFmt.format(new Date(to))}`;
}

export function todayParts(): { date: string; start: string; end: string } {
  const now = new Date();
  const seoul = new Date(now.toLocaleString('en-US', { timeZone: SEOUL }));
  const y = seoul.getFullYear();
  const m = String(seoul.getMonth() + 1).padStart(2, '0');
  const d = String(seoul.getDate()).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, start: '14:00', end: '14:10' };
}

export function seoulLocalToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00+09:00`).toISOString();
}
