export const PRICING = {
  amount: 5000,
  currency: 'KRW',
  finderAmount: 3500,
  platformAmount: 1500,
} as const;

export const SEARCH_DURATION_HOURS = 168;
export const TERMS_VERSION = '2026-09-09';
export const HANDOFF_CODE_TTL_MS = 5 * 60 * 1000;
export const MAX_PHOTOS_FOUND = 3;
export const MAX_PHOTOS_LOST = 3;
export const MIN_PHOTOS_FOUND = 1;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const APP_MODE = (import.meta.env.VITE_APP_MODE ?? 'demo') as 'demo' | 'live';
