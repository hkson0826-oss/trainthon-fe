import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button, ButtonLink } from '@/components/ui/Button';
import { logoutDemo, resetDemo } from '@/services/demoStore';
import { useCurrentUser } from '@/hooks/useDemo';
import { formatSeoulDateTime } from '@/lib/dates';
import { APP_CONFIG } from '@/mocks/fixtures';

export function ProfilePage() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <PageShell title="내 정보">
      <section className="form-width card-surface flex flex-col gap-md">
        <p className="caption">데모 계정 · {user.demoHandle}</p>
        <p className="typo-title-lg">{user.displayName}</p>
        <p className="caption">가입 {formatSeoulDateTime(user.createdAt)}</p>
        <p className="caption">역할은 고정되지 않습니다. 같은 계정으로 찾기와 습득물 등록을 모두 할 수 있어요.</p>
        <p className="caption">프로필 수정 API가 없어 편집 버튼은 제공하지 않습니다.</p>
        <p className="caption">앱 모드 {APP_CONFIG.mode} · 약관 {APP_CONFIG.termsVersion}</p>
        <ButtonLink to="/rewards" variant="secondary">
          내 보상 보기
        </ButtonLink>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            logoutDemo();
            navigate('/');
          }}
        >
          로그아웃
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            resetDemo();
            navigate('/');
          }}
        >
          데모 데이터 초기화
        </Button>
      </section>
    </PageShell>
  );
}
