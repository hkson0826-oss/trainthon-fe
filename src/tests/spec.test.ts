import { describe, expect, it } from 'vitest';
import { formatKrw, formatMmSs, DEMO_WITNESS_REWARD, DEMO_DEPOSIT_AMOUNT, DEMO_PLATFORM_FEE } from '@/lib/money';
import { INCIDENT_STATUS_LABEL, SOURCE_LABEL } from '@/lib/status';
import { incidentFormSchema } from '@/lib/validation';

describe('copy and money', () => {
  it('formats KRW and timestamp labels from the spec', () => {
    expect(formatKrw(DEMO_DEPOSIT_AMOUNT)).toBe('100,000원');
    expect(formatKrw(DEMO_PLATFORM_FEE)).toBe('20,000원');
    expect(formatKrw(DEMO_WITNESS_REWARD)).toBe('80,000원');
    expect(formatMmSs(12)).toBe('00:12');
  });

  it('maps incident and analysis source labels', () => {
    expect(INCIDENT_STATUS_LABEL.OPEN).toBe('접수 완료');
    expect(INCIDENT_STATUS_LABEL.ADOPTED).toBe('채택 완료');
    expect(SOURCE_LABEL.LIVE).toBe('실시간 AI 분석 결과');
    expect(SOURCE_LABEL.PRERECORDED).toBe('사전 분석 결과');
  });
});

describe('incident form', () => {
  it('requires both consents and start before end', () => {
    const result = incidentFormSchema.safeParse({
      placeId: 'place-a',
      type: 'CONTACT',
      date: '2026-09-09',
      start: '14:10',
      end: '14:00',
      color: '흰색',
      model: '세단',
      damageArea: '우측 후면',
      description: '설명',
      evidenceUse: false,
      privacy: false,
    });
    expect(result.success).toBe(false);
  });
});
