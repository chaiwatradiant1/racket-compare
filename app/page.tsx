'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { RACKETS } from '@/data/rackets';
import { useCompare } from '@/lib/compare-context';
import { Header } from '@/src/components/layout/header';
import { CompareDrawer } from '@/src/components/layout/compare-drawer';
import { RacketCard, Rule, MicroLabel } from '@/src/components/primitives';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterKey = 'brand' | 'style' | 'weight';

interface Filters {
  brand: string[];
  style: string[];
  weight: string[];
}

type SortKey = 'name' | 'weight' | 'balance' | 'tension' | 'year';

interface Route {
  page: 'home' | 'racket' | 'compare';
  id?: string;
  ids?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_BRANDS = ['APACS', 'Babolat', 'Carlton', 'Dunlop', 'FZ Forza', 'Gosen', 'HEAD', 'Li-Ning', 'Mizuno', 'RSL', 'Victor', 'Wilson', 'Yonex'];
const ALL_STYLES = ['Power', 'Control', 'All-Around', 'Speed'];
const ALL_WEIGHTS = ['3U (88g)', '4U (83g)', '5U (78g)'];

/** Parse the current URL into a route object. */
function parseUrl(): Route {
  // Support both hash-based and query-based routing
  const hash = window.location.hash.slice(1);
  const search = window.location.search;
  
  // Hash routing: #/compare?ids=a,b,c
  if (hash) {
    const [pathPart, queryPart] = hash.split('?');
    const path = pathPart || '/';
    if (path === '/' || path === '') return { page: 'home' };
    if (path.startsWith('/racket/')) return { page: 'racket', id: path.slice('/racket/'.length) };
    if (path.startsWith('/compare')) {
      const ids = (queryPart?.split('=')[1] || '').split(',').filter(Boolean);
      return { page: 'compare', ids };
    }
  }
  
  // Query routing: ?page=compare&ids=a,b,c (for direct URL access)
  const params = new URLSearchParams(search);
  const page = params.get('page');
  if (page === 'compare') {
    const ids = (params.get('ids') || '').split(',').filter(Boolean);
    return { page: 'compare', ids };
  }
  if (page === 'racket') {
    return { page: 'racket', id: params.get('id') || '' };
  }
  
  return { page: 'home' };
}

/** Navigate by updating the URL. */
function navigate(page: string, opts?: { id?: string; ids?: string[] }) {
  if (page === 'home') {
    window.location.hash = '#/';
  } else if (page === 'racket') {
    window.location.hash = `#/racket/${opts?.id}`;
  } else if (page === 'compare') {
    const ids = (opts?.ids || []).filter(Boolean);
    // Use query string for compare so it works on direct URL access
    const q = ids.length ? `?page=compare&ids=${ids.join(',')}` : '?page=compare';
    window.history.pushState(null, '', q);
    // Also update hash for consistency
    window.location.hash = `#/compare${ids.length ? '?ids=' + ids.join(',') : ''}`;
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function GridPage() {
  const {
    compareIds,
    density,
    toggleCompare,
    removeFromCompare,
    clearCompare,
  } = useCompare();

  const [filters, setFilters] = useState<Filters>({
    brand: [],
    style: [],
    weight: [],
  });
  const [sort, setSort] = useState<SortKey>('name');

  // Derive route from the hash on each render so Header knows the active page.
  const [route, setRoute] = useState<Route>({ page: 'home' });

  // Update route whenever hash changes.
  const handleHashChange = useCallback(() => {
    setRoute(parseUrl());
  }, []);

  // Bind hashchange on mount.
  useEffect(() => {
    // If URL has query string ?page=compare&ids=..., redirect to hash-based URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'compare') {
      const ids = params.get('ids') || '';
      window.location.replace(`#/compare${ids ? '?ids=' + ids : ''}`);
      return;
    }
    setRoute(parseUrl());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  // ── Navigation callbacks ──
  const onNav = useCallback((page: string) => {
    if (page === 'home') navigate('home');
    else if (page === 'compare') navigate('compare', { ids: compareIds });
  }, [compareIds]);

  const onOpen = useCallback((id: string) => {
    if (id === 'home') navigate('home');
    else navigate('racket', { id });
  }, []);

  const onGoCompare = useCallback(() => {
    window.location.hash = `#/compare${compareIds.length ? '?ids=' + compareIds.join(',') : ''}`;
  }, [compareIds]);

  // ── Filtering + sorting ──
  const filtered = useMemo(() => {
    let r = RACKETS.slice();
    if (filters.brand.length) r = r.filter((x) => filters.brand.includes(x.brand));
    if (filters.style.length) r = r.filter((x) => filters.style.includes(x.playStyle));
    if (filters.weight.length) r = r.filter((x) => filters.weight.includes(x.weight));
    switch (sort) {
      case 'weight':
        r.sort((a, b) => a.weightGrams - b.weightGrams);
        break;
      case 'balance':
        r.sort((a, b) => a.balanceMm - b.balanceMm);
        break;
      case 'tension':
        r.sort((a, b) => b.tensionMaxLbs - a.tensionMaxLbs);
        break;
      case 'year':
        r.sort((a, b) => Number(b.year) - Number(a.year));
        break;
      default:
        r.sort((a, b) => a.model.localeCompare(b.model));
    }
    return r;
  }, [filters, sort]);

  // ── Chip toggle helper ──
  const toggleFilter = useCallback((key: FilterKey, value: string) => {
    setFilters((f) => {
      const set = new Set(f[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [key]: Array.from(set) };
    });
  }, []);

  const hasActiveFilters =
    filters.brand.length > 0 || filters.style.length > 0 || filters.weight.length > 0;

  const clearFilters = useCallback(() => {
    setFilters({ brand: [], style: [], weight: [] });
  }, []);

  // ── Render ──
  // If route is compare, render the compare page inline
  if (route.page === 'compare') {
    return (
      <div className="app" data-page="compare">
        <Header route={route} onNav={onNav} compareCount={compareIds.length} />
        <main className="page page-compare">
          <section className="empty-state empty-state-compare">
            <MicroLabel>Compare</MicroLabel>
            <p>Select rackets from the grid to compare them side by side.</p>
          </section>
        </main>
        <CompareDrawer
          rackets={RACKETS}
          compareIds={compareIds}
          slotCount={3}
          onOpen={onOpen}
          onRemove={removeFromCompare}
          onClear={clearCompare}
          onGoCompare={onGoCompare}
        />
      </div>
    );
  }

  return (
    <div className="app" data-page="home">
      <Header route={route} onNav={onNav} compareCount={compareIds.length} />

      <main className="page page-grid">
        {/* ── Masthead ── */}
        <header className="masthead">
          <div className="masthead-eyebrow">
            <MicroLabel>Issue 04 · The Racket Index</MicroLabel>
            <MicroLabel>
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </MicroLabel>
          </div>
          <h1 className="masthead-title">
            A field guide to <em>two-hundred-and-eighty-nine</em> badminton rackets,
            <br />
            tested on the page, not the court.
          </h1>
          <p className="masthead-deck">
            Browse the full index. Filter by brand, style, or weight class. Add up to three
            rackets to the compare drawer and read them against one another in spec &amp; shape.
          </p>
        </header>

        <Rule thick />

        {/* ── FilterBar ── */}
        <section className="filterbar">
          <div className="filterbar-row">
            <div className="filter-group">
              <MicroLabel>Brand</MicroLabel>
              <div className="chip-row">
                {ALL_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`chip ${filters.brand.includes(b) ? 'chip-active' : ''}`}
                    onClick={() => toggleFilter('brand', b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <MicroLabel>Play style</MicroLabel>
              <div className="chip-row">
                {ALL_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${filters.style.includes(s) ? 'chip-active' : ''}`}
                    onClick={() => toggleFilter('style', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <MicroLabel>Weight class</MicroLabel>
              <div className="chip-row">
                {ALL_WEIGHTS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`chip ${filters.weight.includes(w) ? 'chip-active' : ''}`}
                    onClick={() => toggleFilter('weight', w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group filter-group-sort">
              <MicroLabel>Sort</MicroLabel>
              <select
                className="select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="name">Model name (A&rarr;Z)</option>
                <option value="weight">Weight (light &rarr; heavy)</option>
                <option value="balance">Balance (head-light &rarr; head-heavy)</option>
                <option value="tension">Max tension (high &rarr; low)</option>
                <option value="year">Year (new &rarr; old)</option>
              </select>
            </div>
          </div>
          <div className="filterbar-meta">
            <span>
              {filtered.length} of {RACKETS.length} rackets
            </span>
            {hasActiveFilters && (
              <button type="button" className="link-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </section>

        <Rule />

        {/* ── Grid / Empty state ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <MicroLabel>No matches</MicroLabel>
            <p>No rackets fit the current filters. Loosen one and try again.</p>
          </div>
        ) : (
          <ul className={`grid grid-${density}`}>
            {filtered.map((r) => (
              <li key={r.id}>
                <RacketCard
                  racket={r}
                  density={density}
                  onOpen={onOpen}
                  inCompare={compareIds.includes(r.id)}
                  onToggleCompare={toggleCompare}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ── Compare Drawer ── */}
      <CompareDrawer
        rackets={RACKETS}
        compareIds={compareIds}
        slotCount={3}
        onOpen={onOpen}
        onRemove={removeFromCompare}
        onClear={clearCompare}
        onGoCompare={onGoCompare}
      />
    </div>
  );
}