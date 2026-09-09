'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppBar, Shell, ErrorState } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { IncidentMap } from '@/components/IncidentMap';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatSeoulRange } from '@/lib/dates';
import { INCIDENT_STATUS_LABEL } from '@/lib/status';
import type { MapBounds } from '@/types/api';

export default function MapPage() { return <RequireRole><ReportsMap /></RequireRole>; }

function ReportsMap() {
  const { user } = useAuth();
  const [viewport, setViewport] = useState<MapBounds>();
  const [bounds, setBounds] = useState<MapBounds>();
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { const t = setTimeout(() => setBounds(viewport), 350); return () => clearTimeout(t); }, [viewport]);
  const onBoundsChange = useCallback((b: MapBounds) => setViewport(b), []);
  const query = useQuery({ queryKey: ['map-incidents', user?.id, bounds], queryFn: () => api.mapIncidents(bounds), refetchInterval: 30000 });
  const items = query.data?.items ?? [];
  return <>
    <AppBar title="신고 지도" backHref={user?.role === 'REQUESTER' ? '/x' : '/y'} />
    <Shell>
      <div><h2 className="typo-title">우리 주변의 사고 신고</h2><p className="typo-sm mt-sm">로그인한 누구나 신고를 확인할 수 있어요. 지도를 움직여 다른 지역도 살펴보세요.</p></div>
      <IncidentMap items={items} onBoundsChange={onBoundsChange} focus={focus} />
      {query.isPending ? <p role="status">신고를 불러오는 중…</p> : null}
      {query.isError ? <ErrorState title="신고를 불러오지 못했어요" body={query.error.message} onRetry={() => void query.refetch()} /> : null}
      {query.data ? <p className="typo-sm" role="status">현재 지도 영역 {items.length}건{query.data.hasMore ? ' · 일부만 표시됩니다. 지도를 확대해 주세요.' : ''}</p> : null}
      {query.isSuccess && !items.length ? <section className="card"><h2 className="typo-title">이 지역에는 아직 신고가 없어요</h2><p className="typo-sm mt-sm">지도를 축소하거나 다른 지역으로 이동해 보세요.</p></section> : null}
      {items.map((item) => <article key={item.id} className="card flex flex-col gap-sm">
        <div className="flex items-center justify-between gap-sm"><h2 className="typo-title">{item.place.name}</h2><span className="badge badge-neutral">{INCIDENT_STATUS_LABEL[item.status]}</span></div>
        <p className="typo-sm">{item.place.address}</p><p className="typo-sm">{formatSeoulRange(item.occurredFrom, item.occurredTo)}</p>
        <div className="flex gap-sm"><button type="button" className="btn btn-secondary" onClick={() => setFocus({ lat: item.place.lat!, lng: item.place.lng! })}>위치 보기</button><Link className="btn btn-primary" href={`/incidents/${item.id}`}>신고 상세</Link></div>
      </article>)}
      {user?.role === 'REQUESTER' ? <Link className="btn btn-primary" href="/x/incidents/new">사고 신고하기</Link> : null}
    </Shell>
  </>;
}
