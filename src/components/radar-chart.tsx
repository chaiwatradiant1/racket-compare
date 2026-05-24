'use client';

import React from 'react';

export interface RadarAxis {
  key: string;
  label: string;
}

export interface RadarSeries {
  id: string;
  label: string;
  color: string;
  values: Record<string, number>;
}

interface RadarChartProps {
  axes: RadarAxis[];
  series: RadarSeries[];
  size?: number;
  mode?: 'hybrid' | 'filled' | 'stroke';
  showLegend?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  series,
  size = 360,
  mode = 'hybrid',
  showLegend = true,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const levels = 5;
  const angleStep = (Math.PI * 2) / axes.length;
  const startAngle = -Math.PI / 2;

  // Point on the circle for axis i, value 0..1
  const pt = (i: number, v: number): [number, number] => {
    const a = startAngle + i * angleStep;
    return [cx + Math.cos(a) * radius * v, cy + Math.sin(a) * radius * v];
  };

  // Background grid: concentric polygons
  const gridPolys: React.ReactElement[] = [];
  for (let l = 1; l <= levels; l++) {
    const v = l / levels;
    const pts = axes.map((_, i) => pt(i, v).join(',')).join(' ');
    gridPolys.push(
      <polygon
        key={l}
        points={pts}
        fill="none"
        stroke="var(--rule)"
        strokeWidth={l === levels ? 1.25 : 0.5}
      />
    );
  }

  // Axis spokes
  const spokes = axes.map((_, i) => {
    const [x, y] = pt(i, 1);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="var(--rule)"
        strokeWidth={0.5}
      />
    );
  });

  // Axis labels
  const labels = axes.map((ax, i) => {
    const [x, y] = pt(i, 1.18);
    const a = startAngle + i * angleStep;
    // Anchor based on angle quadrant
    let anchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.cos(a) > 0.2) anchor = 'start';
    else if (Math.cos(a) < -0.2) anchor = 'end';
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="radar-axis-label"
      >
        {ax.label.toUpperCase()}
      </text>
    );
  });

  // Scale numbers 1-5 along the top spoke
  const scaleLabels = [1, 2, 3, 4, 5].map((n) => {
    const [x, y] = pt(0, n / 5);
    return (
      <text
        key={n}
        x={x + 4}
        y={y}
        dominantBaseline="middle"
        className="radar-scale-label"
      >
        {n}
      </text>
    );
  });

  // Series polygons with data dots
  const polys = series.map((s) => {
    const pts = axes
      .map((ax, i) => pt(i, (s.values[ax.key] || 0) / 5).join(','))
      .join(' ');
    const dots = axes.map((ax, i) => {
      const [x, y] = pt(i, (s.values[ax.key] || 0) / 5);
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3}
          fill={s.color}
          stroke="var(--paper)"
          strokeWidth={1.5}
        />
      );
    });
    const fillOpacity =
      mode === 'stroke' ? 0 : mode === 'filled' ? 0.22 : 0.12;
    const strokeWidthVal = mode === 'filled' ? 1.25 : 1.75;
    return (
      <g key={s.id}>
        <polygon
          points={pts}
          fill={s.color}
          fillOpacity={fillOpacity}
          stroke={s.color}
          strokeWidth={strokeWidthVal}
          strokeLinejoin="round"
        />
        {mode !== 'filled' && dots}
      </g>
    );
  });

  return (
    <div className="radar-wrap">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="radar-svg"
        role="img"
        width={size}
        height={size}
      >
        {gridPolys}
        {spokes}
        {polys}
        {labels}
        {scaleLabels}
      </svg>
      {showLegend && series.length > 1 && (
        <ul className="radar-legend">
          {series.map((s) => (
            <li key={s.id}>
              <span className="radar-swatch" style={{ background: s.color }} />
              <span className="radar-legend-label">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { RadarChart };