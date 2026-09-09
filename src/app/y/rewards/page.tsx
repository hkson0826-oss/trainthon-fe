'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { AppBar, DemoBadge, EmptyState, Shell, StatusChip } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { formatKrw } from '@/lib/money';
import { formatSeoul } from '@/lib/dates';
import { SETTLEMENT_STATUS_LABEL } from '@/lib/status';

export default function RewardsPage() {
  return (
    <RequireRole role="WITNESS">
      <RewardsInner />
    </RequireRole>
  );
}

function RewardsInner() {
  const { user } = useAuth();
  const { data: rewards = [] } = useQuery({ queryKey: keys.rewards(user?.id), queryFn: api.rewards });

  return (
    <>
      <AppBar title="내 보상" backHref="/y" />
      <Shell>
        {rewards.length === 0 ? (
          <EmptyState title="보상 내역이 없습니다" body="증거가 채택되면 보상 지급 예정이 여기에 나타납니다." />
        ) : (
          rewards.map((reward) => (
            <article key={reward.submissionId} className="card flex flex-col gap-sm">
              <div className="flex items-center justify-between gap-md">
                <h2 className="typo-title">{reward.placeName}</h2>
                <DemoBadge>데모</DemoBadge>
              </div>
              <p className="typo-sm">{formatSeoul(reward.occurredFrom)}</p>
              <p className="typo-title">{formatKrw(reward.amount)}</p>
              <StatusChip label={SETTLEMENT_STATUS_LABEL[reward.status]} tone="warning" />
              {reward.scheduledAt ? <p className="typo-sm">예정 {formatSeoul(reward.scheduledAt)}</p> : null}
            </article>
          ))
        )}
      </Shell>
    </>
  );
}
