import {
  DEMO_DEPOSIT_AMOUNT,
  DEMO_PLATFORM_FEE,
  DEMO_WITNESS_REWARD,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  SAMPLE_TIMESTAMP_SECONDS,
  VIDEO_MAX_BYTES,
  VIDEO_MIN_SECONDS,
} from '@/lib/money';
import { env } from '@/lib/env';
import { nowIso } from '@/lib/dates';
import { ApiError } from '@/types/api';
import type {
  AnalysisDto,
  AnalysisResult,
  AppConfig,
  CandidateDto,
  IncidentDetail,
  IncidentLocation,
  MapBounds,
  MapIncident,
  IncidentType,
  NotificationDto,
  Place,
  Profile,
  RewardDto,
  SettlementDto,
  SubmissionDto,
  VisitDto,
} from '@/types/api';

const STORAGE_KEY = 'lumina-parking-mock-v1';
const SESSION_KEY = 'lumina-parking-user';

export const PLACE_A: Place = {
  id: 'place-a',
  name: 'A주차장',
  kind: 'PARKING_LOT',
  address: '가상 캠퍼스 A주차장 (데모)',
  lat: 37.5665,
  lng: 126.978,
};

const DISCLAIMER = 'AI 결과는 사고 사실·가해 차량·과실을 확정하지 않습니다.';

export const DEMO_PROFILES: Profile[] = [
  {
    id: 'user-x',
    role: 'REQUESTER',
    displayName: '요청자 X',
    email: env.requesterEmail,
    notificationConsent: true,
    payoutReady: false,
    unreadNotificationCount: 0,
  },
  {
    id: 'user-y',
    role: 'WITNESS',
    displayName: '제보자 Y',
    email: env.witnessEmail,
    notificationConsent: true,
    payoutReady: true,
    unreadNotificationCount: 0,
  },
];

interface PhotoRecord {
  objectPath: string;
  dataUrl: string;
  mime: string;
  bytes: number;
  ownerId: string;
  position?: number;
}

interface SubmissionRecord extends SubmissionDto {
  videoUrl: string;
}

interface State {
  photos: Record<string, PhotoRecord>;
  incidents: IncidentDetail[];
  settlements: Record<string, SettlementDto>;
  notifications: NotificationDto[];
  submissions: SubmissionRecord[];
  analyses: AnalysisDto[];
  visits: VisitDto[];
  insurer: Record<string, { status: 'REVIEWING' | 'ADOPTED' | 'REJECTED'; sha256: string; submittedAt: string }>;
}

const listeners = new Set<() => void>();

function createId(): string {
  return crypto.randomUUID();
}

function todayVisitRange() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return {
    enteredAt: `${parts}T13:58:00+09:00`,
    exitedAt: `${parts}T14:12:00+09:00`,
  };
}

function seed(): State {
  const visit = todayVisitRange();
  return {
    photos: {},
    incidents: [],
    settlements: {},
    notifications: [],
    submissions: [],
    analyses: [],
    visits: [
      {
        id: 'visit-y',
        placeName: PLACE_A.name,
        enteredAt: visit.enteredAt,
        exitedAt: visit.exitedAt,
        source: 'SEED',
      },
    ],
    insurer: {},
  };
}

function load(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return { ...seed(), ...(JSON.parse(raw) as State) };
  } catch {
    return seed();
  }
}

let state: State = typeof window === 'undefined' ? seed() : load();

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

export function subscribeMock(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function resetMock() {
  state = seed();
  persist();
}

export function getSessionUserId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionUserId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

function requireUser(): Profile {
  const id = getSessionUserId();
  const user = DEMO_PROFILES.find((row) => row.id === id);
  if (!user) throw new ApiError(401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
  return { ...user, unreadNotificationCount: unreadCount(user.id) };
}

function unreadCount(userId: string): number {
  return state.notifications.filter((n) => {
    const owner = n.type === 'WITNESS_REQUEST' || n.type === 'ADOPTION_UPDATED' || n.type === 'REWARD_SCHEDULED' ? 'user-y' : 'user-x';
    if (n.type === 'WITNESS_REQUEST' || n.type === 'ADOPTION_UPDATED' || n.type === 'REWARD_SCHEDULED') {
      return userId === 'user-y' && !n.readAt;
    }
    return userId === 'user-x' && !n.readAt && owner === 'user-x';
  }).length;
}

function notificationOwner(n: NotificationDto): string {
  if (n.type === 'WITNESS_REQUEST' || n.type === 'ADOPTION_UPDATED' || n.type === 'REWARD_SCHEDULED') return 'user-y';
  return 'user-x';
}

export function getConfig(): AppConfig {
  return {
    demoMode: true,
    aiMode: 'fake',
    provider: 'twelvelabs',
    model: 'pegasus1.5',
    limits: {
      photoMaxBytes: PHOTO_MAX_BYTES,
      photoMaxCount: PHOTO_MAX_COUNT,
      videoMaxBytes: VIDEO_MAX_BYTES,
      videoMinSeconds: VIDEO_MIN_SECONDS,
      videoMaxSeconds: 3600,
    },
    features: { prerecordedFallback: true },
  };
}

export function loginWithPassword(email: string, password: string): Profile {
  if (password !== env.demoPassword) throw new ApiError(401, 'UNAUTHENTICATED', '이메일 또는 비밀번호가 올바르지 않습니다.');
  const user = DEMO_PROFILES.find((row) => row.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new ApiError(401, 'UNAUTHENTICATED', '이메일 또는 비밀번호가 올바르지 않습니다.');
  setSessionUserId(user.id);
  return { ...user, unreadNotificationCount: unreadCount(user.id) };
}

export function logoutMock() {
  setSessionUserId(null);
}

export function getMe(): Profile {
  return requireUser();
}

export function listPlaces(): Place[] {
  requireUser();
  return [PLACE_A];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function createPhotoUpload(file: File): Promise<{ objectPath: string; uploadUrl: string; token: string; expiresAt: string }> {
  const user = requireUser();
  if (user.role !== 'REQUESTER') throw new ApiError(403, 'FORBIDDEN_ROLE', '요청자만 사진을 올릴 수 있습니다.');
  const objectPath = `staging/${user.id}/${createId()}.jpg`;
  const dataUrl = await fileToDataUrl(file);
  state.photos[objectPath] = { objectPath, dataUrl, mime: file.type, bytes: file.size, ownerId: user.id };
  persist();
  return { objectPath, uploadUrl: dataUrl, token: 'mock', expiresAt: new Date(Date.now() + 2 * 3600_000).toISOString() };
}

function rangesOverlap(fromA: number, toA: number, fromB: number, toB: number) {
  return fromA < toB && fromB < toA;
}

export function createIncident(input: {
  placeId?: string;
  location?: IncidentLocation;
  type: IncidentType;
  occurredFrom: string;
  occurredTo: string;
  vehicle: { color: string; model: string; damageArea: string };
  description: string;
  photoObjectPaths: string[];
  consent: { evidenceUse: boolean; privacy: boolean };
}): IncidentDetail {
  const user = requireUser();
  if (user.role !== 'REQUESTER') throw new ApiError(403, 'FORBIDDEN_ROLE', '요청자만 사고를 등록할 수 있습니다.');
  if (!input.consent.evidenceUse || !input.consent.privacy) {
    throw new ApiError(400, 'VALIDATION_ERROR', '동의가 필요합니다.', {
      consent: '증거 이용과 개인정보 처리에 모두 동의해 주세요.',
    });
  }
  const from = new Date(input.occurredFrom).getTime();
  const to = new Date(input.occurredTo).getTime();
  if (!(from < to) || to - from > 24 * 3600_000) {
    throw new ApiError(400, 'VALIDATION_ERROR', '사고 시간 범위가 올바르지 않습니다.', { occurredTo: '시작은 종료보다 빠르고 24시간 이내여야 합니다.' });
  }
  if (input.photoObjectPaths.length > PHOTO_MAX_COUNT) {
    throw new ApiError(400, 'VALIDATION_ERROR', '사진은 최대 2장입니다.');
  }
  const place: Place = input.location ? { id: input.placeId ?? createId(), kind: 'BUILDING', ...input.location } : PLACE_A;
  const id = createId();
  const photos = input.photoObjectPaths.map((path, index) => {
    const photo = state.photos[path];
    if (!photo || photo.ownerId !== user.id) throw new ApiError(400, 'VALIDATION_ERROR', '사진 업로드를 확인해 주세요.');
    photo.position = index;
    return { objectPath: path, url: photo.dataUrl, position: index };
  });

  const visit = state.visits[0];
  const overlap =
    visit && input.placeId === PLACE_A.id &&
    rangesOverlap(from, to, new Date(visit.enteredAt).getTime(), new Date(visit.exitedAt).getTime());
  const matchedWitnessCount = overlap ? 1 : 0;
  const createdAt = nowIso();
  const incident: IncidentDetail = {
    id,
    requesterId: user.id,
    place,
    type: input.type,
    occurredFrom: input.occurredFrom,
    occurredTo: input.occurredTo,
    vehicle: input.vehicle,
    description: input.description,
    status: 'OPEN',
    matchedWitnessCount,
    photos,
    reviewMode: 'AUTO_DEMO',
    matching: { matchedWitnessCount, notifiedAt: overlap ? createdAt : null },
    createdAt,
  };
  state.incidents.push(incident);
  state.settlements[id] = {
    status: 'DEPOSITED',
    depositAmount: DEMO_DEPOSIT_AMOUNT,
    platformFee: DEMO_PLATFORM_FEE,
    witnessReward: DEMO_WITNESS_REWARD,
    payoutScheduledAt: null,
    mock: true,
  };
  if (overlap) {
    state.notifications.push({
      id: createId(),
      type: 'WITNESS_REQUEST',
      title: '영상 확인 요청',
      body: `${formatNotifyTime(input.occurredFrom, input.occurredTo)} ${place.name}에서 사고가 있었습니다. 당시 블랙박스 영상이 있다면 확인해 주세요.`,
      incidentId: id,
      readAt: null,
      createdAt,
    });
  }
  persist();
  return incident;
}

function formatNotifyTime(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  const month = f.getMonth() + 1;
  const day = f.getDate();
  const hh = (d: Date) => String(d.getHours()).padStart(2, '0');
  const mm = (d: Date) => String(d.getMinutes()).padStart(2, '0');
  return `${month}월 ${day}일 ${hh(f)}:${mm(f)}~${hh(t)}:${mm(t)}`;
}

export function listMyIncidents(): IncidentDetail[] {
  const user = requireUser();
  return state.incidents.filter((row) => row.requesterId === user.id);
}

export function listMapIncidents(bounds?: MapBounds): { items: MapIncident[]; hasMore: boolean } {
  requireUser();
  const rows = state.incidents.filter(({ place: p }) => p.lat !== null && p.lng !== null && (!bounds ||
    (p.lat >= bounds.south && p.lat <= bounds.north && p.lng >= bounds.west && p.lng <= bounds.east)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { items: rows.slice(0, 200).map(({ id, place, type, status, occurredFrom, occurredTo }) => ({ id, place, type, status, occurredFrom, occurredTo })), hasMore: rows.length > 200 };
}

export function getIncident(id: string): IncidentDetail {
  const user = requireUser();
  const incident = state.incidents.find((row) => row.id === id);
  if (!incident) throw new ApiError(404, 'NOT_FOUND', '요청을 찾을 수 없습니다.');
  const mine = state.submissions.find((s) => s.incidentId === id && s.witnessId === user.id);
  if (incident.requesterId !== user.id && user.role !== 'OPERATOR') {
    return {
      ...incident,
      requesterId: '',
      masked: true,
      rewardPreview: { amount: DEMO_WITNESS_REWARD, mock: true },
      mySubmissionId: mine?.id ?? null,
      description: incident.description.slice(0, 180),
    };
  }
  return incident;
}

export function getSettlement(id: string): SettlementDto {
  const user = requireUser();
  if (user.role !== 'REQUESTER') throw new ApiError(403, 'FORBIDDEN_ROLE', '요청자만 정산을 볼 수 있습니다.');
  const settlement = state.settlements[id];
  const incident = state.incidents.find((row) => row.id === id);
  if (!settlement || !incident || incident.requesterId !== user.id) throw new ApiError(404, 'NOT_FOUND', '정산을 찾을 수 없습니다.');
  return settlement;
}

export function listNotifications(): NotificationDto[] {
  const user = requireUser();
  return state.notifications
    .filter((n) => notificationOwner(n) === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function readNotification(id: string): NotificationDto {
  const user = requireUser();
  const item = state.notifications.find((n) => n.id === id);
  if (!item || notificationOwner(item) !== user.id) throw new ApiError(404, 'NOT_FOUND', '알림을 찾을 수 없습니다.');
  item.readAt = nowIso();
  persist();
  return item;
}

export function listVisits(): VisitDto[] {
  const user = requireUser();
  if (user.role !== 'WITNESS') return [];
  return state.visits;
}

export function deleteVisit(id: string) {
  const user = requireUser();
  if (user.role !== 'WITNESS') throw new ApiError(403, 'FORBIDDEN_ROLE', '제보자만 방문 기록을 지울 수 있습니다.');
  state.visits = state.visits.filter((row) => row.id !== id);
  persist();
}

export async function createSubmission(
  incidentId: string,
  input: { mime: string; bytes: number; durationSec?: number; recordedAt?: string; file?: File; sample?: boolean },
): Promise<{ submissionId: string; objectPath: string; uploadUrl: string; token: string; expiresAt: string; status: 'UPLOADING' }> {
  const user = requireUser();
  if (user.role !== 'WITNESS') throw new ApiError(403, 'FORBIDDEN_ROLE', '제보자만 영상을 올릴 수 있습니다.');
  const incident = getIncident(incidentId);
  const existing = state.submissions.find((s) => s.incidentId === incidentId && s.witnessId === user.id);
  if (existing && existing.status !== 'UPLOADING' && existing.status !== 'ANALYSIS_FAILED') {
    throw new ApiError(409, 'ALREADY_EXISTS', '이미 이 사고에 제보했습니다.');
  }
  if (input.durationSec != null && input.durationSec < VIDEO_MIN_SECONDS) {
    throw new ApiError(422, 'VIDEO_UNANALYZABLE', '영상이 너무 짧습니다. 4초 이상이어야 합니다.');
  }
  if (input.bytes > VIDEO_MAX_BYTES) throw new ApiError(413, 'FILE_TOO_LARGE', '영상 용량이 너무 큽니다.');
  const submissionId = existing?.id ?? createId();
  const objectPath = `incidents/${incident.id}/submissions/${submissionId}/original.mp4`;
  let videoUrl = existing?.videoUrl ?? '';
  if (input.sample) videoUrl = '/demo/dashcam-sample.mp4';
  else if (input.file) videoUrl = URL.createObjectURL(input.file);
  const record: SubmissionRecord = {
    id: submissionId,
    incidentId,
    witnessId: user.id,
    status: 'UPLOADING',
    objectPath,
    mime: 'video/mp4',
    bytes: input.bytes,
    durationSec: input.durationSec ?? (input.sample ? 20 : null),
    recordedAt: input.recordedAt ?? null,
    redactionApplied: false,
    videoUrl,
  };
  state.submissions = state.submissions.filter((s) => s.id !== submissionId).concat(record);
  persist();
  return {
    submissionId,
    objectPath,
    uploadUrl: videoUrl,
    token: 'mock',
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    status: 'UPLOADING',
  };
}

export function completeUpload(id: string): SubmissionDto {
  const user = requireUser();
  const submission = state.submissions.find((s) => s.id === id);
  if (!submission || submission.witnessId !== user.id) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  if (!submission.videoUrl) throw new ApiError(409, 'INVALID_STATE', 'UPLOAD_NOT_FOUND');
  submission.status = 'UPLOADED';
  const incident = state.incidents.find((row) => row.id === submission.incidentId);
  if (incident?.status === 'OPEN') incident.status = 'COLLECTING';
  persist();
  return submission;
}

export function getSubmission(id: string): SubmissionDto {
  const user = requireUser();
  const submission = state.submissions.find((s) => s.id === id);
  if (!submission) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  if (submission.witnessId !== user.id && getIncident(submission.incidentId).requesterId !== user.id) {
    throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  }
  return submission;
}

export function getVideoUrl(id: string): { url: string } {
  const submission = getSubmission(id) as SubmissionRecord;
  const full = state.submissions.find((s) => s.id === id);
  if (!full?.videoUrl) throw new ApiError(404, 'NOT_FOUND', '영상을 찾을 수 없습니다.');
  if (getSessionUserId() === 'user-x' && !['READY', 'SUBMITTED', 'ADOPTED', 'REJECTED', 'ANALYZING'].includes(submission.status)) {
    if (submission.status !== 'READY' && submission.witnessId !== getSessionUserId()) {
      /* X can view after READY; mock allows after UPLOADED for analysis page of Y */
    }
  }
  return { url: full.videoUrl };
}

export function startAnalyze(id: string, opts?: { fail?: boolean }): AnalysisDto {
  const user = requireUser();
  const submission = state.submissions.find((s) => s.id === id);
  if (!submission || submission.witnessId !== user.id) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  if (submission.status !== 'UPLOADED' && submission.status !== 'ANALYSIS_FAILED') {
    throw new ApiError(409, 'INVALID_STATE', '지금은 분석을 시작할 수 없습니다.');
  }
  const analysisId = createId();
  const analysis: AnalysisDto = {
    id: analysisId,
    submissionId: id,
    status: 'QUEUED',
    source: null,
    result: null,
    error: null,
    startedAt: nowIso(),
    finishedAt: null,
    model: 'pegasus1.5',
    promptVersion: 'v1',
  };
  state.analyses = state.analyses.filter((a) => a.submissionId !== id).concat(analysis);
  submission.status = 'ANALYZING';
  persist();
  runAnalysisPipeline(analysisId, Boolean(opts?.fail), submission.durationSec ?? 20);
  return analysis;
}

function runAnalysisPipeline(analysisId: string, fail: boolean, durationSec: number) {
  const tick = (status: AnalysisDto['status'], delay: number, finish?: boolean) =>
    window.setTimeout(() => {
      const analysis = state.analyses.find((a) => a.id === analysisId);
      const submission = analysis ? state.submissions.find((s) => s.id === analysis.submissionId) : null;
      if (!analysis || !submission) return;
      if (fail && status === 'ANALYZING') {
        analysis.status = 'FAILED';
        analysis.error = { code: 'PROVIDER_UNAVAILABLE', message: 'AI 서비스 연결에 실패했습니다' };
        analysis.finishedAt = nowIso();
        submission.status = 'ANALYSIS_FAILED';
        persist();
        return;
      }
      analysis.status = status;
      if (finish) {
        const detected = durationSec >= 12;
        const result: AnalysisResult = detected
          ? {
              incidentDetected: true,
              incidentTimestampSeconds: SAMPLE_TIMESTAMP_SECONDS,
              incidentTimestampLabel: '00:12',
              victimVehicle: '흰색 세단',
              otherVehicle: '검은색 SUV',
              event: '검은색 SUV가 후진하며 흰색 세단 우측 후면에 접촉한 것으로 보이는 장면',
              relevance: 'HIGH',
              evidence: ['피해 차량의 색상과 차종이 사고 요청과 일치', '신고된 파손 부위와 접근 방향이 유사'],
              videoDurationSec: durationSec,
              disclaimer: DISCLAIMER,
            }
          : {
              incidentDetected: false,
              incidentTimestampSeconds: null,
              incidentTimestampLabel: null,
              victimVehicle: '확인되지 않음',
              otherVehicle: null,
              event: '관련 장면을 찾지 못했습니다',
              relevance: 'LOW',
              evidence: ['요청된 피해 차량과 일치하는 장면을 확인하지 못했습니다'],
              videoDurationSec: durationSec,
              disclaimer: DISCLAIMER,
            };
        analysis.result = result;
        analysis.source = 'LIVE';
        analysis.finishedAt = nowIso();
        analysis.status = 'READY';
        submission.status = 'READY';
        const incident = state.incidents.find((row) => row.id === submission.incidentId);
        if (incident) {
          state.notifications.push({
            id: createId(),
            type: detected ? 'CANDIDATE_FOUND' : 'NO_CANDIDATE',
            title: detected ? '후보 영상 발견' : '후보 없음',
            body: detected
              ? `${incident.place.name} 사고에 대한 후보 영상이 발견되었습니다. 00:12 지점을 확인해 보세요.`
              : `${incident.place.name} 사고에 제보된 영상에서 관련 장면을 찾지 못했습니다. 다른 제보를 기다리고 있습니다.`,
            incidentId: incident.id,
            submissionId: submission.id,
            readAt: null,
            createdAt: nowIso(),
          });
        }
      }
      persist();
    }, delay);
  tick('ANALYZING', 800);
  tick('FINALIZING', 1800);
  tick('READY', 2800, true);
}

export function getAnalysis(submissionId: string): AnalysisDto {
  getSubmission(submissionId);
  const analysis = state.analyses.find((a) => a.submissionId === submissionId);
  if (!analysis) throw new ApiError(404, 'NOT_FOUND', '분석 결과가 없습니다.');
  return analysis;
}

export function retryAnalyze(id: string): AnalysisDto {
  const submission = getSubmission(id);
  if (submission.status !== 'ANALYSIS_FAILED') throw new ApiError(409, 'INVALID_STATE', '실패 상태에서만 다시 분석할 수 있습니다.');
  submission.status = 'UPLOADED';
  persist();
  return startAnalyze(id);
}

export function listCandidates(incidentId: string): { data: CandidateDto[]; noCandidateCount: number } {
  const user = requireUser();
  const incident = getIncident(incidentId);
  if (incident.requesterId !== user.id) throw new ApiError(404, 'NOT_FOUND', '후보를 찾을 수 없습니다.');
  const related = state.submissions.filter((s) => s.incidentId === incidentId);
  const data: CandidateDto[] = [];
  related.forEach((s, index) => {
    const analysis = state.analyses.find((a) => a.submissionId === s.id);
    if (!analysis || analysis.status !== 'READY' || !analysis.result?.incidentDetected || !analysis.result) return;
    const review = state.insurer[s.id];
    data.push({
      submissionId: s.id,
      status: s.status,
      analysis: { source: analysis.source, result: analysis.result },
      videoUrl: s.videoUrl,
      witness: { maskedId: `제보자 #${index + 1}` },
      insurerReview: review
        ? { status: review.status, mock: true, label: '데모 보험사', sha256: review.sha256, submittedAt: review.submittedAt }
        : null,
      humanReviewed: false,
    });
  });
  const noCandidateCount = related.filter((s) => {
    const analysis = state.analyses.find((a) => a.submissionId === s.id);
    return analysis?.result?.incidentDetected === false;
  }).length;
  return { data, noCandidateCount };
}

export function submitToInsurer(submissionId: string) {
  const user = requireUser();
  const submission = state.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  const incident = getIncident(submission.incidentId);
  if (incident.requesterId !== user.id) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  const analysis = state.analyses.find((a) => a.submissionId === submissionId);
  if (submission.status !== 'READY' || !analysis?.result?.incidentDetected) {
    throw new ApiError(409, 'INVALID_STATE', 'NO_CANDIDATE');
  }
  const submittedAt = nowIso();
  state.insurer[submissionId] = { status: 'REVIEWING', sha256: submission.sha256 ?? 'abc123def4567890', submittedAt };
  submission.status = 'SUBMITTED';
  incident.status = 'REVIEWING';
  const settlement = state.settlements[incident.id];
  if (settlement) settlement.status = 'ADOPTION_PENDING';
  persist();
  return { integrity: { sha256: state.insurer[submissionId].sha256, submittedAt }, mock: true, label: '데모 보험사 채택' };
}

export function insurerDecision(submissionId: string, decision: 'ADOPTED' | 'REJECTED') {
  const user = requireUser();
  const submission = state.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  const incident = getIncident(submission.incidentId);
  if (incident.requesterId !== user.id) throw new ApiError(404, 'NOT_FOUND', '제보를 찾을 수 없습니다.');
  const review = state.insurer[submissionId];
  if (!review || review.status !== 'REVIEWING') throw new ApiError(409, 'INVALID_STATE', '이미 결정되었거나 제출되지 않았습니다.');
  review.status = decision;
  if (decision === 'ADOPTED') {
    submission.status = 'ADOPTED';
    incident.status = 'ADOPTED';
    const settlement = state.settlements[incident.id];
    if (settlement) {
      settlement.status = 'PAYOUT_SCHEDULED';
      settlement.payoutScheduledAt = nowIso();
    }
    state.notifications.push(
      {
        id: createId(),
        type: 'ADOPTION_UPDATED',
        title: '증거가 채택되었습니다',
        body: `${incident.place.name} 사고 제보가 채택되었습니다.`,
        incidentId: incident.id,
        submissionId,
        readAt: null,
        createdAt: nowIso(),
      },
      {
        id: createId(),
        type: 'REWARD_SCHEDULED',
        title: '보상 지급 예정',
        body: '보상 지급이 예정되었습니다. 데모이며 실제 송금은 없습니다.',
        incidentId: incident.id,
        submissionId,
        readAt: null,
        createdAt: nowIso(),
      },
    );
  } else {
    submission.status = 'REJECTED';
    incident.status = 'COLLECTING';
  }
  persist();
  return { mock: true, label: '데모 보험사 채택', status: decision };
}

export function listRewards(): RewardDto[] {
  const user = requireUser();
  if (user.role !== 'WITNESS') return [];
  return state.submissions
    .filter((s) => s.witnessId === user.id && s.status === 'ADOPTED')
    .map((s) => {
      const incident = state.incidents.find((row) => row.id === s.incidentId)!;
      const settlement = state.settlements[s.incidentId];
      return {
        incidentId: s.incidentId,
        submissionId: s.id,
        placeName: incident.place.name,
        occurredFrom: incident.occurredFrom,
        amount: settlement?.witnessReward ?? DEMO_WITNESS_REWARD,
        status: settlement?.status ?? 'PAYOUT_SCHEDULED',
        scheduledAt: settlement?.payoutScheduledAt ?? null,
        mock: true as const,
      };
    });
}

export function demoAccounts() {
  return { requester: { email: env.requesterEmail }, witness: { email: env.witnessEmail } };
}
