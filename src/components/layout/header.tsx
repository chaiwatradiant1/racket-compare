'use client';

interface HeaderProps {
  route: { page: string };
  onNav: (page: string) => void;
  compareCount: number;
}

export function Header({ route, onNav, compareCount }: HeaderProps) {
  return (
    <header className="site-header">
      <button
        type="button"
        className="site-logo"
        onClick={() => onNav('home')}
      >
        <span className="site-logo-mark">▲▼</span>
        <span className="site-logo-text">
          <span
            className="site-logo-name"
            style={{ fontFamily: 'var(--serif)' }}
          >
            The Racket Index
          </span>
          <span
            className="site-logo-sub"
            style={{ fontFamily: 'var(--mono)' }}
          >
            A field guide · vol. IV
          </span>
        </span>
      </button>
      <nav className="site-nav">
        <button
          type="button"
          className={`site-nav-link ${route.page === 'home' ? 'site-nav-link-active' : ''}`}
          onClick={() => onNav('home')}
        >
          Index
        </button>
        <button
          type="button"
          className={`site-nav-link ${route.page === 'compare' ? 'site-nav-link-active' : ''}`}
          onClick={() => onNav('compare')}
        >
          Compare
          {compareCount > 0 && (
            <span className="site-nav-count">{compareCount}</span>
          )}
        </button>
      </nav>
    </header>
  );
}