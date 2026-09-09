'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, EmptyState, Shell } from '@/components/AppChrome';
import { NotificationCard } from '@/components/Media';
import { RequireRole } from '@/components/RequireRole';
import { NOTIFICATION_POLL_MS } from '@/lib/money';

export default function NotificationsPage() {
  return (
    <RequireRole>
      <NotesInner />
    </RequireRole>
  );
}

function NotesInner() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: notes = [] } = useQuery({
    queryKey: keys.notifications(user?.id),
    queryFn: api.notifications,
    refetchInterval: () => (document.visibilityState === 'visible' ? NOTIFICATION_POLL_MS : false),
  });
  const read = useMutation({ mutationFn: (id: string) => api.readNotification(id) });

  return (
    <>
      <AppBar title="알림" backHref={user?.role === 'REQUESTER' ? '/x' : '/y'} />
      <Shell>
        {notes.length === 0 ? <EmptyState title="알림이 없습니다" body="새 소식이 있으면 여기에 표시됩니다." /> : null}
        {notes.map((note) => (
          <NotificationCard
            key={note.id}
            title={note.title}
            body={note.body}
            unread={!note.readAt}
            onClick={async () => {
              await read.mutateAsync(note.id);
              if (note.type === 'REWARD_SCHEDULED') router.push('/y/rewards');
              else if (user?.role === 'REQUESTER') router.push(`/x/incidents/${note.incidentId}#candidates`);
              else router.push(`/y/incidents/${note.incidentId}`);
            }}
          />
        ))}
      </Shell>
    </>
  );
}
