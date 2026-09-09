'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, putFile } from '@/lib/api';
import { SAMPLE_VIDEO_SRC, VIDEO_MAX_BYTES } from '@/lib/money';
import { videoClientError } from '@/lib/validation';
import { AppBar, BottomActionBar, DemoBadge, Shell } from '@/components/AppChrome';
import { UploadProgress, VideoPlayer } from '@/components/Media';
import { RequireRole } from '@/components/RequireRole';
import { ApiError } from '@/types/api';

export default function UploadPage() {
  return (
    <RequireRole role="WITNESS">
      <UploadInner />
    </RequireRole>
  );
}

function UploadInner() {
  const { id = '' } = useParams<{ id: string }>();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [percent, setPercent] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [sample, setSample] = useState(false);
  const [abort, setAbort] = useState<AbortController | null>(null);

  const clientError = useMemo(() => {
    if (sample) return duration != null && duration < 4 ? '영상이 너무 짧습니다. 4초 이상이어야 합니다.' : null;
    if (!file) return null;
    return videoClientError(file, duration, VIDEO_MAX_BYTES);
  }, [duration, file, sample]);

  async function handleFile(next: File | null, useSample = false) {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setSample(useSample);
    setFile(next);
    setError(null);
    if (useSample) {
      setPreview(SAMPLE_VIDEO_SRC);
      return;
    }
    if (!next) {
      setPreview(null);
      setDuration(null);
      return;
    }
    setPreview(URL.createObjectURL(next));
  }

  async function upload() {
    if (clientError || (!file && !sample) || !consent) return;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    setAbort(controller);
    try {
      const bytes = file?.size ?? 1_000_000;
      const created = await api.createSubmission(id, {
        mime: 'video/mp4',
        bytes,
        durationSec: duration ?? undefined,
        file: file ?? undefined,
        sample,
      });
      setPercent(0);
      try {
        sessionStorage.setItem('lumina-upload', JSON.stringify({ submissionId: created.submissionId, incidentId: id }));
      } catch {
        /* ignore */
      }
      await putFile(created.uploadUrl, file ?? new File([], 'sample.mp4', { type: 'video/mp4' }), setPercent, controller.signal);
      await api.completeUpload(created.submissionId);
      router.push(`/y/submissions/${created.submissionId}/analysis`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : '업로드가 중단되었습니다');
    } finally {
      setBusy(false);
      setAbort(null);
    }
  }

  return (
    <>
      <AppBar title="영상 제보" backHref={`/y/incidents/${id}`} />
      <Shell>
        <p className="typo-body">사고 추정 시각 전후 영상 1개(MP4)를 선택해 주세요. 데모에서는 약 20초 영상을 사용합니다.</p>
        <input
          type="file"
          accept="video/mp4,video/*"
          className="field"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            void handleFile(next);
            event.currentTarget.value = '';
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => void handleFile(null, true)}>
          데모 샘플 영상 사용
        </button>
        <DemoBadge>데모</DemoBadge>
        {preview ? <VideoPlayer src={preview} muted onDuration={setDuration} /> : null}
        {duration != null ? <p className="typo-sm">길이 {duration.toFixed(1)}초</p> : null}
        {clientError ? <p className="field-error">{clientError}</p> : null}
        <label className="flex items-start gap-md typo-body">
          <input type="checkbox" className="mt-xs h-lg w-lg" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          제출 목적과 보상 조건에 동의합니다. 채택되기 전까지는 보상이 생기지 않습니다.
        </label>
        {percent != null ? <UploadProgress percent={percent} onCancel={() => abort?.abort()} /> : null}
        {error ? (
          <>
            <p className="field-error">{error}</p>
            <button type="button" className="btn btn-secondary" onClick={() => void upload()}>
              다시 업로드
            </button>
          </>
        ) : null}
      </Shell>
      <BottomActionBar>
        <button type="button" className="btn btn-primary" disabled={Boolean(clientError) || (!file && !sample) || !consent || busy} onClick={() => void upload()}>
          {busy ? '업로드 중…' : '업로드'}
        </button>
      </BottomActionBar>
    </>
  );
}
