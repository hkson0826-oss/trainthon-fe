export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  apiBase: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  kakaoEnabled: process.env.NEXT_PUBLIC_KAKAO_AUTH_ENABLED === 'true',
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== 'false',
  requesterEmail: process.env.NEXT_PUBLIC_DEMO_REQUESTER_EMAIL || 'demo.requester@lumina.local',
  witnessEmail: process.env.NEXT_PUBLIC_DEMO_WITNESS_EMAIL || 'demo.witness@lumina.local',
  demoPassword: process.env.NEXT_PUBLIC_DEMO_ACCOUNT_PASSWORD || 'demo-password',
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false',
};

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
