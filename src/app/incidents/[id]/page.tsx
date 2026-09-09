'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppBar, Shell, ErrorState } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { IncidentMap } from '@/components/IncidentMap';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatSeoulRange } from '@/lib/dates';
import { INCIDENT_STATUS_LABEL, INCIDENT_TYPE_LABEL } from '@/lib/status';

export default function IncidentPage() { return <RequireRole><Incident /></RequireRole>; }
function Incident() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['incident', id, user?.id], queryFn: () => api.incident(id) });
  const i = q.data;
  const point = useMemo(() => i && i.place.lat !== null && i.place.lng !== null ? { lat: i.place.lat, lng: i.place.lng } : null, [i]);
  return <><AppBar title="사고 신고" backHref="/map" /><Shell>
    {q.isPending ? <p role="status">신고를 불러오는 중…</p> : null}
    {q.isError ? <ErrorState title="신고를 볼 수 없어요" body={q.error.message} onRetry={() => void q.refetch()} /> : null}
    {i ? <>
      <section className="card flex flex-col gap-sm"><h2 className="typo-title">{i.place.name}</h2><p>{i.place.address}</p><p className="typo-sm">{formatSeoulRange(i.occurredFrom, i.occurredTo)}</p><p className="typo-sm">{INCIDENT_TYPE_LABEL[i.type]} · {INCIDENT_STATUS_LABEL[i.status]}</p><p>{i.vehicle.color} {i.vehicle.model} · {i.vehicle.damageArea}</p><p>{i.description ?? i.descriptionSummary}</p></section>
      {point ? <IncidentMap selected={point} focus={point} /> : <p className="typo-sm">등록된 위치 좌표가 없습니다.</p>}
      {(i.photos ?? []).map((photo, index) => photo.url ? <img key={photo.position ?? index} src={photo.url} alt={`피해 차량 사진 ${index + 1}`} className="w-full rounded-[10px]" /> : null)}
      {!i.masked && user?.role === 'REQUESTER' ? <Link href={`/x/incidents/${id}`} className="btn btn-primary">내 신고 관리</Link> : null}
      {user?.role === 'WITNESS' && (i.mySubmissionId || ['OPEN', 'COLLECTING'].includes(i.status)) ? <Link href={i.mySubmissionId ? `/y/submissions/${i.mySubmissionId}/analysis` : `/y/incidents/${id}/upload`} className="btn btn-primary">{i.mySubmissionId ? '내 영상 제보 보기' : '영상 제보하기'}</Link> : null}
    </> : null}
  </Shell></>;
}
