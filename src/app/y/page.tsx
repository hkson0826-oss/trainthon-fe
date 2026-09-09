'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, EmptyState, Shell } from '@/components/AppChrome';
import { NotificationCard } from '@/components/Media';
import { RequireRole } from '@/components/RequireRole';
import { NOTIFICATION_POLL_MS } from '@/lib/money';

export default function YHomePage() {
  return (
    <RequireRole role="WITNESS">
      <YHome />
    </RequireRole>
  );
}

function YHome() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: notes = [] } = useQuery({
    queryKey: keys.notifications(user?.id),
    queryFn: api.notifications,
    refetchInterval: () => (document.visibilityState === 'visible' ? NOTIFICATION_POLL_MS : false),
  });
  const read = useMutation({
    mutationFn: (id: string) => api.readNotification(id),
  });

  return (
    <>
      <AppBar title="알림" />
      <Shell>
        {notes.length === 0 ? (
          <EmptyState title="아직 알림이 없습니다" body="같은 시간대 방문 기록이 있는 사고 요청이 오면 여기에 표시됩니다." />
        ) : (
          notes.map((note) => (
            <NotificationCard
              key={note.id}
              title={note.title}
              body={note.body}
              unread={!note.readAt}
              onClick={async () => {
                await read.mutateAsync(note.id);
                if (note.type === 'REWARD_SCHEDULED') router.push('/y/rewards');
                else if (note.incidentId) router.push(`/y/incidents/${note.incidentId}`);
              }}
            />
          ))
        )}
        <Link href="/y/rewards" className="btn btn-secondary">
          내 보상
        </Link>
        <Link href="/y/visits" className="btn btn-secondary">
          방문 기록
        </Link>
      </Shell>
    </>
  );
}
