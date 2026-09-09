import { Link, useParams } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { LockedPickupInfo } from '@/components/ui/LockedPickupInfo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageShell } from '@/components/layout/PageShell';
import { PermissionDenied } from '@/components/ui/Feedback';
import { CATEGORY_LABEL } from '@/lib/categories';
import { FOUND_STATUS } from '@/lib/status';
import { formatSeoulDateTime } from '@/lib/dates';
import { getOwnerFound, getPublicFound } from '@/services/demoStore';
import { useCurrentUser, useDemoState } from '@/hooks/useDemo';
import { PRICING } from '@/contracts/amounts';
import { formatKrw } from '@/lib/money';

export function ItemDetailPage() {
  useDemoState();
  const { itemId = '' } = useParams();
  const user = useCurrentUser();
  const publicItem = getPublicFound(itemId);
  const ownerItem = getOwnerFound(itemId);

  if (!publicItem && !ownerItem) {
    return (
      <PageShell title="습득물을 찾을 수 없어요">
        <PermissionDenied body="없거나 공개되지 않은 습득물입니다." />
      </PageShell>
    );
  }

  const item = ownerItem ?? publicItem!;
  const thumbnail = 'thumbnailUrl' in item ? item.thumbnailUrl : null;

  return (
    <PageShell title={item.title}>
      <div className="flex flex-wrap items-center gap-sm">
        <StatusBadge view={FOUND_STATUS[item.status]} />
        <span className="caption">{CATEGORY_LABEL[item.category]}</span>
      </div>
      {thumbnail ? (
        <div className="photo-frame">
          <img src={thumbnail} alt="" className="w-full" />
        </div>
      ) : null}
      <p className="typo-body-md">{item.description}</p>
      <p className="caption">대략적인 지역 · {'placeLabel' in item ? item.placeLabel : ownerItem?.placeLabel}</p>
      {ownerItem ? (
        <section className="card-surface flex flex-col gap-md">
          <h2 className="typo-title-lg">내 습득물 정보</h2>
          <p className="caption">비공개 특징: {ownerItem.privateFeatures}</p>
          <p className="caption">보관 장소: {ownerItem.storagePlace.label}</p>
          <p className="caption">수령 안내: {ownerItem.pickupInstructions}</p>
          <p className="caption">등록 시각 {formatSeoulDateTime(ownerItem.createdAt)}</p>
          {ownerItem.status === 'DRAFT' || ownerItem.status === 'AVAILABLE' ? (
            <ButtonLink to={`/found/${ownerItem.id}/edit`} variant="secondary">
              내용 수정
            </ButtonLink>
          ) : null}
        </section>
      ) : (
        <LockedPickupInfo />
      )}
      <div className="card-surface flex flex-col gap-md">
        <h2 className="typo-title-lg">내 물건인가요?</h2>
        <p className="caption">
          찾기 요청비 {formatKrw(PRICING.amount)}을 결제하면 후보를 확인하고 소유권 확인을 요청할 수 있어요.
        </p>
        <ButtonLink to="/lost/new">분실물 찾기 시작</ButtonLink>
      </div>
      {user ? (
        <p className="caption">
          부적절한 등록은 <Link to="/profile">내 정보</Link>에서 안내를 확인한 뒤 신고할 수 있어요. 데모에서는 접수만
          안내합니다.
        </p>
      ) : null}
    </PageShell>
  );
}
