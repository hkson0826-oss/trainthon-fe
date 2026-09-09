import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { DraftReview, type DraftValues } from '@/components/ui/DraftReview';
import { PermissionDenied } from '@/components/ui/Feedback';
import { getOwnerFound, updateFound } from '@/services/demoStore';
import { useDemoState } from '@/hooks/useDemo';
import { descriptionSchema, privateSchema, titleSchema } from '@/lib/validation';

export function FoundEditPage() {
  useDemoState();
  const { itemId = '' } = useParams();
  const navigate = useNavigate();
  const item = getOwnerFound(itemId);
  const [draft, setDraft] = useState<DraftValues>(() => ({
    title: item?.title ?? '',
    category: item?.category ?? 'OTHER',
    description: item?.description ?? '',
    features: item?.description ?? '',
    privateFeatures: item?.privateFeatures ?? '',
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof DraftValues, string>>>({});
  const [busy, setBusy] = useState(false);

  if (!item) {
    return (
      <PageShell title="수정할 수 없어요">
        <PermissionDenied body="본인 습득물만 수정할 수 있어요." />
      </PageShell>
    );
  }

  const current = item;

  function save() {
    const nextErrors: Partial<Record<keyof DraftValues, string>> = {};
    const title = titleSchema.safeParse(draft.title);
    const description = descriptionSchema.safeParse(draft.description);
    const priv = privateSchema.safeParse(draft.privateFeatures);
    if (!title.success) nextErrors.title = title.error.issues[0].message;
    if (!description.success) nextErrors.description = description.error.issues[0].message;
    if (!priv.success) nextErrors.privateFeatures = priv.error.issues[0].message;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      updateFound(current.id, current.version, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        privateFeatures: draft.privateFeatures.trim(),
      });
      navigate(`/items/${current.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="습득물 수정">
      <div className="form-width card-surface">
        <DraftReview values={draft} onChange={setDraft} errors={errors} includePrivate />
        <div className="mt-lg">
          <Button type="button" onClick={save} busy={busy}>
            저장
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
