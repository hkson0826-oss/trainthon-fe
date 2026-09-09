import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldWrapProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className="flex flex-col gap-sm">
      <label className="typo-label-md" htmlFor={htmlFor}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="caption">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: string; hintId?: string };

export function TextInput({ error, hintId, id, ...props }: InputProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <input
      id={id}
      className="input-field"
      aria-invalid={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      {...props}
    />
  );
}

export function TextArea({
  error,
  hintId,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; hintId?: string }) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <textarea
      id={id}
      className="textarea-field"
      aria-invalid={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      {...props}
    />
  );
}

export function Select({
  error,
  hintId,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string; hintId?: string }) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <select
      id={id}
      className="select-field"
      aria-invalid={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      {...props}
    >
      {children}
    </select>
  );
}
