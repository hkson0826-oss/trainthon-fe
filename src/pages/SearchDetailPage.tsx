import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ItemCard } from '@/components/ui/ItemCard';
import { SimilarityIndicator } from '@/components/ui/SimilarityIndicator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PermissionDenied } from '@/components/ui/Feedback';
import { Field, TextArea } from '@/components/ui/Field';
import { cancelSearch, createClaim, getSearch, listMatches } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';
import { formatRemaining, formatSeoulDateTime } from '@/lib/dates';
import { SEARCH_STATUS } from '@/lib/status';
import { evidenceSchema } from '@/lib/validation';
import { formatKrw } from '@/lib/money';
import { PRICING } from '@/contracts/amounts';

export function SearchDetailPage() {
  useDemoState();
  const { searchId = '' } = useParams();
  const navigate = useNavigate();
  const search = getSearch(searchId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [claimFor, setClaimFor] = useState<string | null>(null);
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!search) {
    return (
      <PageShell title="찾기 요청">
        <PermissionDenied />
      </PageShell>
    );
  }

  const current = search;
  const matches = listMatches(current.id);
  const canCancel = ['DRAFT', 'AWAITING_PAYMENT', 'SEARCHING', 'CLAIM_PENDING'].includes(current.status);

  function submitClaim() {
    if (!claimFor) return;
    const parsed = evidenceSchema.safeParse(evidence);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const claim = createClaim({ searchId: current.id, foundItemId: claimFor, evidenceText: evidence });
      navigate(`/claims/${claim.id}`);
    } catch (caught) {
      setError(caught instanceof Error && caught.message === 'ITEM_UNAVAILABLE' ? '이미 다른 요청이 진행 중이에요.' : '지금은 요청할 수 없어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title={search.title}>
      <div className="flex flex-wrap items-center gap-sm">
        <StatusBadge view={SEARCH_STATUS[search.status]} />
        {search.expiresAt ? <span className="caption">{formatRemaining(search.expiresAt)}</span> : null}
      </div>
      <p className="typo-body-md">{search.description}</p>
      <p className="caption">
        {search.expiresAt ? `만료 ${formatSeoulDateTime(search.expiresAt)}` : '결제 전에는 탐색이 시작되지 않습니다.'} · 후보{' '}
        {matches.length}건
      </p>
      {search.status === 'AWAITING_PAYMENT' ? (
        <Button type="button" onClick={() => navigate(`/searches/${search.id}/checkout`)}>
          결제 계속하기
        </Button>
      ) : null}
      {search.status === 'SEARCHING' && matches.length === 0 ? (
        <p className="caption">아직 후보가 없어요. 가짜 후보를 채우지 않습니다.</p>
      ) : null}
      {search.status === 'CANCELLED' ? <p className="caption">요청이 취소되었습니다. 결제되었다면 환불 상태를 내 활동에서 확인하세요.</p> : null}
      {search.status === 'EXPIRED' ? <p className="caption">탐색 기간이 끝났습니다. 반환되지 않으면 전액 환불됩니다.</p> : null}
      <div className="grid gap-lg md:grid-cols-2">
        {matches.map((match) => (
          <div key={match.id} className="flex flex-col gap-md">
            <ItemCard item={match.item} />
            <SimilarityIndicator score={match.score} />
            <p className="caption">추천 근거: {match.reasons.join(', ')}</p>
            {search.status === 'SEARCHING' ? (
              <Button type="button" variant="secondary" onClick={() => setClaimFor(match.foundItemId)}>
                소유권 확인 요청
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      {search.activeClaimId ? (
        <Link className="btn btn-secondary" to={`/claims/${search.activeClaimId}`}>
          소유권 요청 보기
        </Link>
      ) : null}
      {canCancel ? (
        <Button type="button" variant="danger" onClick={() => setCancelOpen(true)}>
          찾기 요청 취소
        </Button>
      ) : null}
      <Dialog title="찾기 요청을 취소할까요?" open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <p className="typo-body-md">
          미반환 취소 시 결제한 {formatKrw(PRICING.amount)}은 전액 환불됩니다. 습득자 보상과 수수료는 생기지 않습니다.
        </p>
        <div className="mt-lg flex gap-sm">
          <Button
            type="button"
            variant="danger"
            busy={busy}
            onClick={() => {
              setBusy(true);
              try {
                cancelSearch(current.id, '사용자 취소');
                setCancelOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            취소하고 환불 진행
          </Button>
          <Button type="button" variant="secondary" onClick={() => setCancelOpen(false)}>
            닫기
          </Button>
        </div>
      </Dialog>
      <Dialog title="소유권 확인 요청" open={Boolean(claimFor)} onClose={() => setClaimFor(null)}>
        <p className="caption">이 설명은 공개 게시물이 아니라 해당 습득자만 검토합니다.</p>
        <div className="mt-lg">
          <Field label="소유권 설명" htmlFor="evidence" error={error ?? undefined}>
            <TextArea id="evidence" value={evidence} error={error ?? undefined} onChange={(event) => setEvidence(event.target.value)} />
          </Field>
        </div>
        <div className="mt-lg">
          <Button type="button" onClick={submitClaim} busy={busy}>
            요청 보내기
          </Button>
        </div>
      </Dialog>
    </PageShell>
  );
}
