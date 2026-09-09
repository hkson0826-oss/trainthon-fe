export type Category =
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'KEYS'
  | 'WALLET'
  | 'ID_CARD'
  | 'BOOKS'
  | 'ACCESSORIES'
  | 'OTHER';

export type FoundStatus = 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'RETURNED' | 'ARCHIVED';
export type SearchStatus =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'SEARCHING'
  | 'CLAIM_PENDING'
  | 'HANDOFF_READY'
  | 'RETURNED'
  | 'CANCELLED'
  | 'EXPIRED';
export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type HandoffStatus = 'READY' | 'COMPLETED' | 'CANCELLED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'ON_HOLD';
export type AnalysisStatus = 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export interface MoneyBreakdown {
  amount: 5000;
  currency: 'KRW';
  finderAmount: 3500;
  platformAmount: 1500;
}

export interface User {
  id: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  demoHandle: string;
}

export interface Photo {
  id: string;
  previewUrl: string;
  mimeType: string;
}

export interface FoundItem {
  id: string;
  finderId: string;
  title: string;
  description: string;
  category: Category;
  photoIds: string[];
  occurredAt: string;
  place: Place;
  placeLabel: string;
  status: FoundStatus;
  version: number;
  privateFeatures: string;
  storagePlace: Place;
  pickupInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFoundItem {
  id: string;
  title: string;
  category: Category;
  description: string;
  thumbnailUrl: string | null;
  placeLabel: string;
  status: FoundStatus;
}

export interface SearchRequest {
  id: string;
  seekerId: string;
  title: string;
  description: string;
  category: Category;
  photoIds: string[];
  occurredAt: string;
  place: Place;
  privateFeatures: string;
  status: SearchStatus;
  paymentId: string | null;
  expiresAt: string | null;
  activeClaimId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  searchId: string;
  foundItemId: string;
  score: number;
  reasons: string[];
  algorithmVersion: string;
  generatedAt: string;
}

export interface Claim {
  id: string;
  searchId: string;
  foundItemId: string;
  seekerId: string;
  finderId: string;
  status: ClaimStatus;
  evidenceText: string;
  rejectReason: string | null;
  handoffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  searchId: string;
  status: PaymentStatus;
  amount: 5000;
  currency: 'KRW';
  finderAmount: 3500;
  platformAmount: 1500;
  provider: 'demo';
  paidAt: string | null;
  refundedAt: string | null;
  refundErrorCode: string | null;
  refundRetryable: boolean;
}

export interface Handoff {
  id: string;
  claimId: string;
  status: HandoffStatus;
  completedAt: string | null;
}

export interface HandoffCode {
  token: string;
  manualCode: string;
  expiresAt: string;
}

export interface Payout {
  id: string;
  handoffId: string;
  finderId: string;
  amount: 3500;
  currency: 'KRW';
  status: PayoutStatus;
  failureCode: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface Analysis {
  id: string;
  ownerId: string;
  kind: 'FOUND' | 'LOST';
  status: AnalysisStatus;
  result: {
    title: string;
    category: Category;
    description: string;
    features: string;
  } | null;
  errorCode: string | null;
}

export interface AppConfig {
  mode: 'demo' | 'live';
  pricing: MoneyBreakdown;
  searchDurationHours: 168;
  termsVersion: string;
  capabilities: {
    payments: boolean;
    payouts: boolean;
    ai: boolean;
    maps: boolean;
  };
}
