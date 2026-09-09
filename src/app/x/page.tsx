'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { keys } from '@/lib/queryKeys';
import { AppBar, BottomActionBar, DemoBadge, Shell, StatusChip } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { INCIDENT_STATUS_LABEL } from '@/lib/status';
import { formatSeoulRange } from '@/lib/dates';
import { NOTIFICATION_POLL_MS } from '@/lib/money';

export default function XHomePage() {
  return (
    <RequireRole role="REQUESTER">
      <XHome />
    </RequireRole>
  );
}

function XHome() {
  const { user } = useAuth();
  const { data: incidents = [] } = useQuery({
    queryKey: keys.incidents(user?.id),
    queryFn: api.myIncidents,
  });
  const { data: notes = [] } = useQuery({
    queryKey: keys.notifications(user?.id),
    queryFn: api.notifications,
    refetchInterval: () => (document.visibilityState === 'visible' ? NOTIFICATION_POLL_MS : false),
  });
  const banner = notes.find((n) => !n.readAt && (n.type === 'CANDIDATE_FOUND' || n.type === 'NO_CANDIDATE'));

  return (
    <>
      <AppBar title="내 사고 요청" />
      <Shell>
        {banner ? (
          <Link href={`/x/incidents/${banner.incidentId}#candidates`} className="card">
            <p className="typo-label">{banner.title}</p>
            <p className="typo-sm mt-sm">{banner.body}</p>
          </Link>
        ) : null}
        {incidents.length === 0 ? <p className="typo-sm">아직 등록한 사고 요청이 없습니다.</p> : null}
        {incidents.map((incident) => (
          <Link key={incident.id} href={`/x/incidents/${incident.id}`} className="card flex flex-col gap-sm">
            <div className="flex items-center justify-between gap-md">
              <h2 className="typo-title">{incident.place.name}</h2>
              <StatusChip label={INCIDENT_STATUS_LABEL[incident.status]} tone="warning" />
            </div>
            <p className="typo-sm">{formatSeoulRange(incident.occurredFrom, incident.occurredTo)}</p>
            <p className="typo-sm">
              {incident.vehicle.color} {incident.vehicle.model}
            </p>
          </Link>
        ))}
        <DemoBadge>데모</DemoBadge>
      </Shell>
      <BottomActionBar>
        <Link href="/x/incidents/new" className="btn btn-primary">
          사고 제보하기
        </Link>
      </BottomActionBar>
    </>
  );
}
