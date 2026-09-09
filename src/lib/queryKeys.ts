export const queryKeys = {
  config: ['config'] as const,
  me: (userId: string | null) => ['me', userId] as const,
  foundList: (query: string, category: string) => ['found-public', query, category] as const,
  foundPublic: (id: string) => ['found-public', id] as const,
  foundOwner: (userId: string | null, id: string) => ['found-owner', userId, id] as const,
  search: (userId: string | null, id: string) => ['search', userId, id] as const,
  matches: (userId: string | null, id: string) => ['matches', userId, id] as const,
  claim: (userId: string | null, id: string) => ['claim', userId, id] as const,
  handoff: (userId: string | null, id: string) => ['handoff', userId, id] as const,
  activity: (userId: string | null) => ['activity', userId] as const,
  payouts: (userId: string | null) => ['payouts', userId] as const,
};
