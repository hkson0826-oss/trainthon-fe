import { env, hasSupabase } from '@/lib/env';
import { ApiError } from '@/types/api';
import type {
  AnalysisDto,
  AppConfig,
  CandidateDto,
  IncidentDetail,
  IncidentType,
  NotificationDto,
  Place,
  Profile,
  RewardDto,
  SettlementDto,
  SubmissionDto,
  VisitDto,
} from '@/types/api';
import * as mock from '@/lib/mockStore';
import { getAccessToken } from '@/lib/supabase';

function useMock(): boolean {
  return env.useMockApi || !hasSupabase();
}

export function isMockMode(): boolean {
  return useMock();
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? '요청을 처리하지 못했습니다.',
      json.error?.fieldErrors ?? {},
      json.meta?.requestId,
      json.error?.retryable,
    );
  }
  return json.data as T;
}

async function realFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const requestId = crypto.randomUUID();
  const accessToken = token ?? (await getAccessToken());
  const res = await fetch(`${env.apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  return unwrap<T>(res);
}

export const api = {
  config: (): Promise<AppConfig> => (useMock() ? Promise.resolve(mock.getConfig()) : realFetch<AppConfig>('/config')),
  me: (): Promise<Profile> => (useMock() ? Promise.resolve(mock.getMe()) : realFetch<Profile>('/me')),
  places: (): Promise<Place[]> => (useMock() ? Promise.resolve(mock.listPlaces()) : realFetch<Place[]>('/places')),
  myIncidents: (): Promise<IncidentDetail[]> =>
    useMock() ? Promise.resolve(mock.listMyIncidents()) : realFetch<IncidentDetail[]>('/me/incidents'),
  incident: (id: string): Promise<IncidentDetail> =>
    useMock() ? Promise.resolve(mock.getIncident(id)) : realFetch<IncidentDetail>(`/incidents/${id}`),
  settlement: (id: string): Promise<SettlementDto> =>
    useMock() ? Promise.resolve(mock.getSettlement(id)) : realFetch<SettlementDto>(`/incidents/${id}/settlement`),
  notifications: (): Promise<NotificationDto[]> =>
    useMock() ? Promise.resolve(mock.listNotifications()) : realFetch<NotificationDto[]>('/me/notifications'),
  readNotification: (id: string): Promise<NotificationDto> =>
    useMock() ? Promise.resolve(mock.readNotification(id)) : realFetch<NotificationDto>(`/notifications/${id}/read`, { method: 'POST' }),
  visits: (): Promise<VisitDto[]> => (useMock() ? Promise.resolve(mock.listVisits()) : realFetch<VisitDto[]>('/me/visits')),
  deleteVisit: (id: string): Promise<void> =>
    useMock() ? Promise.resolve(mock.deleteVisit(id)) : realFetch<void>(`/me/visits/${id}`, { method: 'DELETE' }),
  createIncident: (body: {
    placeId: string;
    type: IncidentType;
    occurredFrom: string;
    occurredTo: string;
    vehicle: { color: string; model: string; damageArea: string };
    description: string;
    photoObjectPaths: string[];
    consent: { evidenceUse: boolean; privacy: boolean };
  }): Promise<IncidentDetail> =>
    useMock() ? Promise.resolve(mock.createIncident(body)) : realFetch<IncidentDetail>('/incidents', { method: 'POST', body: JSON.stringify(body) }),
  uploadPhoto: async (file: File) => {
    if (useMock()) return mock.createPhotoUpload(file);
    const signed = await realFetch<{ objectPath: string; uploadUrl: string; token: string; expiresAt: string }>(
      '/uploads/photo-url',
      { method: 'POST', body: JSON.stringify({ mime: file.type, bytes: file.size }) },
    );
    await putFile(signed.uploadUrl, file);
    return signed;
  },
  createSubmission: (
    incidentId: string,
    input: { mime: string; bytes: number; durationSec?: number; recordedAt?: string; file?: File; sample?: boolean },
  ) =>
    useMock()
      ? mock.createSubmission(incidentId, input)
      : realFetch<{ submissionId: string; objectPath: string; uploadUrl: string; token: string; expiresAt: string; status: 'UPLOADING' }>(
          `/incidents/${incidentId}/submissions`,
          {
            method: 'POST',
            body: JSON.stringify({ mime: input.mime, bytes: input.bytes, durationSec: input.durationSec, recordedAt: input.recordedAt }),
          },
        ),
  completeUpload: (id: string): Promise<SubmissionDto> =>
    useMock() ? Promise.resolve(mock.completeUpload(id)) : realFetch<SubmissionDto>(`/submissions/${id}/complete-upload`, { method: 'POST' }),
  submission: (id: string): Promise<SubmissionDto> =>
    useMock() ? Promise.resolve(mock.getSubmission(id)) : realFetch<SubmissionDto>(`/submissions/${id}`),
  videoUrl: (id: string): Promise<{ url: string }> =>
    useMock() ? Promise.resolve(mock.getVideoUrl(id)) : realFetch<{ url: string }>(`/submissions/${id}/video-url`),
  analyze: (id: string, fail = false): Promise<AnalysisDto> =>
    useMock() ? Promise.resolve(mock.startAnalyze(id, { fail })) : realFetch<AnalysisDto>(`/submissions/${id}/analyze`, { method: 'POST' }),
  analysis: (id: string): Promise<AnalysisDto> =>
    useMock() ? Promise.resolve(mock.getAnalysis(id)) : realFetch<AnalysisDto>(`/submissions/${id}/analysis`),
  retryAnalyze: (id: string): Promise<AnalysisDto> =>
    useMock() ? Promise.resolve(mock.retryAnalyze(id)) : realFetch<AnalysisDto>(`/submissions/${id}/analyze/retry`, { method: 'POST' }),
  candidates: (id: string): Promise<{ data: CandidateDto[]; noCandidateCount: number }> =>
    useMock()
      ? Promise.resolve(mock.listCandidates(id))
      : realFetch<CandidateDto[]>(`/incidents/${id}/candidates`).then((data) => ({ data, noCandidateCount: 0 })),
  submitToInsurer: (id: string) =>
    useMock() ? Promise.resolve(mock.submitToInsurer(id)) : realFetch(`/submissions/${id}/submit-to-insurer`, { method: 'POST' }),
  insurerDecision: (id: string, decision: 'ADOPTED' | 'REJECTED') =>
    useMock()
      ? Promise.resolve(mock.insurerDecision(id, decision))
      : realFetch(`/submissions/${id}/insurer-decision`, { method: 'POST', body: JSON.stringify({ decision }) }),
  rewards: (): Promise<RewardDto[]> => (useMock() ? Promise.resolve(mock.listRewards()) : realFetch<RewardDto[]>('/me/rewards')),
};

export async function putFile(url: string, file: File, onProgress?: (pct: number) => void, signal?: AbortSignal) {
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    onProgress?.(100);
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('업로드에 실패했습니다.')));
    xhr.onerror = () => reject(new Error('업로드가 중단되었습니다'));
    xhr.onabort = () => reject(new Error('업로드가 중단되었습니다'));
    signal?.addEventListener('abort', () => xhr.abort());
    xhr.send(file);
  });
}
