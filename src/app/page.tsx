'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/lib/env';
import { useAuth } from '@/lib/auth';
import { DemoBadge } from '@/components/AppChrome';

export default function LandingPage() {
  const { loginDemo, user } = useAuth();
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<'REQUESTER' | 'WITNESS' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(role: 'REQUESTER' | 'WITNESS') {
    setPendingRole(role);
    setError(null);
    try {
      const profile = await loginDemo(role);
      router.push(profile.role === 'REQUESTER' ? '/x' : '/y');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '데모 계정으로 진입하지 못했습니다.');
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <main className="shell flex min-h-dvh flex-col justify-center gap-xl">
      <p className="typo-sm">Lumina</p>
      <h1 className="page-title">주차장 사고 증거를, 당시 영상을 가진 사람과 연결합니다.</h1>
      <p className="typo-body">
        요청자 X가 사고와 피해 차량 사진을 남기면, 같은 시간대 방문 기록이 있는 제보자 Y에게 알림이 갑니다. AI는 사고
        후보 장면만 찾아 주며 가해나 과실을 확정하지 않습니다.
      </p>
      <DemoBadge>데모 · 실제 결제·송금 없음</DemoBadge>
      {env.demoMode ? (
        <div className="flex flex-col gap-md">
          <button type="button" className="btn btn-primary" disabled={pendingRole !== null} onClick={() => void start('REQUESTER')}>
            {pendingRole === 'REQUESTER' ? '피해자 계정으로 로그인 중…' : '피해자로 시작'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={pendingRole !== null} onClick={() => void start('WITNESS')}>
            {pendingRole === 'WITNESS' ? '목격자 계정으로 로그인 중…' : '목격자로 시작'}
          </button>
          <p className="typo-sm">데모 중 상단의 역할 전환 버튼으로 두 계정을 오갈 수 있습니다.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
        </div>
      ) : null}
      <button type="button" className="btn btn-secondary" disabled={!env.kakaoEnabled}>
        {env.kakaoEnabled ? 'Kakao로 로그인' : 'Kakao 로그인 · 설정 대기'}
      </button>
      {user ? <p className="typo-sm">현재 로그인: {user.displayName}</p> : null}
    </main>
  );
}
