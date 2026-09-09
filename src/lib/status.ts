import type {
  AnalysisSource,
  IncidentStatus,
  SettlementStatus,
  SubmissionStatus,
} from '@/types/api';

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  OPEN: '접수 완료',
  COLLECTING: '제보 수집 중',
  REVIEWING: '증거 검토 중',
  ADOPTED: '채택 완료',
  CLOSED_NO_EVIDENCE: '증거 없음 종료',
  CANCELLED: '취소',
};

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  UPLOADING: '업로드 중',
  UPLOADED: '업로드 완료',
  ANALYZING: 'AI 분석 중',
  READY: '후보 확인 가능',
  ANALYSIS_FAILED: '분석 실패',
  SUBMITTED: '보험사 검토 중',
  ADOPTED: '채택',
  REJECTED: '미채택',
};

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  DEPOSITED: '예치 완료',
  ADOPTION_PENDING: '채택 대기',
  PAYOUT_SCHEDULED: '보상 지급 예정',
};

export const SOURCE_LABEL: Record<AnalysisSource, string> = {
  LIVE: '실시간 AI 분석 결과',
  PRERECORDED: '사전 분석 결과',
};

export const RELEVANCE_LABEL = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
} as const;

export const INCIDENT_TYPE_LABEL = {
  HIT_AND_RUN: '뺑소니',
  CONTACT: '접촉 사고',
  DAMAGE: '차량 파손',
  OTHER: '기타',
} as const;

export const INCIDENT_TIMELINE: IncidentStatus[] = ['OPEN', 'COLLECTING', 'REVIEWING', 'ADOPTED'];
