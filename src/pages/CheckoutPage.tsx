import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { PaymentSummary } from '@/components/ui/PaymentSummary';
import { PermissionDenied } from '@/components/ui/Feedback';
import { TERMS_VERSION } from '@/contracts/amounts';
import { formatKrw } from '@/lib/money';
import { PRICING } from '@/contracts/amounts';
import { checkoutSearch, getSearch } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';
import { SEARCH_STATUS } from '@/lib/status';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function CheckoutPage() {
  useDemoState();
  const { searchId = '' } = useParams();
  const navigate = useNavigate();
  const search = getSearch(searchId);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!search) {
    return (
      <PageShell title="결제">
        <PermissionDenied body="이 찾기 요청을 볼 수 없어요." />
      </PageShell>
    );
  }

  const current = search;

  if (['SEARCHING', 'CLAIM_PENDING', 'HANDOFF_READY', 'RETURNED'].includes(current.status)) {
    return <Navigate to={`/searches/${current.id}`} replace />;
  }

  function pay() {
    if (!agreed) return;
    setBusy(true);
    try {
      const { payment } = checkoutSearch(current.id);
      navigate(`/payments/return?paymentId=${payment.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="찾기 요청 결제">
      <div className="form-width flex flex-col gap-lg">
        <section className="card-surface flex flex-col gap-sm">
          <h2 className="typo-title-lg">{search.title}</h2>
          <p className="typo-body-md">{search.description}</p>
          <p className="caption">탐색 기간 7일 · 약관 버전 {TERMS_VERSION}</p>
          <StatusBadge view={SEARCH_STATUS[search.status]} />
        </section>
        <PaymentSummary />
        <label className="flex items-start gap-md typo-body-md">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-xs h-lg w-lg"
          />
          <span>
            {formatKrw(PRICING.amount)} 찾기 요청비, 7일 탐색, 미반환 시 전액 환불, 반환 확인 시{' '}
            {formatKrw(PRICING.finderAmount)} / {formatKrw(PRICING.platformAmount)} 배분에 동의합니다. 실제 금전 이동은
            없습니다.
          </span>
        </label>
        <Button type="button" onClick={pay} disabled={!agreed} busy={busy}>
          {formatKrw(PRICING.amount)} 결제하고 찾기 시작
        </Button>
      </div>
    </PageShell>
  );
}
