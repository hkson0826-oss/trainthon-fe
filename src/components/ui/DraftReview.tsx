import type { Category } from '@/contracts/types';
import { CATEGORY_OPTIONS } from '@/lib/categories';
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field';

export interface DraftValues {
  title: string;
  category: Category;
  description: string;
  features: string;
  privateFeatures: string;
}

export function DraftReview({
  values,
  onChange,
  errors,
  includePrivate,
}: {
  values: DraftValues;
  onChange: (values: DraftValues) => void;
  errors: Partial<Record<keyof DraftValues, string>>;
  includePrivate: boolean;
}) {
  return (
    <div className="flex flex-col gap-lg">
      <Field label="제목" htmlFor="draft-title" error={errors.title}>
        <TextInput
          id="draft-title"
          value={values.title}
          error={errors.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
        />
      </Field>
      <Field label="카테고리" htmlFor="draft-category" error={errors.category}>
        <Select
          id="draft-category"
          value={values.category}
          error={errors.category}
          onChange={(event) => onChange({ ...values, category: event.target.value as Category })}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="요약" htmlFor="draft-description" error={errors.description}>
        <TextArea
          id="draft-description"
          value={values.description}
          error={errors.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
        />
      </Field>
      <Field label="공개 특징" htmlFor="draft-features" error={errors.features}>
        <TextArea
          id="draft-features"
          value={values.features}
          error={errors.features}
          onChange={(event) => onChange({ ...values, features: event.target.value })}
        />
      </Field>
      {includePrivate ? (
        <Field
          label="비공개 소유권 확인 특징"
          htmlFor="draft-private"
          hint="공개 목록에는 보이지 않고, 소유권 확인 때만 사용합니다."
          error={errors.privateFeatures}
        >
          <TextArea
            id="draft-private"
            value={values.privateFeatures}
            error={errors.privateFeatures}
            onChange={(event) => onChange({ ...values, privateFeatures: event.target.value })}
          />
        </Field>
      ) : null}
    </div>
  );
}
