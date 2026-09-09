import type { Place } from '@/contracts/types';

export const CAMPUS_PLACES: Place[] = [
  { label: '가상 캠퍼스 중앙도서관', lat: 37.5501, lng: 126.9408 },
  { label: '가상 공학관 1층', lat: 37.5508, lng: 126.9416 },
  { label: '가상 학생회관 로비', lat: 37.5496, lng: 126.9399 },
  { label: '가상 기숙사 A동 출입구', lat: 37.5514, lng: 126.9422 },
];

export function findPlace(label: string): Place | undefined {
  return CAMPUS_PLACES.find((place) => place.label === label);
}
