'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, DemoBadge, EmptyState, Shell } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { formatSeoulRange } from '@/lib/dates';

export default function VisitsPage() {
  return (
    <RequireRole role="WITNESS">
      <VisitsInner />
    </RequireRole>
  );
}

function VisitsInner() {
  const { user } = useAuth();
  const client = useQueryClient();
  const { data: visits = [] } = useQuery({ queryKey: keys.visits(user?.id), queryFn: api.visits });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteVisit(id),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.visits(user?.id) }),
  });

  return (
    <>
      <AppBar title="방문 기록" backHref="/y" />
      <Shell>
        <DemoBadge>데모 seed</DemoBadge>
        {visits.length === 0 ? <EmptyState title="방문 기록이 없습니다" body="데모 방문 기록을 삭제했거나 아직 없습니다." /> : null}
        {visits.map((visit) => (
          <article key={visit.id} className="card flex flex-col gap-sm">
            <h2 className="typo-title">{visit.placeName}</h2>
            <p className="typo-sm">{formatSeoulRange(visit.enteredAt, visit.exitedAt)}</p>
            <p className="typo-sm">{visit.source === 'SEED' ? '데모 seed' : '직접 입력'}</p>
            <button type="button" className="btn btn-danger" onClick={() => remove.mutate(visit.id)}>
              삭제
            </button>
          </article>
        ))}
      </Shell>
    </>
  );
}
