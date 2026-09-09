import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { DemoMoneyLabel, StatusBadge } from '@/components/ui/StatusBadge';
import { PAYMENT_STATUS } from '@/lib/status';
import { confirmDemoPayment, failDemoPayment, getPayment, getSearch } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';

export function PaymentReturnPage() {
  useDemoState();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = params.get('paymentId');
  const queryStatus = params.get('status');
  const [message, setMessage] = useState('결제 결과를 확인하고 있어요');
  const [delayed, setDelayed] = useState(false);
  const started = useRef(false);
  const payment = paymentId ? getPayment(paymentId) : null;
  const search = payment ? getSearch(payment.searchId) : null;

  useEffect(() => {
    if (!paymentId || started.current) return;
    started.current = true;
    const delayHint = window.setTimeout(() => {
      setDelayed(true);
      setMessage('확인이 지연되고 있어요. 내 활동에서 다시 확인할 수 있어요.');
    }, 2500);
    const verify = window.setTimeout(() => {
      try {
        if (params.get('demoOutcome') === 'fail') {
          failDemoPayment(paymentId);
          setMessage('결제가 실패했어요. 다시 시도할 수 있어요.');
        } else {
          const next = confirmDemoPayment(paymentId);
          if (next.status === 'PAID') {
            setMessage('결제가 확인되어 탐색을 시작했어요.');
            const paidSearch = getSearch(next.searchId);
            if (paidSearch) navigate(`/searches/${paidSearch.id}`, { replace: true });
          }
        }
      } catch {
        setMessage('결제 상태를 확인하지 못했어요. 내 활동에서 다시 확인해 주세요.');
      }
    }, 1400);
    return () => {
      window.clearTimeout(delayHint);
      window.clearTimeout(verify);
    };
  }, [paymentId, navigate, params]);

  return (
    <PageShell title="결제 확인">
      <div className="form-width flex flex-col gap-lg">
        <section className="card-surface flex flex-col gap-md">
          <DemoMoneyLabel />
          <p className="typo-body-md">{message}</p>
          {queryStatus ? (
            <p className="caption">주소의 성공/실패 문구는 결제 상태의 근거가 아닙니다. 서버(데모) 확인 결과를 기다립니다.</p>
          ) : null}
          {payment ? <StatusBadge view={PAYMENT_STATUS[payment.status]} /> : <p className="caption">결제 정보를 찾지 못했어요.</p>}
          {delayed ? (
            <Link className="btn btn-secondary" to="/activity">
              내 활동에서 확인
            </Link>
          ) : null}
          {payment?.status === 'FAILED' && search ? (
            <Button type="button" onClick={() => navigate(`/searches/${search.id}/checkout`)}>
              다시 결제하기
            </Button>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
