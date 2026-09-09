'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, BottomActionBar, DemoBadge, Shell } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { formatSeoulRange } from '@/lib/dates';
import { formatKrw } from '@/lib/money';
import { INCIDENT_TYPE_LABEL } from '@/lib/status';

export default function YIncidentPage() {
  return (
    <RequireRole role="WITNESS">
      <YIncident />
    </RequireRole>
  );
}

function YIncident() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: incident } = useQuery({ queryKey: keys.incident(id, user?.id), queryFn: () => api.incident(id) });
  if (!incident) return null;
  const href = incident.mySubmissionId ? `/y/submissions/${incident.mySubmissionId}/analysis` : `/y/incidents/${id}/upload`;

  return (
    <>
      <AppBar title="사고 요청" backHref="/y" />
      <Shell>
        <section className="card flex flex-col gap-sm">
          <h2 className="typo-title">{incident.place.name}</h2>
          <p className="typo-sm">{formatSeoulRange(incident.occurredFrom, incident.occurredTo)}</p>
          <p className="typo-sm">{INCIDENT_TYPE_LABEL[incident.type]}</p>
          <p className="typo-body">
            {incident.vehicle.color} {incident.vehicle.model} · {incident.vehicle.damageArea}
          </p>
          <p className="typo-body">{incident.description ?? incident.descriptionSummary}</p>
          <Link href={`/incidents/${id}`} className="btn btn-secondary">지도에서 사고 위치 보기</Link>
          {incident.photos.map((photo) =>
            photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={photo.objectPath} src={photo.url} alt="피해 차량" className="w-full rounded-[10px]" />
            ) : null,
          )}
        </section>
        <section className="card flex flex-col gap-sm">
          <p className="typo-label">채택 시 보상 {formatKrw(incident.rewardPreview?.amount ?? 80000)} 예정</p>
          <DemoBadge>데모</DemoBadge>
        </section>
      </Shell>
      <BottomActionBar>
        <Link href={href} className="btn btn-primary">
          {incident.mySubmissionId ? '내 제보 보기' : '영상 제보하기'}
        </Link>
      </BottomActionBar>
    </>
  );
}
