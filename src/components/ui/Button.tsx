import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'danger';

interface SharedProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  busy?: boolean;
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
};

export function Button({ variant = 'primary', className = '', busy, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`btn ${variantClass[variant]} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy ? '처리 중…' : children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  to,
  children,
}: SharedProps & { to: string }) {
  return (
    <Link to={to} className={`btn ${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}
