import { z } from 'zod';

export const titleSchema = z.string().trim().min(2, '제목은 2자 이상이어야 해요.').max(80, '제목은 80자까지예요.');
export const descriptionSchema = z
  .string()
  .trim()
  .min(5, '설명은 5자 이상이어야 해요.')
  .max(1000, '설명은 1,000자까지예요.');
export const evidenceSchema = z
  .string()
  .trim()
  .min(10, '소유권 설명은 10자 이상이어야 해요.')
  .max(1000, '소유권 설명은 1,000자까지예요.');
export const privateSchema = z.string().trim().max(1000, '비공개 특징은 1,000자까지예요.');
export const pickupSchema = z
  .string()
  .trim()
  .min(5, '수령 안내는 5자 이상이어야 해요.')
  .max(500, '수령 안내는 500자까지예요.');
