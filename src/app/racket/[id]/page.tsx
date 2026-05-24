'use client';

import { useParams, useRouter } from 'next/navigation';
import { RACKETS } from '@/data/rackets';
import { SPEC_ROWS, PLAY_ROWS, ACCENT, RADAR_AXES } from '@/src/lib/constants';
import { Placeholder, MicroLabel, Rule } from '@/src/components/primitives';
import { RadarChart } from '@/src/components/radar-chart';
import { useCompare } from '@/lib/compare-context';
import type { Racket } from '@/data/rackets';

export default function RacketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const racket = RACKETS.find((r) => r.id === id);
  const { compareIds, toggleCompare } = useCompare();

  if (!racket) {
    return (
      <main className="page page-detail">
        <p className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <MicroLabel>404</MicroLabel>
          <span>No racket with that id.</span>
        </p>
      </main>
    );
  }

  const inCompare = compareIds.includes(racket.id);
  const idx = RACKETS.findIndex((r) => r.id === racket.id);
  const prev = RACKETS[(idx - 1 + RACKETS.length) % RACKETS.length];
  const next = RACKETS[(idx + 1) % RACKETS.length];

  const series = [
    {
      id: racket.id,
      label: `${racket.brand} ${racket.model}`,
      color: ACCENT,
      values: {
        power: racket.power,
        speed: racket.speed,
        control: racket.control,
        maneuverability: racket.maneuverability,
        defense: racket.defense,
      },
    },
  ];

  return (
    <main className="page page-detail">
      <nav className="detail-crumbs">
        <button type="button" className="link-btn" onClick={() => router.push('/')}>
          ← Index
        </button>
        <span className="crumb-divider">/</span>
        <span>{racket.brand}</span>
        <span className="crumb-divider">/</span>
        <span>{racket.model}</span>
      </nav>

      <header className="detail-head">
        <div className="detail-head-text">
          <MicroLabel>
            {racket.brand} · {racket.year}
          </MicroLabel>
          <h1 className="detail-title">{racket.model}</h1>
          <p className="detail-deck">
            A {racket.balance.toLowerCase()}, {racket.flex.toLowerCase()}-shaft
            frame in the <strong>{racket.weight}</strong> class. Profiled as a{' '}
            <em>{racket.playStyle.toLowerCase()}</em> racket; strings tolerated
            up to <strong>{racket.tensionMaxLbs} lbs</strong>.
          </p>
          <div className="detail-head-actions">
            <button
              type="button"
              className={`btn ${inCompare ? 'btn-active' : 'btn-primary'}`}
              onClick={() => toggleCompare(racket.id)}
            >
              {inCompare ? '✓ In compare' : '+ Add to compare'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push('/compare')}
            >
              Open compare →
            </button>
          </div>
        </div>
        <div className="detail-head-media">
          <Placeholder
            label={`${racket.brand} ${racket.model} · product shot`}
            aspect="3/4"
          />
          <span className="detail-no">№ {racket.no}</span>
        </div>
      </header>

      <Rule thick />

      <section className="detail-body">
        <div className="detail-radar-col">
          <MicroLabel>Play profile</MicroLabel>
          <h2 className="section-title">Five attributes, scored 1–5.</h2>
          <RadarChart
            axes={[...RADAR_AXES]}
            series={series}
            size={400}
            showLegend={false}
          />
          <ul className="play-list">
            {PLAY_ROWS.map((row) => {
              const key = row.key as keyof Pick<Racket, 'power' | 'speed' | 'control' | 'maneuverability' | 'defense'>;
              const val = racket[key] as number;
              return (
                <li key={row.key}>
                  <span className="play-list-label">{row.label}</span>
                  <span className="play-list-bar">
                    <span
                      className="play-list-bar-fill"
                      style={{
                        width: `${(val / 5) * 100}%`,
                        background: ACCENT,
                      }}
                    />
                  </span>
                  <span className="play-list-value">{val}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="detail-spec-col">
          <MicroLabel>Specifications</MicroLabel>
          <h2 className="section-title">As printed on the cone.</h2>
          <table className="spec-table">
            <tbody>
              {SPEC_ROWS.map((row) => {
                const rowDef = row as { key: string; label: string; format?: (v: unknown) => string };
                const value = (racket as unknown as Record<string, unknown>)[rowDef.key];
                return (
                  <tr key={rowDef.key}>
                    <th scope="row">{rowDef.label}</th>
                    <td>
                      {rowDef.format ? rowDef.format(value) : String(value ?? '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Rule />

      <nav className="detail-pager">
        <button
          type="button"
          className="detail-pager-btn"
          onClick={() => router.push(`/racket/${prev.id}`)}
        >
          <MicroLabel>← Previous</MicroLabel>
          <span>
            {prev.brand} {prev.model}
          </span>
        </button>
        <button
          type="button"
          className="detail-pager-btn detail-pager-btn-right"
          onClick={() => router.push(`/racket/${next.id}`)}
        >
          <MicroLabel>Next →</MicroLabel>
          <span>
            {next.brand} {next.model}
          </span>
        </button>
      </nav>
    </main>
  );
}