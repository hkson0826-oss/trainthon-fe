import { z } from 'zod';
import { PHOTO_MAX_BYTES, PHOTO_MAX_COUNT, VIDEO_MIN_SECONDS } from '@/lib/money';

export const incidentFormSchema = z
  .object({
    placeId: z.string().min(1, '장소를 선택해 주세요.'),
    type: z.enum(['HIT_AND_RUN', 'CONTACT', 'DAMAGE', 'OTHER']),
    date: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    color: z.string().min(1, '차량 색상을 입력해 주세요.'),
    model: z.string().min(1, '차종을 입력해 주세요.'),
    damageArea: z.string().min(1, '파손 부위를 입력해 주세요.'),
    description: z.string().trim().min(1, '사고 설명을 입력해 주세요.').max(1000),
    evidenceUse: z.boolean().refine((v) => v, { message: '증거 이용 동의가 필요합니다.' }),
    privacy: z.boolean().refine((v) => v, { message: '개인정보 처리 동의가 필요합니다.' }),
  })
  .refine((value) => value.start < value.end, {
    message: '시작 시각은 종료 시각보다 빨라야 합니다.',
    path: ['end'],
  });

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export function photoError(file: File, existingCount: number): string | null {
  if (existingCount >= PHOTO_MAX_COUNT) return '사진은 최대 2장까지 올릴 수 있어요.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'JPEG, PNG, WebP만 올릴 수 있어요.';
  if (file.size > PHOTO_MAX_BYTES) return '한 장당 10MB까지 올릴 수 있어요.';
  return null;
}

export function videoClientError(file: File, durationSec: number | null, maxBytes: number): string | null {
  if (!file.type.includes('mp4') && file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
    return 'MP4 영상만 올릴 수 있어요.';
  }
  if (file.size > maxBytes) return '영상 용량이 너무 큽니다.';
  if (durationSec != null && durationSec < VIDEO_MIN_SECONDS) {
    return '영상이 너무 짧습니다. 4초 이상이어야 합니다.';
  }
  return null;
}
