'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/types/api';
import { Skeleton, Shell } from '@/components/AppChrome';

export function RequireRole({ role, children }: { role?: Role | Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = role ? (Array.isArray(role) ? role : [role]) : undefined;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (allowed && !allowed.includes(user.role)) {
      router.replace(user.role === 'REQUESTER' ? '/x' : '/y');
    }
  }, [allowed, loading, router, user]);

  if (loading || !user || (allowed && !allowed.includes(user.role))) {
    return (
      <Shell>
        <Skeleton className="h-3xl" />
      </Shell>
    );
  }
  return children;
}
