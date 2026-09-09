import { HANDOFF_CODE_TTL_MS, PRICING, SEARCH_DURATION_HOURS } from '@/contracts/amounts';
import type {
  Analysis,
  Claim,
  FoundItem,
  Handoff,
  HandoffCode,
  Match,
  Payment,
  Photo,
  Payout,
  PublicFoundItem,
  SearchRequest,
} from '@/contracts/types';
import { addHours, nowIso } from '@/lib/dates';
import { CAMPUS_PLACES } from '@/lib/places';
import { createId, maskDescription } from '@/lib/utils';
import { APP_CONFIG, DEMO_USERS, placeholderPhoto } from '@/mocks/fixtures';

const STORAGE_KEY = 'lumina-demo-store-v1';
const SESSION_USER_KEY = 'lumina-demo-user';

export interface DemoState {
  currentUserId: string | null;
  photos: Record<string, Photo>;
  foundItems: FoundItem[];
  searches: SearchRequest[];
  matches: Match[];
  claims: Claim[];
  payments: Payment[];
  handoffs: Handoff[];
  payouts: Payout[];
  analyses: Analysis[];
  codes: Record<string, HandoffCode>;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function seedState(): DemoState {
  const photos = {
    'photo-earbuds': placeholderPhoto('photo-earbuds', '흰색 이어폰 케이스'),
    'photo-umbrella': placeholderPhoto('photo-umbrella', '검은색 접이식 우산'),
    'photo-keys': placeholderPhoto('photo-keys', '은색 열쇠고리'),
  };
  const library = CAMPUS_PLACES[0];
  const hall = CAMPUS_PLACES[2];
  const engineering = CAMPUS_PLACES[1];
  const dorm = CAMPUS_PLACES[3];
  const now = '2026-09-08T02:00:00.000Z';

  const earbuds: FoundItem = {
    id: 'found-earbuds',
    finderId: 'user-finder-b',
    title: '흰색 이어폰 케이스',
    description: '중앙도서관 근처에서 주운 흰색 무선이어폰 케이스입니다. 깨끗한 상태예요.',
    category: 'ELECTRONICS',
    photoIds: ['photo-earbuds'],
    occurredAt: '2026-09-07T08:30:00.000Z',
    place: library,
    placeLabel: '가상 캠퍼스 중앙도서관 근처',
    status: 'AVAILABLE',
    version: 1,
    privateFeatures: '케이스 표면에 파란 별 스티커가 붙어 있어요.',
    storagePlace: engineering,
    pickupInstructions: '가상 공학관 1층 안내데스크에서 평일 낮에 전달해요.',
    createdAt: now,
    updatedAt: now,
  };

  const umbrella: FoundItem = {
    id: 'found-umbrella',
    finderId: 'user-finder-b',
    title: '검은색 접이식 우산',
    description: '학생회관 로비에 두고 간 검은색 우산입니다.',
    category: 'OTHER',
    photoIds: ['photo-umbrella'],
    occurredAt: '2026-09-06T06:00:00.000Z',
    place: hall,
    placeLabel: '가상 학생회관 근처',
    status: 'AVAILABLE',
    version: 1,
    privateFeatures: '손잡이에 빨간 실이 감겨 있어요.',
    storagePlace: hall,
    pickupInstructions: '가상 학생회관 로비 안내에서 전달해요.',
    createdAt: now,
    updatedAt: now,
  };

  const keys: FoundItem = {
    id: 'found-keys',
    finderId: 'user-other-c',
    title: '은색 열쇠고리',
    description: '기숙사 출입구에서 발견한 은색 열쇠고리입니다.',
    category: 'KEYS',
    photoIds: ['photo-keys'],
    occurredAt: '2026-09-05T11:00:00.000Z',
    place: dorm,
    placeLabel: '가상 기숙사 A동 근처',
    status: 'AVAILABLE',
    version: 1,
    privateFeatures: '하트 모양 참이 달려 있어요.',
    storagePlace: dorm,
    pickupInstructions: '가상 기숙사 A동 출입 안내에서 전달해요.',
    createdAt: now,
    updatedAt: now,
  };

  const search: SearchRequest = {
    id: 'search-earbuds',
    seekerId: 'user-seeker-a',
    title: '흰색 이어폰 케이스',
    description: '중앙도서관에서 흰색 무선이어폰 케이스를 잃어버렸어요. 파란 별 스티커가 있어요.',
    category: 'ELECTRONICS',
    photoIds: [],
    occurredAt: '2026-09-07T07:00:00.000Z',
    place: library,
    privateFeatures: '표면에 파란 별 스티커',
    status: 'SEARCHING',
    paymentId: 'pay-earbuds',
    expiresAt: addHours(now, SEARCH_DURATION_HOURS),
    activeClaimId: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  const payment: Payment = {
    id: 'pay-earbuds',
    searchId: 'search-earbuds',
    status: 'PAID',
    amount: PRICING.amount,
    currency: PRICING.currency,
    finderAmount: PRICING.finderAmount,
    platformAmount: PRICING.platformAmount,
    provider: 'demo',
    paidAt: now,
    refundedAt: null,
    refundErrorCode: null,
    refundRetryable: false,
  };

  const match: Match = {
    id: 'match-earbuds',
    searchId: 'search-earbuds',
    foundItemId: 'found-earbuds',
    score: 0.86,
    reasons: ['이미지 유사', '설명 유사', '같은 구역'],
    algorithmVersion: 'demo-1',
    generatedAt: now,
  };

  return {
    currentUserId: loadUserId(),
    photos,
    foundItems: [earbuds, umbrella, keys],
    searches: [search],
    matches: [match],
    claims: [],
    payments: [payment],
    handoffs: [],
    payouts: [],
    analyses: [],
    codes: {},
  };
}

function loadUserId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_USER_KEY);
  } catch {
    return null;
  }
}

function persistUser(userId: string | null) {
  try {
    if (userId) sessionStorage.setItem(SESSION_USER_KEY, userId);
    else sessionStorage.removeItem(SESSION_USER_KEY);
  } catch {
    /* ignore */
  }
}

function loadState(): DemoState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as DemoState;
    parsed.currentUserId = loadUserId();
    return parsed;
  } catch {
    return seedState();
  }
}

let state: DemoState = loadState();

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, currentUserId: null }));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<DemoState> | ((prev: DemoState) => DemoState)) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
  emit();
}

export function subscribeDemo(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoState(): DemoState {
  return state;
}

export function resetDemo() {
  persistUser(state.currentUserId);
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state = seedState();
  emit();
}

export function loginDemo(userId: string) {
  persistUser(userId);
  setState({ currentUserId: userId });
}

export function logoutDemo() {
  persistUser(null);
  setState({ currentUserId: null });
}

export function currentUser() {
  return DEMO_USERS.find((user) => user.id === state.currentUserId) ?? null;
}

export function requireUser() {
  const user = currentUser();
  if (!user) {
    const error = new Error('UNAUTHENTICATED');
    throw error;
  }
  return user;
}

function toPublic(item: FoundItem): PublicFoundItem {
  const photo = item.photoIds[0] ? state.photos[item.photoIds[0]] : undefined;
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: maskDescription(item.description),
    thumbnailUrl: photo?.previewUrl ?? null,
    placeLabel: item.placeLabel,
    status: item.status,
  };
}

export function getConfig() {
  return APP_CONFIG;
}

export function listPublicFound(query = '', category = '') {
  const q = query.trim().toLowerCase();
  return state.foundItems
    .filter((item) => item.status === 'AVAILABLE' || item.status === 'RESERVED')
    .filter((item) => !category || item.category === category)
    .filter((item) => {
      if (!q) return true;
      return `${item.title} ${item.description} ${item.placeLabel}`.toLowerCase().includes(q);
    })
    .map(toPublic);
}

export function getPublicFound(id: string): PublicFoundItem | null {
  const item = state.foundItems.find((row) => row.id === id);
  if (!item) return null;
  if (item.status === 'DRAFT' || item.status === 'ARCHIVED') return null;
  return toPublic(item);
}

export function getOwnerFound(id: string): FoundItem | null {
  const user = currentUser();
  const item = state.foundItems.find((row) => row.id === id) ?? null;
  if (!item) return null;
  if (user && item.finderId === user.id) return item;
  return null;
}

export function getPhoto(id: string): Photo | undefined {
  return state.photos[id];
}

export async function addPhotoFromFile(file: File): Promise<Photo> {
  const previewUrl = await fileToDataUrl(file);
  const photo: Photo = { id: createId(), previewUrl, mimeType: file.type };
  setState((prev) => ({ ...prev, photos: { ...prev.photos, [photo.id]: photo } }));
  return photo;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function createAnalysis(input: {
  kind: 'FOUND' | 'LOST';
  description: string;
  fail?: boolean;
}): Analysis {
  const user = requireUser();
  const analysis: Analysis = {
    id: createId(),
    ownerId: user.id,
    kind: input.kind,
    status: input.fail ? 'FAILED' : 'PROCESSING',
    result: null,
    errorCode: input.fail ? 'AI_TIMEOUT' : null,
  };
  setState((prev) => ({ ...prev, analyses: [...prev.analyses, analysis] }));
  if (!input.fail) {
    window.setTimeout(() => completeAnalysis(analysis.id, input.description), 1200);
  }
  return analysis;
}

function completeAnalysis(id: string, description: string) {
  setState((prev) => ({
    ...prev,
    analyses: prev.analyses.map((row) =>
      row.id === id
        ? {
            ...row,
            status: 'SUCCEEDED',
            result: {
              title: description.trim().slice(0, 24) || '습득물',
              category: guessCategory(description),
              description: description.trim(),
              features: description.trim(),
            },
          }
        : row,
    ),
  }));
}

function guessCategory(text: string): FoundItem['category'] {
  if (/이어폰|케이스|폰|노트북|충전기/.test(text)) return 'ELECTRONICS';
  if (/우산/.test(text)) return 'OTHER';
  if (/열쇠|키링/.test(text)) return 'KEYS';
  if (/지갑/.test(text)) return 'WALLET';
  if (/학생증|신분증/.test(text)) return 'ID_CARD';
  if (/책|노트/.test(text)) return 'BOOKS';
  return 'OTHER';
}

export function getAnalysis(id: string): Analysis | null {
  const user = currentUser();
  const analysis = state.analyses.find((row) => row.id === id) ?? null;
  if (!analysis || !user || analysis.ownerId !== user.id) return null;
  return analysis;
}

export function createFoundItem(input: {
  title: string;
  description: string;
  category: FoundItem['category'];
  photoIds: string[];
  occurredAt: string;
  place: FoundItem['place'];
  placeLabel: string;
  privateFeatures: string;
  storagePlace: FoundItem['place'];
  pickupInstructions: string;
}): FoundItem {
  const user = requireUser();
  const timestamp = nowIso();
  const item: FoundItem = {
    id: createId(),
    finderId: user.id,
    status: 'DRAFT',
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
  setState((prev) => ({ ...prev, foundItems: [...prev.foundItems, item] }));
  return item;
}

export function publishFound(id: string, version: number): FoundItem {
  const user = requireUser();
  let published: FoundItem | null = null;
  setState((prev) => ({
    ...prev,
    foundItems: prev.foundItems.map((item) => {
      if (item.id !== id || item.finderId !== user.id) return item;
      if (item.version !== version) throw new Error('VERSION_CONFLICT');
      published = { ...item, status: 'AVAILABLE', version: item.version + 1, updatedAt: nowIso() };
      return published;
    }),
  }));
  if (!published) throw new Error('NOT_FOUND');
  rematchAll();
  return published;
}

export function updateFound(
  id: string,
  version: number,
  patch: Partial<Pick<FoundItem, 'title' | 'description' | 'category' | 'privateFeatures' | 'pickupInstructions'>>,
): FoundItem {
  const user = requireUser();
  let updated: FoundItem | null = null;
  setState((prev) => ({
    ...prev,
    foundItems: prev.foundItems.map((item) => {
      if (item.id !== id || item.finderId !== user.id) return item;
      if (item.status === 'RESERVED' || item.status === 'RETURNED') throw new Error('INVALID_STATE');
      if (item.version !== version) throw new Error('VERSION_CONFLICT');
      updated = { ...item, ...patch, version: item.version + 1, updatedAt: nowIso() };
      return updated;
    }),
  }));
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
}

export function createSearch(input: {
  title: string;
  description: string;
  category: SearchRequest['category'];
  photoIds: string[];
  occurredAt: string;
  place: SearchRequest['place'];
  privateFeatures: string;
}): SearchRequest {
  const user = requireUser();
  const timestamp = nowIso();
  const search: SearchRequest = {
    id: createId(),
    seekerId: user.id,
    status: 'DRAFT',
    paymentId: null,
    expiresAt: null,
    activeClaimId: null,
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
  setState((prev) => ({ ...prev, searches: [...prev.searches, search] }));
  return search;
}

export function checkoutSearch(id: string): { payment: Payment; search: SearchRequest } {
  const user = requireUser();
  const search = state.searches.find((row) => row.id === id && row.seekerId === user.id);
  if (!search) throw new Error('NOT_FOUND');
  if (search.status === 'SEARCHING' || search.status === 'CLAIM_PENDING' || search.status === 'HANDOFF_READY') {
    const existing = state.payments.find((row) => row.id === search.paymentId);
    if (existing) return { payment: existing, search };
  }
  if (search.status !== 'DRAFT' && search.status !== 'AWAITING_PAYMENT') throw new Error('INVALID_STATE');
  const payment: Payment = {
    id: createId(),
    searchId: search.id,
    status: 'CREATED',
    amount: PRICING.amount,
    currency: PRICING.currency,
    finderAmount: PRICING.finderAmount,
    platformAmount: PRICING.platformAmount,
    provider: 'demo',
    paidAt: null,
    refundedAt: null,
    refundErrorCode: null,
    refundRetryable: false,
  };
  const nextSearch: SearchRequest = {
    ...search,
    status: 'AWAITING_PAYMENT',
    paymentId: payment.id,
    version: search.version + 1,
    updatedAt: nowIso(),
  };
  setState((prev) => ({
    ...prev,
    searches: prev.searches.map((row) => (row.id === id ? nextSearch : row)),
    payments: [...prev.payments.filter((row) => row.searchId !== id || row.status === 'FAILED'), payment],
  }));
  return { payment, search: nextSearch };
}

export function getPayment(id: string): Payment | null {
  const user = currentUser();
  const payment = state.payments.find((row) => row.id === id) ?? null;
  if (!payment || !user) return null;
  const search = state.searches.find((row) => row.id === payment.searchId);
  if (!search || search.seekerId !== user.id) return null;
  return payment;
}

export function confirmDemoPayment(id: string): Payment {
  const user = requireUser();
  const payment = getPayment(id);
  if (!payment) throw new Error('NOT_FOUND');
  if (payment.status === 'PAID') return payment;
  const paidAt = nowIso();
  const nextPayment: Payment = { ...payment, status: 'PAID', paidAt };
  setState((prev) => ({
    ...prev,
    payments: prev.payments.map((row) => (row.id === id ? nextPayment : row)),
    searches: prev.searches.map((search) => {
      if (search.id !== payment.searchId || search.seekerId !== user.id) return search;
      if (search.status === 'CANCELLED' || search.status === 'EXPIRED') {
        return search;
      }
      return {
        ...search,
        status: 'SEARCHING',
        expiresAt: addHours(paidAt, SEARCH_DURATION_HOURS),
        version: search.version + 1,
        updatedAt: paidAt,
      };
    }),
  }));
  rematchAll();
  return getPayment(id) ?? nextPayment;
}

export function failDemoPayment(id: string): Payment {
  const payment = getPayment(id);
  if (!payment) throw new Error('NOT_FOUND');
  const next: Payment = { ...payment, status: 'FAILED' };
  setState((prev) => ({
    ...prev,
    payments: prev.payments.map((row) => (row.id === id ? next : row)),
  }));
  return next;
}

export function getSearch(id: string): SearchRequest | null {
  const user = currentUser();
  const search = state.searches.find((row) => row.id === id) ?? null;
  if (!search || !user || search.seekerId !== user.id) return null;
  return search;
}

export function listMatches(searchId: string): Array<Match & { item: PublicFoundItem }> {
  const search = getSearch(searchId);
  if (!search) return [];
  if (search.status === 'DRAFT' || search.status === 'AWAITING_PAYMENT') return [];
  return state.matches
    .filter((row) => row.searchId === searchId)
    .map((row) => {
      const item = state.foundItems.find((found) => found.id === row.foundItemId);
      return item ? { ...row, item: toPublic(item) } : null;
    })
    .filter((row): row is Match & { item: PublicFoundItem } => Boolean(row))
    .sort((a, b) => b.score - a.score);
}

function rematchAll() {
  const timestamp = nowIso();
  const nextMatches: Match[] = [];
  for (const search of state.searches) {
    if (!['SEARCHING', 'CLAIM_PENDING', 'HANDOFF_READY'].includes(search.status)) continue;
    for (const item of state.foundItems) {
      if (item.status !== 'AVAILABLE' && item.status !== 'RESERVED') continue;
      if (item.finderId === search.seekerId) continue;
      const score = scoreMatch(search, item);
      if (score < 0.6) continue;
      nextMatches.push({
        id: `match-${search.id}-${item.id}`,
        searchId: search.id,
        foundItemId: item.id,
        score,
        reasons: matchReasons(search, item),
        algorithmVersion: 'demo-1',
        generatedAt: timestamp,
      });
    }
  }
  state = { ...state, matches: nextMatches };
  persist();
}

function scoreMatch(search: SearchRequest, item: FoundItem): number {
  let score = 0;
  if (search.category === item.category) score += 0.45;
  const text = `${search.title} ${search.description}`.toLowerCase();
  const found = `${item.title} ${item.description}`.toLowerCase();
  const keywords = text.split(/\s+/).filter((word) => word.length >= 2);
  const hits = keywords.filter((word) => found.includes(word)).length;
  if (hits > 0) score += Math.min(0.35, hits * 0.12);
  if (search.place.label === item.place.label) score += 0.15;
  return Number(score.toFixed(2));
}

function matchReasons(search: SearchRequest, item: FoundItem): string[] {
  const reasons: string[] = [];
  if (search.category === item.category) reasons.push('같은 종류');
  if (`${item.title}${item.description}`.includes(search.title.slice(0, 4))) reasons.push('설명 유사');
  if (search.place.label === item.place.label) reasons.push('같은 구역');
  return reasons.length ? reasons : ['설명 유사'];
}

export function cancelSearch(id: string, reason: string): SearchRequest {
  requireUser();
  const search = getSearch(id);
  if (!search) throw new Error('NOT_FOUND');
  if (search.status === 'RETURNED') throw new Error('INVALID_STATE');
  if (!['DRAFT', 'AWAITING_PAYMENT', 'SEARCHING', 'CLAIM_PENDING'].includes(search.status)) {
    throw new Error('INVALID_STATE');
  }
  const timestamp = nowIso();
  const hadPaid = search.status !== 'DRAFT' && search.status !== 'AWAITING_PAYMENT';
  setState((prev) => ({
    ...prev,
    searches: prev.searches.map((row) =>
      row.id === id
        ? { ...row, status: 'CANCELLED', activeClaimId: null, version: row.version + 1, updatedAt: timestamp }
        : row,
    ),
    claims: prev.claims.map((claim) =>
      claim.searchId === id && claim.status === 'PENDING'
        ? { ...claim, status: 'CANCELLED', updatedAt: timestamp }
        : claim,
    ),
    foundItems: prev.foundItems.map((item) => {
      const claim = prev.claims.find((row) => row.searchId === id && row.foundItemId === item.id);
      if (claim && item.status === 'RESERVED') return { ...item, status: 'AVAILABLE', updatedAt: timestamp };
      return item;
    }),
    payments: prev.payments.map((payment) => {
      if (payment.searchId !== id || !hadPaid || payment.status !== 'PAID') return payment;
      return { ...payment, status: 'REFUND_PENDING' };
    }),
  }));
  window.setTimeout(() => {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((payment) =>
        payment.searchId === id && payment.status === 'REFUND_PENDING'
          ? { ...payment, status: 'REFUNDED', refundedAt: nowIso() }
          : payment,
      ),
    }));
  }, 1600);
  void reason;
  return getSearch(id)!;
}

export function createClaim(input: { searchId: string; foundItemId: string; evidenceText: string }): Claim {
  const user = requireUser();
  const search = getSearch(input.searchId);
  const item = state.foundItems.find((row) => row.id === input.foundItemId);
  if (!search || !item) throw new Error('NOT_FOUND');
  if (item.finderId === user.id) throw new Error('INVALID_STATE');
  if (search.status !== 'SEARCHING') throw new Error('INVALID_STATE');
  if (item.status !== 'AVAILABLE') throw new Error('ITEM_UNAVAILABLE');
  const timestamp = nowIso();
  const claim: Claim = {
    id: createId(),
    searchId: search.id,
    foundItemId: item.id,
    seekerId: user.id,
    finderId: item.finderId,
    status: 'PENDING',
    evidenceText: input.evidenceText.trim(),
    rejectReason: null,
    handoffId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  setState((prev) => ({
    ...prev,
    claims: [...prev.claims, claim],
    searches: prev.searches.map((row) =>
      row.id === search.id
        ? { ...row, status: 'CLAIM_PENDING', activeClaimId: claim.id, version: row.version + 1, updatedAt: timestamp }
        : row,
    ),
  }));
  return claim;
}

export function getClaim(id: string): Claim | null {
  const user = currentUser();
  const claim = state.claims.find((row) => row.id === id) ?? null;
  if (!claim || !user) return null;
  if (claim.seekerId !== user.id && claim.finderId !== user.id) return null;
  return claim;
}

export function approveClaim(id: string): { claim: Claim; handoff: Handoff } {
  const user = requireUser();
  const claim = getClaim(id);
  if (!claim || claim.finderId !== user.id) throw new Error('NOT_FOUND');
  if (claim.status !== 'PENDING') throw new Error('INVALID_STATE');
  const item = state.foundItems.find((row) => row.id === claim.foundItemId);
  if (!item || item.status !== 'AVAILABLE') throw new Error('ITEM_UNAVAILABLE');
  const timestamp = nowIso();
  const handoff: Handoff = { id: createId(), claimId: claim.id, status: 'READY', completedAt: null };
  const nextClaim: Claim = { ...claim, status: 'APPROVED', handoffId: handoff.id, updatedAt: timestamp };
  setState((prev) => ({
    ...prev,
    claims: prev.claims.map((row) => {
      if (row.id === id) return nextClaim;
      if (row.foundItemId === claim.foundItemId && row.status === 'PENDING') {
        return { ...row, status: 'REJECTED', rejectReason: '다른 요청이 먼저 승인되었습니다.', updatedAt: timestamp };
      }
      return row;
    }),
    searches: prev.searches.map((search) => {
      if (search.id === claim.searchId) {
        return { ...search, status: 'HANDOFF_READY', version: search.version + 1, updatedAt: timestamp };
      }
      if (search.activeClaimId && prev.claims.some((row) => row.id === search.activeClaimId && row.foundItemId === claim.foundItemId && row.id !== id)) {
        return { ...search, status: 'SEARCHING', activeClaimId: null, version: search.version + 1, updatedAt: timestamp };
      }
      return search;
    }),
    foundItems: prev.foundItems.map((found) =>
      found.id === claim.foundItemId ? { ...found, status: 'RESERVED', updatedAt: timestamp } : found,
    ),
    handoffs: [...prev.handoffs, handoff],
  }));
  return { claim: nextClaim, handoff };
}

export function rejectClaim(id: string, reason: string): Claim {
  const user = requireUser();
  const claim = getClaim(id);
  if (!claim || claim.finderId !== user.id) throw new Error('NOT_FOUND');
  if (claim.status !== 'PENDING') throw new Error('INVALID_STATE');
  const timestamp = nowIso();
  const next: Claim = { ...claim, status: 'REJECTED', rejectReason: reason, updatedAt: timestamp };
  setState((prev) => ({
    ...prev,
    claims: prev.claims.map((row) => (row.id === id ? next : row)),
    searches: prev.searches.map((search) =>
      search.id === claim.searchId
        ? { ...search, status: 'SEARCHING', activeClaimId: null, version: search.version + 1, updatedAt: timestamp }
        : search,
    ),
  }));
  return next;
}

export function getHandoff(id: string): Handoff | null {
  const user = currentUser();
  const handoff = state.handoffs.find((row) => row.id === id) ?? null;
  if (!handoff || !user) return null;
  const claim = state.claims.find((row) => row.id === handoff.claimId);
  if (!claim || (claim.seekerId !== user.id && claim.finderId !== user.id)) return null;
  return handoff;
}

export function getPickup(claimId: string): { storagePlace: FoundItem['storagePlace']; pickupInstructions: string } | null {
  const claim = getClaim(claimId);
  if (!claim || claim.status !== 'APPROVED' && claim.status !== 'COMPLETED') return null;
  const item = state.foundItems.find((row) => row.id === claim.foundItemId);
  if (!item) return null;
  return { storagePlace: item.storagePlace, pickupInstructions: item.pickupInstructions };
}

export function issueHandoffCode(handoffId: string): HandoffCode {
  const user = requireUser();
  const handoff = getHandoff(handoffId);
  const claim = handoff ? state.claims.find((row) => row.id === handoff.claimId) : null;
  if (!handoff || !claim || claim.seekerId !== user.id) throw new Error('NOT_FOUND');
  if (handoff.status !== 'READY') throw new Error('INVALID_STATE');
  const code: HandoffCode = {
    token: createId(),
    manualCode: String(Math.floor(100000 + Math.random() * 900000)),
    expiresAt: new Date(Date.now() + HANDOFF_CODE_TTL_MS).toISOString(),
  };
  setState((prev) => ({ ...prev, codes: { ...prev.codes, [handoffId]: code } }));
  return code;
}

export function getIssuedCode(handoffId: string): HandoffCode | null {
  const user = currentUser();
  const handoff = getHandoff(handoffId);
  const claim = handoff ? state.claims.find((row) => row.id === handoff.claimId) : null;
  if (!user || !claim || claim.seekerId !== user.id) return null;
  const code = state.codes[handoffId];
  if (!code) return null;
  return code;
}

export function completeHandoff(handoffId: string, input: { manualCode?: string; token?: string }): {
  handoff: Handoff;
  payout: Payout;
} {
  const user = requireUser();
  const handoff = getHandoff(handoffId);
  const claim = handoff ? state.claims.find((row) => row.id === handoff.claimId) : null;
  if (!handoff || !claim || claim.finderId !== user.id) throw new Error('NOT_FOUND');
  if (handoff.status === 'COMPLETED') {
    const payout = state.payouts.find((row) => row.handoffId === handoffId);
    if (payout) return { handoff, payout };
  }
  if (handoff.status !== 'READY') throw new Error('INVALID_STATE');
  const hasToken = Boolean(input.token);
  const hasCode = Boolean(input.manualCode);
  if (hasToken === hasCode) throw new Error('VALIDATION_ERROR');
  const issued = state.codes[handoffId];
  if (!issued) throw new Error('CODE_INVALID');
  if (new Date(issued.expiresAt).getTime() < Date.now()) throw new Error('CODE_EXPIRED');
  if (input.manualCode && input.manualCode !== issued.manualCode) throw new Error('CODE_INVALID');
  if (input.token && input.token !== issued.token) throw new Error('CODE_INVALID');
  const timestamp = nowIso();
  const nextHandoff: Handoff = { ...handoff, status: 'COMPLETED', completedAt: timestamp };
  const payout: Payout = {
    id: createId(),
    handoffId,
    finderId: user.id,
    amount: PRICING.finderAmount,
    currency: PRICING.currency,
    status: 'PENDING',
    failureCode: null,
    createdAt: timestamp,
    paidAt: null,
  };
  setState((prev) => ({
    ...prev,
    handoffs: prev.handoffs.map((row) => (row.id === handoffId ? nextHandoff : row)),
    claims: prev.claims.map((row) => (row.id === claim.id ? { ...row, status: 'COMPLETED', updatedAt: timestamp } : row)),
    searches: prev.searches.map((row) =>
      row.id === claim.searchId ? { ...row, status: 'RETURNED', version: row.version + 1, updatedAt: timestamp } : row,
    ),
    foundItems: prev.foundItems.map((row) =>
      row.id === claim.foundItemId ? { ...row, status: 'RETURNED', updatedAt: timestamp } : row,
    ),
    payouts: [...prev.payouts, payout],
    codes: Object.fromEntries(Object.entries(prev.codes).filter(([key]) => key !== handoffId)),
  }));
  window.setTimeout(() => {
    setState((prev) => ({
      ...prev,
      payouts: prev.payouts.map((row) =>
        row.id === payout.id ? { ...row, status: 'PAID', paidAt: nowIso() } : row,
      ),
    }));
  }, 1800);
  return { handoff: nextHandoff, payout };
}

export function myFoundItems() {
  const user = currentUser();
  if (!user) return [];
  return state.foundItems.filter((item) => item.finderId === user.id);
}

export function mySearches() {
  const user = currentUser();
  if (!user) return [];
  return state.searches.filter((item) => item.seekerId === user.id);
}

export function myClaims(role: 'seeker' | 'finder') {
  const user = currentUser();
  if (!user) return [];
  return state.claims.filter((item) => (role === 'seeker' ? item.seekerId === user.id : item.finderId === user.id));
}

export function myPayouts() {
  const user = currentUser();
  if (!user) return [];
  return state.payouts.filter((item) => item.finderId === user.id);
}

export function getFoundByIdInternal(id: string): FoundItem | undefined {
  return state.foundItems.find((item) => item.id === id);
}
