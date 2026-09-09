import { type ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { BottomNav, Navbar } from '@/components/layout/Navbar';

export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} · Lumina`;
    headingRef.current?.focus();
  }, [title, location.pathname]);

  return (
    <div className="min-h-full bg-background">
      <a className="skip-link btn btn-primary" href="#main">
        본문으로 건너뛰기
      </a>
      <DemoBanner />
      <Navbar />
      <main id="main" className="page-shell">
        <div className="page-content flex flex-col gap-xl">
          <h1 ref={headingRef} tabIndex={-1} className="typo-headline-md">
            {title}
          </h1>
          {children}
          <div className="h-3xl md:hidden" aria-hidden="true" />
          <div className="h-3xl md:hidden" aria-hidden="true" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
