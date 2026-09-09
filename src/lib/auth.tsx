'use client';

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env, hasSupabase } from '@/lib/env';
import { DEMO_PROFILES, getMe, getSessionUserId, loginWithPassword, logoutMock, setSessionUserId, subscribeMock } from '@/lib/mockStore';
import type { Profile } from '@/types/api';

interface AuthValue {
  user: Profile | null;
  loading: boolean;
  loginDemo: (role: 'REQUESTER' | 'WITNESS') => Promise<Profile>;
  switchAccount: () => Promise<Profile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

function subscribe(callback: () => void) {
  return subscribeMock(callback);
}

function getSnapshot(): string | null {
  return getSessionUserId();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const userId = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const queryClient = useQueryClient();
  const user = useMemo(() => {
    if (!userId) return null;
    try {
      return getMe();
    } catch {
      return DEMO_PROFILES.find((row) => row.id === userId) ?? null;
    }
  }, [userId]);

  async function loginDemo(role: 'REQUESTER' | 'WITNESS') {
    const email = role === 'REQUESTER' ? env.requesterEmail : env.witnessEmail;
    if (hasSupabase() && !env.useMockApi) {
      throw new Error('Supabase 로그인은 키가 설정된 뒤에만 동작합니다.');
    }
    const next = loginWithPassword(email, env.demoPassword);
    await queryClient.clear();
    return next;
  }

  async function switchAccount() {
    const nextRole = user?.role === 'REQUESTER' ? 'WITNESS' : 'REQUESTER';
    logoutMock();
    await queryClient.clear();
    try {
      sessionStorage.removeItem('lumina-upload');
    } catch {
      /* ignore */
    }
    return loginDemo(nextRole);
  }

  async function logout() {
    logoutMock();
    setSessionUserId(null);
    await queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, loginDemo, switchAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider 필요');
  return value;
}
