export const DEMO_DEPOSIT_AMOUNT = 100_000;
export const DEMO_PLATFORM_FEE = 20_000;
export const DEMO_WITNESS_REWARD = DEMO_DEPOSIT_AMOUNT - DEMO_PLATFORM_FEE;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 2;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const VIDEO_MIN_SECONDS = 4;
export const ANALYSIS_POLL_MS = 2_000;
export const ANALYSIS_POLL_TIMEOUT_MS = 180_000;
export const NOTIFICATION_POLL_MS = 5_000;
export const SAMPLE_VIDEO_SRC = '/demo/dashcam-sample.mp4';
export const SAMPLE_TIMESTAMP_SECONDS = 12;

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatMmSs(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
