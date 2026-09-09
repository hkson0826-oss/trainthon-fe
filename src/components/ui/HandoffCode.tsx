import { formatSeoulDateTime } from '@/lib/dates';
import { Button } from '@/components/ui/Button';
import type { HandoffCode } from '@/contracts/types';

export function HandoffCodeView({
  code,
  onRefresh,
  busy,
}: {
  code: HandoffCode | null;
  onRefresh: () => void;
  busy?: boolean;
}) {
  return (
    <section className="card-surface flex flex-col gap-lg">
      <h2 className="typo-title-lg">반환 인증 코드</h2>
      <p className="typo-body-md">물건을 실제로 받은 뒤 습득자에게 보여 주세요. 코드는 5분간 유효합니다.</p>
      {code ? (
        <>
          <p className="typo-headline-md tabular tracking-headline-md">{code.manualCode}</p>
          <p className="caption">만료 시각 {formatSeoulDateTime(code.expiresAt)}</p>
        </>
      ) : (
        <p className="caption">아직 발급된 코드가 없습니다.</p>
      )}
      <Button type="button" onClick={onRefresh} busy={busy}>
        {code ? '새 코드 발급' : '코드 발급'}
      </Button>
      <p className="caption">카메라가 없어도 숫자를 직접 보여 주면 됩니다.</p>
    </section>
  );
}
