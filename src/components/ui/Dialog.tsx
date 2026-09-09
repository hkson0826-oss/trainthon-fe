import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface DialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeDisabled?: boolean;
  closeLabel?: string;
}

export function Dialog({ title, open, onClose, children, closeDisabled, closeLabel = '닫기' }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus();
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={() => !closeDisabled && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="card-surface form-width"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-lg">
          <h2 id={titleId} className="typo-title-lg">
            {title}
          </h2>
          <Button variant="secondary" onClick={onClose} disabled={closeDisabled}>
            {closeLabel}
          </Button>
        </div>
        <div className="mt-lg">{children}</div>
      </div>
    </div>
  );
}
