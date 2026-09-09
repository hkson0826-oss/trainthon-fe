import { describe, expect, it } from 'vitest';
import { photoCountError } from '@/lib/utils';
import { isSafeNextPath } from '@/lib/utils';

describe('photo rules', () => {
  it('requires at least one found photo', () => {
    expect(photoCountError('FOUND', 0)).toBe('사진은 최소 1장이 필요해요.');
    expect(photoCountError('LOST', 0)).toBeNull();
  });

  it('caps both flows at three photos', () => {
    expect(photoCountError('FOUND', 4)).toContain('최대 3장');
    expect(photoCountError('LOST', 4)).toContain('최대 3장');
  });
});

describe('login next path', () => {
  it('only allows same-app relative paths', () => {
    expect(isSafeNextPath('/activity')).toBe('/activity');
    expect(isSafeNextPath('https://evil.example')).toBe('/');
    expect(isSafeNextPath('//evil.example')).toBe('/');
    expect(isSafeNextPath('/login')).toBe('/');
  });
});
