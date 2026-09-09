import { useState } from 'react';
import { isAllowedPhoto, photoCountError } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  kind: 'FOUND' | 'LOST';
  photos: Array<{ id: string; previewUrl: string }>;
  onAdd: (file: File) => Promise<void>;
  onRemove: (id: string) => void;
  busy?: boolean;
}

export function ImageUploader({ kind, photos, onAdd, onRemove, busy }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const file = list[0];
    const typeError = isAllowedPhoto(file);
    if (typeError) {
      setError(typeError);
      return;
    }
    const countError = photoCountError(kind, photos.length + 1);
    if (countError) {
      setError(countError);
      return;
    }
    setError(null);
    await onAdd(file);
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="grid grid-cols-3 gap-sm">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-frame relative">
            <img src={photo.previewUrl} alt="" className="h-3xl w-full object-cover" />
            <Button
              type="button"
              variant="secondary"
              className="absolute right-xs top-xs"
              onClick={() => onRemove(photo.id)}
            >
              삭제
            </Button>
          </div>
        ))}
      </div>
      <label className="btn btn-secondary cursor-pointer">
        사진 올리기
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.currentTarget.value = '';
          }}
        />
      </label>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="caption">{kind === 'FOUND' ? '최소 1장, 최대 3장. jpg/png/webp, 10MB.' : '사진은 없어도 됩니다. 최대 3장.'}</p>
      )}
    </div>
  );
}
