import { CAMPUS_PLACES } from '@/lib/places';
import type { Place } from '@/contracts/types';
import { Field, Select, TextInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface LocationInputProps {
  id: string;
  label: string;
  hint?: string;
  value: Place | null;
  onChange: (place: Place) => void;
  error?: string;
}

export function LocationInput({ id, label, hint, value, onChange, error }: LocationInputProps) {
  const [manual, setManual] = useState(value?.label ?? '');
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  function applyPlace(place: Place) {
    setManual(place.label);
    onChange(place);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoMessage('위치 기능을 쓸 수 없어요. 목록에서 장소를 선택해 주세요.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoMessage('지도를 연결하지 않아 정확한 좌표는 쓰지 않습니다. 가상 캠퍼스 장소를 선택해 주세요.');
      },
      () => {
        setGeoMessage('위치 권한이 없거나 시간이 초과됐어요. 장소를 직접 선택해 주세요.');
      },
      { timeout: 4000 },
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <Field label={label} htmlFor={id} hint={hint} error={error}>
        <Select
          id={id}
          error={error}
          value={value?.label ?? ''}
          onChange={(event) => {
            const place = CAMPUS_PLACES.find((row) => row.label === event.target.value);
            if (place) applyPlace(place);
          }}
        >
          <option value="">장소를 선택하세요</option>
          {CAMPUS_PLACES.map((place) => (
            <option key={place.label} value={place.label}>
              {place.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={`${label} 직접 입력`} htmlFor={`${id}-manual`}>
        <TextInput
          id={`${id}-manual`}
          value={manual}
          onChange={(event) => {
            const labelValue = event.target.value;
            setManual(labelValue);
            onChange({
              label: labelValue,
              lat: value?.lat ?? CAMPUS_PLACES[0].lat,
              lng: value?.lng ?? CAMPUS_PLACES[0].lng,
            });
          }}
        />
      </Field>
      <Button type="button" variant="secondary" onClick={useCurrentLocation}>
        현재 위치 사용
      </Button>
      {geoMessage ? <p className="caption">{geoMessage}</p> : null}
      <p className="caption">데모 장소는 가상 캠퍼스이며 실제 제휴 보관소가 아닙니다.</p>
    </div>
  );
}
