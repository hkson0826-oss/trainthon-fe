import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_FOUND,
  MAX_PHOTOS_LOST,
  MIN_PHOTOS_FOUND,
} from '@/contracts/amounts';

export function createId(): string {
  return crypto.randomUUID();
}

export function isSafeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith('/login')) return '/';
  return value;
}

export function isAllowedPhoto(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    return 'jpg, png, webp만 올릴 수 있어요.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return '한 장당 10MB까지 올릴 수 있어요.';
  }
  return null;
}

export function photoCountError(kind: 'FOUND' | 'LOST', count: number): string | null {
  if (kind === 'FOUND' && count < MIN_PHOTOS_FOUND) return '사진은 최소 1장이 필요해요.';
  if (kind === 'FOUND' && count > MAX_PHOTOS_FOUND) return '사진은 최대 3장까지 올릴 수 있어요.';
  if (kind === 'LOST' && count > MAX_PHOTOS_LOST) return '사진은 최대 3장까지 올릴 수 있어요.';
  return null;
}

export function maskDescription(description: string): string {
  const trimmed = description.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 80)}…`;
}

export function titleFromDescription(description: string, fallback: string): string {
  const compact = description.trim().replace(/\s+/g, ' ');
  if (compact.length >= 2) return compact.slice(0, 40);
  return fallback;
}
