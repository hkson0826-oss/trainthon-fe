const SEOUL = 'Asia/Seoul';

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatSeoulDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '시각 확인 필요';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRemaining(expiresAt: string | null, nowMs = Date.now()): string {
  if (!expiresAt) return '기간 없음';
  const remaining = new Date(expiresAt).getTime() - nowMs;
  if (remaining <= 0) return '만료됨';
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  if (days > 0) return `${days}일 ${restHours}시간 남음`;
  const minutes = Math.floor(remaining / (60 * 1000));
  if (hours > 0) return `${hours}시간 ${minutes % 60}분 남음`;
  return `${Math.max(1, minutes)}분 남음`;
}

export function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();
}
