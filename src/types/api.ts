export type Role = 'REQUESTER' | 'WITNESS' | 'OPERATOR';
export type IncidentType = 'HIT_AND_RUN' | 'CONTACT' | 'DAMAGE' | 'OTHER';
export type IncidentStatus = 'OPEN' | 'COLLECTING' | 'REVIEWING' | 'ADOPTED' | 'CLOSED_NO_EVIDENCE' | 'CANCELLED';
export type SubmissionStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'ANALYZING'
  | 'READY'
  | 'ANALYSIS_FAILED'
  | 'SUBMITTED'
  | 'ADOPTED'
  | 'REJECTED';
export type AnalysisStatus = 'QUEUED' | 'ANALYZING' | 'FINALIZING' | 'READY' | 'FAILED';
export type AnalysisSource = 'LIVE' | 'PRERECORDED';
export type Relevance = 'HIGH' | 'MEDIUM' | 'LOW';
export type SettlementStatus = 'DEPOSITED' | 'ADOPTION_PENDING' | 'PAYOUT_SCHEDULED';
export type NotificationType =
  | 'WITNESS_REQUEST'
  | 'CANDIDATE_FOUND'
  | 'NO_CANDIDATE'
  | 'ADOPTION_UPDATED'
  | 'REWARD_SCHEDULED';

export interface AppConfig {
  demoMode: boolean;
  aiMode: 'live' | 'fake';
  provider: string;
  model: string;
  limits: {
    photoMaxBytes: number;
    photoMaxCount: number;
    videoMaxBytes: number;
    videoMinSeconds: number;
    videoMaxSeconds: number;
  };
  features: { prerecordedFallback: boolean };
}

export interface Profile {
  id: string;
  role: Role;
  displayName: string;
  email: string;
  notificationConsent: boolean;
  payoutReady: boolean;
  unreadNotificationCount: number;
}

export interface Place {
  id: string;
  name: string;
  kind: 'PARKING_LOT' | 'APARTMENT' | 'BUILDING';
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface IncidentLocation { name: string; address: string; lat: number; lng: number }
export interface MapBounds { south: number; north: number; west: number; east: number }
export interface MapIncident {
  id: string;
  place: Place;
  type: IncidentType;
  status: IncidentStatus;
  occurredFrom: string;
  occurredTo: string;
}

export interface Vehicle {
  color: string;
  model: string;
  damageArea: string;
}

export interface AnalysisResult {
  incidentDetected: boolean;
  incidentTimestampSeconds: number | null;
  incidentTimestampLabel: string | null;
  victimVehicle: string;
  otherVehicle: string | null;
  event: string;
  relevance: Relevance;
  evidence: string[];
  videoDurationSec: number;
  disclaimer: string;
}

export interface AnalysisDto {
  id: string;
  submissionId: string;
  status: AnalysisStatus;
  source: AnalysisSource | null;
  result: AnalysisResult | null;
  error?: { code: string; message: string } | null;
  startedAt: string | null;
  finishedAt: string | null;
  model: string;
  promptVersion: string;
}

export interface PhotoDto {
  objectPath: string;
  url: string | null;
  position: number;
}

export interface IncidentDetail {
  id: string;
  requesterId: string;
  place: Place;
  type: IncidentType;
  occurredFrom: string;
  occurredTo: string;
  vehicle: Vehicle;
  description: string;
  descriptionSummary?: string;
  masked?: boolean;
  status: IncidentStatus;
  matchedWitnessCount: number;
  photos: PhotoDto[];
  reviewMode?: 'AUTO_DEMO';
  matching?: { matchedWitnessCount: number; notifiedAt: string | null };
  rewardPreview?: { amount: number; mock: true };
  mySubmissionId?: string | null;
  createdAt: string;
}

export interface SettlementDto {
  status: SettlementStatus;
  depositAmount: number;
  platformFee: number;
  witnessReward: number;
  payoutScheduledAt: string | null;
  mock: true;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  incidentId: string;
  submissionId?: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SubmissionDto {
  id: string;
  incidentId: string;
  witnessId: string;
  status: SubmissionStatus;
  objectPath: string;
  mime: string;
  bytes: number;
  durationSec: number | null;
  recordedAt: string | null;
  redactionApplied: false;
  sha256?: string;
}

export interface CandidateDto {
  submissionId: string;
  status: SubmissionStatus;
  analysis: { source: AnalysisSource | null; result: AnalysisResult | null };
  videoUrl: string | null;
  witness: { maskedId: string };
  insurerReview?: { status: 'REVIEWING' | 'ADOPTED' | 'REJECTED'; mock: true; label: string; sha256?: string; submittedAt?: string } | null;
  humanReviewed: false;
}

export interface RewardDto {
  incidentId: string;
  submissionId: string;
  placeName: string;
  occurredFrom: string;
  amount: number;
  status: SettlementStatus;
  scheduledAt: string | null;
  mock: true;
}

export interface VisitDto {
  id: string;
  placeName: string;
  enteredAt: string;
  exitedAt: string;
  source: 'SEED' | 'MANUAL';
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    retryable: boolean;
  };
  meta: { requestId: string };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors: Record<string, string> = {},
    public requestId = '',
    public retryable = false,
  ) {
    super(message);
  }
}
