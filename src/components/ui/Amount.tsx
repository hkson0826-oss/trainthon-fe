import { formatKrw } from '@/lib/money';

export function Amount({ value }: { value: number }) {
  return <span className="tabular">{formatKrw(value)}</span>;
}
