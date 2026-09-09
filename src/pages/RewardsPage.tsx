import { PageShell } from '@/components/layout/PageShell';
import { Amount } from '@/components/ui/Amount';
import { DemoMoneyLabel, StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/Feedback';
import { PRICING } from '@/contracts/amounts';
import { formatSeoulDateTime } from '@/lib/dates';
import { PAYOUT_STATUS } from '@/lib/status';
import { APP_CONFIG } from '@/mocks/fixtures';
import { myPayouts } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';

export function RewardsPage() {
  useDemoState();
  const payouts = myPayouts();

  return (
    <PageShell title="내 보상">
      <div className="flex items-center gap-md">
        <DemoMoneyLabel />
      </div>
      <p className="typo-body-md">
        반환이 확인된 뒤에만 습득자 보상 <Amount value={PRICING.finderAmount} />이 생깁니다. 프런트에서 반환 횟수로 잔액을
        계산하지 않습니다.
      </p>
      {!APP_CONFIG.capabilities.payouts ? (
        <p className="caption">지급계정 등록은 이 데모에서 지원되지 않습니다. 지급은 대기 후 모의 완료로 표시됩니다.</p>
      ) : null}
      {payouts.length === 0 ? (
        <EmptyState title="보상 내역이 없어요" body="반환이 완료되면 여기에 지급 대기와 지급 완료가 구분되어 나타납니다." />
      ) : (
        <div className="flex flex-col gap-md">
          {payouts.map((payout) => (
            <article key={payout.id} className="card-surface flex flex-col gap-sm">
              <div className="flex items-center justify-between gap-md">
                <Amount value={payout.amount} />
                <StatusBadge view={PAYOUT_STATUS[payout.status]} />
              </div>
              <p className="caption">생성 {formatSeoulDateTime(payout.createdAt)}</p>
              {payout.paidAt ? <p className="caption">지급 시각 {formatSeoulDateTime(payout.paidAt)}</p> : <p className="caption">지급 대기</p>}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
