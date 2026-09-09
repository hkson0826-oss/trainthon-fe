import { PRICING } from '@/contracts/amounts';

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatPricingSearchFee(): string {
  return formatKrw(PRICING.amount);
}

export function formatPricingFinder(): string {
  return formatKrw(PRICING.finderAmount);
}

export function formatPricingPlatform(): string {
  return formatKrw(PRICING.platformAmount);
}
