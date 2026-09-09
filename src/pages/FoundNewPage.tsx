import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { AssistantBubble, ChatThread } from '@/components/ui/ChatIntake';
import { Button } from '@/components/ui/Button';
import { DraftReview, type DraftValues } from '@/components/ui/DraftReview';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationInput } from '@/components/ui/LocationInput';
import { Field, TextArea } from '@/components/ui/Field';
import type { Category, Place } from '@/contracts/types';
import {
  addPhotoFromFile,
  createAnalysis,
  createFoundItem,
  getAnalysis,
  getPhoto,
  publishFound,
} from '@/services/demoStore';
import { descriptionSchema, pickupSchema, privateSchema, titleSchema } from '@/lib/validation';
import { CAMPUS_PLACES } from '@/lib/places';
import { useDemoState } from '@/hooks/useDemo';
import { photoCountError } from '@/lib/utils';

export function FoundNewPage() {
  useDemoState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [foundPlace, setFoundPlace] = useState<Place | null>(CAMPUS_PLACES[0]);
  const [storagePlace, setStoragePlace] = useState<Place | null>(CAMPUS_PLACES[1]);
  const [line, setLine] = useState('');
  const [pickup, setPickup] = useState('가상 공학관 1층 안내데스크에서 평일 낮에 전달해요.');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftValues>({
    title: '',
    category: 'ELECTRONICS',
    description: '',
    features: '',
    privateFeatures: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DraftValues, string>>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
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

  function startAnalysis(fail = false) {
    const countError = photoCountError('FOUND', photoIds.length);
    if (countError) {
      setPhotoError(countError);
      return;
    }
    if (!line.trim()) {
      setPhotoError('한 줄 설명을 입력해 주세요.');
      return;
    }
    setPhotoError(null);
    const created = createAnalysis({ kind: 'FOUND', description: line, fail });
    setAnalysisId(created.id);
    setStep(3);
  }

  function validateDraft() {
    const nextErrors: Partial<Record<keyof DraftValues, string>> = {};
    const title = titleSchema.safeParse(draft.title);
    const description = descriptionSchema.safeParse(draft.description);
    const priv = privateSchema.safeParse(draft.privateFeatures);
    const pick = pickupSchema.safeParse(pickup);
    if (!title.success) nextErrors.title = title.error.issues[0].message;
    if (!description.success) nextErrors.description = description.error.issues[0].message;
    if (!priv.success) nextErrors.privateFeatures = priv.error.issues[0].message;
    if (!pick.success) setPhotoError(pick.error.issues[0].message);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && pick.success && foundPlace && storagePlace;
  }

  async function publish() {
    if (!validateDraft() || !foundPlace || !storagePlace) return;
    setBusy(true);
    try {
      const item = createFoundItem({
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category as Category,
        photoIds,
        occurredAt: new Date().toISOString(),
        place: foundPlace,
        placeLabel: `${foundPlace.label} 근처`,
        privateFeatures: draft.privateFeatures.trim(),
        storagePlace,
        pickupInstructions: pickup.trim(),
      });
      const published = publishFound(item.id, item.version);
      setPublishedId(published.id);
      setStep(5);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="습득물 등록">
      <div className="form-width">
        <ChatThread>
          <AssistantBubble>
            주운 물건을 등록하면 주인을 찾는 데 도움이 돼요. 먼저 사진을 올려 주세요. 최소 1장이 필요해요.
          </AssistantBubble>
          <div className="card-surface">
            <ImageUploader
              kind="FOUND"
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
              <AssistantBubble>
                어디서 발견했나요? 공개되는 대략 위치와, 승인 후 안내할 보관 장소를 구분해 주세요.
              </AssistantBubble>
              <div className="card-surface flex flex-col gap-lg">
                  <LocationInput
                    id="found-place"
                    label="발견한 위치 (공개 지역)"
                    value={foundPlace}
                    onChange={setFoundPlace}
                  />
                  <LocationInput
                    id="storage-place"
                    label="승인 후 안내할 보관 장소"
                    value={storagePlace}
                    onChange={setStoragePlace}
                  />
                  <Field label="수령 안내" htmlFor="pickup">
                    <TextArea id="pickup" value={pickup} onChange={(event) => setPickup(event.target.value)} />
                  </Field>
                  {step === 1 ? (
                    <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                      다음
                    </Button>
                  ) : null}
              </div>
            </>
          ) : null}
          {step >= 2 ? (
            <>
              <AssistantBubble>한 줄로 어떤 물건인지 알려 주세요. 긴 글은 필요 없어요.</AssistantBubble>
              <div className="card-surface">
                <Field label="한 줄 설명" htmlFor="line" error={photoError ?? undefined}>
                  <TextArea id="line" value={line} error={photoError ?? undefined} onChange={(event) => setLine(event.target.value)} />
                </Field>
                {step === 2 ? (
                  <div className="mt-md flex flex-col gap-sm">
                    <Button type="button" onClick={() => startAnalysis(false)}>
                      AI로 정리하기
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => startAnalysis(true)}>
                      분석 실패 재현
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          {step >= 3 ? (
            <AssistantBubble>
              {analysis?.status === 'FAILED' ? (
                <div className="flex flex-col gap-md">
                  <p>초안을 만들지 못했어요. 직접 작성하거나 다시 시도해 주세요.</p>
                  <div className="flex flex-col gap-sm">
                    <Button type="button" onClick={() => startAnalysis(false)}>
                      다시 시도
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, title: line.slice(0, 24), description: line, features: line }));
                        setStep(4);
                      }}
                    >
                      직접 작성하기
                    </Button>
                  </div>
                </div>
              ) : analysis?.status === 'SUCCEEDED' ? (
                '초안이 준비됐어요. 내용을 확인하고 수정한 뒤 등록해 주세요.'
              ) : (
                '사진을 살펴보고 초안을 정리하고 있어요. 진행률을 정확히 알 수는 없어요.'
              )}
            </AssistantBubble>
          ) : null}
          {step >= 4 ? (
            <div className="card-surface">
              <DraftReview values={draft} onChange={setDraft} errors={errors} includePrivate />
              {step === 4 ? (
                <div className="mt-lg">
                  <Button type="button" onClick={() => void publish()} busy={busy}>
                    내용 확인 후 등록
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
          {step >= 5 && publishedId ? (
            <AssistantBubble>
              <p>습득물이 등록됐어요. AI가 작성했다는 이유만으로 게시하지 않고, 확인 후에만 올렸습니다.</p>
              <div className="mt-md">
                <Button type="button" onClick={() => navigate(`/items/${publishedId}`)}>
                  등록한 물건 보기
                </Button>
              </div>
            </AssistantBubble>
          ) : null}
        </ChatThread>
      </div>
    </PageShell>
  );
}
