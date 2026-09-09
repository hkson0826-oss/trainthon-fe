'use client';

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env, hasSupabase } from '@/lib/env';
import { api } from '@/lib/api';
import { DEMO_PROFILES, getMe, getSessionUserId, loginWithPassword, logoutMock, setSessionUserId, subscribeMock } from '@/lib/mockStore';
import { getSupabaseClient } from '@/lib/supabase';
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
  const mockUser = useMemo(() => {
    if (!userId) return null;
    try {
      return getMe();
    } catch {
      return DEMO_PROFILES.find((row) => row.id === userId) ?? null;
    }
  }, [userId]);
  const realMode = hasSupabase() && !env.useMockApi;
  const [realUser, setRealUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(realMode);
  const user = realMode ? realUser : mockUser;

  useEffect(() => {
    if (!realMode) {
      setLoading(false);
      return;
    }
    let active = true;
    void getSupabaseClient()
      .auth.getSession()
      .then(async ({ data }) => {
        if (!active) return;
        if (!data.session) {
          setRealUser(null);
          return;
        }
        setRealUser(await api.me());
      })
      .catch(() => {
        if (active) setRealUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [realMode]);

  async function loginDemo(role: 'REQUESTER' | 'WITNESS') {
    const email = role === 'REQUESTER' ? env.requesterEmail : env.witnessEmail;
    if (realMode) {
      if (!env.demoPassword) throw new Error('데모 계정 비밀번호가 설정되지 않았습니다.');
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password: env.demoPassword });
      if (error) throw new Error(`데모 로그인에 실패했습니다: ${error.message}`);
      const next = await api.me();
      setRealUser(next);
      await queryClient.clear();
      return next;
    }
    const next = loginWithPassword(email, env.demoPassword);
    await queryClient.clear();
    return next;
  }

  async function switchAccount() {
    const nextRole = user?.role === 'REQUESTER' ? 'WITNESS' : 'REQUESTER';
    if (realMode) {
      await getSupabaseClient().auth.signOut({ scope: 'local' });
      setRealUser(null);
    } else {
      logoutMock();
    }
    await queryClient.clear();
    try {
      sessionStorage.removeItem('lumina-upload');
    } catch {
      /* ignore */
    }
    return loginDemo(nextRole);
  }

  async function logout() {
    if (realMode) {
      await getSupabaseClient().auth.signOut({ scope: 'local' });
      setRealUser(null);
    } else {
      logoutMock();
      setSessionUserId(null);
    }
    await queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, switchAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider 필요');
  return value;
}
