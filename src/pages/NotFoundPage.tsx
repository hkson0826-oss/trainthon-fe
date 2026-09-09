import { ButtonLink } from '@/components/ui/Button';
import { PageShell } from '@/components/layout/PageShell';

export function NotFoundPage() {
  return (
    <PageShell title="화면을 찾을 수 없어요">
      <p className="typo-body-md">주소가 잘못되었거나 더 이상 없는 화면입니다.</p>
      <ButtonLink to="/">홈으로</ButtonLink>
    </PageShell>
  );
}
