'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { keys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth';
import { incidentFormSchema, photoError, type IncidentFormValues } from '@/lib/validation';
import { seoulLocalToIso, todayParts } from '@/lib/dates';
import { INCIDENT_TYPE_LABEL } from '@/lib/status';
import { AppBar, BottomActionBar, Shell } from '@/components/AppChrome';
import { RequireRole } from '@/components/RequireRole';
import { ApiError } from '@/types/api';
import type { IncidentType } from '@/types/api';

const DAMAGE_CHIPS = ['우측 후면', '좌측 후면', '전면', '후면', '측면', '범퍼'];

export default function NewIncidentPage() {
  return (
    <RequireRole role="REQUESTER">
      <NewIncidentForm />
    </RequireRole>
  );
}

function NewIncidentForm() {
  const router = useRouter();
  const { user } = useAuth();
  const defaults = todayParts();
  const { data: places = [] } = useQuery({ queryKey: keys.places(user?.id), queryFn: api.places });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      placeId: 'place-a',
      type: 'CONTACT',
      date: defaults.date,
      start: defaults.start,
      end: defaults.end,
      color: '흰색',
      model: '세단',
      damageArea: '우측 후면',
      description: '',
      evidenceUse: false,
      privacy: false,
    },
  });
  const description = form.watch('description');
  const type = form.watch('type');
  const damageArea = form.watch('damageArea');

  async function onSubmit(values: IncidentFormValues) {
    setBusy(true);
    setPhotoMessage(null);
    try {
      const paths: string[] = [];
      for (const file of photos) {
        const signed = await api.uploadPhoto(file);
        paths.push(signed.objectPath);
      }
      const created = await api.createIncident({
        placeId: values.placeId,
        type: values.type,
        occurredFrom: seoulLocalToIso(values.date, values.start),
        occurredTo: seoulLocalToIso(values.date, values.end),
        vehicle: { color: values.color, model: values.model, damageArea: values.damageArea },
        description: values.description,
        photoObjectPaths: paths,
        consent: { evidenceUse: values.evidenceUse, privacy: values.privacy },
      });
      router.push(`/x/incidents/${created.id}/done`);
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => form.setError(field as keyof IncidentFormValues, { message }));
        setPhotoMessage(error.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar title="사고 제보" backHref="/x" />
      <form className="shell flex flex-col gap-xl" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="typo-label" htmlFor="placeId">
          사고 장소
        </label>
        <select id="placeId" className="field" {...form.register('placeId')}>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>

        <p className="typo-label">사고 유형</p>
        <div className="flex flex-wrap gap-sm">
          {(Object.keys(INCIDENT_TYPE_LABEL) as IncidentType[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${type === key ? 'chip-active' : ''}`}
              onClick={() => form.setValue('type', key)}
            >
              {INCIDENT_TYPE_LABEL[key]}
            </button>
          ))}
        </div>

        <label className="typo-label" htmlFor="date">
          사고 추정 날짜
        </label>
        <input id="date" type="date" className="field" {...form.register('date')} />
        <label className="typo-label" htmlFor="start">
          시작 시각
        </label>
        <input id="start" type="time" className="field" {...form.register('start')} />
        <label className="typo-label" htmlFor="end">
          종료 시각
        </label>
        <input id="end" type="time" className="field" aria-invalid={Boolean(form.formState.errors.end)} {...form.register('end')} />
        {form.formState.errors.end ? <p className="field-error">{form.formState.errors.end.message}</p> : null}

        <label className="typo-label" htmlFor="color">
          피해 차량 색상
        </label>
        <input id="color" className="field" {...form.register('color')} />
        <label className="typo-label" htmlFor="model">
          차종
        </label>
        <input id="model" className="field" {...form.register('model')} />
        <p className="typo-label">파손 부위</p>
        <div className="flex flex-wrap gap-sm">
          {DAMAGE_CHIPS.map((chip) => (
            <button key={chip} type="button" className={`chip ${damageArea === chip ? 'chip-active' : ''}`} onClick={() => form.setValue('damageArea', chip)}>
              {chip}
            </button>
          ))}
        </div>
        <input id="damageArea" className="field" {...form.register('damageArea')} />

        <label className="typo-label" htmlFor="description">
          사고 설명
        </label>
        <textarea id="description" className="field textarea" maxLength={1000} {...form.register('description')} />
        <p className="typo-sm">{description.length}/1000</p>
        {form.formState.errors.description ? <p className="field-error">{form.formState.errors.description.message}</p> : null}

        <p className="typo-label">피해 차량 사진 1~2장</p>
        <input
          type="file"
          accept="image/*"
          multiple
          className="field"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            const err = photoError(file, photos.length);
            if (err) {
              setPhotoMessage(err);
              return;
            }
            setPhotos((prev) => [...prev, file].slice(0, 2));
          }}
        />
        <div className="flex flex-col gap-md">
          {photos.map((file, index) => (
            <div key={`${file.name}-${index}`} className="card flex items-center justify-between gap-md">
              <p className="typo-sm">{file.name}</p>
              <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}>
                삭제
              </button>
            </div>
          ))}
        </div>
        {photoMessage ? <p className="field-error">{photoMessage}</p> : null}

        <label className="flex items-start gap-md typo-body">
          <input type="checkbox" className="mt-xs h-lg w-lg" {...form.register('evidenceUse')} />
          증거 이용에 동의합니다.
        </label>
        {form.formState.errors.evidenceUse ? <p className="field-error">{form.formState.errors.evidenceUse.message}</p> : null}
        <label className="flex items-start gap-md typo-body">
          <input type="checkbox" className="mt-xs h-lg w-lg" {...form.register('privacy')} />
          개인정보 처리에 동의합니다.
        </label>
        {form.formState.errors.privacy ? <p className="field-error">{form.formState.errors.privacy.message}</p> : null}
        <div className="h-3xl" />
      </form>
      <BottomActionBar>
        <button type="submit" className="btn btn-primary" disabled={busy} onClick={form.handleSubmit(onSubmit)}>
          {busy ? '처리 중…' : '제보 등록'}
        </button>
      </BottomActionBar>
    </>
  );
}
