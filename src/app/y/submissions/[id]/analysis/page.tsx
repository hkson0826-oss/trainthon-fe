'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { ANALYSIS_POLL_MS, ANALYSIS_POLL_TIMEOUT_MS } from '@/lib/money';
import { RELEVANCE_LABEL } from '@/lib/status';
import { AppBar, ErrorState, Shell } from '@/components/AppChrome';
import { AnalysisResultCard, StepIndicator, VideoPlayer, type VideoPlayerHandle } from '@/components/Media';
import { RequireRole } from '@/components/RequireRole';
import { subscribeMock } from '@/lib/mockStore';
import { isMockMode } from '@/lib/api';

const STEPS = ['업로드 완료', 'AI 분석 중', '결과 정리 중'];

export default function AnalysisPage() {
  return (
    <RequireRole role="WITNESS">
      <AnalysisInner />
    </RequireRole>
  );
}

function AnalysisInner() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [active, setActive] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [waitLong, setWaitLong] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!isMockMode()) return;
    return subscribeMock(() => bump((n) => n + 1));
  }, []);

  const submission = useQuery({ queryKey: keys.submission(id, user?.id), queryFn: () => api.submission(id) });
  const video = useQuery({ queryKey: ['video', id, user?.id], queryFn: () => api.videoUrl(id), enabled: Boolean(submission.data) });
  const analysis = useQuery({
    queryKey: keys.analysis(id, user?.id),
    queryFn: async () => {
      try {
        return await api.analysis(id);
      } catch (error) {
        if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(submission.data && submission.data.status !== 'UPLOADING'),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === 'READY' || status === 'FAILED') return false;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;
      return ANALYSIS_POLL_MS;
    },
    retry: false,
  });

  useEffect(() => {
    const t0 = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    const timeout = window.setTimeout(() => setWaitLong(true), ANALYSIS_POLL_TIMEOUT_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [id]);

  const start = useMutation({
    mutationFn: (fail?: boolean) => api.analyze(id, fail),
    onSuccess: () => {
      void submission.refetch();
      void analysis.refetch();
    },
  });
  const retry = useMutation({
    mutationFn: () => api.retryAnalyze(id),
    onSuccess: () => {
      void submission.refetch();
      void analysis.refetch();
    },
  });

  const status = analysis.data?.status;
  const step = status === 'FINALIZING' ? 2 : status === 'READY' ? 2 : status === 'QUEUED' || status === 'ANALYZING' ? 1 : 0;
  const result = analysis.data?.result;

  return (
    <>
      <AppBar title="AI 분석" backHref="/y" />
      <Shell>
        {submission.data?.status === 'UPLOADED' || submission.data?.status === 'ANALYSIS_FAILED' ? (
          <div className="flex flex-col gap-md">
            <p className="typo-body">업로드가 완료되었습니다. AI 분석을 시작하면 사고 후보 장면을 찾습니다.</p>
            <button type="button" className="btn btn-primary" onClick={() => start.mutate(false)}>
              AI 분석 시작
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => start.mutate(true)}>
              분석 실패 재현
            </button>
          </div>
        ) : null}

        {status && status !== 'READY' && status !== 'FAILED' ? (
          <section className="card flex flex-col gap-lg">
            <StepIndicator steps={STEPS} current={step} />
            <p className="typo-sm">경과 {elapsed}초</p>
            {waitLong ? (
              <p className="typo-sm">분석이 지연되고 있습니다. 계속 기다리거나 다시 시도해 주세요.</p>
            ) : null}
          </section>
        ) : null}

        {status === 'FAILED' ? (
          <ErrorState
            title="분석을 완료하지 못했습니다"
            body={
              analysis.data?.error?.code === 'VIDEO_UNANALYZABLE'
                ? '영상 조건이 맞지 않습니다'
                : 'AI 서비스 연결에 실패했습니다'
            }
            onRetry={() => retry.mutate()}
          />
        ) : null}

        {video.data?.url ? <VideoPlayer ref={playerRef} src={video.data.url} /> : null}

        {status === 'READY' && result ? (
          <>
            <AnalysisResultCard
              source={analysis.data?.source ?? null}
              event={result.event}
              relevance={RELEVANCE_LABEL[result.relevance]}
              victimVehicle={result.victimVehicle}
              otherVehicle={result.otherVehicle}
              evidence={result.evidence}
              disclaimer={result.disclaimer}
              timestampLabel={result.incidentTimestampLabel}
              timestampSeconds={result.incidentTimestampSeconds}
              detected={result.incidentDetected}
              active={active === result.incidentTimestampSeconds}
              onSeek={(seconds) => {
                setActive(seconds);
                playerRef.current?.seekTo(seconds, true);
              }}
            />
            {result.incidentDetected ? (
              <p className="typo-body">제보 완료. 요청자에게 후보 영상이 전달되었습니다.</p>
            ) : (
              <p className="typo-body">다른 영상을 올려 주세요. 이번 제보에서는 사고 후보를 찾지 못했습니다.</p>
            )}
            <Link href="/y/rewards" className="btn btn-secondary">
              내 보상 보기
            </Link>
          </>
        ) : null}
      </Shell>
    </>
  );
}
