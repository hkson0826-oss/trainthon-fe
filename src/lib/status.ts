import type {
  AnalysisStatus,
  ClaimStatus,
  FoundStatus,
  HandoffStatus,
  PaymentStatus,
  PayoutStatus,
  SearchStatus,
} from '@/contracts/types';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusView {
  label: string;
  tone: BadgeTone;
}

export const FOUND_STATUS: Record<FoundStatus, StatusView> = {
  DRAFT: { label: '초안', tone: 'neutral' },
  AVAILABLE: { label: '습득물 등록', tone: 'neutral' },
  RESERVED: { label: '수령 준비', tone: 'warning' },
  RETURNED: { label: '반환 완료', tone: 'success' },
  ARCHIVED: { label: '보관 종료', tone: 'neutral' },
};

export const SEARCH_STATUS: Record<SearchStatus, StatusView> = {
  DRAFT: { label: '초안', tone: 'neutral' },
  AWAITING_PAYMENT: { label: '결제 대기', tone: 'warning' },
  SEARCHING: { label: '탐색 중', tone: 'warning' },
  CLAIM_PENDING: { label: '소유권 확인 중', tone: 'warning' },
  HANDOFF_READY: { label: '수령 준비', tone: 'warning' },
  RETURNED: { label: '반환 완료', tone: 'success' },
  CANCELLED: { label: '취소됨', tone: 'neutral' },
  EXPIRED: { label: '탐색 기간 종료', tone: 'neutral' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusView> = {
  CREATED: { label: '결제 준비', tone: 'neutral' },
  PENDING: { label: '결제 확인 중', tone: 'warning' },
  PAID: { label: '결제 완료', tone: 'success' },
  FAILED: { label: '결제 실패', tone: 'danger' },
  REFUND_PENDING: { label: '환불 처리 중', tone: 'warning' },
  REFUNDED: { label: '환불 완료', tone: 'success' },
};

export const CLAIM_STATUS: Record<ClaimStatus, StatusView> = {
  PENDING: { label: '검토 대기', tone: 'warning' },
  APPROVED: { label: '승인', tone: 'success' },
  REJECTED: { label: '거절', tone: 'danger' },
  CANCELLED: { label: '취소', tone: 'neutral' },
  COMPLETED: { label: '반환 완료', tone: 'success' },
};

export const HANDOFF_STATUS: Record<HandoffStatus, StatusView> = {
  READY: { label: '반환 준비', tone: 'warning' },
  COMPLETED: { label: '반환 완료', tone: 'success' },
  CANCELLED: { label: '취소', tone: 'neutral' },
};

export const PAYOUT_STATUS: Record<PayoutStatus, StatusView> = {
  PENDING: { label: '지급 대기', tone: 'warning' },
  PROCESSING: { label: '지급 처리 중', tone: 'warning' },
  PAID: { label: '지급 완료', tone: 'success' },
  FAILED: { label: '지급 실패', tone: 'danger' },
  ON_HOLD: { label: '지급 보류', tone: 'warning' },
};

export const ANALYSIS_STATUS: Record<AnalysisStatus, StatusView> = {
  QUEUED: { label: '분석 대기', tone: 'warning' },
  PROCESSING: { label: '분석 중', tone: 'warning' },
  SUCCEEDED: { label: '초안 준비', tone: 'success' },
  FAILED: { label: '분석 실패', tone: 'danger' },
};

export function unknownStatus(): StatusView {
  return { label: '상태 확인 필요', tone: 'neutral' };
}
