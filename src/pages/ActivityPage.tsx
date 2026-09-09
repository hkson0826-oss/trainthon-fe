import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/Feedback';
import { CLAIM_STATUS, FOUND_STATUS, SEARCH_STATUS } from '@/lib/status';
import { getPublicFound, myClaims, myFoundItems, mySearches } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';

export function ActivityPage() {
  useDemoState();
  const searches = mySearches();
  const foundItems = myFoundItems();
  const seekerClaims = myClaims('seeker');
  const finderClaims = myClaims('finder');

  return (
    <PageShell title="내 활동">
      <section className="flex flex-col gap-md">
        <h2 className="typo-title-lg">내가 찾는 물건</h2>
        {searches.length === 0 ? (
          <EmptyState title="찾기 요청이 없어요" body="분실 정보와 요청비를 확인한 뒤 탐색을 시작할 수 있어요." actionTo="/lost/new" actionLabel="분실물 찾기" />
        ) : (
          searches.map((search) => (
            <Link key={search.id} to={`/searches/${search.id}`} className="card-surface flex items-center justify-between gap-md no-underline">
              <div>
                <p className="typo-title-lg">{search.title}</p>
                <p className="caption">{search.description}</p>
              </div>
              <StatusBadge view={SEARCH_STATUS[search.status]} />
            </Link>
          ))
        )}
      </section>
      <section className="flex flex-col gap-md">
        <h2 className="typo-title-lg">내가 주운 물건</h2>
        {foundItems.length === 0 ? (
          <EmptyState title="등록한 습득물이 없어요" body="주운 물건을 등록하면 주인을 찾는 데 도움이 됩니다." actionTo="/found/new" actionLabel="습득물 등록" />
        ) : (
          foundItems.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`} className="card-surface flex items-center justify-between gap-md no-underline">
              <div>
                <p className="typo-title-lg">{item.title}</p>
                <p className="caption">{item.placeLabel}</p>
              </div>
              <StatusBadge view={FOUND_STATUS[item.status]} />
            </Link>
          ))
        )}
      </section>
      <section className="flex flex-col gap-md">
        <h2 className="typo-title-lg">반환 요청</h2>
        {[...seekerClaims, ...finderClaims].length === 0 ? (
          <p className="caption">소유권 확인 요청이 없습니다.</p>
        ) : (
          [...seekerClaims, ...finderClaims].map((claim) => {
            const item = getPublicFound(claim.foundItemId);
            return (
              <Link key={`${claim.id}-${claim.seekerId}`} to={`/claims/${claim.id}`} className="card-surface flex items-center justify-between gap-md no-underline">
                <div>
                  <p className="typo-title-lg">{item?.title ?? '습득물'}</p>
                  <p className="caption">{claim.handoffId ? '수령 절차 있음' : '소유권 확인'}</p>
                </div>
                <StatusBadge view={CLAIM_STATUS[claim.status]} />
              </Link>
            );
          })
        )}
      </section>
    </PageShell>
  );
}
