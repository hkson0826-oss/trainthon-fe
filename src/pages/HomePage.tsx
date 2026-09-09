import { Link, useSearchParams } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ItemCard } from '@/components/ui/ItemCard';
import { PaymentSummary } from '@/components/ui/PaymentSummary';
import { PageShell } from '@/components/layout/PageShell';
import { PRICING } from '@/contracts/amounts';
import { formatKrw } from '@/lib/money';
import { listPublicFound } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';

export function HomePage() {
  useDemoState();
  const items = listPublicFound().slice(0, 3);

  return (
    <PageShell title="잃어버린 물건과, 발견한 사람을 연결해요.">
      <p className="typo-body-md">
        Lumina는 사례금 장터가 아닙니다. 분실자가 {formatKrw(PRICING.amount)} 찾기 요청비를 결제하면 AI가 습득물 후보를
        찾아 주고, 반환이 확인되면 {formatKrw(PRICING.finderAmount)}은 습득자 보상, {formatKrw(PRICING.platformAmount)}은
        매칭·운영 수수료로 나뉩니다.
      </p>
      <div className="flex flex-col gap-md sm:flex-row">
        <ButtonLink to="/lost/new">분실물 찾기 · {formatKrw(PRICING.amount)}</ButtonLink>
        <ButtonLink to="/found/new" variant="secondary">
          주운 물건 등록하기
        </ButtonLink>
      </div>
      <div className="grid gap-lg md:grid-cols-3">
        <Card>
          <p className="typo-label-sm">1</p>
          <h2 className="typo-title-lg mt-sm">정보 등록</h2>
          <p className="caption mt-sm">사진과 장소를 채팅처럼 입력합니다. 습득물 등록은 무료입니다.</p>
        </Card>
        <Card>
          <p className="typo-label-sm">2</p>
          <h2 className="typo-title-lg mt-sm">AI 후보 확인</h2>
          <p className="caption mt-sm">유사도 순위일 뿐, 일치 확률이나 찾기 보장은 아닙니다.</p>
        </Card>
        <Card>
          <p className="typo-label-sm">3</p>
          <h2 className="typo-title-lg mt-sm">소유권 확인 후 수령</h2>
          <p className="caption mt-sm">승인 전에는 정확한 보관 장소가 잠겨 있습니다. 반환은 일회용 코드로 확인합니다.</p>
        </Card>
      </div>
      <PaymentSummary />
      <div className="flex items-center justify-between gap-md">
        <h2 className="typo-title-lg">최근 공개 습득물</h2>
        <Link to="/items" className="typo-label-sm">
          전체 보기
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="caption">아직 등록된 물건이 없어요.</p>
      ) : (
        <div className="grid gap-lg md:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function ItemsPage() {
  useDemoState();
  const [params, setParams] = useSearchParams();
  const query = params.get('query') ?? '';
  const category = params.get('category') ?? '';
  const items = listPublicFound(query, category);

  return (
    <PageShell title="공개 습득물">
      <form
        className="form-width flex flex-col gap-md"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setParams({
            query: String(data.get('query') ?? ''),
            category: String(data.get('category') ?? ''),
          });
        }}
      >
        <label className="typo-label-md" htmlFor="query">
          검색어
        </label>
        <input id="query" name="query" defaultValue={query} className="input-field" />
        <label className="typo-label-md" htmlFor="category">
          카테고리
        </label>
        <select id="category" name="category" defaultValue={category} className="select-field">
          <option value="">전체</option>
          <option value="ELECTRONICS">전자기기</option>
          <option value="CLOTHING">의류</option>
          <option value="KEYS">열쇠</option>
          <option value="WALLET">지갑</option>
          <option value="ID_CARD">신분증</option>
          <option value="BOOKS">도서</option>
          <option value="ACCESSORIES">액세서리</option>
          <option value="OTHER">기타</option>
        </select>
        <div className="flex gap-sm">
          <button className="btn btn-primary" type="submit">
            검색
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setParams({})}
          >
            필터 초기화
          </button>
        </div>
      </form>
      {items.length === 0 ? (
        <div className="card-surface">
          <h2 className="typo-title-lg">아직 등록된 물건이 없어요</h2>
          <p className="caption mt-sm">필터를 지우거나 찾기 요청을 시작해 보세요.</p>
          <div className="mt-lg flex gap-sm">
            <ButtonLink to="/lost/new">분실물 찾기</ButtonLink>
            <ButtonLink to="/items" variant="secondary">
              필터 초기화
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-lg md:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
