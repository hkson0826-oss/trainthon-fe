import { describe, expect, it } from 'vitest';
import { PRICING } from '@/contracts/amounts';
import { formatKrw, formatPricingFinder, formatPricingPlatform, formatPricingSearchFee } from '@/lib/money';

describe('money', () => {
  it('formats shared pricing constants', () => {
    expect(formatKrw(PRICING.amount)).toBe('5,000원');
    expect(formatPricingSearchFee()).toBe('5,000원');
    expect(formatPricingFinder()).toBe('3,500원');
    expect(formatPricingPlatform()).toBe('1,500원');
  });
});
