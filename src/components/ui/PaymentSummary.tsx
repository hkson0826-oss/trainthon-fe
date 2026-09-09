import { PRICING } from '@/contracts/amounts';
import { Amount } from '@/components/ui/Amount';
import { DemoMoneyLabel } from '@/components/ui/StatusBadge';

export function PaymentSummary() {
  return (
    <section className="card-surface flex flex-col gap-md">
      <div className="flex items-center justify-between gap-md">
        <h2 className="typo-title-lg">찾기 요청비</h2>
        <DemoMoneyLabel />
      </div>
      <p className="typo-headline-md">
        <Amount value={PRICING.amount} />
      </p>
      <p className="typo-body-md">7일 동안의 탐색 요청비입니다. 반환을 보장하는 금액이 아닙니다.</p>
      <hr className="divider" />
      <ul className="flex flex-col gap-sm">
        <li className="flex justify-between gap-md">
          <span>반환 확인 시 습득자 보상</span>
          <Amount value={PRICING.finderAmount} />
        </li>
        <li className="flex justify-between gap-md">
          <span>Lumina 매칭·운영 수수료</span>
          <Amount value={PRICING.platformAmount} />
        </li>
      </ul>
      <p className="caption">미반환으로 취소되거나 만료되면 전액 환불되며, 습득자 보상과 수수료는 생기지 않습니다.</p>
    </section>
  );
}
