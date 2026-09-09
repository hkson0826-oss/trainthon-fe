import { NavLink, useLocation } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { useCurrentUser } from '@/hooks/useDemo';

const desktopLinks = [
  { to: '/', label: '홈', match: (path: string) => path === '/' },
  { to: '/items', label: '습득물', match: (path: string) => path.startsWith('/items') },
  { to: '/activity', label: '내 활동', match: (path: string) => path.startsWith('/activity') || path.startsWith('/searches') || path.startsWith('/claims') || path.startsWith('/handoffs') || path.startsWith('/rewards') },
];

export function Navbar() {
  const user = useCurrentUser();
  const location = useLocation();

  return (
    <header className="hidden border-b border-border bg-surface md:block">
      <div className="page-content flex items-center gap-lg px-xl py-md">
        <NavLink to="/" className="typo-title-lg no-underline">
          Lumina
        </NavLink>
        <nav className="flex flex-1 items-center gap-sm" aria-label="주요 메뉴">
          {desktopLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`nav-item ${link.match(location.pathname) ? 'nav-item-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-sm">
          <ButtonLink to="/lost/new">분실물 찾기</ButtonLink>
          <ButtonLink to="/found/new" variant="secondary">
            습득물 등록
          </ButtonLink>
          <NavLink to={user ? '/profile' : '/login'} className="nav-item">
            {user ? user.displayName : '로그인'}
          </NavLink>
        </div>
      </div>
    </header>
  );
}

const mobileLinks = [
  { to: '/', label: '홈', match: (path: string) => path === '/' },
  { to: '/lost/new', label: '찾기', match: (path: string) => path.startsWith('/lost') || path.startsWith('/searches') },
  { to: '/found/new', label: '습득물 등록', match: (path: string) => path.startsWith('/found'), primary: true },
  { to: '/activity', label: '내 활동', match: (path: string) => path.startsWith('/activity') || path.startsWith('/rewards') },
  { to: '/profile', label: '내 정보', match: (path: string) => path.startsWith('/profile') || path.startsWith('/login') },
];

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="bottom-nav md:hidden" aria-label="하단 메뉴">
      <div className="grid grid-cols-5 gap-xs">
        {mobileLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={`nav-item flex-col text-center ${link.match(location.pathname) ? 'nav-item-active' : ''} ${link.primary && !link.match(location.pathname) ? 'border border-primary' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
