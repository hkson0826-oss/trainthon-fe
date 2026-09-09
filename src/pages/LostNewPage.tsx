import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { AssistantBubble, ChatThread } from '@/components/ui/ChatIntake';
import { Button } from '@/components/ui/Button';
import { DraftReview, type DraftValues } from '@/components/ui/DraftReview';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationInput } from '@/components/ui/LocationInput';
import { Field, TextArea, TextInput } from '@/components/ui/Field';
import { PaymentSummary } from '@/components/ui/PaymentSummary';
import type { Category, Place } from '@/contracts/types';
import { addPhotoFromFile, createAnalysis, createSearch, getAnalysis, getPhoto } from '@/services/demoStore';
import { CAMPUS_PLACES } from '@/lib/places';
import { descriptionSchema, privateSchema, titleSchema } from '@/lib/validation';
import { useDemoState } from '@/hooks/useDemo';
import { formatKrw } from '@/lib/money';
import { PRICING } from '@/contracts/amounts';

export function LostNewPage() {
  useDemoState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [place, setPlace] = useState<Place | null>(CAMPUS_PLACES[0]);
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [line, setLine] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftValues>({
    title: '',
    category: 'ELECTRONICS',
    description: '',
    features: '',
    privateFeatures: '표면에 파란 별 스티커',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DraftValues, string>>>({});
  const [busy, setBusy] = useState(false);
  const analysis = analysisId ? getAnalysis(analysisId) : null;
  const photos = photoIds.map((id) => getPhoto(id)).filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

  useEffect(() => {
    if (analysis?.status === 'SUCCEEDED' && analysis.result) {
      setDraft((prev) => ({
        ...prev,
        title: analysis.result!.title,
        category: analysis.result!.category,
        description: analysis.result!.description,
        features: analysis.result!.features,
      }));
      setStep(4);
    }
  }, [analysis]);

  function startAnalysis() {
    const created = createAnalysis({ kind: 'LOST', description: line || '잃어버린 물건' });
    setAnalysisId(created.id);
    setStep(3);
  }

  function goManual() {
    setDraft((prev) => ({
      ...prev,
      title: line.slice(0, 24) || '잃어버린 물건',
      description: line || '사진 없이 설명으로 찾습니다.',
      features: line,
    }));
    setStep(4);
  }

  function submitSearch() {
    const nextErrors: Partial<Record<keyof DraftValues, string>> = {};
    const title = titleSchema.safeParse(draft.title);
    const description = descriptionSchema.safeParse(draft.description);
    const priv = privateSchema.safeParse(draft.privateFeatures);
    if (!title.success) nextErrors.title = title.error.issues[0].message;
    if (!description.success) nextErrors.description = description.error.issues[0].message;
    if (!priv.success) nextErrors.privateFeatures = priv.error.issues[0].message;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !place) return;
    setBusy(true);
    try {
      const search = createSearch({
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category as Category,
        photoIds,
        occurredAt: new Date(occurredAt).toISOString(),
        place,
        privateFeatures: draft.privateFeatures.trim(),
      });
      navigate(`/searches/${search.id}/checkout`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="분실물 찾기">
      <div className="form-width">
        <ChatThread>
          <AssistantBubble>
            잃어버린 물건을 알려 주세요. 사진이 없어도 설명과 장소로 찾을 수 있어요. 찾기 요청비는{' '}
            {formatKrw(PRICING.amount)}입니다.
          </AssistantBubble>
          <div className="card-surface">
            <ImageUploader
              kind="LOST"
              photos={photos}
              onAdd={async (file) => {
                const photo = await addPhotoFromFile(file);
                setPhotoIds((prev) => [...prev, photo.id]);
              }}
              onRemove={(id) => setPhotoIds((prev) => prev.filter((photoId) => photoId !== id))}
            />
            {step === 0 ? (
              <div className="mt-md">
                <Button type="button" onClick={() => setStep(1)}>
                  다음
                </Button>
              </div>
            ) : null}
          </div>
          {step >= 1 ? (
            <>
              <AssistantBubble>마지막으로 본 위치와 시간은 대략이어도 됩니다.</AssistantBubble>
              <div className="card-surface">
                <LocationInput id="lost-place" label="마지막 위치" value={place} onChange={setPlace} />
                <div className="mt-lg">
                  <Field label="잃어버린 시각" htmlFor="occurredAt">
                    <TextInput
                      id="occurredAt"
                      type="datetime-local"
                      value={occurredAt}
                      onChange={(event) => setOccurredAt(event.target.value)}
                    />
                  </Field>
                </div>
                {step === 1 ? (
                  <div className="mt-md">
                    <Button type="button" onClick={() => setStep(2)}>
                      다음
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          {step >= 2 ? (
            <>
              <AssistantBubble>
                어떤 물건인지 설명해 주세요. 비공개 소유권 특징은 후보 검색에 공개되지 않습니다. 비밀번호나 금융정보는
                적지 마세요.
              </AssistantBubble>
              <div className="card-surface">
                <Field label="분실 설명" htmlFor="lost-line">
                  <TextArea id="lost-line" value={line} onChange={(event) => setLine(event.target.value)} />
                </Field>
                {step === 2 ? (
                  <div className="mt-md flex flex-col gap-sm">
                    <Button type="button" onClick={startAnalysis}>
                      AI로 정리하기
                    </Button>
                    <Button type="button" variant="secondary" onClick={goManual}>
                      직접 작성하기
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          {step >= 3 ? (
            <AssistantBubble>
              {analysis?.status === 'PROCESSING' || analysis?.status === 'QUEUED'
                ? '초안을 정리하고 있어요.'
                : '초안을 확인하고 요금을 살펴본 뒤 결제로 넘어갑니다. 결제 전에는 탐색 중이 아닙니다.'}
            </AssistantBubble>
          ) : null}
          {step >= 4 ? (
            <div className="card-surface">
              <DraftReview values={draft} onChange={setDraft} errors={errors} includePrivate />
              <div className="mt-lg">
                <PaymentSummary />
              </div>
              {step === 4 ? (
                <div className="mt-lg">
                  <Button type="button" onClick={submitSearch} busy={busy}>
                    요금 확인하고 결제 화면으로
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </ChatThread>
      </div>
    </PageShell>
  );
}
