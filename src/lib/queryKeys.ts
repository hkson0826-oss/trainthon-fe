export const keys = {
  config: ['config'] as const,
  me: (userId?: string) => ['me', userId] as const,
  places: (userId?: string) => ['places', userId] as const,
  incidents: (userId?: string) => ['incidents', userId] as const,
  incident: (id: string, userId?: string) => ['incident', id, userId] as const,
  settlement: (id: string, userId?: string) => ['settlement', id, userId] as const,
  notifications: (userId?: string) => ['notifications', userId] as const,
  visits: (userId?: string) => ['visits', userId] as const,
  submission: (id: string, userId?: string) => ['submission', id, userId] as const,
  analysis: (id: string, userId?: string) => ['analysis', id, userId] as const,
  candidates: (id: string, userId?: string) => ['candidates', id, userId] as const,
  rewards: (userId?: string) => ['rewards', userId] as const,
};
