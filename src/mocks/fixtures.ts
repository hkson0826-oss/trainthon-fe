import { PRICING, SEARCH_DURATION_HOURS, TERMS_VERSION } from '@/contracts/amounts';
import type { AppConfig, Photo, User } from '@/contracts/types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-seeker-a',
    displayName: '김서연',
    role: 'USER',
    createdAt: '2026-09-01T00:00:00.000Z',
    demoHandle: '분실자 A',
  },
  {
    id: 'user-finder-b',
    displayName: '이준호',
    role: 'USER',
    createdAt: '2026-09-01T00:00:00.000Z',
    demoHandle: '습득자 B',
  },
  {
    id: 'user-other-c',
    displayName: '박민지',
    role: 'USER',
    createdAt: '2026-09-01T00:00:00.000Z',
    demoHandle: '다른 사용자 C',
  },
];

export const APP_CONFIG: AppConfig = {
  mode: 'demo',
  pricing: { ...PRICING },
  searchDurationHours: SEARCH_DURATION_HOURS,
  termsVersion: TERMS_VERSION,
  capabilities: {
    payments: true,
    payouts: false,
    ai: true,
    maps: false,
  },
};

export function placeholderPhoto(id: string, label: string): Photo {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#F8FAFC"/><rect x="1" y="1" width="638" height="398" fill="none" stroke="#CBD5E1"/><text x="320" y="210" text-anchor="middle" font-size="28" font-family="ui-sans-serif, system-ui, sans-serif" fill="#4B5563">${label}</text></svg>`;
  return {
    id,
    mimeType: 'image/svg+xml',
    previewUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}
