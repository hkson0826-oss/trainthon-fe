import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { HandoffCodeView } from '@/components/ui/HandoffCode';
import { DemoMoneyLabel, StatusBadge } from '@/components/ui/StatusBadge';
import { PermissionDenied } from '@/components/ui/Feedback';
import { Amount } from '@/components/ui/Amount';
import { PRICING } from '@/contracts/amounts';
import {
  completeHandoff,
  getClaim,
  getHandoff,
  getIssuedCode,
  issueHandoffCode,
  myPayouts,
} from '@/services/demoStore';
import { useCurrentUser, useDemoState } from '@/hooks/useDemo';
import { HANDOFF_STATUS, PAYOUT_STATUS } from '@/lib/status';

export function HandoffPage() {
  useDemoState();
  const { handoffId = '' } = useParams();
  const user = useCurrentUser();
  const handoff = getHandoff(handoffId);
  const claim = handoff ? getClaim(handoff.claimId) : null;
  const code = handoff ? getIssuedCode(handoff.id) : null;
  const [manual, setManual] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!handoff || !claim || !user) {
    return (
      <PageShell title="반환 인증">
        <PermissionDenied />
      </PageShell>
    );
  }

  const current = handoff;

  const isSeeker = claim.seekerId === user.id;
  const isFinder = claim.finderId === user.id;
  const payout = myPayouts().find((row) => row.handoffId === current.id);

  function issue() {
    setBusy(true);
    try {
      issueHandoffCode(current.id);
    } finally {
      setBusy(false);
    }
  }

  function consume() {
    setBusy(true);
    setError(null);
    try {
      completeHandoff(current.id, { manualCode: manual.trim() });
    } catch (caught) {
      const codeName = caught instanceof Error ? caught.message : '';
      if (codeName === 'CODE_EXPIRED') setError('코드가 만료됐어요. 분실자에게 새 코드를 요청하세요.');
      else if (codeName === 'CODE_INVALID') setError('코드가 올바르지 않아요.');
      else setError('반환을 확인하지 못했어요. 상태를 다시 조회해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="반환 인증">
      <StatusBadge view={HANDOFF_STATUS[handoff.status]} />
      {isSeeker ? (
        <HandoffCodeView code={code} onRefresh={issue} busy={busy} />
      ) : null}
      {isFinder ? (
        <section className="card-surface flex flex-col gap-lg">
          <h2 className="typo-title-lg">코드 확인하고 반환 완료</h2>
          <p className="typo-body-md">물건을 실제로 건넨 뒤에만 코드를 입력하세요.</p>
          <Field label="인증 코드" htmlFor="manual-code" error={error ?? undefined}>
            <TextInput
              id="manual-code"
              inputMode="numeric"
              value={manual}
              error={error ?? undefined}
              onChange={(event) => setManual(event.target.value)}
            />
          </Field>
          <Button type="button" onClick={consume} busy={busy} disabled={handoff.status !== 'READY'}>
            코드 확인하고 반환 완료
          </Button>
        </section>
      ) : null}
      {handoff.status === 'COMPLETED' ? (
        <section className="card-surface flex flex-col gap-md">
          <h2 className="typo-title-lg">반환이 완료되었습니다</h2>
          <p className="typo-body-md">반환 완료와 보상 지급은 다른 상태입니다.</p>
          <DemoMoneyLabel />
          {payout ? (
            <>
              <p>
                습득자 보상 <Amount value={PRICING.finderAmount} />
              </p>
              <StatusBadge view={PAYOUT_STATUS[payout.status]} />
              {payout.status !== 'PAID' ? <p className="caption">아직 지급 대기입니다. 지급 완료로 표시하지 않습니다.</p> : null}
            </>
          ) : (
            <p className="caption">보상 상태를 확인하려면 내 보상을 열어 주세요.</p>
          )}
        </section>
      ) : null}
    </PageShell>
  );
}
