'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, DemoBadge, Shell, StatusChip } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { formatSeoulRange } from '@/lib/dates';
import { formatKrw } from '@/lib/money';

export default function DonePage() {
  return (
    <RequireRole role="REQUESTER">
      <DoneInner />
    </RequireRole>
  );
}

function DoneInner() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: incident } = useQuery({ queryKey: keys.incident(id, user?.id), queryFn: () => api.incident(id) });
  const { data: settlement } = useQuery({ queryKey: keys.settlement(id, user?.id), queryFn: () => api.settlement(id) });
  if (!incident) return null;
  const count = incident.matching?.matchedWitnessCount ?? incident.matchedWitnessCount;

  return (
    <>
      <AppBar title="접수 완료" backHref="/x" />
      <Shell>
        <p className="page-title">사고 접수가 완료되었습니다</p>
        <section className="card flex flex-col gap-sm">
          <p className="typo-title">{incident.place.name}</p>
          <p className="typo-sm">{formatSeoulRange(incident.occurredFrom, incident.occurredTo)}</p>
          <p className="typo-sm">
            {incident.vehicle.color} {incident.vehicle.model} · {incident.vehicle.damageArea}
          </p>
        </section>
        {count > 0 ? (
          <p className="typo-title">같은 시간대 방문 사용자 {count}명 발견</p>
        ) : (
          <p className="typo-body">아직 같은 시간대 방문 사용자가 없습니다. 새로운 방문 기록이 확인되면 알려드릴게요.</p>
        )}
        <StatusChip label="예치 완료(데모)" tone="warning" />
        {settlement ? <p className="typo-sm">예치 {formatKrw(settlement.depositAmount)} · 데모</p> : null}
        <DemoBadge>데모: 실제 결제·송금 없음</DemoBadge>
        <Link href={`/x/incidents/${incident.id}`} className="btn btn-primary">
          내 요청 보기
        </Link>
      </Shell>
    </>
  );
}
