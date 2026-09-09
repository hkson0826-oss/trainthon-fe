import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Field, TextArea } from '@/components/ui/Field';
import { LockedPickupInfo } from '@/components/ui/LockedPickupInfo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PermissionDenied } from '@/components/ui/Feedback';
import { approveClaim, getClaim, getFoundByIdInternal, getPickup, getPublicFound, rejectClaim } from '@/services/demoStore';
import { useCurrentUser, useDemoState } from '@/hooks/useDemo';
import { CLAIM_STATUS } from '@/lib/status';
import { formatSeoulDateTime } from '@/lib/dates';

export function ClaimPage() {
  useDemoState();
  const { claimId = '' } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const claim = getClaim(claimId);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!claim || !user) {
    return (
      <PageShell title="소유권 확인">
        <PermissionDenied body="당사자만 이 요청을 볼 수 있어요." />
      </PageShell>
    );
  }

  const current = claim;

  const isFinder = current.finderId === user.id;
  const isSeeker = current.seekerId === user.id;
  const publicItem = getPublicFound(current.foundItemId);
  const ownerItem = isFinder ? getFoundByIdInternal(current.foundItemId) : null;
  const pickup = getPickup(current.id);
  const showLocked = !pickup;

  function approve() {
    setBusy(true);
    try {
      const result = approveClaim(current.id);
      navigate(`/handoffs/${result.handoff.id}`);
    } catch {
      setError('다른 요청이 먼저 처리되었거나 지금은 승인할 수 없어요. 최신 상태를 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  function reject() {
    if (reason.trim().length < 2) {
      setError('거절 이유를 적어 주세요.');
      return;
    }
    setBusy(true);
    try {
      rejectClaim(current.id, reason.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="소유권 확인">
      <div className="flex flex-wrap items-center gap-sm">
        <StatusBadge view={CLAIM_STATUS[claim.status]} />
        <span className="caption">{formatSeoulDateTime(claim.createdAt)}</span>
      </div>
      {publicItem ? <p className="typo-title-lg">{publicItem.title}</p> : null}
      {ownerItem ? <p className="caption">내 등록 물건 · {ownerItem.title}</p> : null}
      {isFinder ? (
        <section className="card-surface">
          <h2 className="typo-title-lg">분실자가 보낸 소유권 설명</h2>
          <p className="typo-body-md mt-sm">{claim.evidenceText}</p>
        </section>
      ) : (
        <p className="caption">보낸 설명은 해당 습득자만 검토합니다.</p>
      )}
      {claim.rejectReason ? <p className="field-error">거절 이유: {claim.rejectReason}</p> : null}
      {showLocked || !pickup ? <LockedPickupInfo /> : (
        <section className="card-surface flex flex-col gap-sm">
          <h2 className="typo-title-lg">수령 안내</h2>
          <p className="typo-body-md">{pickup.storagePlace.label}</p>
          <p className="typo-body-md">{pickup.pickupInstructions}</p>
          {claim.handoffId ? (
            <Link className="btn btn-primary" to={`/handoffs/${claim.handoffId}`}>
              반환 인증으로 이동
            </Link>
          ) : null}
        </section>
      )}
      {isFinder && claim.status === 'PENDING' ? (
        <div className="form-width flex flex-col gap-md">
          <Field label="거절 이유" htmlFor="reject-reason">
            <TextArea id="reject-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
          {error ? <p className="field-error">{error}</p> : null}
          <div className="flex flex-col gap-sm">
            <Button type="button" onClick={approve} busy={busy}>
              승인하고 수령 안내
            </Button>
            <Button type="button" variant="danger" onClick={reject} busy={busy}>
              거절
            </Button>
          </div>
        </div>
      ) : null}
      {isSeeker && claim.status === 'PENDING' ? (
        <p className="caption">습득자가 검토하는 동안 정확한 보관 장소는 잠겨 있습니다.</p>
      ) : null}
    </PageShell>
  );
}
