'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, DemoBadge, Shell, StatusChip } from '@/components/AppChrome';
import { AnalysisResultCard, VideoPlayer, type VideoPlayerHandle } from '@/components/Media';
import { RequireRole } from '@/components/RequireRole';
import { formatSeoulRange } from '@/lib/dates';
import { formatKrw } from '@/lib/money';
import { INCIDENT_STATUS_LABEL, INCIDENT_TIMELINE, RELEVANCE_LABEL, SETTLEMENT_STATUS_LABEL } from '@/lib/status';
import { ApiError } from '@/types/api';

export default function IncidentDetailPage() {
  return (
    <RequireRole role="REQUESTER">
      <IncidentDetail />
    </RequireRole>
  );
}

function IncidentDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const client = useQueryClient();
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [activeSeconds, setActiveSeconds] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data: incident } = useQuery({ queryKey: keys.incident(id, user?.id), queryFn: () => api.incident(id) });
  const { data: settlement } = useQuery({ queryKey: keys.settlement(id, user?.id), queryFn: () => api.settlement(id) });
  const { data: candidates } = useQuery({
    queryKey: keys.candidates(id, user?.id),
    queryFn: () => api.candidates(id),
    refetchInterval: () => (document.visibilityState === 'visible' ? 5000 : false),
  });

  useEffect(() => {
    if (window.location.hash === '#candidates') {
      document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [candidates]);

  const submit = useMutation({
    mutationFn: (submissionId: string) => api.submitToInsurer(submissionId),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : '제출하지 못했습니다.'),
  });
  const decide = useMutation({
    mutationFn: ({ submissionId, decision }: { submissionId: string; decision: 'ADOPTED' | 'REJECTED' }) =>
      api.insurerDecision(submissionId, decision),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });

  if (!incident) return null;
  const statusIndex = Math.max(0, INCIDENT_TIMELINE.indexOf(incident.status as (typeof INCIDENT_TIMELINE)[number]));

  return (
    <>
      <AppBar title="요청 상세" backHref="/x" />
      <Shell>
        <ol className="flex flex-col gap-sm">
          {INCIDENT_TIMELINE.map((step, index) => (
            <li key={step} className="flex items-center gap-md">
              <span className={`badge ${index <= statusIndex ? 'badge-live' : 'badge-neutral'}`}>{index + 1}</span>
              <span>{INCIDENT_STATUS_LABEL[step]}</span>
            </li>
          ))}
        </ol>
        <section className="card flex flex-col gap-sm">
          <h2 className="typo-title">{incident.place.name}</h2>
          <p className="typo-sm">{formatSeoulRange(incident.occurredFrom, incident.occurredTo)}</p>
          <p className="typo-body">
            {incident.vehicle.color} {incident.vehicle.model} · {incident.vehicle.damageArea}
          </p>
          <p className="typo-body">{incident.description}</p>
          {incident.photos.map((photo) =>
            photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={photo.objectPath} src={photo.url} alt="피해 차량" className="w-full rounded-[10px]" />
            ) : null,
          )}
        </section>

        <section id="candidates" className="flex flex-col gap-lg">
          <h2 className="typo-title">후보 영상</h2>
          {(candidates?.noCandidateCount ?? 0) > 0 ? (
            <p className="typo-sm">후보 없음으로 끝난 제보 {candidates?.noCandidateCount}건</p>
          ) : null}
          {candidates?.data.length === 0 ? <p className="typo-sm">아직 전달된 후보 영상이 없습니다.</p> : null}
          {candidates?.data.map((candidate) => (
            <article key={candidate.submissionId} className="flex flex-col gap-lg">
              <div className="flex items-center justify-between gap-md">
                <p className="typo-label">{candidate.witness.maskedId}</p>
                {!candidate.humanReviewed ? <StatusChip label="담당자 검토 전(데모)" tone="warning" /> : null}
              </div>
              {candidate.videoUrl ? <VideoPlayer ref={playerRef} src={candidate.videoUrl} /> : null}
              {candidate.analysis.result ? (
                <AnalysisResultCard
                  source={candidate.analysis.source}
                  event={candidate.analysis.result.event}
                  relevance={RELEVANCE_LABEL[candidate.analysis.result.relevance]}
                  victimVehicle={candidate.analysis.result.victimVehicle}
                  otherVehicle={candidate.analysis.result.otherVehicle}
                  evidence={candidate.analysis.result.evidence}
                  disclaimer={candidate.analysis.result.disclaimer}
                  timestampLabel={candidate.analysis.result.incidentTimestampLabel}
                  timestampSeconds={candidate.analysis.result.incidentTimestampSeconds}
                  detected={candidate.analysis.result.incidentDetected}
                  active={activeSeconds === candidate.analysis.result.incidentTimestampSeconds}
                  onSeek={(seconds) => {
                    setActiveSeconds(seconds);
                    playerRef.current?.seekTo(seconds, true);
                  }}
                />
              ) : null}
              {candidate.status === 'READY' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => submit.mutate(candidate.submissionId)}
                >
                  보험사 제출
                </button>
              ) : null}
              {candidate.insurerReview ? (
                <section className="card flex flex-col gap-sm">
                  <DemoBadge>데모 보험사</DemoBadge>
                  <p className="typo-label">무결성</p>
                  <p className="typo-sm">sha256 앞 12자 {candidate.insurerReview.sha256?.slice(0, 12)}</p>
                  {candidate.insurerReview.submittedAt ? (
                    <p className="typo-sm">제출 시각 {candidate.insurerReview.submittedAt}</p>
                  ) : null}
                  <StatusChip
                    label={candidate.insurerReview.status === 'REVIEWING' ? '검토 중' : candidate.insurerReview.status === 'ADOPTED' ? '채택' : '미채택'}
                    tone={candidate.insurerReview.status === 'ADOPTED' ? 'success' : 'warning'}
                  />
                  {candidate.insurerReview.status === 'REVIEWING' ? (
                    <div className="flex flex-col gap-sm">
                      <button type="button" className="btn btn-primary" onClick={() => decide.mutate({ submissionId: candidate.submissionId, decision: 'ADOPTED' })}>
                        증거 채택(데모)
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => decide.mutate({ submissionId: candidate.submissionId, decision: 'REJECTED' })}>
                        미채택(데모)
                      </button>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </article>
          ))}
        </section>

        {settlement ? (
          <section className="card flex flex-col gap-md">
            <h2 className="typo-title">예치·보상</h2>
            <p>{SETTLEMENT_STATUS_LABEL[settlement.status]}</p>
            <p className="typo-sm">예치 {formatKrw(settlement.depositAmount)}</p>
            <p className="typo-sm">수수료 {formatKrw(settlement.platformFee)}</p>
            <p className="typo-sm">제보자 보상 {formatKrw(settlement.witnessReward)}</p>
            <DemoBadge>데모: 실제 결제·송금 없음</DemoBadge>
          </section>
        ) : null}
        {message ? <p className="field-error">{message}</p> : null}
      </Shell>
    </>
  );
}
