import { beforeEach, describe, expect, it } from 'vitest';
import { createIncident, getIncident, listMapIncidents, loginWithPassword, logoutMock, resetMock } from '@/lib/mockStore';
import { env } from '@/lib/env';

beforeEach(() => { resetMock(); logoutMock(); });
describe('map demo contract', () => {
  it('requires a session and shares reports even when no notification was sent', () => {
    expect(() => listMapIncidents()).toThrow('로그인이 필요합니다.');
    loginWithPassword(env.requesterEmail, env.demoPassword);
    const report = createIncident({ location: { name: '지도 테스트', address: '서울 중구', lat: 37.56, lng: 126.97 }, type: 'CONTACT',
      occurredFrom: '2026-09-10T00:00:00Z', occurredTo: '2026-09-10T00:10:00Z',
      vehicle: { color: '흰색', model: '세단', damageArea: '범퍼' }, description: '위치 확인', photoObjectPaths: [], consent: { evidenceUse: true, privacy: true } });
    expect(report.matchedWitnessCount).toBe(0);
    loginWithPassword(env.witnessEmail, env.demoPassword);
    expect(getIncident(report.id).place.lat).toBe(37.56);
    expect(getIncident(report.id).masked).toBe(true);
    expect(listMapIncidents().items.map((i) => i.id)).toContain(report.id);
    expect(listMapIncidents({ south: 0, north: 1, west: 0, east: 1 }).items).toHaveLength(0);
    logoutMock();
    expect(() => getIncident(report.id)).toThrow('로그인이 필요합니다.');
  });
});
