import type { BadgeTone, StatusView } from '@/lib/status';
import { unknownStatus } from '@/lib/status';

const toneClass: Record<BadgeTone, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
};

export function StatusBadge({ view }: { view?: StatusView }) {
  const resolved = view ?? unknownStatus();
  return <span className={`badge ${toneClass[resolved.tone]}`}>{resolved.label}</span>;
}

export function DemoMoneyLabel() {
  return <span className="badge badge-warning">모의 데이터 · 실제 지급 아님</span>;
}
