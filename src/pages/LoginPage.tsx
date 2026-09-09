import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_USERS } from '@/mocks/fixtures';
import { loginDemo } from '@/services/demoStore';
import { isSafeNextPath } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = useMemo(() => isSafeNextPath(params.get('next')), [params]);

  return (
    <PageShell title="데모 로그인">
      <p className="typo-body-md">
        실제 Firebase 로그인은 아직 연결하지 않았습니다. 역할이 고정되지 않은 데모 계정 중 하나를 선택하세요.
      </p>
      <div className="form-width flex flex-col gap-lg">
        {DEMO_USERS.map((user) => (
          <Card key={user.id}>
            <h2 className="typo-title-lg">{user.displayName}</h2>
            <p className="caption mt-sm">{user.demoHandle}</p>
            <div className="mt-lg">
              <Button
                type="button"
                onClick={() => {
                  loginDemo(user.id);
                  navigate(next);
                }}
              >
                {user.displayName}으로 계속
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
