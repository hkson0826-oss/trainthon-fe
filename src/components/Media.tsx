'use client';

import { useImperativeHandle, useRef, forwardRef } from 'react';

export interface VideoPlayerHandle {
  seekTo: (seconds: number, autoplay?: boolean) => void;
  currentTime: () => number;
}

export const VideoPlayer = forwardRef<
  VideoPlayerHandle,
  { src: string; muted?: boolean; onDuration?: (seconds: number) => void }
>(function VideoPlayer({ src, muted, onDuration }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    seekTo(seconds: number, autoplay = true) {
      const el = videoRef.current;
      if (!el) return;
      el.currentTime = seconds;
      if (autoplay) void el.play();
    },
    currentTime() {
      return videoRef.current?.currentTime ?? 0;
    },
  }));

  return (
    <div className="video-frame">
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        preload="metadata"
        muted={muted}
        onLoadedMetadata={() => {
          const duration = videoRef.current?.duration;
          if (duration && onDuration) onDuration(duration);
        }}
      />
    </div>
  );
});

export function TimestampButton({
  seconds,
  label,
  active,
  onSeek,
}: {
  seconds: number;
  label: string;
  active?: boolean;
  onSeek: (seconds: number) => void;
}) {
  return (
    <button type="button" className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onSeek(seconds)}>
      {label} 사고 후보
    </button>
  );
}

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex flex-col gap-sm">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-md">
          <span className={`badge ${index <= current ? 'badge-live' : 'badge-neutral'}`}>{index + 1}</span>
          <span className={index === current ? 'typo-label' : 'typo-sm'}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function UploadProgress({ percent, onCancel }: { percent: number; onCancel?: () => void }) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} role="progressbar">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="typo-sm">{percent}%</p>
      {onCancel ? (
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          취소
        </button>
      ) : null}
    </div>
  );
}

export function NotificationCard({
  title,
  body,
  unread,
  onClick,
}: {
  title: string;
  body: string;
  unread?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="card w-full text-left" onClick={onClick}>
      <div className="flex items-start justify-between gap-md">
        <h2 className="typo-title">{title}</h2>
        {unread ? <span className="unread-dot mt-md" /> : null}
      </div>
      <p className="typo-sm mt-sm">{body}</p>
    </button>
  );
}

export function AnalysisResultCard({
  source,
  event,
  relevance,
  victimVehicle,
  otherVehicle,
  evidence,
  disclaimer,
  timestampLabel,
  timestampSeconds,
  detected,
  active,
  onSeek,
}: {
  source: 'LIVE' | 'PRERECORDED' | null;
  event: string;
  relevance: string;
  victimVehicle: string;
  otherVehicle: string | null;
  evidence: string[];
  disclaimer: string;
  timestampLabel: string | null;
  timestampSeconds: number | null;
  detected: boolean;
  active?: boolean;
  onSeek?: (seconds: number) => void;
}) {
  return (
    <section className="card flex flex-col gap-lg">
      {source === 'LIVE' ? <span className="badge badge-live">실시간 AI 분석 결과</span> : null}
      {source === 'PRERECORDED' ? <span className="badge badge-demo">사전 분석 결과</span> : null}
      {detected && timestampLabel && timestampSeconds != null && onSeek ? (
        <TimestampButton seconds={timestampSeconds} label={timestampLabel} active={active} onSeek={onSeek} />
      ) : (
        <p className="typo-title">사고 후보 장면을 찾지 못했습니다</p>
      )}
      <p className="typo-body">{event}</p>
      <p>
        관련도 <span className="badge badge-neutral">{relevance}</span>
      </p>
      <div>
        <p className="typo-label">차량 특징</p>
        <p className="typo-sm mt-sm">피해 차량 · {victimVehicle}</p>
        {otherVehicle ? <p className="typo-sm">상대 차량 · {otherVehicle}</p> : null}
      </div>
      <ul className="flex flex-col gap-sm">
        {evidence.map((item) => (
          <li key={item} className="typo-sm">
            {item}
          </li>
        ))}
      </ul>
      <p className="typo-sm">{disclaimer}</p>
    </section>
  );
}
