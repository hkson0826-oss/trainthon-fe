'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { env } from '@/lib/env';
import { keys } from '@/lib/queryKeys';
import { NOTIFICATION_POLL_MS } from '@/lib/money';

export function AppBar({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();
  const { user, switchAccount } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const { data: notifications = [] } = useQuery({
    queryKey: keys.notifications(user?.id),
    queryFn: api.notifications,
    enabled: Boolean(user),
    refetchInterval: (query) => (typeof document !== 'undefined' && document.visibilityState === 'visible' ? NOTIFICATION_POLL_MS : false),
  });
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <header className="app-bar">
      <div className="mx-auto flex w-full max-w-[640px] items-center gap-md">
        {backHref ? (
          <button type="button" className="btn btn-secondary" style={{ width: 44 }} onClick={() => router.push(backHref)} aria-label="뒤로 가기">
            ←
          </button>
        ) : (
          <span className="typo-label text-primary">Lumina</span>
        )}
        <h1 className="typo-label min-w-0 flex-1">{title}</h1>
        {user ? <Link href="/map" className="btn btn-secondary" style={{ width: 'auto' }} aria-label="신고 지도">지도</Link> : null}
        {user && env.demoMode ? (
          <button
            type="button"
            className="btn btn-secondary role-switch"
            style={{ width: 'auto' }}
            disabled={switching}
            aria-label={user.role === 'REQUESTER' ? '목격자 계정으로 전환' : '피해자 계정으로 전환'}
            onClick={async () => {
              setSwitching(true);
              setSwitchError(null);
              try {
                const next = await switchAccount();
                router.replace(next.role === 'REQUESTER' ? '/x' : '/y');
              } catch (cause) {
                setSwitchError(cause instanceof Error ? cause.message : '역할을 전환하지 못했습니다.');
              } finally {
                setSwitching(false);
              }
            }}
          >
            {switching ? '전환 중…' : user.role === 'REQUESTER' ? '목격자로 전환' : '피해자로 전환'}
          </button>
        ) : null}
        {user ? (
          <Link href="/notifications" className="btn btn-secondary" style={{ width: 44 }} aria-label="알림">
            종
            {unread > 0 ? <span className="unread-dot" /> : null}
          </Link>
        ) : null}
      </div>
      {switchError ? <p className="field-error mx-auto mt-sm w-full max-w-[640px]" role="alert">{switchError}</p> : null}
    </header>
  );
}

export function BottomActionBar({ children }: { children: React.ReactNode }) {
  return <div className="bottom-action mx-auto w-full max-w-[640px]">{children}</div>;
}

export function DemoBadge({ children }: { children: React.ReactNode }) {
  return <span className="badge badge-demo">{children}</span>;
}

export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="card">
      <h2 className="typo-title">{title}</h2>
      <p className="typo-sm mt-sm">{body}</p>
    </section>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <section className="card" role="alert">
      <h2 className="typo-title">{title}</h2>
      <p className="typo-sm mt-sm">{body}</p>
      {onRetry ? (
        <button type="button" className="btn btn-primary mt-lg" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </section>
  );
}

export function Skeleton({ className = 'h-2xl' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function Shell({ children }: { children: React.ReactNode }) {
  return <main className="shell flex flex-col gap-xl">{children}</main>;
}
