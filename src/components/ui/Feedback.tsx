import { type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';

export function EmptyState({
  title,
  body,
  actionTo,
  actionLabel,
}: {
  title: string;
  body: string;
  actionTo?: string;
  actionLabel?: string;
}) {
  return (
    <CardBox>
      <h2 className="typo-title-lg">{title}</h2>
      <p className="caption mt-sm">{body}</p>
      {actionTo && actionLabel ? (
        <div className="mt-lg">
          <ButtonLink to={actionTo}>{actionLabel}</ButtonLink>
        </div>
      ) : null}
    </CardBox>
  );
}

function CardBox({ children }: { children: ReactNode }) {
  return <section className="card-surface">{children}</section>;
}

export function ErrorPanel({
  title = '지금은 이 작업을 완료하지 못했어요',
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <section className="card-surface" role="alert">
      <h2 className="typo-title-lg">{title}</h2>
      <p className="caption mt-sm">{body}</p>
      {onRetry ? (
        <div className="mt-lg">
          <button className="btn btn-primary" type="button" onClick={onRetry}>
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function PermissionDenied({ body = '이 화면에 접근할 수 없어요.' }: { body?: string }) {
  return (
    <EmptyState
      title="권한이 없어요"
      body={body}
      actionTo="/activity"
      actionLabel="내 활동으로 이동"
    />
  );
}

export function SkeletonBlock({ className = 'h-2xl' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
